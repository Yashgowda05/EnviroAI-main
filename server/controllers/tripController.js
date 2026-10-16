const Trip = require("../models/Trip");

// @desc    Create a new trip
// @route   POST /api/trips
// @access  Public (for now)
const createTrip = async (req, res) => {
  try {
    const {
      source,
      sourcePosition,
      destination,
      destinationPosition,
      travelDate,
      returnDate,
      budget,
      travelers,
      tripDays,
      travelMode,
    } = req.body;

    // Basic validation
    if (!source || !destination || !travelDate || !budget) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    const trip = await Trip.create({
      source,
      sourcePosition,
      destination,
      destinationPosition,
      travelDate,
      returnDate,
      budget,
      travelers,
      tripDays,
      travelMode,
    });

    res.status(201).json({
      success: true,
      message: "Trip created successfully",
      trip,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// @desc    Get all trips
// @route   GET /api/trips
// @access  Public (for now)
const getTrips = async (req, res) => {
  try {
    const trips = await Trip.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      trips,
    });
  } catch (error) {
    console.error("Get Trips Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch trips",
    });
  }
};
const updateTripStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "Planned",
      "Upcoming",
      "Ongoing",
      "Completed",
      "Deleted",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid trip status",
      });
    }

    const trip = await Trip.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    res.status(200).json({
      success: true,
      message: `Trip status updated to ${status}`,
      trip,
    });
  } catch (error) {
    console.error("Update Trip Status Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to update trip status",
    });
  }
};
const planBudget = async (req, res) => {
  try {
    const {
  totalBudget,
  travelers = 1,
  tripDays = 1,
  travelMode = "DRIVING",

  source,
  destination,
  travelDate,
  returnDate,

  selectedRoute,
} = req.body;

    if (!totalBudget || totalBudget <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid total budget is required",
      });
    }

    const budget = Number(totalBudget);
    const people = Number(travelers);
    const days = Number(tripDays);
    console.log("💰 BUDGET PLANNING INPUT:", {
  totalBudget: budget,
  travelers: people,
  tripDays: days,
  travelMode,
  source,
  destination,
  travelDate,
  returnDate,
  selectedRoute,
});

    let travelAllocation;

  const distanceKm =
  parseFloat(selectedRoute?.distance?.replace(/[^\d.]/g, "")) || 0;

const normalDurationText = selectedRoute?.normalDuration || "";

const durationHoursMatch = normalDurationText.match(/(\d+)\s*hour/);
const durationMinutesMatch = normalDurationText.match(/(\d+)\s*min/);

let routeHours = 0;

if (durationHoursMatch) {
  routeHours += Number(durationHoursMatch[1]);
}

if (durationMinutesMatch) {
  routeHours += Number(durationMinutesMatch[1]) / 60;
}



if (travelMode === "DRIVING") {
  const fuelAndRoadCost = distanceKm * 2 * 7;

  travelAllocation = Math.round(
    Math.max(budget * 0.15, fuelAndRoadCost)
  );
} else if (travelMode === "TRANSIT") {
  travelAllocation = Math.round(budget * 0.20);
} else if (travelMode === "FLIGHT") {
  travelAllocation = Math.round(budget * 0.30);
} else {
  travelAllocation = Math.round(budget * 0.20);
}

const longTripAdjustment =
  routeHours > 6 ? 0.05 :
  routeHours > 3 ? 0.03 :
  0;

const emergencyReserve = Math.round(budget * 0.10);

const accommodation = Math.round(
  budget * (0.30 + longTripAdjustment)
);

const food = Math.round(
  budget * (0.20 + longTripAdjustment)
);

const activities = Math.round(
  budget * 0.10
);

const buffer = Math.round(
  budget * 0.10
);

    const allocated =
      travelAllocation +
      emergencyReserve +
      accommodation +
      food +
      activities +
      buffer;

    const finalAllocated = Math.min(allocated, budget);
const remaining = budget - finalAllocated;
    let feasibility;

if (remaining >= 0) {
  feasibility = "Comfortable";
} else if (remaining >= -Math.round(budget * 0.10)) {
  feasibility = "Tight";
} else {
  feasibility = "Not Feasible";
}

    res.status(200).json({
      success: true,
      budgetPlan: {
  totalBudget: budget,
  travelers: people,
  tripDays: days,
  travelMode,

  source,
  destination,
  travelDate,
  returnDate,

  selectedRoute,

        allocation: {
          travel: travelAllocation,
          accommodation,
          food,
          activities,
          emergencyReserve,
          buffer,
        },

        totalAllocated: finalAllocated,
        remaining,
        feasibility,
      },
    });
  } catch (error) {
    console.error("Budget Planning Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to create budget plan",
    });
  }
};
module.exports = {
  createTrip,
  getTrips,
  updateTripStatus,
  planBudget,
};