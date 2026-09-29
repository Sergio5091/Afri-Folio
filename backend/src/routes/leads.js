const express = require("express");
const authenticate = require("../middleware/authenticate");
const { getLeads, updateLead, markAllRead, deleteLead } = require("../controllers/leadsController");

const router = express.Router();
router.use(authenticate);

router.get("/", getLeads);
router.put("/read-all", markAllRead);
router.put("/:id", updateLead);
router.delete("/:id", deleteLead);

module.exports = router;
