const express = require("express");
const authenticate = require("../middleware/authenticate");
const {
  getReferralStats,
  getCommissions,
  requestWithdrawal,
} = require("../controllers/referralController");

const router = express.Router();

router.use(authenticate);

router.get("/stats", getReferralStats);
router.get("/commissions", getCommissions);
router.post("/withdraw", requestWithdrawal);

module.exports = router;
