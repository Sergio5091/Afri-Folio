const pool = require("../config/db");
const {
  SUBSCRIPTION_PRICE,
  SUBSCRIPTION_PRICE_YEARLY,
  COMMISSION_RATE,
  FREE_PLAN_LIMITS,
} = require("../config/constants");

const PERIODS = {
  monthly: { price: SUBSCRIPTION_PRICE, months: 1 },
  yearly: { price: SUBSCRIPTION_PRICE_YEARLY, months: 12 },
};

/**
 * GET /api/subscription/plans (public)
 * Source unique des prix : la page d'accueil et le dashboard lisent ceci.
 */
function getPlans(_req, res) {
  return res.json({
    currency: "FCFA",
    monthly: PERIODS.monthly.price,
    yearly: PERIODS.yearly.price,
    commissionRate: COMMISSION_RATE,
    freeLimits: FREE_PLAN_LIMITS,
  });
}

/**
 * Active un abonnement payé : prolonge depuis l'expiration en cours si elle
 * est dans le futur, passe le compte en premium et crédite le parrain.
 */
async function activateSubscription(subscriptionId, externalRef = null) {
  const [subs] = await pool.query("SELECT * FROM subscriptions WHERE id = ?", [subscriptionId]);
  const sub = subs[0];
  if (!sub) return null;
  if (sub.status === "success") return sub;

  const [current] = await pool.query(
    `SELECT MAX(expires_at) AS expiresAt FROM subscriptions WHERE user_id = ? AND status = 'success'`,
    [sub.user_id]
  );
  const base =
    current[0]?.expiresAt && new Date(current[0].expiresAt) > new Date() ? new Date(current[0].expiresAt) : new Date();
  base.setMonth(base.getMonth() + (PERIODS[sub.period]?.months || 1));

  await pool.query("UPDATE subscriptions SET status = 'success', external_ref = ?, expires_at = ? WHERE id = ?", [
    externalRef,
    base,
    subscriptionId,
  ]);
  await pool.query("UPDATE users SET plan = 'premium' WHERE id = ?", [sub.user_id]);

  // Commission du parrain : un pourcentage de chaque paiement
  const [userRows] = await pool.query("SELECT referred_by FROM users WHERE id = ?", [sub.user_id]);
  const referrerId = userRows[0]?.referred_by;
  if (referrerId) {
    const month = new Date().toISOString().slice(0, 7); // "YYYY-MM"
    await pool.query(
      `INSERT IGNORE INTO commissions (referrer_id, referee_id, amount, month, status)
       VALUES (?, ?, ?, ?, 'paid')`,
      [referrerId, sub.user_id, Math.floor(sub.amount * COMMISSION_RATE), month]
    );
  }

  return { ...sub, status: "success", expires_at: base };
}

/**
 * POST /api/subscription/initiate  { operator, phoneNumber, period }
 * Initie un paiement Mobile Money
 *
 * NOTE: stub prêt à être connecté à un vrai provider (FedaPay, CinetPay, KkiaPay...)
 */
async function initiatePayment(req, res, next) {
  try {
    const userId = req.user.id;
    const { operator, phoneNumber } = req.body || {};
    const period = PERIODS[req.body?.period] ? req.body.period : "monthly";

    if (!["mtn", "moov", "wave"].includes(operator)) {
      return res.status(400).json({ message: "Opérateur invalide (mtn, moov, wave)" });
    }
    if (!phoneNumber || String(phoneNumber).replace(/\D/g, "").length < 8) {
      return res.status(400).json({ message: "Numéro de téléphone invalide" });
    }

    const [result] = await pool.query(
      `INSERT INTO subscriptions (user_id, operator, phone_number, amount, status, period)
       VALUES (?, ?, ?, ?, 'pending', ?)`,
      [userId, operator, String(phoneNumber).trim(), PERIODS[period].price, period]
    );

    // ============================================================
    // TODO: Intégrer ici l'API du provider de paiement, par ex. :
    // const payment = await paymentService.initiate({
    //   amount: PERIODS[period].price, currency: 'XOF', phoneNumber, operator,
    //   transactionId: String(result.insertId),
    //   callbackUrl: `${process.env.APP_URL}/api/subscription/webhook`,
    // });
    // return res.json({ subscriptionId: result.insertId, paymentUrl: payment.url, message: '...' });
    // ============================================================

    return res.json({
      subscriptionId: result.insertId,
      message: `Paiement de ${PERIODS[period].price} FCFA initié via ${operator.toUpperCase()}. Validez sur votre téléphone.`,
      paymentUrl: null,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/subscription/webhook
 * Callback du provider de paiement (route publique)
 */
async function handleWebhook(req, res, next) {
  try {
    // ============================================================
    // TODO: Valider la signature du webhook selon le provider
    // if (!validateSignature(req.body, req.headers['x-webhook-signature'])) {
    //   return res.status(401).json({ message: 'Signature invalide' });
    // }
    // ============================================================
    const { subscriptionId, status, externalRef } = req.body || {};
    if (!subscriptionId || !status) {
      return res.status(400).json({ message: "Données webhook invalides" });
    }

    if (status === "success") {
      const sub = await activateSubscription(subscriptionId, externalRef || null);
      if (!sub) return res.status(404).json({ message: "Abonnement introuvable" });
    } else if (status === "failed") {
      await pool.query("UPDATE subscriptions SET status = 'failed' WHERE id = ? AND status = 'pending'", [
        subscriptionId,
      ]);
    }

    return res.json({ message: "Webhook traité" });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/subscription/history
 */
async function getHistory(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT id, operator, amount, status, period, granted_by_admin, expires_at, created_at
       FROM subscriptions WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`,
      [req.user.id]
    );
    return res.json(
      rows.map((r) => ({
        id: r.id,
        operator: r.operator,
        amount: r.amount,
        status: r.status,
        period: r.period,
        grantedByAdmin: Boolean(r.granted_by_admin),
        expiresAt: r.expires_at,
        createdAt: r.created_at,
      }))
    );
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/subscription/simulate-payment  { period }
 * MODE DEV UNIQUEMENT — passe le compte en premium sans provider.
 */
async function simulatePayment(req, res, next) {
  if (process.env.NODE_ENV === "production") {
    return res.status(403).json({ message: "Non disponible en production" });
  }
  try {
    const period = PERIODS[req.body?.period] ? req.body.period : "monthly";
    const [result] = await pool.query(
      `INSERT INTO subscriptions (user_id, operator, phone_number, amount, status, period)
       VALUES (?, 'mtn', '00000000', ?, 'pending', ?)`,
      [req.user.id, PERIODS[period].price, period]
    );
    const sub = await activateSubscription(result.insertId, "SIMULATION");
    return res.json({ message: "✅ Paiement simulé — compte passé en Pro", plan: "premium", expiresAt: sub.expires_at });
  } catch (err) {
    next(err);
  }
}

module.exports = { getPlans, initiatePayment, handleWebhook, getHistory, simulatePayment, activateSubscription };
