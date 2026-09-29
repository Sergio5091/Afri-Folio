const pool = require("../config/db");

/**
 * GET /api/dashboard/summary
 * Résumé du tableau de bord de l'utilisateur connecté
 */
async function getDashboardSummary(req, res, next) {
  try {
    const userId = req.user.id;
    const username = req.user.username;

    const [[views]] = await pool.query(
      `SELECT
        COUNT(*) AS totalViews,
        COALESCE(SUM(viewed_at >= DATE_FORMAT(NOW(), '%Y-%m-01')), 0) AS viewsThisMonth,
        COALESCE(SUM(viewed_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)), 0) AS viewsLast7Days,
        COALESCE(SUM(viewed_at >= DATE_SUB(NOW(), INTERVAL 14 DAY) AND viewed_at < DATE_SUB(NOW(), INTERVAL 7 DAY)), 0) AS viewsPrevious7Days
       FROM portfolio_views WHERE portfolio_username = ?`,
      [username]
    );

    const [[clicks]] = await pool.query(
      `SELECT
        COALESCE(SUM(type IN ('whatsapp','call','email')), 0) AS contactClicksThisMonth
       FROM portfolio_events
       WHERE portfolio_username = ? AND created_at >= DATE_FORMAT(NOW(), '%Y-%m-01')`,
      [username]
    );

    const [[leads]] = await pool.query(
      "SELECT COUNT(*) AS totalLeads, COALESCE(SUM(is_read = 0), 0) AS unreadLeads FROM leads WHERE user_id = ?",
      [userId]
    );

    const [[referrals]] = await pool.query(
      "SELECT COUNT(*) AS activeReferrals FROM users WHERE referred_by = ? AND plan = 'premium'",
      [userId]
    );

    // Wallet balance = commissions payées - retraits approuvés
    const [[wallet]] = await pool.query(
      `SELECT
        COALESCE((SELECT SUM(amount) FROM commissions WHERE referrer_id = ? AND status = 'paid'), 0) AS totalEarned,
        COALESCE((SELECT SUM(amount) FROM withdrawals WHERE user_id = ? AND status = 'approved'), 0) AS totalWithdrawn`,
      [userId, userId]
    );

    const [[profile]] = await pool.query(
      "SELECT full_name, title, bio, whatsapp, photo_url FROM profiles WHERE user_id = ?",
      [userId]
    );
    const profileComplete = !!(profile && profile.full_name && profile.title && profile.bio && profile.whatsapp);

    const [subData] = await pool.query(
      `SELECT expires_at FROM subscriptions WHERE user_id = ? AND status = 'success'
       ORDER BY expires_at DESC LIMIT 1`,
      [userId]
    );

    return res.json({
      username,
      plan: req.user.plan,
      portfolioUrl: `/${username}`,
      totalViews: Number(views.totalViews) || 0,
      viewsThisMonth: Number(views.viewsThisMonth) || 0,
      viewsLast7Days: Number(views.viewsLast7Days) || 0,
      viewsPrevious7Days: Number(views.viewsPrevious7Days) || 0,
      contactClicksThisMonth: Number(clicks.contactClicksThisMonth) || 0,
      totalLeads: Number(leads.totalLeads) || 0,
      unreadLeads: Number(leads.unreadLeads) || 0,
      activeReferrals: Number(referrals.activeReferrals) || 0,
      walletBalance: Math.max(0, Number(wallet.totalEarned) - Number(wallet.totalWithdrawn)),
      profileComplete,
      subscriptionExpiresAt: subData.length > 0 ? subData[0].expires_at : null,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getDashboardSummary };
