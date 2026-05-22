const jwt = require("jsonwebtoken");
const pool = require("../config/db");

/**
 * Middleware: vérifie le JWT et attache req.user
 */
async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token manquant ou invalide" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Vérifier que l'utilisateur existe toujours en DB
    const [rows] = await pool.query(
      "SELECT id, username, email, plan, referral_code, is_admin, created_at FROM users WHERE id = ?",
      [decoded.userId]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Utilisateur introuvable" });
    }

    req.user = rows[0];
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expiré" });
    }
    return res.status(401).json({ message: "Token invalide" });
  }
}

module.exports = authenticate;
