const express = require("express");
const router = express.Router();

const {
  createTrip,
  getTrips,
  updateTripStatus,
  planBudget,
} = require("../controllers/tripController");

router.post("/", createTrip);
router.get("/", getTrips);
router.patch("/:id/status", updateTripStatus);
router.post("/budget-plan", planBudget);


module.exports = router;