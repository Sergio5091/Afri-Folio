const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const { formatUser, slugify } = require("../utils/format");
const { sanitizeBlocks } = require("../utils/blocks");
const { RESERVED_USERNAMES, TEMPLATES } = require("../config/constants");

const USERNAME_RE = /^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Génère un code de parrainage unique de type REF-XXXXXX
 */
async function generateUniqueReferralCode(db = pool) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  for (;;) {
    const random = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    const code = `REF-${random}`;
    const [rows] = await db.query("SELECT id FROM users WHERE referral_code = ?", [code]);
    if (rows.length === 0) return code;
  }
}

function validateUsername(username) {
  if (!USERNAME_RE.test(username)) {
    return "3 à 40 caractères : lettres minuscules, chiffres et tirets (pas au début ni à la fin)";
  }
  if (RESERVED_USERNAMES.has(username)) return "Cet identifiant est réservé";
  return null;
}

async function isUsernameTaken(username, db = pool) {
  const [rows] = await db.query("SELECT id FROM users WHERE username = ?", [username]);
  return rows.length > 0;
}

/** Trouve un identifiant libre à partir d'une base ("aminata-diallo", "aminata-diallo-2"...) */
async function findAvailableUsername(base, db = pool) {
  let root = slugify(base) || "pro";
  if (root.length < 3) root = `${root}-pro`;
  if (RESERVED_USERNAMES.has(root)) root = `${root}-pro`;
  if (!(await isUsernameTaken(root, db))) return root;
  for (let i = 2; i < 500; i++) {
    const candidate = `${root.slice(0, 36)}-${i}`;
    if (!(await isUsernameTaken(candidate, db))) return candidate;
  }
  return `${root.slice(0, 30)}-${Date.now().toString(36)}`;
}

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "30d" });
}

const str = (v, max) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null);

// GET /api/auth/username-available?u=...&name=...
async function usernameAvailable(req, res, next) {
  try {
    const wanted = slugify(req.query.u || "");
    if (wanted) {
      const error = validateUsername(wanted);
      const taken = !error && (await isUsernameTaken(wanted));
      return res.json({
        username: wanted,
        available: !error && !taken,
        reason: error || (taken ? "Déjà utilisé" : null),
        suggestion: error || taken ? await findAvailableUsername(wanted) : wanted,
      });
    }
    const suggestion = await findAvailableUsername(req.query.name || "pro");
    return res.json({ username: suggestion, available: true, reason: null, suggestion });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/register
// Accepte soit une inscription simple (email + mot de passe), soit la totalité
// du parcours guidé : métier, infos, services... Le portfolio est créé en une fois.
async function register(req, res, next) {
  const body = req.body || {};
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");

  if (!EMAIL_RE.test(email)) return res.status(400).json({ message: "Adresse email invalide" });
  if (password.length < 6) {
    return res.status(400).json({ message: "Le mot de passe doit contenir au moins 6 caractères" });
  }

  let blocks = [];
  try {
    blocks = sanitizeBlocks(Array.isArray(body.blocks) ? body.blocks : []);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }

  const conn = await pool.getConnection();
  try {
    const [existingEmail] = await conn.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existingEmail.length > 0) {
      return res.status(409).json({ message: "Un compte existe déjà avec cet email. Connectez-vous." });
    }

    // Identifiant : celui choisi, sinon généré depuis le nom
    let username;
    if (body.username) {
      username = slugify(body.username);
      const error = validateUsername(username);
      if (error) {
        return res.status(400).json({ message: error });
      }
      if (await isUsernameTaken(username, conn)) {
        return res.status(409).json({ message: "Cet identifiant est déjà pris", field: "username" });
      }
    } else {
      username = await findAvailableUsername(body.fullName || email.split("@")[0], conn);
    }

    // Parrain
    let referrerId = null;
    if (typeof body.referralCode === "string" && body.referralCode.trim()) {
      const [referrer] = await conn.query("SELECT id FROM users WHERE referral_code = ?", [
        body.referralCode.trim().toUpperCase(),
      ]);
      if (referrer.length > 0) referrerId = referrer[0].id;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const referralCode = await generateUniqueReferralCode(conn);
    const template = TEMPLATES.includes(body.template) ? body.template : null;

    await conn.beginTransaction();

    const [result] = await conn.query(
      `INSERT INTO users (username, email, password_hash, referral_code, referred_by, last_login_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [username, email, passwordHash, referralCode, referrerId]
    );
    const userId = result.insertId;

    await conn.query(
      `INSERT INTO profiles
        (user_id, profile_type, profession, profession_custom, template, full_name, title, tagline, bio,
         whatsapp, email_contact, city, country, years_experience, primary_color, style_theme)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        str(body.profileType, 50),
        str(body.profession, 60),
        str(body.professionCustom, 120),
        template,
        str(body.fullName, 100),
        str(body.title, 150),
        str(body.tagline, 255),
        str(body.bio, 5000),
        str(body.whatsapp, 30),
        str(body.emailContact, 255) || email,
        str(body.city, 100),
        str(body.country, 100),
        Number.isInteger(body.yearsExperience) ? body.yearsExperience : null,
        str(body.primaryColor, 10),
        template || "modern",
      ]
    );

    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];
      await conn.query(
        "INSERT INTO profile_blocks (user_id, type, position, visible, data) VALUES (?, ?, ?, ?, ?)",
        [userId, b.type, i, b.visible ? 1 : 0, JSON.stringify(b.data)]
      );
    }

    await conn.commit();

    const [rows] = await conn.query("SELECT * FROM users WHERE id = ?", [userId]);
    return res.status(201).json({ token: signToken(userId), user: formatUser(rows[0]) });
  } catch (err) {
    try {
      await conn.rollback();
    } catch {
      /* transaction non démarrée */
    }
    next(err);
  } finally {
    conn.release();
  }
}

// POST /api/auth/login — accepte l'email ou l'identifiant
async function login(req, res, next) {
  try {
    const identifier = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");

    if (!identifier || !password) {
      return res.status(400).json({ message: "Email et mot de passe requis" });
    }

    const [rows] = await pool.query("SELECT * FROM users WHERE email = ? OR username = ? LIMIT 1", [
      identifier,
      identifier,
    ]);

    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect" });
    }
    if (user.status === "suspended") {
      return res.status(403).json({ message: "Ce compte est suspendu. Contactez le support." });
    }

    await pool.query("UPDATE users SET last_login_at = NOW() WHERE id = ?", [user.id]);

    return res.status(200).json({ token: signToken(user.id), user: formatUser(user) });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/me
async function me(req, res) {
  return res.json(formatUser(req.user));
}

module.exports = {
  register,
  login,
  me,
  usernameAvailable,
  validateUsername,
  isUsernameTaken,
};
