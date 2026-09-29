const pool = require("../config/db");
const { formatProfile, formatProject } = require("../utils/format");
const { listBlocks } = require("./blocksController");
const { PORTFOLIO_EVENT_TYPES } = require("../config/constants");

const SOURCES = ["whatsapp", "facebook", "instagram", "tiktok", "linkedin", "twitter", "google", "qr", "annuaire", "direct"];

/** Charge un utilisateur actif + son profil par identifiant. */
async function findPortfolioOwner(username) {
  const [rows] = await pool.query(
    `SELECT u.id, u.username, u.plan, u.created_at, u.status, p.*
       , p.id AS profile_id, u.id AS user_id
     FROM users u JOIN profiles p ON p.user_id = u.id
     WHERE u.username = ?`,
    [String(username || "").toLowerCase()]
  );
  const row = rows[0];
  if (!row || row.status === "suspended") return null;
  return row;
}

/**
 * GET /api/portfolio/:username
 * Retourne le portfolio public complet d'un utilisateur
 */
async function getPublicPortfolio(req, res, next) {
  try {
    const row = await findPortfolioOwner(req.params.username);
    if (!row) {
      return res.status(404).json({ message: "Portfolio introuvable" });
    }

    const [projects] = await pool.query(
      "SELECT * FROM projects WHERE user_id = ? ORDER BY display_order ASC, created_at DESC",
      [row.user_id]
    );
    const blocks = (await listBlocks(row.user_id)).filter((b) => b.visible);

    const profile = formatProfile({ ...row, id: row.profile_id });

    return res.json({
      user: {
        id: row.user_id,
        username: row.username,
        plan: row.plan,
        createdAt: row.created_at,
      },
      profile,
      blocks,
      projects: projects.map(formatProject),
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
    const { portfolioUsername } = req.body || {};
    if (!portfolioUsername) {
      return res.status(400).json({ message: "portfolioUsername est requis" });
    }

    const username = String(portfolioUsername).toLowerCase();
    const [users] = await pool.query("SELECT id FROM users WHERE username = ?", [username]);
    if (users.length === 0) {
      return res.status(404).json({ message: "Portfolio introuvable" });
    }

    const viewerIp = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress || null;
    // Pays fourni par un proxy (Cloudflare, Vercel...) quand il existe
    const country = req.headers["cf-ipcountry"] || req.headers["x-vercel-ip-country"] || null;
    const source = SOURCES.includes(req.body.source) ? req.body.source : "direct";

    // Une vue par IP et par heure suffit : évite de gonfler les stats en rechargeant
    const [recent] = await pool.query(
      `SELECT id FROM portfolio_views
       WHERE portfolio_username = ? AND viewer_ip <=> ? AND viewed_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)
       LIMIT 1`,
      [username, viewerIp]
    );
    if (recent.length === 0) {
      await pool.query(
        "INSERT INTO portfolio_views (portfolio_username, viewer_ip, viewer_country, source) VALUES (?, ?, ?, ?)",
        [username, viewerIp, country, source]
      );
    }

    return res.status(201).json({ message: "Vue enregistrée" });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/portfolio/event  { portfolioUsername, type }
 * Suivi des clics sur les boutons de contact
 */
async function recordEvent(req, res, next) {
  try {
    const username = String(req.body?.portfolioUsername || "").toLowerCase();
    const type = req.body?.type;
    if (!username || !PORTFOLIO_EVENT_TYPES.includes(type)) {
      return res.status(400).json({ message: "Événement invalide" });
    }
    const [users] = await pool.query("SELECT id FROM users WHERE username = ?", [username]);
    if (users.length === 0) return res.status(404).json({ message: "Portfolio introuvable" });

    await pool.query("INSERT INTO portfolio_events (portfolio_username, type) VALUES (?, ?)", [username, type]);
    return res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/portfolio/:username/lead  { name, phone?, email?, message }
 * Un visiteur laisse un message au professionnel
 */
async function createLead(req, res, next) {
  try {
    const row = await findPortfolioOwner(req.params.username);
    if (!row) return res.status(404).json({ message: "Portfolio introuvable" });

    const name = String(req.body?.name || "").trim().slice(0, 100);
    const phone = String(req.body?.phone || "").trim().slice(0, 30) || null;
    const email = String(req.body?.email || "").trim().slice(0, 255) || null;
    const message = String(req.body?.message || "").trim().slice(0, 2000);

    // Champ piège anti-robot : invisible pour un humain
    if (req.body?.website) return res.status(201).json({ ok: true });

    if (name.length < 2) return res.status(400).json({ message: "Indiquez votre nom" });
    if (!phone && !email) return res.status(400).json({ message: "Laissez un numéro ou un email pour être recontacté" });
    if (message.length < 5) return res.status(400).json({ message: "Votre message est trop court" });

    await pool.query("INSERT INTO leads (user_id, name, phone, email, message) VALUES (?, ?, ?, ?, ?)", [
      row.user_id,
      name,
      phone,
      email,
      message,
    ]);
    await pool.query("INSERT INTO portfolio_events (portfolio_username, type) VALUES (?, 'lead')", [row.username]);

    return res.status(201).json({ ok: true, message: "Message envoyé" });
  } catch (err) {
    next(err);
  }
}

/** Colonnes communes aux listes de portfolios (annuaire, vitrine) */
const CARD_SELECT = `
  SELECT u.username, u.plan, p.full_name, p.title, p.profession, p.profession_custom, p.profile_type,
         p.template, p.photo_url, p.city, p.country, p.primary_color, p.is_featured,
         (SELECT JSON_UNQUOTE(JSON_EXTRACT(b.data, '$.items[0].url'))
            FROM profile_blocks b
           WHERE b.user_id = u.id AND b.type = 'gallery' AND b.visible = 1
           ORDER BY b.position LIMIT 1) AS cover_url
  FROM users u JOIN profiles p ON p.user_id = u.id`;

function formatCard(r) {
  return {
    username: r.username,
    plan: r.plan,
    fullName: r.full_name,
    title: r.title,
    profession: r.profession,
    professionCustom: r.profession_custom,
    profileType: r.profile_type,
    template: r.template,
    photoUrl: r.photo_url,
    coverUrl: r.cover_url && r.cover_url !== "null" ? r.cover_url : null,
    city: r.city,
    country: r.country,
    primaryColor: r.primary_color,
    isFeatured: Boolean(r.is_featured),
  };
}

/**
 * GET /api/portfolio/directory?q=&profession=&family=&city=&page=
 * Annuaire public des professionnels
 */
async function getDirectory(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = 24;
    const where = [
      "u.status = 'active'",
      "p.listed_in_directory = 1",
      "p.full_name IS NOT NULL",
      "(p.profession IS NOT NULL OR p.title IS NOT NULL)",
    ];
    const params = [];

    if (req.query.profession) {
      where.push("p.profession = ?");
      params.push(String(req.query.profession));
    }
    if (req.query.family) {
      where.push("p.profile_type = ?");
      params.push(String(req.query.family));
    }
    if (req.query.city) {
      where.push("p.city LIKE ?");
      params.push(`%${String(req.query.city).slice(0, 60)}%`);
    }
    if (req.query.q) {
      const q = `%${String(req.query.q).slice(0, 60)}%`;
      where.push("(p.full_name LIKE ? OR p.title LIKE ? OR p.profession_custom LIKE ? OR p.city LIKE ?)");
      params.push(q, q, q, q);
    }

    const whereSql = `WHERE ${where.join(" AND ")}`;
    const [rows] = await pool.query(
      `${CARD_SELECT} ${whereSql}
       ORDER BY p.is_featured DESC, (u.plan = 'premium') DESC, p.updated_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, (page - 1) * limit]
    );
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM users u JOIN profiles p ON p.user_id = u.id ${whereSql}`,
      params
    );
    const [cities] = await pool.query(
      `SELECT p.city, COUNT(*) AS n FROM users u JOIN profiles p ON p.user_id = u.id
       WHERE u.status = 'active' AND p.listed_in_directory = 1 AND p.city IS NOT NULL
       GROUP BY p.city ORDER BY n DESC LIMIT 12`
    );

    return res.json({
      items: rows.map(formatCard),
      total: Number(total),
      page,
      limit,
      cities: cities.map((c) => c.city),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/portfolio/featured
 * Portfolios mis en avant par l'équipe (page d'accueil)
 */
async function getFeatured(req, res, next) {
  try {
    const [rows] = await pool.query(
      `${CARD_SELECT}
       WHERE u.status = 'active' AND p.is_featured = 1 AND p.full_name IS NOT NULL
       ORDER BY p.updated_at DESC LIMIT 12`
    );
    return res.json(rows.map(formatCard));
  } catch (err) {
    next(err);
  }
}

const escapeHtml = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

/**
 * GET /share/:username
 * Page minimale avec balises Open Graph : WhatsApp/Facebook n'exécutent pas
 * le JavaScript, ils lisent ces balises pour afficher l'aperçu du lien.
 * Le visiteur est ensuite redirigé vers le portfolio.
 */
async function sharePage(req, res, next) {
  try {
    const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");
    const row = await findPortfolioOwner(req.params.username);
    if (!row) return res.redirect(302, frontendUrl);

    const target = `${frontendUrl}/${row.username}?src=${encodeURIComponent(String(req.query.src || "whatsapp"))}`;
    const [gallery] = await pool.query(
      `SELECT JSON_UNQUOTE(JSON_EXTRACT(data, '$.items[0].url')) AS url FROM profile_blocks
       WHERE user_id = ? AND type = 'gallery' AND visible = 1 ORDER BY position LIMIT 1`,
      [row.user_id]
    );
    const image = row.photo_url || (gallery[0]?.url !== "null" ? gallery[0]?.url : null) || `${frontendUrl}/opengraph.jpg`;
    const place = [row.city, row.country].filter(Boolean).join(", ");
    const title = [row.full_name, row.title].filter(Boolean).join(" — ") || row.username;
    const description =
      row.tagline || (row.bio ? String(row.bio).slice(0, 180) : `${row.title || "Professionnel"}${place ? ` à ${place}` : ""}`);

    res.set("Content-Type", "text/html; charset=utf-8");
    return res.send(`<!doctype html>
<html lang="fr"><head>
<meta charset="utf-8">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<meta property="og:type" content="profile">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:image" content="${escapeHtml(image)}">
<meta property="og:url" content="${escapeHtml(`${frontendUrl}/${row.username}`)}">
<meta property="og:site_name" content="AfriFolio">
<meta name="twitter:card" content="summary_large_image">
<meta http-equiv="refresh" content="0;url=${escapeHtml(target)}">
</head><body><a href="${escapeHtml(target)}">Voir le portfolio de ${escapeHtml(row.full_name || row.username)}</a>
<script>location.replace(${JSON.stringify(target)})</script></body></html>`);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getPublicPortfolio,
  recordView,
  recordEvent,
  createLead,
  getDirectory,
  getFeatured,
  sharePage,
};
