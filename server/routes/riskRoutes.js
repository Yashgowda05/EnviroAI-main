const express = require("express");
const router = express.Router();

const { analyzeRisk } = require("../controllers/riskController");

// AI Trip Risk Analysis
router.post("/", analyzeRisk);

module.exports = router;