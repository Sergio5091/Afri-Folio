const express = require("express");
const authenticate = require("../middleware/authenticate");
const { getBlocks, saveBlocks } = require("../controllers/blocksController");

const router = express.Router();
router.use(authenticate);

router.get("/", getBlocks);
router.put("/", saveBlocks);

module.exports = router;
