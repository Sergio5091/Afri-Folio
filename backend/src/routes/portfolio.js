const express = require("express");
const rateLimit = require("express-rate-limit");
const {
  getPublicPortfolio,
  recordView,
  recordEvent,
  createLead,
  getDirectory,
  getFeatured,
} = require("../controllers/portfolioController");

const router = express.Router();

const trackLimiter = rateLimit({ windowMs: 60 * 1000, max: 60, standardHeaders: true, legacyHeaders: false });
const leadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { message: "Trop de messages envoyés. Réessayez plus tard ou contactez directement sur WhatsApp." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Routes publiques (pas de JWT requis) — les routes fixes avant /:username
router.get("/directory", getDirectory);
router.get("/featured", getFeatured);
router.post("/view", trackLimiter, recordView);
router.post("/event", trackLimiter, recordEvent);
router.get("/:username", getPublicPortfolio);
router.post("/:username/lead", leadLimiter, createLead);

module.exports = router;
