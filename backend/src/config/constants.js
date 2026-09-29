// ============================================================
// Constantes métier partagées par les contrôleurs
// ============================================================

const SUBSCRIPTION_PRICE = parseInt(process.env.SUBSCRIPTION_PRICE || "360");
// Prix annuel : 10 mois payés pour 12 (2 mois offerts) sauf si défini explicitement
const SUBSCRIPTION_PRICE_YEARLY = parseInt(
  process.env.SUBSCRIPTION_PRICE_YEARLY || String(SUBSCRIPTION_PRICE * 10)
);
const COMMISSION_RATE = parseFloat(process.env.COMMISSION_RATE || "0.10");

// Limites du plan gratuit
const FREE_PLAN_LIMITS = {
  photos: parseInt(process.env.FREE_PLAN_MAX_PHOTOS || "12"),
};

// Types de blocs acceptés (doit rester aligné avec frontend/src/lib/blocks.ts)
const BLOCK_TYPES = [
  "gallery",
  "beforeAfter",
  "services",
  "menu",
  "hours",
  "zone",
  "credentials",
  "experience",
  "testimonials",
  "projects",
  "offers",
  "skills",
  "faq",
  "stats",
  "video",
];

// Templates de portfolio (doit rester aligné avec frontend/src/lib/templates.ts)
const TEMPLATES = ["atelier", "chantier", "table", "galerie", "cabinet", "studio", "scene"];

// Identifiants réservés : ils entreraient en conflit avec les routes du site
const RESERVED_USERNAMES = new Set([
  "admin", "api", "app", "dashboard", "connexion", "inscription", "login", "register",
  "portfolio", "p", "share", "uploads", "exemples", "exemple", "annuaire", "tarifs",
  "aide", "support", "contact", "cgu", "confidentialite", "afrifolio", "static", "assets",
  "www", "mail", "blog", "compte", "settings", "public", "index",
]);

const PORTFOLIO_EVENT_TYPES = ["whatsapp", "call", "email", "share", "lead", "vcard"];

module.exports = {
  SUBSCRIPTION_PRICE,
  SUBSCRIPTION_PRICE_YEARLY,
  COMMISSION_RATE,
  FREE_PLAN_LIMITS,
  BLOCK_TYPES,
  TEMPLATES,
  RESERVED_USERNAMES,
  PORTFOLIO_EVENT_TYPES,
};
