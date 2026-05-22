const pool = require("../config/db");

/**
 * GET /api/portfolio/:username
 * Retourne le portfolio public complet d'un utilisateur
 */
async function getPublicPortfolio(req, res, next) {
  try {
    const { username } = req.params;

    // Récupérer l'utilisateur
    const [users] = await pool.query(
      `SELECT id, email, username, plan, referral_code, created_at
       FROM users WHERE username = ?`,
      [username.toLowerCase()]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "Portfolio introuvable" });
    }

    const user = users[0];

    // Récupérer le profil
    const [profiles] = await pool.query(
      "SELECT * FROM profiles WHERE user_id = ?",
      [user.id]
    );

    if (profiles.length === 0) {
      return res.status(404).json({ message: "Profil introuvable" });
    }

    const profile = profiles[0];

    // Récupérer les projets
    const [projects] = await pool.query(
      "SELECT * FROM projects WHERE user_id = ? ORDER BY created_at DESC",
      [user.id]
    );

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        plan: user.plan,
        referralCode: user.referral_code,
        createdAt: user.created_at,
      },
      profile: {
        id: profile.id,
        userId: profile.user_id,
        fullName: profile.full_name,
        title: profile.title,
        tagline: profile.tagline,
        bio: profile.bio,
        photoUrl: profile.photo_url,
        logoUrl: profile.logo_url,
        skills: profile.skills
          ? typeof profile.skills === "string"
            ? JSON.parse(profile.skills)
            : profile.skills
          : [],
        services: profile.services,
        whatsapp: profile.whatsapp,
        emailContact: profile.email_contact,
        linkedin: profile.linkedin,
        twitter: profile.twitter,
        github: profile.github,
        website: profile.website,
        country: profile.country,
        city: profile.city,
        styleTheme: profile.style_theme,
        primaryColor: profile.primary_color,
        fontFamily: profile.font_family,
        yearsExperience: profile.years_experience,
        completedProjects: profile.completed_projects,
        satisfiedClients: profile.satisfied_clients,
        availableForWork: Boolean(profile.available_for_work),
      },
      projects: projects.map((p) => ({
        id: p.id,
        userId: p.user_id,
        title: p.title,
        description: p.description,
        imageUrl: p.image_url,
        projectUrl: p.project_url,
        createdAt: p.created_at,
      })),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/portfolio/view
 * Enregistre une vue sur un portfolio
 */
async function recordView(req, res, next) {
  try {
    const { portfolioUsername } = req.body;

    if (!portfolioUsername) {
      return res.status(400).json({ message: "portfolioUsername est requis" });
    }

    // Vérifier que l'utilisateur existe
    const [users] = await pool.query(
      "SELECT id FROM users WHERE username = ?",
      [portfolioUsername.toLowerCase()]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "Portfolio introuvable" });
    }

    // Récupérer l'IP du visiteur
    const viewerIp =
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      null;

    await pool.query(
      "INSERT INTO portfolio_views (portfolio_username, viewer_ip) VALUES (?, ?)",
      [portfolioUsername.toLowerCase(), viewerIp]
    );

    return res.status(201).json({ message: "Vue enregistrée" });
  } catch (err) {
    next(err);
  }
}

module.exports = { getPublicPortfolio, recordView };
