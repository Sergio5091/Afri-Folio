const jwt = require("jsonwebtoken");
const pool = require("../config/db");

/**
 * Rétrograde en "free" un compte premium dont l'abonnement a expiré.
 * Retourne le plan à jour.
 */
async function refreshPlan(user) {
  if (user.plan !== "premium") return user.plan;
  const [subs] = await pool.query(
    `SELECT MAX(expires_at) AS expiresAt FROM subscriptions
     WHERE user_id = ? AND status = 'success'`,
    [user.id]
  );
  const expiresAt = subs[0]?.expiresAt;
  if (expiresAt && new Date(expiresAt) < new Date()) {
    await pool.query("UPDATE users SET plan = 'free' WHERE id = ?", [user.id]);
    return "free";
  }
  return user.plan;
}

/**
 * Middleware: vérifie le JWT et attache req.user
 */
async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token manquant ou invalide" });
  }

  const token = authHeader.split(" ")[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Session expirée, reconnectez-vous" });
    }
    return res.status(401).json({ message: "Token invalide" });
  }

  try {
    // Vérifier que l'utilisateur existe toujours en DB
    const [rows] = await pool.query(
      "SELECT id, username, email, plan, referral_code, is_admin, status, created_at FROM users WHERE id = ?",
      [decoded.userId]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Utilisateur introuvable" });
    }
    if (rows[0].status === "suspended") {
      return res.status(403).json({ message: "Ce compte est suspendu. Contactez le support." });
    }

    req.user = rows[0];
    req.user.plan = await refreshPlan(req.user);
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = authenticate;
