const express = require("express");
const authenticate = require("../middleware/authenticate");
const {
  initiatePayment,
  handleWebhook,
  simulatePayment,
} = require("../controllers/subscriptionController");

const router = express.Router();

// Webhook : route publique (appelée par le provider de paiement)
router.post("/webhook", handleWebhook);

// Routes protégées
router.post("/initiate", authenticate, initiatePayment);

// DEV ONLY — simulation de paiement sans provider
router.post("/simulate-payment", authenticate, simulatePayment);

module.exports = router;
