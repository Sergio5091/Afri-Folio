const pool = require("../config/db");
const { formatProfile } = require("../utils/format");
const { TEMPLATES } = require("../config/constants");

// Champs modifiables : clé API → [colonne DB, type, longueur max]
const FIELDS = {
  profileType: ["profile_type", "string", 50],
  profession: ["profession", "string", 60],
  professionCustom: ["profession_custom", "string", 120],
  template: ["template", "template"],
  fullName: ["full_name", "string", 100],
  title: ["title", "string", 150],
  tagline: ["tagline", "string", 255],
  bio: ["bio", "string", 5000],
  photoUrl: ["photo_url", "string", 500],
  logoUrl: ["logo_url", "string", 500],
  skills: ["skills", "json"],
  services: ["services", "string", 5000],
  whatsapp: ["whatsapp", "string", 30],
  emailContact: ["email_contact", "string", 255],
  linkedin: ["linkedin", "string", 500],
  twitter: ["twitter", "string", 500],
  instagram: ["instagram", "string", 500],
  facebook: ["facebook", "string", 500],
  tiktok: ["tiktok", "string", 500],
  youtube: ["youtube", "string", 500],
  github: ["github", "string", 500],
  website: ["website", "string", 500],
  country: ["country", "string", 100],
  city: ["city", "string", 100],
  styleTheme: ["style_theme", "string", 30],
  primaryColor: ["primary_color", "color"],
  fontFamily: ["font_family", "string", 100],
  yearsExperience: ["years_experience", "int"],
  completedProjects: ["completed_projects", "int"],
  satisfiedClients: ["satisfied_clients", "int"],
  availableForWork: ["available_for_work", "bool"],
  listedInDirectory: ["listed_in_directory", "bool"],
};

function coerce(value, type, max) {
  if (value === undefined) return undefined;
  switch (type) {
    case "string":
      if (value == null) return null;
      return String(value).trim().slice(0, max) || null;
    case "int": {
      if (value === null || value === "") return null;
      const n = parseInt(value, 10);
      return Number.isFinite(n) && n >= 0 ? Math.min(n, 1_000_000) : null;
    }
    case "bool":
      return value ? 1 : 0;
    case "json":
      return JSON.stringify(Array.isArray(value) ? value.map(String).slice(0, 50) : []);
    case "color":
      return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value) ? value : null;
    case "template":
      return TEMPLATES.includes(value) ? value : null;
    default:
      return undefined;
  }
}

// GET /api/profile
async function getProfile(req, res, next) {
  try {
    const [rows] = await pool.query("SELECT * FROM profiles WHERE user_id = ?", [req.user.id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Profil introuvable" });
    }

    return res.json(formatProfile(rows[0]));
  } catch (err) {
    next(err);
  }
}

// PUT /api/profile — mise à jour partielle : seuls les champs envoyés sont modifiés
async function updateProfile(req, res, next) {
  try {
    const body = req.body || {};

    if (body.fullName !== undefined && String(body.fullName || "").trim().length < 2) {
      return res.status(400).json({ message: "Le nom est requis (min 2 caractères)" });
    }
    if (body.emailContact && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.emailContact)) {
      return res.status(400).json({ message: "Email de contact invalide" });
    }

    const sets = [];
    const values = [];
    for (const [key, [column, type, max]] of Object.entries(FIELDS)) {
      if (!(key in body)) continue;
      const value = coerce(body[key], type, max);
      if (value === undefined) continue;
      sets.push(`${column} = ?`);
      values.push(value);
    }

    if (sets.length > 0) {
      await pool.query(`UPDATE profiles SET ${sets.join(", ")} WHERE user_id = ?`, [...values, req.user.id]);
    }

    const [rows] = await pool.query("SELECT * FROM profiles WHERE user_id = ?", [req.user.id]);
    return res.json(formatProfile(rows[0]));
  } catch (err) {
    next(err);
  }
}

module.exports = { getProfile, updateProfile };
