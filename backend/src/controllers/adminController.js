const pool = require("../config/db");
const { formatProfile } = require("../utils/format");

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

    const [[extra]] = await pool.query(
      `SELECT
        (SELECT COUNT(*) FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)) AS newUsers7d,
        (SELECT COUNT(*) FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 14 DAY)
                                      AND created_at < DATE_SUB(NOW(), INTERVAL 7 DAY)) AS newUsersPrev7d,
        (SELECT COUNT(*) FROM profiles WHERE full_name IS NOT NULL AND (title IS NOT NULL OR profession IS NOT NULL)) AS publishedPortfolios,
        (SELECT COUNT(*) FROM leads) AS totalLeads,
        (SELECT COUNT(*) FROM portfolio_events WHERE type IN ('whatsapp','call','email')) AS totalContactClicks,
        (SELECT COUNT(*) FROM users WHERE status = 'suspended') AS suspendedUsers,
        (SELECT COALESCE(SUM(amount), 0) FROM subscriptions
          WHERE status = 'success' AND granted_by_admin = 0 AND created_at >= DATE_FORMAT(NOW(), '%Y-%m-01')) AS revenueThisMonth`
    );

    const [topProfessions] = await pool.query(
      `SELECT COALESCE(profession, CONCAT('famille:', COALESCE(profile_type, 'inconnue'))) AS profession, COUNT(*) AS count
       FROM profiles GROUP BY 1 ORDER BY count DESC LIMIT 8`
    );

    return res.json({
      newUsers7d: Number(extra.newUsers7d),
      newUsersPrev7d: Number(extra.newUsersPrev7d),
      publishedPortfolios: Number(extra.publishedPortfolios),
      totalLeads: Number(extra.totalLeads),
      totalContactClicks: Number(extra.totalContactClicks),
      suspendedUsers: Number(extra.suspendedUsers),
      revenueThisMonth: Number(extra.revenueThisMonth),
      topProfessions: topProfessions.map((r) => ({ profession: r.profession, count: Number(r.count) })),
      totalUsers: Number(userStats[0].totalUsers),
      premiumUsers: Number(userStats[0].premiumUsers) || 0,
      totalRevenue: Number(revenueStats[0].totalRevenue),
      totalCommissionsPaid: Number(commissionStats[0].totalCommissionsPaid),
      pendingWithdrawals: Number(withdrawalStats[0].pendingWithdrawals),
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
 * GET /api/admin/users?search=&plan=&status=&profession=&page=&limit=
 * Liste paginée des utilisateurs avec leurs vues totales
 */
async function getAdminUsers(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 25);
    const where = [];
    const params = [];

    if (req.query.search) {
      const q = `%${String(req.query.search).slice(0, 80)}%`;
      where.push("(u.username LIKE ? OR u.email LIKE ? OR p.full_name LIKE ? OR p.city LIKE ?)");
      params.push(q, q, q, q);
    }
    if (["free", "premium"].includes(req.query.plan)) {
      where.push("u.plan = ?");
      params.push(req.query.plan);
    }
    if (["active", "suspended"].includes(req.query.status)) {
      where.push("u.status = ?");
      params.push(req.query.status);
    }
    if (req.query.profession) {
      where.push("p.profession = ?");
      params.push(String(req.query.profession));
    }
    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const [users] = await pool.query(
      `SELECT
        u.id, u.username, u.email, u.plan, u.is_admin, u.status, u.created_at, u.last_login_at,
        p.full_name, p.profession, p.profession_custom, p.profile_type, p.city, p.photo_url, p.is_featured,
        (SELECT COUNT(*) FROM portfolio_views pv WHERE pv.portfolio_username = u.username) AS totalViews,
        (SELECT COUNT(*) FROM leads l WHERE l.user_id = u.id) AS totalLeads
       FROM users u
       LEFT JOIN profiles p ON p.user_id = u.id
       ${whereSql}
       ORDER BY u.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, (page - 1) * limit]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM users u LEFT JOIN profiles p ON p.user_id = u.id ${whereSql}`,
      params
    );

    return res.json({
      users: users.map((u) => ({
        id: u.id,
        username: u.username,
        email: u.email,
        plan: u.plan,
        isAdmin: Boolean(u.is_admin),
        status: u.status,
        createdAt: u.created_at,
        lastLoginAt: u.last_login_at,
        fullName: u.full_name,
        profession: u.profession,
        professionCustom: u.profession_custom,
        profileType: u.profile_type,
        city: u.city,
        photoUrl: u.photo_url,
        isFeatured: Boolean(u.is_featured),
        totalViews: Number(u.totalViews),
        totalLeads: Number(u.totalLeads),
      })),
      total: Number(total),
      page,
      limit,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/users/:id
 * Fiche complète d'un utilisateur
 */
async function getAdminUser(req, res, next) {
  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [req.params.id]);
    const user = rows[0];
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

    const [[profile]] = await pool.query("SELECT * FROM profiles WHERE user_id = ?", [user.id]);
    const [[stats]] = await pool.query(
      `SELECT
        (SELECT COUNT(*) FROM portfolio_views WHERE portfolio_username = ?) AS totalViews,
        (SELECT COUNT(*) FROM portfolio_views WHERE portfolio_username = ? AND viewed_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) AS views30d,
        (SELECT COUNT(*) FROM portfolio_events WHERE portfolio_username = ? AND type IN ('whatsapp','call','email')) AS contactClicks,
        (SELECT COUNT(*) FROM leads WHERE user_id = ?) AS totalLeads,
        (SELECT COUNT(*) FROM profile_blocks WHERE user_id = ?) AS blocks,
        (SELECT COUNT(*) FROM users WHERE referred_by = ?) AS referrals`,
      [user.username, user.username, user.username, user.id, user.id, user.id]
    );
    const [subscriptions] = await pool.query(
      `SELECT id, operator, phone_number, amount, status, period, granted_by_admin, expires_at, created_at
       FROM subscriptions WHERE user_id = ? ORDER BY created_at DESC LIMIT 20`,
      [user.id]
    );
    let referrer = null;
    if (user.referred_by) {
      const [r] = await pool.query("SELECT id, username FROM users WHERE id = ?", [user.referred_by]);
      referrer = r[0] || null;
    }

    return res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        plan: user.plan,
        isAdmin: Boolean(user.is_admin),
        status: user.status,
        referralCode: user.referral_code,
        createdAt: user.created_at,
        lastLoginAt: user.last_login_at,
        referrer,
      },
      profile: profile ? formatProfile(profile) : null,
      stats: Object.fromEntries(Object.entries(stats).map(([k, v]) => [k, Number(v)])),
      subscriptions: subscriptions.map((s) => ({
        id: s.id,
        operator: s.operator,
        phoneNumber: s.phone_number,
        amount: s.amount,
        status: s.status,
        period: s.period,
        grantedByAdmin: Boolean(s.granted_by_admin),
        expiresAt: s.expires_at,
        createdAt: s.created_at,
      })),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/admin/users/:id  { status?, isFeatured? }
 */
async function updateAdminUser(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const { status, isFeatured } = req.body || {};

    if (status !== undefined) {
      if (!["active", "suspended"].includes(status)) return res.status(400).json({ message: "Statut invalide" });
      if (id === req.user.id) return res.status(400).json({ message: "Vous ne pouvez pas suspendre votre propre compte" });
      await pool.query("UPDATE users SET status = ? WHERE id = ?", [status, id]);
    }
    if (isFeatured !== undefined) {
      await pool.query("UPDATE profiles SET is_featured = ? WHERE user_id = ?", [isFeatured ? 1 : 0, id]);
    }
    return res.json({ message: "Utilisateur mis à jour" });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/admin/users/:id/premium  { months }  — months = 0 retire le Pro
 * Offrir un abonnement (partenariat, geste commercial, paiement reçu hors ligne...)
 */
async function setUserPremium(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const months = Math.max(0, Math.min(36, parseInt(req.body?.months) || 0));
    const [rows] = await pool.query("SELECT id FROM users WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ message: "Utilisateur introuvable" });

    if (months === 0) {
      await pool.query(
        "UPDATE subscriptions SET expires_at = NOW() WHERE user_id = ? AND status = 'success' AND expires_at > NOW()",
        [id]
      );
      await pool.query("UPDATE users SET plan = 'free' WHERE id = ?", [id]);
      return res.json({ message: "Abonnement Pro retiré" });
    }

    const [current] = await pool.query(
      "SELECT MAX(expires_at) AS expiresAt FROM subscriptions WHERE user_id = ? AND status = 'success'",
      [id]
    );
    const base =
      current[0]?.expiresAt && new Date(current[0].expiresAt) > new Date() ? new Date(current[0].expiresAt) : new Date();
    base.setMonth(base.getMonth() + months);

    await pool.query(
      `INSERT INTO subscriptions (user_id, operator, phone_number, amount, status, period, granted_by_admin, expires_at)
       VALUES (?, 'mtn', '', 0, 'success', ?, 1, ?)`,
      [id, months >= 12 ? "yearly" : "monthly", base]
    );
    await pool.query("UPDATE users SET plan = 'premium' WHERE id = ?", [id]);
    return res.json({ message: `${months} mois de Pro offerts`, expiresAt: base });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/admin/users/:id
 */
async function deleteAdminUser(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    if (id === req.user.id) return res.status(400).json({ message: "Vous ne pouvez pas supprimer votre propre compte" });
    const [rows] = await pool.query("SELECT username, is_admin FROM users WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ message: "Utilisateur introuvable" });
    if (rows[0].is_admin) return res.status(400).json({ message: "Impossible de supprimer un administrateur" });

    await pool.query("DELETE FROM portfolio_views WHERE portfolio_username = ?", [rows[0].username]);
    await pool.query("DELETE FROM portfolio_events WHERE portfolio_username = ?", [rows[0].username]);
    await pool.query("DELETE FROM users WHERE id = ?", [id]);
    return res.json({ message: "Utilisateur supprimé" });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/subscriptions?status=
 */
async function getAdminSubscriptions(req, res, next) {
  try {
    const params = [];
    let where = "";
    if (["pending", "success", "failed"].includes(req.query.status)) {
      where = "WHERE s.status = ?";
      params.push(req.query.status);
    }
    const [rows] = await pool.query(
      `SELECT s.*, u.username, u.email FROM subscriptions s JOIN users u ON u.id = s.user_id
       ${where} ORDER BY s.created_at DESC LIMIT 200`,
      params
    );
    return res.json(
      rows.map((s) => ({
        id: s.id,
        userId: s.user_id,
        username: s.username,
        email: s.email,
        operator: s.operator,
        phoneNumber: s.phone_number,
        amount: s.amount,
        status: s.status,
        period: s.period,
        grantedByAdmin: Boolean(s.granted_by_admin),
        externalRef: s.external_ref,
        expiresAt: s.expires_at,
        createdAt: s.created_at,
      }))
    );
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/professions
 * Répartition des métiers + métiers saisis librement (« Autre ») à ajouter au catalogue
 */
async function getAdminProfessions(req, res, next) {
  try {
    const [byProfession] = await pool.query(
      `SELECT profession, COUNT(*) AS count FROM profiles
       WHERE profession IS NOT NULL AND profession <> 'autre'
       GROUP BY profession ORDER BY count DESC`
    );
    const [byFamily] = await pool.query(
      `SELECT COALESCE(profile_type, 'inconnue') AS family, COUNT(*) AS count FROM profiles
       GROUP BY 1 ORDER BY count DESC`
    );
    const [custom] = await pool.query(
      `SELECT LOWER(TRIM(profession_custom)) AS label, COUNT(*) AS count, MAX(updated_at) AS lastSeen
       FROM profiles WHERE profession_custom IS NOT NULL AND TRIM(profession_custom) <> ''
       GROUP BY LOWER(TRIM(profession_custom)) ORDER BY count DESC, lastSeen DESC LIMIT 100`
    );
    return res.json({
      byProfession: byProfession.map((r) => ({ profession: r.profession, count: Number(r.count) })),
      byFamily: byFamily.map((r) => ({ family: r.family, count: Number(r.count) })),
      custom: custom.map((r) => ({ label: r.label, count: Number(r.count), lastSeen: r.lastSeen })),
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

module.exports = {
  getAdminStats,
  getAdminUsers,
  getAdminUser,
  updateAdminUser,
  setUserPremium,
  deleteAdminUser,
  getAdminSubscriptions,
  getAdminProfessions,
  getAdminWithdrawals,
  updateWithdrawal,
};
