const axios = require("axios");
const getWeather = async (req, res) => {
  const { lat, lon } = req.query;

  const googleApiKey = process.env.GOOGLE_WEATHER_API_KEY;
  const openWeatherApiKey = process.env.WEATHER_API_KEY;

  console.log(
    "Google Weather Key loaded:",
    googleApiKey ? googleApiKey.slice(0, 10) + "..." : "NOT FOUND"
  );

  if (!lat || !lon) {
    return res.status(400).json({
      success: false,
      message: "Latitude and longitude are required",
    });
  }

  try {
    // ==========================================
    // 1. GOOGLE WEATHER - PRIMARY
    // ==========================================

const googleResponse = await axios.get(
  "https://weather.googleapis.com/v1/currentConditions:lookup",
  {
    params: {
      key: googleApiKey,
      "location.latitude": Number(lat),
      "location.longitude": Number(lon),
      languageCode: "en-US",
    },
  }
);

    const googleWeather = googleResponse.data;

    // ==========================================
    // 2. GET LOCATION NAME
    // ==========================================

    let locationName = "Current Location";

try {
  const geocodeResponse = await axios.get(
    "https://maps.googleapis.com/maps/api/geocode/json",
    {
      params: {
        latlng: `${lat},${lon}`,
        key: googleApiKey,
      },
    }
  );

  const results = geocodeResponse.data.results;
  console.log(
  "🗺️ GOOGLE GEOCODING FULL RESPONSE:",
  JSON.stringify(geocodeResponse.data, null, 2)
);

  if (results && results.length > 0) {
    const addressComponents = results[0].address_components;

    const locality =
      addressComponents.find((component) =>
        component.types.includes("locality")
      )?.long_name;

    const sublocality =
      addressComponents.find((component) =>
        component.types.includes("sublocality")
      )?.long_name;

    locationName = locality || sublocality || results[0].formatted_address;
  }
} catch (locationError) {
  console.log(
    "Google Geocoding Error:",
    locationError.response?.data || locationError.message
  );
}

    // ==========================================
    // 3. NORMALIZE GOOGLE WEATHER RESPONSE
    // ==========================================

    const normalizedWeather = {
      name: locationName,

      coord: {
        lat: Number(lat),
        lon: Number(lon),
      },

      main: {
        temp: googleWeather.temperature?.degrees ?? null,

        feels_like:
          googleWeather.feelsLikeTemperature?.degrees ?? null,

        humidity:
          googleWeather.relativeHumidity ?? null,
      },

      weather: [
        {
          description:
            googleWeather.weatherCondition?.description?.text ||
            "Weather unavailable",

          main:
            googleWeather.weatherCondition?.type ||
            "Unknown",

          icon:
            googleWeather.weatherCondition?.iconBaseUri ||
            null,
        },
      ],

      wind: {
        speed:
          googleWeather.wind?.speed?.value ?? null,

        unit:
          googleWeather.wind?.speed?.unit ||
          "KILOMETERS_PER_HOUR",

        direction:
          googleWeather.wind?.direction?.cardinal ||
          null,
      },

      precipitation: {
        probability:
          googleWeather.precipitation?.probability?.percent ?? null,
      },

      uvIndex:
        googleWeather.uvIndex ?? null,

      cloudCover:
        googleWeather.cloudCover ?? null,
    };

    return res.status(200).json({
      success: true,
      provider: "Google Weather",
      data: normalizedWeather,
    });

  } catch (googleError) {

    console.error(
      "Google Weather Error:",
      googleError.response?.data || googleError.message
    );

    console.log("==========================================");
    console.log("Switching to OpenWeather fallback...");
    console.log("==========================================");

    // ==========================================
    // 4. OPENWEATHER FALLBACK
    // ==========================================

    try {
      const url =
        `https://api.openweathermap.org/data/2.5/weather` +
        `?lat=${lat}` +
        `&lon=${lon}` +
        `&appid=${openWeatherApiKey}` +
        `&units=metric`;

      const response = await axios.get(url);

      return res.status(200).json({
        success: true,
        provider: "OpenWeather",
        data: response.data,
      });

    } catch (error) {

      console.error(
        "OpenWeather Error:",
        error.response?.data || error.message
      );

      return res.status(500).json({
        success: false,
        message: "Unable to fetch weather from both providers",
      });
    }
  }
};
const getTripWeather = async (req, res) => {
  const { lat, lon, startDate, endDate } = req.query;

  const googleApiKey = process.env.GOOGLE_WEATHER_API_KEY;
  const openWeatherApiKey = process.env.WEATHER_API_KEY;

  if (!lat || !lon || !startDate || !endDate) {
    return res.status(400).json({
      success: false,
      message: "Latitude, longitude, startDate and endDate are required",
    });
  }

  try {
    // ==========================================
    // 1. GOOGLE WEATHER - PRIMARY
    // ==========================================

    const googleResponse = await axios.get(
      `https://weather.googleapis.com/v1/forecast/days:lookup`,
      {
        params: {
          key: googleApiKey,
          "location.latitude": Number(lat),
          "location.longitude": Number(lon),
          "days": 10,
        },
      }
    );

    const googleData = googleResponse.data;

    // Google returns daily forecast data.
    // We filter it according to the user's trip dates.

    const start = new Date(`${startDate}T00:00:00Z`);
    const end = new Date(`${endDate}T23:59:59Z`);

    const forecastDays = (googleData.forecastDays || []).filter((day) => {
      const date = day.displayDate;

      if (!date) return false;

      const forecastDate = new Date(
        `${date.year}-${String(date.month).padStart(2, "0")}-${String(
          date.day
        ).padStart(2, "0")}T00:00:00Z`
      );

      return forecastDate >= start && forecastDate <= end;
    });

    return res.status(200).json({
      success: true,
      provider: "Google Weather",
      startDate,
      endDate,
      location: {
        lat: Number(lat),
        lon: Number(lon),
      },
      forecasts: forecastDays,
    });
  } catch (googleError) {
    console.error(
      "Google Weather Error:",
      googleError.response?.data || googleError.message
    );

    console.log("==========================================");
    console.log("Switching to OpenWeather fallback...");
    console.log("==========================================");

    // ==========================================
    // 2. OPENWEATHER - FALLBACK
    // ==========================================

    try {
      const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${openWeatherApiKey}&units=metric`;

      const response = await axios.get(url);

      const start = new Date(`${startDate}T00:00:00`);
      const end = new Date(`${endDate}T23:59:59`);

      const forecasts = response.data.list.filter((item) => {
        const forecastDate = new Date(item.dt_txt.replace(" ", "T"));

        return forecastDate >= start && forecastDate <= end;
      });

      return res.status(200).json({
        success: true,
        provider: "OpenWeather",
        startDate,
        endDate,
        location: response.data.city,
        forecasts,
      });
    } catch (error) {
      console.error(
        "OpenWeather Error:",
        error.response?.data || error.message
      );

      return res.status(500).json({
        success: false,
        message: "Unable to fetch trip weather from both providers",
      });
    }
  }
};

module.exports = {
  getWeather,
  getTripWeather,
};