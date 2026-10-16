const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      required: true,
      trim: true,
    },

    destination: {
      type: String,
      required: true,
      trim: true,
    },
    sourcePosition: {
  lat: {
    type: Number,
  },
  lng: {
    type: Number,
  },
},

destinationPosition: {
  lat: {
    type: Number,
  },
  lng: {
    type: Number,
  },
},

    travelDate: {
      type: Date,
      required: true,
    },

    returnDate: {
      type: Date,
    },

    budget: {
      type: Number,
      required: true,
    },

    travelers: {
      type: Number,
      default: 1,
    },

    tripDays: {
      type: Number,
      default: 1,
    },

    travelMode: {
      type: String,
      default: "DRIVING",
    },

    status: {
      type: String,
      default: "Planned",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Trip", tripSchema);