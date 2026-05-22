const express = require("express");
const authenticate = require("../middleware/authenticate");
const { getDashboardSummary } = require("../controllers/dashboardController");

const router = express.Router();

router.use(authenticate);

router.get("/summary", getDashboardSummary);

module.exports = router;
