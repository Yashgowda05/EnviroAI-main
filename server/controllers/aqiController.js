const axios = require("axios");

const getAQI = async (req, res) => {
  try {
    const { lat, lon } = req.query;

    const apiKey = process.env.WEATHER_API_KEY;

    const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;

    const response = await axios.get(url);

    res.status(200).json({
      success: true,
      data: response.data,
    });

  } catch (error) {
    console.error(error.response?.data || error.message);

    res.status(500).json({
      success: false,
      message: "Unable to fetch AQI",
    });
  }
};

module.exports = {
  getAQI,
};