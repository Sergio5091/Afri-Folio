const pool = require("../config/db");

/**
 * GET /api/dashboard/summary
 * Résumé du tableau de bord de l'utilisateur connecté
 */
async function getDashboardSummary(req, res, next) {
  try {
    const userId = req.user.id;
    const username = req.user.username;

    // Vues totales et ce mois
    const [viewStats] = await pool.query(
      `SELECT
        COUNT(*) AS totalViews,
        SUM(CASE WHEN viewed_at >= DATE_FORMAT(NOW(), '%Y-%m-01') THEN 1 ELSE 0 END) AS viewsThisMonth
       FROM portfolio_views
       WHERE portfolio_username = ?`,
      [username]
    );

    // Filleuls actifs (premium)
    const [referralStats] = await pool.query(
      `SELECT COUNT(*) AS activeReferrals
       FROM users
       WHERE referred_by = ? AND plan = 'premium'`,
      [userId]
    );

    // Wallet balance = commissions payées - retraits approuvés
    const [walletData] = await pool.query(
      `SELECT
        COALESCE((SELECT SUM(amount) FROM commissions WHERE referrer_id = ? AND status = 'paid'), 0) AS totalEarned,
        COALESCE((SELECT SUM(amount) FROM withdrawals WHERE user_id = ? AND status = 'approved'), 0) AS totalWithdrawn`,
      [userId, userId]
    );

    const walletBalance = walletData[0].totalEarned - walletData[0].totalWithdrawn;

    // Vérifier si le profil est complet
    const [profileData] = await pool.query(
      `SELECT full_name, title, bio, services, email_contact
       FROM profiles WHERE user_id = ?`,
      [userId]
    );

    const profile = profileData[0];
    const profileComplete = !!(
      profile &&
      profile.full_name &&
      profile.title &&
      profile.bio &&
      profile.services &&
      profile.email_contact
    );

    // Date d'expiration de l'abonnement
    const [subData] = await pool.query(
      `SELECT expires_at FROM subscriptions
       WHERE user_id = ? AND status = 'success'
       ORDER BY expires_at DESC LIMIT 1`,
      [userId]
    );

    const subscriptionExpiresAt = subData.length > 0 ? subData[0].expires_at : null;

    return res.json({
      plan: req.user.plan,
      portfolioUrl: `/portfolio/${username}`,
      totalViews: viewStats[0].totalViews || 0,
      viewsThisMonth: viewStats[0].viewsThisMonth || 0,
      activeReferrals: referralStats[0].activeReferrals || 0,
      walletBalance: Math.max(0, walletBalance),
      profileComplete,
      subscriptionExpiresAt,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getDashboardSummary };
