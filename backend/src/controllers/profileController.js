const pool = require("../config/db");

/**
 * Convertit les colonnes snake_case DB → camelCase pour le frontend
 */
function formatProfile(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    profileType: row.profile_type,
    fullName: row.full_name,
    title: row.title,
    tagline: row.tagline,
    bio: row.bio,
    photoUrl: row.photo_url,
    logoUrl: row.logo_url,
    skills: row.skills ? (typeof row.skills === "string" ? JSON.parse(row.skills) : row.skills) : [],
    services: row.services,
    whatsapp: row.whatsapp,
    emailContact: row.email_contact,
    linkedin: row.linkedin,
    twitter: row.twitter,
    github: row.github,
    website: row.website,
    country: row.country,
    city: row.city,
    styleTheme: row.style_theme,
    primaryColor: row.primary_color,
    fontFamily: row.font_family,
    yearsExperience: row.years_experience,
    completedProjects: row.completed_projects,
    satisfiedClients: row.satisfied_clients,
    availableForWork: Boolean(row.available_for_work),
    updatedAt: row.updated_at,
  };
}

// GET /api/profile
async function getProfile(req, res, next) {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM profiles WHERE user_id = ?",
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Profil introuvable" });
    }

    return res.json(formatProfile(rows[0]));
  } catch (err) {
    next(err);
  }
}

// PUT /api/profile
async function updateProfile(req, res, next) {
  try {
    const {
      profileType,
      fullName,
      title,
      tagline,
      bio,
      photoUrl,
      logoUrl,
      skills,
      services,
      whatsapp,
      emailContact,
      linkedin,
      twitter,
      github,
      website,
      country,
      city,
      styleTheme,
      primaryColor,
      fontFamily,
      yearsExperience,
      completedProjects,
      satisfiedClients,
      availableForWork,
    } = req.body;

    // Validation minimale
    if (!fullName || fullName.length < 2) {
      return res.status(400).json({ message: "Le nom est requis (min 2 caractères)" });
    }
    if (!title || title.length < 2) {
      return res.status(400).json({ message: "Le titre est requis (min 2 caractères)" });
    }
    if (!bio || bio.length < 10) {
      return res.status(400).json({ message: "Une courte bio est requise (min 10 caractères)" });
    }
    if (!emailContact) {
      return res.status(400).json({ message: "L'email de contact est requis" });
    }
    // services est optionnel à la sauvegarde (peut être rempli plus tard)
    if (services && services.trim().length > 0 && services.trim().length < 5) {
      return res.status(400).json({ message: "Décrivez vos services (min 5 caractères)" });
    }

    const validThemes = ["minimalist", "modern", "classic", "bold", "elegant", "sidebar", "card", "timeline", "magazine", "neon"];
    const theme = validThemes.includes(styleTheme) ? styleTheme : "modern";

    const skillsJson = JSON.stringify(Array.isArray(skills) ? skills : []);

    await pool.query(
      `UPDATE profiles SET
        profile_type = ?,
        full_name = ?,
        title = ?,
        tagline = ?,
        bio = ?,
        photo_url = ?,
        logo_url = ?,
        skills = ?,
        services = ?,
        whatsapp = ?,
        email_contact = ?,
        linkedin = ?,
        twitter = ?,
        github = ?,
        website = ?,
        country = ?,
        city = ?,
        style_theme = ?,
        primary_color = ?,
        font_family = ?,
        years_experience = ?,
        completed_projects = ?,
        satisfied_clients = ?,
        available_for_work = ?
      WHERE user_id = ?`,
      [
        profileType || null,
        fullName || null,
        title || null,
        tagline || null,
        bio || null,
        photoUrl || null,
        logoUrl || null,
        skillsJson,
        services || null,
        whatsapp || null,
        emailContact || null,
        linkedin || null,
        twitter || null,
        github || null,
        website || null,
        country || null,
        city || null,
        theme,
        primaryColor || "#4f46e5",
        fontFamily || "Inter",
        yearsExperience != null ? parseInt(yearsExperience) : null,
        completedProjects != null ? parseInt(completedProjects) : null,
        satisfiedClients != null ? parseInt(satisfiedClients) : null,
        availableForWork ? 1 : 0,
        req.user.id,
      ]
    );

    // Retourner le profil mis à jour
    const [rows] = await pool.query(
      "SELECT * FROM profiles WHERE user_id = ?",
      [req.user.id]
    );

    return res.json(formatProfile(rows[0]));
  } catch (err) {
    next(err);
  }
}

module.exports = { getProfile, updateProfile };
