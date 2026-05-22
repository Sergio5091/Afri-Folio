const express = require("express");
const authenticate = require("../middleware/authenticate");
const { getAnalyticsStats } = require("../controllers/analyticsController");

const router = express.Router();

router.use(authenticate);

router.get("/", getAnalyticsStats);

module.exports = router;
