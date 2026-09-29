const bcrypt = require("bcryptjs");
const pool = require("../config/db");
const { formatUser, slugify } = require("../utils/format");
const { validateUsername, isUsernameTaken } = require("./authController");

async function checkPassword(userId, password) {
  const [rows] = await pool.query("SELECT password_hash FROM users WHERE id = ?", [userId]);
  return rows.length > 0 && bcrypt.compare(String(password || ""), rows[0].password_hash);
}

// PUT /api/account/password  { currentPassword, newPassword }
async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!newPassword || String(newPassword).length < 6) {
      return res.status(400).json({ message: "Le nouveau mot de passe doit contenir au moins 6 caractères" });
    }
    if (!(await checkPassword(req.user.id, currentPassword))) {
      return res.status(400).json({ message: "Mot de passe actuel incorrect" });
    }
    const hash = await bcrypt.hash(String(newPassword), 12);
    await pool.query("UPDATE users SET password_hash = ? WHERE id = ?", [hash, req.user.id]);
    return res.json({ message: "Mot de passe modifié" });
  } catch (err) {
    next(err);
  }
}

// PUT /api/account/username  { username }
// Change l'adresse du portfolio. Les statistiques suivent le nouvel identifiant.
async function changeUsername(req, res, next) {
  const username = slugify(req.body?.username);
  const error = validateUsername(username);
  if (error) return res.status(400).json({ message: error });
  if (username === req.user.username) return res.json(formatUser(req.user));

  const conn = await pool.getConnection();
  try {
    if (await isUsernameTaken(username, conn)) {
      return res.status(409).json({ message: "Cet identifiant est déjà pris" });
    }
    await conn.beginTransaction();
    await conn.query("UPDATE users SET username = ? WHERE id = ?", [username, req.user.id]);
    await conn.query("UPDATE portfolio_views SET portfolio_username = ? WHERE portfolio_username = ?", [
      username,
      req.user.username,
    ]);
    await conn.query("UPDATE portfolio_events SET portfolio_username = ? WHERE portfolio_username = ?", [
      username,
      req.user.username,
    ]);
    await conn.commit();
    return res.json(formatUser({ ...req.user, username }));
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
}

// PUT /api/account/email  { email, password }
async function changeEmail(req, res, next) {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: "Adresse email invalide" });
    if (!(await checkPassword(req.user.id, req.body?.password))) {
      return res.status(400).json({ message: "Mot de passe incorrect" });
    }
    const [exists] = await pool.query("SELECT id FROM users WHERE email = ? AND id <> ?", [email, req.user.id]);
    if (exists.length > 0) return res.status(409).json({ message: "Cet email est déjà utilisé" });
    await pool.query("UPDATE users SET email = ? WHERE id = ?", [email, req.user.id]);
    return res.json(formatUser({ ...req.user, email }));
  } catch (err) {
    next(err);
  }
}

// DELETE /api/account  { password }
async function deleteAccount(req, res, next) {
  try {
    if (req.user.is_admin) {
      return res.status(400).json({ message: "Un compte administrateur ne peut pas être supprimé ici" });
    }
    if (!(await checkPassword(req.user.id, req.body?.password))) {
      return res.status(400).json({ message: "Mot de passe incorrect" });
    }
    await pool.query("DELETE FROM portfolio_views WHERE portfolio_username = ?", [req.user.username]);
    await pool.query("DELETE FROM portfolio_events WHERE portfolio_username = ?", [req.user.username]);
    // Les tables liées (profil, blocs, projets, messages...) sont supprimées en cascade
    await pool.query("DELETE FROM users WHERE id = ?", [req.user.id]);
    return res.json({ message: "Compte supprimé" });
  } catch (err) {
    next(err);
  }
}

module.exports = { changePassword, changeUsername, changeEmail, deleteAccount };
