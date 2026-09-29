const express = require("express");
const rateLimit = require("express-rate-limit");
const authenticate = require("../middleware/authenticate");
const { register, login, me, usernameAvailable } = require("../controllers/authController");

const router = express.Router();

// Rate limiting sur les routes d'auth (max 10 tentatives / 15 min par IP)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Trop de tentatives. Réessayez dans 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

const checkLimiter = rateLimit({ windowMs: 60 * 1000, max: 60, standardHeaders: true, legacyHeaders: false });

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.get("/me", authenticate, me);
router.get("/username-available", checkLimiter, usernameAvailable);

module.exports = router;
