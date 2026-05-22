const express = require("express");
const { getPublicPortfolio, recordView } = require("../controllers/portfolioController");

const router = express.Router();

// Routes publiques (pas de JWT requis)
router.get("/:username", getPublicPortfolio);
router.post("/view", recordView);

module.exports = router;
