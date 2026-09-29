const express = require("express");
const authenticate = require("../middleware/authenticate");
const {
  getPlans,
  initiatePayment,
  handleWebhook,
  getHistory,
  simulatePayment,
} = require("../controllers/subscriptionController");

const router = express.Router();

// Routes publiques
router.get("/plans", getPlans);
router.post("/webhook", handleWebhook); // appelée par le provider de paiement

// Routes protégées
router.post("/initiate", authenticate, initiatePayment);
router.get("/history", authenticate, getHistory);

// DEV ONLY — simulation de paiement sans provider
router.post("/simulate-payment", authenticate, simulatePayment);

module.exports = router;
