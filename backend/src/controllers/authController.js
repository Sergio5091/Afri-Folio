const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

/**
 * Génère un code de parrainage unique de type REF-XXXXXX
 */
async function generateUniqueReferralCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code;
  let exists = true;

  while (exists) {
    const random = Array.from({ length: 6 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join("");
    code = `REF-${random}`;

    const [rows] = await pool.query(
      "SELECT id FROM users WHERE referral_code = ?",
      [code]
    );
    exists = rows.length > 0;
  }

  return code;
}

/**
 * Formate l'objet user pour la réponse (sans password_hash)
 */
function formatUser(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    plan: user.plan,
    referralCode: user.referral_code,
    isAdmin: user.is_admin,
    createdAt: user.created_at,
  };
}

// POST /api/auth/register
async function register(req, res, next) {
  try {
    const { username, email, password, referralCode } = req.body;

    // Validation basique
    if (!username || !email || !password) {
      return res.status(400).json({ message: "username, email et password sont requis" });
    }
    if (username.length < 3) {
      return res.status(400).json({ message: "Le nom d'utilisateur doit contenir au moins 3 caractères" });
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return res.status(400).json({ message: "Lettres, nombres, tirets et underscores uniquement" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Le mot de passe doit contenir au moins 6 caractères" });
    }

    // Vérifier unicité username/email
    const [existing] = await pool.query(
      "SELECT id FROM users WHERE username = ? OR email = ?",
      [username.toLowerCase(), email.toLowerCase()]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: "Ce nom d'utilisateur ou email est déjà utilisé" });
    }

    // Résoudre le parrain
    let referrerId = null;
    if (referralCode && referralCode.trim()) {
      const [referrer] = await pool.query(
        "SELECT id FROM users WHERE referral_code = ?",
        [referralCode.trim().toUpperCase()]
      );
      if (referrer.length > 0) {
        referrerId = referrer[0].id;
      }
    }

    // Hash du mot de passe
    const passwordHash = await bcrypt.hash(password, 12);

    // Générer un code de parrainage unique
    const newReferralCode = await generateUniqueReferralCode();

    // Insérer l'utilisateur
    const [result] = await pool.query(
      `INSERT INTO users (username, email, password_hash, referral_code, referred_by)
       VALUES (?, ?, ?, ?, ?)`,
      [username.toLowerCase(), email.toLowerCase(), passwordHash, newReferralCode, referrerId]
    );

    const userId = result.insertId;

    // Créer un profil vide pour l'utilisateur
    await pool.query(
      "INSERT INTO profiles (user_id, email_contact, profile_type) VALUES (?, ?, ?)",
      [userId, email.toLowerCase(), req.body.profileType || null]
    );

    // Générer le JWT
    const token = jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    const user = {
      id: userId,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      plan: "free",
      referral_code: newReferralCode,
      is_admin: false,
      created_at: new Date(),
    };

    return res.status(201).json({ token, user: formatUser(user) });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email et mot de passe requis" });
    }

    // Récupérer l'utilisateur
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email.toLowerCase()]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Identifiants incorrects" });
    }

    const user = rows[0];

    // Vérifier le mot de passe
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ message: "Identifiants incorrects" });
    }

    // Générer le JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    return res.status(200).json({ token, user: formatUser(user) });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login };
