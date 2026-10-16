const express = require("express");
const router = express.Router();

const { getAQI } = require("../controllers/aqiController");

router.get("/", getAQI);

module.exports = router;