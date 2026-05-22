const express = require("express");
const authenticate = require("../middleware/authenticate");
const requireAdmin = require("../middleware/requireAdmin");
const {
  getAdminStats,
  getAdminUsers,
  getAdminWithdrawals,
  updateWithdrawal,
} = require("../controllers/adminController");

const router = express.Router();

// Toutes les routes admin nécessitent JWT + is_admin
router.use(authenticate, requireAdmin);

router.get("/stats", getAdminStats);
router.get("/users", getAdminUsers);
router.get("/withdrawals", getAdminWithdrawals);
router.put("/withdrawals/:id", updateWithdrawal);

module.exports = router;
