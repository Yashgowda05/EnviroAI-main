const express = require("express");
const router = express.Router();

const {
  getWeather,
  getTripWeather,
} = require("../controllers/weatherController");

router.get("/", getWeather);
router.get("/trip", getTripWeather);

module.exports = router; 