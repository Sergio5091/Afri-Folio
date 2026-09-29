const express = require("express");
const authenticate = require("../middleware/authenticate");
const {
  changePassword,
  changeUsername,
  changeEmail,
  deleteAccount,
} = require("../controllers/accountController");

const router = express.Router();
router.use(authenticate);

router.put("/password", changePassword);
router.put("/username", changeUsername);
router.put("/email", changeEmail);
router.delete("/", deleteAccount);

module.exports = router;
