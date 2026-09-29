const pool = require("../config/db");

/**
 * GET /api/referral/stats
 */
async function getReferralStats(req, res, next) {
  try {
    const userId = req.user.id;
    const username = req.user.username;

    // Total filleuls inscrits
    const [totalRef] = await pool.query(
      "SELECT COUNT(*) AS totalReferrals FROM users WHERE referred_by = ?",
      [userId]
    );

    // Filleuls actifs (premium)
    const [activeRef] = await pool.query(
      "SELECT COUNT(*) AS activeReferrals FROM users WHERE referred_by = ? AND plan = 'premium'",
      [userId]
    );

    // Gains totaux (commissions payées)
    const [earned] = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) AS totalEarned FROM commissions WHERE referrer_id = ? AND status = 'paid'",
      [userId]
    );

    // Total retiré (retraits approuvés)
    const [withdrawn] = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) AS totalWithdrawn FROM withdrawals WHERE user_id = ? AND status = 'approved'",
      [userId]
    );

    const walletBalance = Math.max(
      0,
      earned[0].totalEarned - withdrawn[0].totalWithdrawn
    );

    const appUrl = process.env.APP_URL || "http://localhost:3001";
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    return res.json({
      referralCode: req.user.referral_code,
      referralLink: `${frontendUrl}/inscription?ref=${req.user.referral_code}`,
      totalReferrals: totalRef[0].totalReferrals,
      activeReferrals: activeRef[0].activeReferrals,
      walletBalance,
      totalEarned: earned[0].totalEarned,
      totalWithdrawn: withdrawn[0].totalWithdrawn,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/referral/commissions
 */
async function getCommissions(req, res, next) {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query(
      `SELECT c.id, c.referee_id, u.username AS referee_username,
              c.amount, c.month, c.status, c.created_at
       FROM commissions c
       JOIN users u ON u.id = c.referee_id
       WHERE c.referrer_id = ?
       ORDER BY c.created_at DESC`,
      [userId]
    );

    return res.json(
      rows.map((r) => ({
        id: r.id,
        refereeId: r.referee_id,
        refereeUsername: r.referee_username,
        amount: r.amount,
        month: r.month,
        status: r.status,
        createdAt: r.created_at,
      }))
    );
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/referral/withdraw
 * Demande de retrait
 */
async function requestWithdrawal(req, res, next) {
  try {
    const userId = req.user.id;
    const { amount, method, phoneNumber } = req.body;

    // Validation
    if (!amount || isNaN(amount) || parseInt(amount) < 500) {
      return res.status(400).json({ message: "Le montant minimum de retrait est de 500 FCFA" });
    }

    const validMethods = ["mobile_money", "subscription_credit"];
    if (!method || !validMethods.includes(method)) {
      return res.status(400).json({ message: "Méthode de retrait invalide" });
    }

    if (method === "mobile_money" && !phoneNumber) {
      return res.status(400).json({ message: "Le numéro Mobile Money est requis" });
    }

    // Calculer le solde disponible
    const [earned] = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) AS totalEarned FROM commissions WHERE referrer_id = ? AND status = 'paid'",
      [userId]
    );
    const [withdrawn] = await pool.query(
      // Les retraits en attente sont déjà réservés : ils ne peuvent pas être redemandés
      "SELECT COALESCE(SUM(amount), 0) AS totalWithdrawn FROM withdrawals WHERE user_id = ? AND status IN ('approved', 'pending')",
      [userId]
    );

    const walletBalance = earned[0].totalEarned - withdrawn[0].totalWithdrawn;

    if (parseInt(amount) > walletBalance) {
      return res.status(400).json({ message: "Solde insuffisant (les retraits en attente sont déjà déduits)" });
    }

    // Créer la demande de retrait
    const [result] = await pool.query(
      `INSERT INTO withdrawals (user_id, amount, method, phone_number)
       VALUES (?, ?, ?, ?)`,
      [userId, parseInt(amount), method, phoneNumber || null]
    );

    return res.status(201).json({
      id: result.insertId,
      message: "Demande de retrait enregistrée avec succès",
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getReferralStats, getCommissions, requestWithdrawal };
