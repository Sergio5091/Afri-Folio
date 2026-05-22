const pool = require("../config/db");

const SUBSCRIPTION_PRICE = parseInt(process.env.SUBSCRIPTION_PRICE || "360");
const COMMISSION_RATE = parseFloat(process.env.COMMISSION_RATE || "0.10");

/**
 * POST /api/subscription/initiate
 * Initie un paiement Mobile Money
 *
 * NOTE: Cette implémentation est un stub prêt à être connecté
 * à un vrai provider (CinetPay, FedaPay, etc.)
 * Pour l'instant, elle simule un paiement en attente.
 */
async function initiatePayment(req, res, next) {
  try {
    const userId = req.user.id;
    const { operator, phoneNumber } = req.body;

    const validOperators = ["mtn", "moov", "wave"];
    if (!operator || !validOperators.includes(operator)) {
      return res.status(400).json({ message: "Opérateur invalide (mtn, moov, wave)" });
    }

    if (!phoneNumber || phoneNumber.trim().length < 8) {
      return res.status(400).json({ message: "Numéro de téléphone invalide" });
    }

    // Vérifier si l'utilisateur a déjà un abonnement actif
    const [activeSub] = await pool.query(
      `SELECT id FROM subscriptions
       WHERE user_id = ? AND status = 'success' AND expires_at > NOW()`,
      [userId]
    );

    if (activeSub.length > 0) {
      return res.status(409).json({ message: "Vous avez déjà un abonnement actif" });
    }

    // Créer l'entrée de paiement en attente
    const [result] = await pool.query(
      `INSERT INTO subscriptions (user_id, operator, phone_number, amount, status)
       VALUES (?, ?, ?, ?, 'pending')`,
      [userId, operator, phoneNumber.trim(), SUBSCRIPTION_PRICE]
    );

    const subscriptionId = result.insertId;

    // ============================================================
    // TODO: Intégrer ici l'API du provider de paiement
    // Exemple avec CinetPay ou FedaPay :
    //
    // const paymentResponse = await paymentService.initiate({
    //   amount: SUBSCRIPTION_PRICE,
    //   currency: 'XOF',
    //   phoneNumber,
    //   operator,
    //   transactionId: subscriptionId.toString(),
    //   callbackUrl: `${process.env.APP_URL}/api/subscription/webhook`,
    // });
    //
    // return res.json({ paymentUrl: paymentResponse.paymentUrl });
    // ============================================================

    // Simulation : retourner un message de confirmation
    return res.json({
      subscriptionId,
      message: `Paiement de ${SUBSCRIPTION_PRICE} FCFA initié via ${operator.toUpperCase()}. Validez sur votre téléphone.`,
      paymentUrl: null, // Sera rempli avec le vrai provider
    });
  } catch (err) {
    next(err);
  }
}
/**
 * POST /api/subscription/webhook
 * Callback du provider de paiement (route publique)
 * Appelé automatiquement par le provider après paiement
 */
async function handleWebhook(req, res, next) {
  try {
    // ============================================================
    // TODO: Valider la signature du webhook selon le provider
    // const signature = req.headers['x-webhook-signature'];
    // if (!validateSignature(req.body, signature)) {
    //   return res.status(401).json({ message: 'Signature invalide' });
    // }
    // ============================================================

    const { subscriptionId, status, externalRef } = req.body;

    if (!subscriptionId || !status) {
      return res.status(400).json({ message: "Données webhook invalides" });
    }

    // Récupérer l'abonnement
    const [subs] = await pool.query(
      "SELECT * FROM subscriptions WHERE id = ?",
      [subscriptionId]
    );

    if (subs.length === 0) {
      return res.status(404).json({ message: "Abonnement introuvable" });
    }

    const sub = subs[0];

    if (status === "success") {
      // Calculer la date d'expiration (1 mois)
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      // Mettre à jour l'abonnement
      await pool.query(
        `UPDATE subscriptions SET status = 'success', external_ref = ?, expires_at = ?
         WHERE id = ?`,
        [externalRef || null, expiresAt, subscriptionId]
      );

      // Passer l'utilisateur en premium
      await pool.query(
        "UPDATE users SET plan = 'premium' WHERE id = ?",
        [sub.user_id]
      );

      // Créer la commission pour le parrain (si l'utilisateur a été parrainé)
      const [userRows] = await pool.query(
        "SELECT referred_by FROM users WHERE id = ?",
        [sub.user_id]
      );

      if (userRows[0]?.referred_by) {
        const referrerId = userRows[0].referred_by;
        const commissionAmount = Math.floor(SUBSCRIPTION_PRICE * COMMISSION_RATE);
        const month = new Date().toISOString().slice(0, 7); // "YYYY-MM"

        // Insérer la commission (ignore si déjà existante pour ce mois)
        await pool.query(
          `INSERT IGNORE INTO commissions (referrer_id, referee_id, amount, month, status)
           VALUES (?, ?, ?, ?, 'paid')`,
          [referrerId, sub.user_id, commissionAmount, month]
        );
      }
    } else if (status === "failed") {
      await pool.query(
        "UPDATE subscriptions SET status = 'failed' WHERE id = ?",
        [subscriptionId]
      );
    }

    return res.json({ message: "Webhook traité" });
  } catch (err) {
    next(err);
  }
}

module.exports = { initiatePayment, handleWebhook };

// ============================================================
// MODE DEV UNIQUEMENT — Simulation de paiement
// ============================================================

/**
 * POST /api/subscription/simulate-payment
 * Passe l'utilisateur connecté en premium instantanément.
 * DÉSACTIVÉ en production.
 */
async function simulatePayment(req, res, next) {
  if (process.env.NODE_ENV === "production") {
    return res.status(403).json({ message: "Non disponible en production" });
  }

  try {
    const userId = req.user.id;

    // Calculer la date d'expiration (1 mois)
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    // Créer un abonnement success
    await pool.query(
      `INSERT INTO subscriptions (user_id, operator, phone_number, amount, status, expires_at)
       VALUES (?, 'mtn', '00000000', ?, 'success', ?)`,
      [userId, SUBSCRIPTION_PRICE, expiresAt]
    );

    // Passer en premium
    await pool.query("UPDATE users SET plan = 'premium' WHERE id = ?", [userId]);

    // Créer la commission pour le parrain si applicable
    const [userRows] = await pool.query(
      "SELECT referred_by FROM users WHERE id = ?",
      [userId]
    );

    if (userRows[0]?.referred_by) {
      const referrerId = userRows[0].referred_by;
      const commissionAmount = Math.floor(SUBSCRIPTION_PRICE * COMMISSION_RATE);
      const month = new Date().toISOString().slice(0, 7);

      await pool.query(
        `INSERT IGNORE INTO commissions (referrer_id, referee_id, amount, month, status)
         VALUES (?, ?, ?, ?, 'paid')`,
        [referrerId, userId, commissionAmount, month]
      );
    }

    return res.json({
      message: "✅ Paiement simulé — compte passé en Premium",
      plan: "premium",
      expiresAt,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { initiatePayment, handleWebhook, simulatePayment };