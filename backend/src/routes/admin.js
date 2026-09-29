const express = require("express");
const authenticate = require("../middleware/authenticate");
const requireAdmin = require("../middleware/requireAdmin");
const {
  getAdminStats,
  getAdminUsers,
  getAdminUser,
  updateAdminUser,
  setUserPremium,
  deleteAdminUser,
  getAdminSubscriptions,
  getAdminProfessions,
  getAdminWithdrawals,
  updateWithdrawal,
} = require("../controllers/adminController");

const router = express.Router();

// Toutes les routes admin nécessitent JWT + is_admin
router.use(authenticate, requireAdmin);

router.get("/stats", getAdminStats);
router.get("/users", getAdminUsers);
router.get("/users/:id", getAdminUser);
router.put("/users/:id", updateAdminUser);
router.post("/users/:id/premium", setUserPremium);
router.delete("/users/:id", deleteAdminUser);
router.get("/subscriptions", getAdminSubscriptions);
router.get("/professions", getAdminProfessions);
router.get("/withdrawals", getAdminWithdrawals);
router.put("/withdrawals/:id", updateWithdrawal);

module.exports = router;
