const { analyzeTripRisk } = require("../services/groqService");

const analyzeRisk = async (req, res) => {
  try {
    const tripData = req.body;

    if (!tripData) {
      return res.status(400).json({
        success: false,
        message: "Trip data is required",
      });
    }

    const result = await analyzeTripRisk(tripData);

    res.status(200).json({
      success: true,
      riskAnalysis: result,
    });
  } catch (error) {
    console.error("AI Risk Analysis Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to analyze trip risk",
    });
  }
};

module.exports = {
  analyzeRisk,
};