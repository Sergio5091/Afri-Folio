const pool = require("../config/db");

/**
 * GET /api/admin/stats
 */
async function getAdminStats(req, res, next) {
  try {
    // Période configurable via query param : days=7|30|90|180|365 (défaut 30)
    const days = parseInt(req.query.days) || 30;
    const months = days <= 90 ? 3 : days <= 180 ? 6 : 12;

    const [userStats] = await pool.query(
      `SELECT
        COUNT(*) AS totalUsers,
        SUM(CASE WHEN plan = 'premium' THEN 1 ELSE 0 END) AS premiumUsers
       FROM users`
    );

    const [revenueStats] = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) AS totalRevenue FROM subscriptions WHERE status = 'success'"
    );

    const [commissionStats] = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) AS totalCommissionsPaid FROM commissions WHERE status = 'paid'"
    );

    const [withdrawalStats] = await pool.query(
      "SELECT COUNT(*) AS pendingWithdrawals FROM withdrawals WHERE status = 'pending'"
    );

    // Inscriptions par jour (période sélectionnée)
    const [registrationsByDay] = await pool.query(
      `SELECT DATE(created_at) AS date, COUNT(*) AS count
       FROM users
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
       GROUP BY DATE(created_at)
       ORDER BY date ASC`,
      [days]
    );

    // Revenus par mois (période sélectionnée)
    const [revenueByMonth] = await pool.query(
      `SELECT DATE_FORMAT(created_at, '%Y-%m') AS month,
              COALESCE(SUM(amount), 0) AS revenue,
              COUNT(*) AS subscriptions
       FROM subscriptions
       WHERE status = 'success' AND created_at >= DATE_SUB(NOW(), INTERVAL ? MONTH)
       GROUP BY DATE_FORMAT(created_at, '%Y-%m')
       ORDER BY month ASC`,
      [months]
    );

    // Inscriptions par mois (période sélectionnée)
    const [usersByMonth] = await pool.query(
      `SELECT DATE_FORMAT(created_at, '%Y-%m') AS month,
              COUNT(*) AS total,
              SUM(CASE WHEN plan = 'premium' THEN 1 ELSE 0 END) AS premium
       FROM users
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? MONTH)
       GROUP BY DATE_FORMAT(created_at, '%Y-%m')
       ORDER BY month ASC`,
      [months]
    );

    // Vues portfolio par jour (période sélectionnée)
    const [viewsByDay] = await pool.query(
      `SELECT DATE(viewed_at) AS date, COUNT(*) AS count
       FROM portfolio_views
       WHERE viewed_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
       GROUP BY DATE(viewed_at)
       ORDER BY date ASC`,
      [days]
    );

    // Top 5 portfolios les plus vus (période sélectionnée)
    const [topPortfolios] = await pool.query(
      `SELECT pv.portfolio_username, COUNT(*) AS views
       FROM portfolio_views pv
       WHERE pv.viewed_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
       GROUP BY pv.portfolio_username
       ORDER BY views DESC
       LIMIT 5`,
      [days]
    );

    return res.json({
      totalUsers: userStats[0].totalUsers,
      premiumUsers: userStats[0].premiumUsers,
      totalRevenue: revenueStats[0].totalRevenue,
      totalCommissionsPaid: commissionStats[0].totalCommissionsPaid,
      pendingWithdrawals: withdrawalStats[0].pendingWithdrawals,
      registrationsByDay: registrationsByDay.map(r => ({ date: r.date, count: Number(r.count) })),
      revenueByMonth: revenueByMonth.map(r => ({ month: r.month, revenue: Number(r.revenue), subscriptions: Number(r.subscriptions) })),
      usersByMonth: usersByMonth.map(r => ({ month: r.month, total: Number(r.total), premium: Number(r.premium) })),
      viewsByDay: viewsByDay.map(r => ({ date: r.date, count: Number(r.count) })),
      topPortfolios: topPortfolios.map(r => ({ username: r.portfolio_username, views: Number(r.views) })),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/users
 * Liste des utilisateurs avec leurs vues totales
 */
async function getAdminUsers(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const [users] = await pool.query(
      `SELECT
        u.id, u.username, u.email, u.plan, u.is_admin, u.created_at,
        COUNT(pv.id) AS totalViews
       FROM users u
       LEFT JOIN portfolio_views pv ON pv.portfolio_username = u.username
       GROUP BY u.id
       ORDER BY u.created_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const [countResult] = await pool.query("SELECT COUNT(*) AS total FROM users");

    return res.json({
      users: users.map((u) => ({
        id: u.id,
        username: u.username,
        email: u.email,
        plan: u.plan,
        isAdmin: u.is_admin,
        createdAt: u.created_at,
        totalViews: u.totalViews,
      })),
      total: countResult[0].total,
      page,
      limit,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/withdrawals
 * Toutes les demandes de retrait
 */
async function getAdminWithdrawals(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT w.id, w.user_id, w.amount, w.method, w.phone_number,
              w.status, w.requested_at, w.processed_at,
              u.username
       FROM withdrawals w
       JOIN users u ON u.id = w.user_id
       ORDER BY
         CASE w.status WHEN 'pending' THEN 0 ELSE 1 END,
         w.requested_at DESC`
    );

    return res.json(
      rows.map((r) => ({
        id: r.id,
        userId: r.user_id,
        username: r.username,
        amount: r.amount,
        method: r.method,
        phoneNumber: r.phone_number,
        status: r.status,
        requestedAt: r.requested_at,
        processedAt: r.processed_at,
      }))
    );
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/admin/withdrawals/:id
 * Approuver ou rejeter un retrait
 */
async function updateWithdrawal(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["approved", "rejected"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: "Statut invalide (approved ou rejected)" });
    }

    // Vérifier que le retrait existe et est en attente
    const [rows] = await pool.query(
      "SELECT * FROM withdrawals WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Retrait introuvable" });
    }

    if (rows[0].status !== "pending") {
      return res.status(409).json({ message: "Ce retrait a déjà été traité" });
    }

    await pool.query(
      "UPDATE withdrawals SET status = ?, processed_at = NOW() WHERE id = ?",
      [status, id]
    );

    // Si crédit d'abonnement approuvé → prolonger l'abonnement
    if (status === "approved" && rows[0].method === "subscription_credit") {
      const userId = rows[0].user_id;
      const amount = rows[0].amount;
      const SUBSCRIPTION_PRICE = parseInt(process.env.SUBSCRIPTION_PRICE || "360");
      const monthsToAdd = Math.floor(amount / SUBSCRIPTION_PRICE);

      if (monthsToAdd > 0) {
        // Récupérer la date d'expiration actuelle
        const [subRows] = await pool.query(
          `SELECT expires_at FROM subscriptions
           WHERE user_id = ? AND status = 'success'
           ORDER BY expires_at DESC LIMIT 1`,
          [userId]
        );

        const baseDate =
          subRows.length > 0 && subRows[0].expires_at > new Date()
            ? new Date(subRows[0].expires_at)
            : new Date();

        baseDate.setMonth(baseDate.getMonth() + monthsToAdd);

        await pool.query(
          `INSERT INTO subscriptions (user_id, operator, phone_number, amount, status, expires_at)
           VALUES (?, 'mtn', '', ?, 'success', ?)`,
          [userId, amount, baseDate]
        );

        await pool.query(
          "UPDATE users SET plan = 'premium' WHERE id = ?",
          [userId]
        );
      }
    }

    return res.json({ message: `Retrait ${status === "approved" ? "approuvé" : "rejeté"} avec succès` });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAdminStats, getAdminUsers, getAdminWithdrawals, updateWithdrawal };
