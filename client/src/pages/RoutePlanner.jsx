import {
  GoogleMap,
  LoadScript,
  Marker,
  Autocomplete,
  DirectionsService,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { useEffect, useState } from "react";
import axios from "axios";

function RoutePlanner() {
  const containerStyle = {
    width: "100%",
    height: "500px",
  };

  const [center, setCenter] = useState({
  lat: 12.9716,
  lng: 77.5946,
});
const [autocomplete, setAutocomplete] = useState(null);
const [destination, setDestination] = useState("");

const [source, setSource] = useState("");
const [sourceAutocomplete, setSourceAutocomplete] = useState(null);
const [sourcePosition, setSourcePosition] = useState(null);

const [returnDate, setReturnDate] = useState("");
const [travelers, setTravelers] = useState(1);
const [aiRecommendation, setAiRecommendation] = useState(null);


const [destinationPosition, setDestinationPosition] = useState(null);
const [map, setMap] = useState(null);
const [directions, setDirections] = useState(null);
const [travelDate, setTravelDate] = useState("");
const [tripDays, setTripDays] = useState(1);

const [travelMode, setTravelMode] = useState("DRIVING");
const [tripWeather, setTripWeather] = useState(null);
const [riskAnalysis, setRiskAnalysis] = useState(null);
const [weatherLoading, setWeatherLoading] = useState(false);
const [weatherError, setWeatherError] = useState("");
const [tripPlanned, setTripPlanned] = useState(false);
const [weatherLoaded, setWeatherLoaded] = useState(false);
const [routeDistance, setRouteDistance] = useState("");
const [routeDuration, setRouteDuration] = useState("");
const [trafficDuration, setTrafficDuration] = useState("");
const [trafficDelay, setTrafficDelay] = useState("");
const [routeWeather, setRouteWeather] = useState([]);
const [smartRoutes, setSmartRoutes] = useState([]);
const [selectedRoute, setSelectedRoute] = useState(null);
const [totalBudget, setTotalBudget] = useState("");
const [budgetPlan, setBudgetPlan] = useState(null);
const [budgetLoading, setBudgetLoading] = useState(false);
const [budgetError, setBudgetError] = useState("");


useEffect(() => {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      setCenter({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    },
    (error) => {
      console.log(error);
    }
  );
}, []);
const fetchTripWeather = async () => {
  if (!destinationPosition || !travelDate || !returnDate) {
    alert("Please select destination, travel date and return date first.");
    return;
  }

  try {
    setWeatherLoading(true);
    setWeatherError("");
    setTripWeather(null);

    const response = await fetch(
      `http://localhost:5000/api/weather/trip?lat=${destinationPosition.lat}&lon=${destinationPosition.lng}&startDate=${travelDate}&endDate=${returnDate}`
    );

    const data = await response.json();

    console.log("Trip Weather Response:", data);

  if (data.success) {
  setTripWeather(data);
  setWeatherLoaded(true);

  return data;
}
 else {
      setWeatherError(data.message || "Unable to fetch trip weather");
    }
  } catch (error) {
    console.error("Trip weather error:", error);
    setWeatherError("Unable to connect to weather service");
  } finally {
    setWeatherLoading(false);
  }
};
const fetchRouteWeather = async (points) => {
  try {
    const weatherResults = await Promise.all(
      points.map(async (point) => {
        const response = await fetch(
          `http://localhost:5000/api/weather/trip?lat=${point.lat}&lon=${point.lng}&startDate=${travelDate}&endDate=${returnDate}`
        );

        const data = await response.json();

        return {
          point,
          weather: data,
        };
      })
    );

    console.log("🌦️ ROUTE WEATHER RESULTS:", weatherResults);

    console.log(
      "🌦️ FIRST ROUTE WEATHER:",
      weatherResults[0]?.weather
    );

    setRouteWeather(weatherResults);

  } catch (error) {
    console.error("Route weather error:", error);
  }
};


const fetchAllRoutesWeather = async (routes) => {
  try {
    const routesWithWeather = await Promise.all(
      routes.map(async (route) => {
        const weatherResults = await Promise.all(
          route.weatherPoints.map(async (point) => {
            const response = await fetch(
              `http://localhost:5000/api/weather/trip?lat=${point.lat}&lon=${point.lng}&startDate=${travelDate}&endDate=${returnDate}`
            );

            const data = await response.json();

            return {
              point,
              weather: data,
            };
          })
        );

        return {
          ...route,
          weather: weatherResults,
        };
      })
    );

    console.log(
      "🌦️ ALL ROUTES WEATHER:",
      routesWithWeather
    );
    console.log(
  "🛣️ FIRST ROUTE FIRST STEP DETAILS:",
  routesWithWeather[0]?.steps?.[0]
);
  const scoredRoutes = routesWithWeather.map((route) => { const weatherRisk = calculateWeatherRisk(route);
  const routeRisk = calculateRouteRisk(route);

  console.log(
    `🛣️ ROUTE ${route.routeIndex + 1} RISK:`,
    routeRisk
  );

  const score = calculateRouteScore({
    ...route,
    weatherRisk,
  });

  return {
    ...route,
    weatherRisk,
    routeRisk,
    smartScore: score,
  };
});

console.log(
  "🧠 SCORED SMART ROUTES:",
  scoredRoutes
);
const rankedRoutes = [...scoredRoutes].sort(
  (a, b) => b.smartScore - a.smartScore
);
const bestRoute = rankedRoutes[0];

const reasons = [];

if (bestRoute.weatherRisk <= 20) {
  reasons.push("low weather risk");
} else if (bestRoute.weatherRisk <= 50) {
  reasons.push("moderate weather risk");
} else {
  reasons.push("higher weather risk");
}

if (bestRoute.routeRisk <= 20) {
  reasons.push("low route risk");
} else if (bestRoute.routeRisk <= 50) {
  reasons.push("moderate route risk");
} else {
  reasons.push("higher route risk");
}

const normalMinutes = parseDurationToMinutes(bestRoute.normalDuration);
const trafficMinutes = parseDurationToMinutes(bestRoute.trafficDuration);

const delay = Math.max(
  0,
  trafficMinutes - normalMinutes
);

if (delay <= 10) {
  reasons.push("low traffic delay");
} else {
  reasons.push(`${delay} minutes of traffic delay`);
}

setAiRecommendation({
  routeIndex: bestRoute.routeIndex,
  score: bestRoute.smartScore,
  message: `Route ${bestRoute.routeIndex + 1} is recommended because it has the best overall smart score, with ${reasons.join(", ")}.`
});

console.table(
  rankedRoutes.map((route, index) => ({
    Rank: index + 1,
    GoogleRoute: route.routeIndex + 1,
    Distance: route.distance,
    NormalTime: route.normalDuration,
    TrafficTime: route.trafficDuration,
    WeatherRisk: route.weatherRisk,
    SmartScore: route.smartScore,
  }))
);

setSmartRoutes(rankedRoutes);


    

    routesWithWeather.forEach((route) => {
      console.log(
        `🌦️ ROUTE ${route.routeIndex + 1} WEATHER:`,
        route.weather
      );
    });
  } catch (error) {
    console.error(
      "All routes weather error:",
      error
    );
  }
};
const parseDurationToMinutes = (duration) => {
  if (!duration) return 0;

  let minutes = 0;

  const hoursMatch = duration.match(/(\d+)\s*hour/);
  const minutesMatch = duration.match(/(\d+)\s*min/);

  if (hoursMatch) {
    minutes += parseInt(hoursMatch[1], 10) * 60;
  }

  if (minutesMatch) {
    minutes += parseInt(minutesMatch[1], 10);
  }

  return minutes;
};
const calculateWeatherRisk = (route) => {
  let totalRisk = 0;
  let forecastCount = 0;

  route.weather?.forEach((weatherPoint) => {
    const forecast = weatherPoint.weather?.forecasts?.[0];

    if (!forecast) return;

    const daytime = forecast.daytimeForecast;

    if (!daytime) return;

    // Temperature risk
    const maxTemp =
      forecast.maxTemperature?.degrees ?? 0;

    if (maxTemp >= 35) {
      totalRisk += 25;
    } else if (maxTemp >= 30) {
      totalRisk += 10;
    }

    // Precipitation risk
    const precipitation = daytime.precipitation;

    const probability =
      precipitation?.probability?.percent ?? 0;

    if (probability >= 70) {
      totalRisk += 30;
    } else if (probability >= 40) {
      totalRisk += 15;
    } else if (probability >= 20) {
      totalRisk += 5;
    }

    forecastCount++;
  });

  if (forecastCount === 0) {
    return 0;
  }

  return Math.min(
    40,
    Math.round(totalRisk / forecastCount)
  );
};
const calculateRouteRisk = (route) => {
  let risk = 0;

  const steps = route.steps || [];

  // Very long routes have slightly higher travel exposure
  const distanceKm =
    parseFloat(route.distance?.replace(/[^\d.]/g, "")) || 0;

  if (distanceKm > 300) {
    risk += 20;
  } else if (distanceKm > 200) {
    risk += 10;
  }

  // Long travel duration increases exposure to traffic
  const durationMinutes =
    parseDurationToMinutes(route.normalDuration);

  if (durationMinutes > 360) {
    risk += 20;
  } else if (durationMinutes > 240) {
    risk += 10;
  }

  // A large number of route steps means more driving decisions.
  if (steps.length > 50) {
    risk += 10;
  } else if (steps.length > 30) {
    risk += 5;
  }
  console.log("🛣️ ROUTE RISK DETAILS:", {
  distance: distanceKm,
  durationMinutes,
  steps: steps.length,
  risk,
});

  return Math.min(40, risk);
};
const calculateRouteScore = (route) => {
  const distanceKm =
    parseFloat(route.distance?.replace(/[^\d.]/g, "")) || 0;

  const normalMinutes =
    parseDurationToMinutes(route.normalDuration);

  const trafficMinutes =
    parseDurationToMinutes(route.trafficDuration);

  const trafficDelay = Math.max(
    0,
    trafficMinutes - normalMinutes
  );

  // 1. Distance score
  const distanceScore =
    distanceKm > 0
      ? Math.max(0, 100 - distanceKm / 2)
      : 0;

  // 2. Travel time score
  const timeScore =
    normalMinutes > 0
      ? Math.max(0, 100 - normalMinutes / 4)
      : 0;

  // 3. Traffic score
  const trafficScore =
    Math.max(0, 100 - trafficDelay * 2);

  // 4. Weather score
  // Lower weather risk = better score
  const weatherRisk =
    route.weatherRisk ?? 0;

  const weatherScore =
    Math.max(0, 100 - weatherRisk);

  // 5. Route safety score
  // Lower route risk = better score
  const routeRisk =
    route.routeRisk ?? 0;

  const routeSafetyScore =
    Math.max(0, 100 - routeRisk);

  // Final Smart Route Score
  const finalScore =
    distanceScore * 0.30 +
    timeScore * 0.25 +
    trafficScore * 0.20 +
    weatherScore * 0.15 +
    routeSafetyScore * 0.10;

  return Math.round(finalScore);
};

const handlePlanTrip = async () => {
  if (!sourcePosition || !destinationPosition) {
    alert("Please select both Source and Destination.");
    return;
  }

  if (!travelDate || !returnDate) {
    alert("Please select travel and return dates.");
    return;
  }

  // Do NOT save to database.
  // Just move to route generation.
  setTripPlanned(true);

  // Load destination weather
  await fetchTripWeather();
};

  return (
    <div style={{ padding: "20px" }}>
      <h1>🗺️ Smart Route Planner</h1>

      <LoadScript
  googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
  libraries={["places"]}
>
   <div
  style={{
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
    marginBottom: "30px",
  }}
>
  {/* Source */}
  <div>
    <label style={{ color: "white", marginBottom: "6px", display: "block" }}>
      Source
    </label>

    <Autocomplete
      onLoad={(auto) => setSourceAutocomplete(auto)}
      onPlaceChanged={() => {
        if (sourceAutocomplete) {
          const place = sourceAutocomplete.getPlace();

         if (place.geometry) {
  const location = place.geometry.location;

  const sourceLocation = {
    lat: location.lat(),
    lng: location.lng(),
  };

  setSource(place.formatted_address);
  setSourcePosition(sourceLocation);

  if (map) {
    map.panTo(sourceLocation);
    map.setZoom(14);
  }
}
        }
      }}
    >
      <input
        type="text"
        placeholder="Search Source..."
        value={source}
        onChange={(e) => setSource(e.target.value)}
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          fontSize: "15px",
        }}
      />
    </Autocomplete>
  </div>

  {/* Destination */}
  <div>
    <label style={{ color: "white", marginBottom: "6px", display: "block" }}>
      Destination
    </label>

    <Autocomplete
      onLoad={(auto) => setAutocomplete(auto)}
      onPlaceChanged={() => {
        if (autocomplete) {
          const place = autocomplete.getPlace();

          if (place.geometry) {
            const location = place.geometry.location;

            const destination = {
              lat: location.lat(),
              lng: location.lng(),
            };

            setDestination(place.formatted_address);
            setDestinationPosition(destination);

            if (map) {
              map.panTo(destination);
              map.setZoom(14);
            }
          }
        }
      }}
    >
      <input
        type="text"
        placeholder="Search Destination..."
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          fontSize: "15px",
        }}
      />
    </Autocomplete>
  </div>

  {/* Travel Date */}
  <div>
    <label style={{ color: "white", marginBottom: "6px", display: "block" }}>
      Travel Date
    </label>

    <input
      type="date"
      value={travelDate}
      onChange={(e) => setTravelDate(e.target.value)}
      style={{
        width: "100%",
        padding: "12px",
        borderRadius: "8px",
        border: "1px solid #ccc",
      }}
    />
  </div>

  {/* Return Date */}
  <div>
    <label style={{ color: "white", marginBottom: "6px", display: "block" }}>
      Return Date
    </label>

    <input
      type="date"
      value={returnDate}
      onChange={(e) => setReturnDate(e.target.value)}
      style={{
        width: "100%",
        padding: "12px",
        borderRadius: "8px",
        border: "1px solid #ccc",
      }}
    />
  </div>

  

  {/* Travelers */}
  <div>
    <label style={{ color: "white", marginBottom: "6px", display: "block" }}>
      Travelers
    </label>

    <input
      type="number"
      min="1"
      value={travelers}
      onChange={(e) => setTravelers(e.target.value)}
      style={{
        width: "100%",
        padding: "12px",
        borderRadius: "8px",
        border: "1px solid #ccc",
      }}
    />
  </div>

  {/* Travel Mode */}
  <div>
    <label style={{ color: "white", marginBottom: "6px", display: "block" }}>
      Travel Mode
    </label>

    <select
      value={travelMode}
      onChange={(e) => setTravelMode(e.target.value)}
      style={{
        width: "100%",
        padding: "12px",
        borderRadius: "8px",
      }}
    >
      <option value="DRIVING">🚗 Car</option>
      <option value="TWO_WHEELER">🏍 Bike</option>
      <option value="TRANSIT">🚌 Public Transport</option>
      <option value="WALKING">🚶 Walking</option>
    </select>
  </div>

  {/* Trip Days */}
  <div>
    <label style={{ color: "white", marginBottom: "6px", display: "block" }}>
      Trip Days
    </label>

    <input
      type="number"
      min="1"
      value={tripDays}
      onChange={(e) => setTripDays(e.target.value)}
      style={{
        width: "100%",
        padding: "12px",
        borderRadius: "8px",
        border: "1px solid #ccc",
      }}
    />
  </div>


{weatherLoading && <p>Loading trip weather... 🌦️</p>}

{weatherError && (
  <p>
    ⚠️ {weatherError}
  </p>
)}
{tripWeather && weatherLoaded && (
  <div
    style={{
      gridColumn: "1 / span 2",
      marginTop: "25px",
    }}
  >
    <h2
      style={{
        color: "#172033",
        marginBottom: "5px",
      }}
    >
      🌦️ Trip Weather
    </h2>

    <p
      style={{
        color: "#4b5563",
        marginBottom: "20px",
      }}
    >
      📍 Destination Forecast
    </p>

    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "20px",
      }}
    >
      {tripWeather.forecasts?.map((forecast, index) => {
        const date = forecast.displayDate;

        const dayWeather =
          forecast.daytimeForecast?.weatherCondition;

        const nightWeather =
          forecast.nighttimeForecast?.weatherCondition;

        const dayDescription =
          dayWeather?.description?.text || "Weather unavailable";

        const nightDescription =
          nightWeather?.description?.text || "Weather unavailable";

        const maxTemp =
          forecast.maxTemperature?.degrees;

        const minTemp =
          forecast.minTemperature?.degrees;

        const feelsLike =
          forecast.feelsLikeMaxTemperature?.degrees;

        const dayRain =
          forecast.daytimeForecast?.precipitation
            ?.probability?.percent;

        const nightRain =
          forecast.nighttimeForecast?.precipitation
            ?.probability?.percent;

        const humidity =
          forecast.daytimeForecast?.relativeHumidity;

        const wind =
          forecast.daytimeForecast?.wind?.speed?.value;

        const windUnit =
          forecast.daytimeForecast?.wind?.speed?.unit ===
          "KILOMETERS_PER_HOUR"
            ? "km/h"
            : "";

        const uv =
          forecast.daytimeForecast?.uvIndex;

        const thunderstorm =
          forecast.daytimeForecast
            ?.thunderstormProbability;

        return (
          <div
            key={index}
            style={{
              background:
                "rgba(255,255,255,0.95)",
              borderRadius: "18px",
              padding: "22px",
              boxShadow:
                "0 5px 18px rgba(0,0,0,0.08)",
              color: "#172033",
            }}
          >
            {/* DATE */}
            <h3
              style={{
                marginTop: 0,
                marginBottom: "15px",
                color: "#111827",
              }}
            >
              📅{" "}
              {date
                ? `${date.day}/${date.month}/${date.year}`
                : "Date unavailable"}
            </h3>

            {/* WEATHER ICON */}
            <div
              style={{
                fontSize: "45px",
                marginBottom: "5px",
              }}
            >
              {dayWeather?.type?.includes("RAIN")
                ? "🌧️"
                : dayWeather?.type?.includes("CLOUD")
                ? "☁️"
                : dayWeather?.type?.includes("CLEAR")
                ? "☀️"
                : "🌤️"}
            </div>

            {/* DAY WEATHER */}
            <h3
              style={{
                margin: "5px 0",
                color: "#111827",
              }}
            >
              ☀️ Day
            </h3>

            <p
              style={{
                textTransform: "capitalize",
                color: "#374151",
              }}
            >
              {dayDescription}
            </p>

            {/* TEMPERATURE */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "15px",
              }}
            >
              <div>
                <strong>🌡️ Max</strong>
                <br />
                <span style={{ fontSize: "22px" }}>
                  {maxTemp !== undefined
                    ? `${Math.round(maxTemp)}°C`
                    : "N/A"}
                </span>
              </div>

              <div>
                <strong>🌡️ Min</strong>
                <br />
                <span style={{ fontSize: "22px" }}>
                  {minTemp !== undefined
                    ? `${Math.round(minTemp)}°C`
                    : "N/A"}
                </span>
              </div>
            </div>

            {/* FEELS LIKE */}
            <p style={{ color: "#374151" }}>
              🌡️ Feels like:{" "}
              {feelsLike !== undefined
                ? `${Math.round(feelsLike)}°C`
                : "N/A"}
            </p>

            {/* RAIN */}
            <p style={{ color: "#374151" }}>
              🌧️ Day rain:{" "}
              {dayRain !== undefined
                ? `${dayRain}%`
                : "N/A"}
            </p>

            <p style={{ color: "#374151" }}>
              🌧️ Night rain:{" "}
              {nightRain !== undefined
                ? `${nightRain}%`
                : "N/A"}
            </p>

            {/* NIGHT */}
            <div
              style={{
                marginTop: "15px",
                paddingTop: "12px",
                borderTop:
                  "1px solid #e5e7eb",
              }}
            >
              <h3
                style={{
                  margin: "5px 0",
                  color: "#111827",
                }}
              >
                🌙 Night
              </h3>

              <p
                style={{
                  color: "#374151",
                }}
              >
                {nightDescription}
              </p>
            </div>

            {/* EXTRA INFORMATION */}
            <div
              style={{
                marginTop: "15px",
                paddingTop: "12px",
                borderTop:
                  "1px solid #e5e7eb",
              }}
            >
              <p style={{ color: "#374151" }}>
                💧 Humidity:{" "}
                {humidity !== undefined
                  ? `${humidity}%`
                  : "N/A"}
              </p>

              <p style={{ color: "#374151" }}>
                💨 Wind:{" "}
                {wind !== undefined
                  ? `${wind} ${windUnit}`
                  : "N/A"}
              </p>

              <p style={{ color: "#374151" }}>
                ☀️ UV Index:{" "}
                {uv !== undefined ? uv : "N/A"}
              </p>

              <p style={{ color: "#374151" }}>
                ⛈️ Thunderstorm:{" "}
                {thunderstorm !== undefined
                  ? `${thunderstorm}%`
                  : "N/A"}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  </div>
)}
{routeWeather.length > 0 && (
  <div
    style={{
      marginTop: "30px",
      background: "rgba(255,255,255,0.95)",
      borderRadius: "18px",
      padding: "25px",
      boxShadow: "0 5px 18px rgba(0,0,0,0.08)",
      color: "#172033",
    }}
  >
    <h2
      style={{
        marginTop: 0,
        color: "#111827",
      }}
    >
      🛣️ Route Weather
    </h2>

    <p
      style={{
        color: "#4b5563",
        marginBottom: "20px",
      }}
    >
      Weather conditions at important points along your route.
    </p>

    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "20px",
      }}
    >
      {routeWeather.map((routePoint, index) => {
        const forecast =
          routePoint.weather?.forecasts?.[0];

        const dayWeather =
          forecast?.daytimeForecast?.weatherCondition;

        const description =
          dayWeather?.description?.text ||
          "Weather unavailable";

        const temperature =
          forecast?.maxTemperature?.degrees;

        const rain =
          forecast?.daytimeForecast?.precipitation
            ?.probability?.percent;

        return (
          <div
            key={index}
            style={{
              background: "#f9fafb",
              borderRadius: "14px",
              padding: "20px",
              border: "1px solid #e5e7eb",
            }}
          >
            <h3
              style={{
                marginTop: 0,
                color: "#111827",
              }}
            >
              📍{" "}
{index === 0
  ? "Starting Point"
  : index === routeWeather.length - 1
  ? "Destination"
  : `Route — ${index === 1 ? "1/3" : "2/3"}`}
            </h3>

            <div
              style={{
                fontSize: "40px",
                marginBottom: "8px",
              }}
            >
              {dayWeather?.type?.includes("RAIN")
                ? "🌧️"
                : dayWeather?.type?.includes("CLOUD")
                ? "☁️"
                : dayWeather?.type?.includes("CLEAR")
                ? "☀️"
                : "🌤️"}
            </div>

            <p
              style={{
                textTransform: "capitalize",
                color: "#374151",
              }}
            >
              {description}
            </p>

            <p style={{ color: "#374151" }}>
              🌡️ Temperature:{" "}
              {temperature !== undefined
                ? `${Math.round(temperature)}°C`
                : "N/A"}
            </p>

            <p style={{ color: "#374151" }}>
              🌧️ Rain probability:{" "}
              {rain !== undefined
                ? `${rain}%`
                : "N/A"}
            </p>

            <p
              style={{
                fontSize: "13px",
                color: "#6b7280",
              }}
            >
              📍 {routePoint.point.lat.toFixed(4)},{" "}
              {routePoint.point.lng.toFixed(4)}
            </p>
          </div>
        );
      })}
    </div>
  </div>
)}
{riskAnalysis && (
  <div
    style={{
      marginTop: "30px",
      background: "rgba(255,255,255,0.95)",
      borderRadius: "18px",
      padding: "25px",
      boxShadow: "0 5px 18px rgba(0,0,0,0.08)",
      color: "#172033",
    }}
  >
    <h2
      style={{
        marginTop: 0,
        color: "#111827",
      }}
    >
      🤖 AI Risk Analysis
    </h2>

    <p
      style={{
        color: "#4b5563",
        marginBottom: "20px",
      }}
    >
      AI-powered assessment of your trip conditions.
    </p>

    {/* Risk Summary */}
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "15px",
      }}
    >
      <div
        style={{
          padding: "18px",
          borderRadius: "12px",
          background: "#f3f4f6",
        }}
      >
        <strong>Overall Risk</strong>
        <p style={{ fontSize: "20px", marginBottom: 0 }}>
          {riskAnalysis.overallRisk === "Low"
            ? "🟢"
            : riskAnalysis.overallRisk === "Moderate"
            ? "🟡"
            : "🔴"}{" "}
          {riskAnalysis.overallRisk}
        </p>
      </div>

      <div
        style={{
          padding: "18px",
          borderRadius: "12px",
          background: "#f3f4f6",
        }}
      >
        <strong>🌦️ Weather Risk</strong>
        <p style={{ fontSize: "20px", marginBottom: 0 }}>
          {riskAnalysis.weatherRisk}
        </p>
      </div>

      <div
        style={{
          padding: "18px",
          borderRadius: "12px",
          background: "#f3f4f6",
        }}
      >
        <strong>🚦 Traffic Risk</strong>
        <p style={{ fontSize: "20px", marginBottom: 0 }}>
          {riskAnalysis.trafficRisk}
        </p>
      </div>

      <div
        style={{
          padding: "18px",
          borderRadius: "12px",
          background: "#f3f4f6",
        }}
      >
        <strong>🛣️ Route Risk</strong>
        <p style={{ fontSize: "20px", marginBottom: 0 }}>
          {riskAnalysis.routeRisk}
        </p>
      </div>
    </div>

    {/* Alerts */}
    {riskAnalysis.alerts?.length > 0 && (
      <div style={{ marginTop: "25px" }}>
        <h3 style={{ color: "#111827" }}>
          ⚠️ Travel Alerts
        </h3>

        {riskAnalysis.alerts.map((alert, index) => (
          <p
            key={index}
            style={{
              background: "#fff7ed",
              padding: "12px 15px",
              borderRadius: "10px",
              color: "#9a3412",
            }}
          >
            ⚠️ {alert}
          </p>
        ))}
      </div>
    )}

    {/* Recommendation */}
    {riskAnalysis.recommendation && (
      <div
        style={{
          marginTop: "20px",
          padding: "18px",
          background: "#f0fdf4",
          borderRadius: "12px",
        }}
      >
        <h3 style={{ marginTop: 0, color: "#166534" }}>
          💡 AI Recommendation
        </h3>

        <p style={{ marginBottom: 0, color: "#374151" }}>
          {riskAnalysis.recommendation}
        </p>
      </div>
    )}
  </div>
)}
  {/* Button */}
  <div style={{ gridColumn: "1 / span 2", textAlign: "center" }}>
    <button
    onClick={handlePlanTrip}
      style={{
        background: "#16a34a",
        color: "white",
        padding: "14px 40px",
        border: "none",
        borderRadius: "10px",
        fontSize: "18px",
        cursor: "pointer",
        fontWeight: "bold",
      }}
    >
      🚀 Plan My Trip
    </button>
  </div>
</div>
    {tripPlanned && (
  <GoogleMap
    mapContainerStyle={containerStyle}
    center={center}
    zoom={14}
    onLoad={(map) => setMap(map)}
  >
  <Marker
    position={center}
    title="You are here"
  />
  {destinationPosition && (
  <Marker
    position={destinationPosition}
    title="Destination"
  />
)}
{sourcePosition && destinationPosition && !directions && (
   <DirectionsService
  options={{
  origin: sourcePosition,
  destination: destinationPosition,
  travelMode: google.maps.TravelMode.DRIVING,
  provideRouteAlternatives: true,
  drivingOptions: {
    departureTime: new Date(),
    trafficModel: google.maps.TrafficModel.BEST_GUESS,
  },
}}
   callback={async (result) => {
  if (result.status === "OK") {
    console.log("🚗 DIRECTIONS RESULT:", result);
console.log(
  "🚦 TRAFFIC DATA:",
  result.routes?.[0]?.legs?.[0]?.duration_in_traffic
);
    setDirections(result);
    const routes = result.routes || [];

console.log("🛣️ TOTAL ROUTES FROM GOOGLE:", routes.length);
    

const routeData = routes.map((route, index) => {
  const routeLeg = route.legs?.[0];

  const steps = routeLeg?.steps || [];

  const routePoints = steps
    .map((step) => {
      if (!step.end_location) return null;

      return {
        lat: step.end_location.lat(),
        lng: step.end_location.lng(),
      };
    })
    .filter(Boolean);

  const selectedRoutePoints = [
    routePoints[0],
    routePoints[Math.floor(routePoints.length / 3)],
    routePoints[Math.floor((routePoints.length * 2) / 3)],
    routePoints[routePoints.length - 1],
  ].filter(Boolean);

  return {
    routeIndex: index,
    distance: routeLeg?.distance?.text || "",
    normalDuration: routeLeg?.duration?.text || "",
    trafficDuration:
      routeLeg?.duration_in_traffic?.text || "",
    steps,
    weatherPoints: selectedRoutePoints,
  };
});

console.log("🛣️ ALL SMART ROUTES:", routeData);
routeData.forEach((route) => {
  console.log(
    `🌦️ ROUTE ${route.routeIndex + 1} WEATHER POINTS:`,
    route.weatherPoints
  );
});

setSmartRoutes(routeData);
fetchAllRoutesWeather(routeData);
fetchAllRoutesWeather(routeData);
const leg = result.routes?.[0]?.legs?.[0];

    
    const steps = leg?.steps || [];
const routePoints = steps
  .map((step) => {
    if (!step.end_location) return null;

    return {
      lat: step.end_location.lat(),
      lng: step.end_location.lng(),
    };
  })
  .filter(Boolean);

const selectedRoutePoints = [
  routePoints[0],
  routePoints[Math.floor(routePoints.length / 3)],
  routePoints[Math.floor((routePoints.length * 2) / 3)],
  routePoints[routePoints.length - 1],
].filter(Boolean);

await fetchRouteWeather(selectedRoutePoints);

console.log(
  "🛣️ SELECTED ROUTE WEATHER POINTS:",
  selectedRoutePoints
);

if (leg) {
  setRouteDistance(leg.distance?.text || "");
  setRouteDuration(leg.duration?.text || "");

  if (leg.duration_in_traffic) {
    setTrafficDuration(leg.duration_in_traffic.text);

    const normalSeconds = leg.duration?.value || 0;
    const trafficSeconds = leg.duration_in_traffic.value || 0;

    const delaySeconds = trafficSeconds - normalSeconds;

    const delayMinutes = Math.max(
      0,
      Math.round(delaySeconds / 60)
    );

    setTrafficDelay(
      delayMinutes > 0
        ? `${delayMinutes} min delay`
        : "No significant delay"
    );
  }
}
  } else {
    console.error("Directions error:", result);
  }
}}
  />
)}
{directions && (
  <DirectionsRenderer
    directions={directions}
  />
)}
</GoogleMap>
)}
{tripPlanned && directions && (
  <div
    style={{
      display: "flex",
      gap: "20px",
      flexWrap: "wrap",
      marginTop: "20px",
    }}
  >
    <div className="dashboard-card">
      <h3>📏 Distance</h3>
      <p>{routeDistance || "Calculating..."}</p>
    </div>

    <div className="dashboard-card">
      <h3>⏱️ Estimated Time</h3>
      <p>{routeDuration || "Calculating..."}</p>
    </div>
    <div className="dashboard-card">
  <h3>🚦 Traffic</h3>
  <p>{trafficDuration || "Calculating..."}</p>
  <p>{trafficDelay || "Calculating..."}</p>
</div>
  </div>
)}
{tripPlanned && smartRoutes.length > 0 && (
  <div
    style={{
      marginTop: "30px",
      background: "rgba(255,255,255,0.95)",
      borderRadius: "18px",
      padding: "25px",
      boxShadow: "0 5px 18px rgba(0,0,0,0.08)",
      color: "#172033",
    }}
  >
    <h2 style={{ marginTop: 0 }}>
      🛣️ Available Routes
    </h2>

    <p style={{ color: "#4b5563" }}>
      Choose one route for your trip.
    </p>
    {aiRecommendation && (
  <div className="ai-recommendation">
    <h3>🧠 AI Recommended Route</h3>

    <p>
      <strong>Route {aiRecommendation.routeIndex + 1}</strong>
    </p>

    <p>{aiRecommendation.message}</p>

    <p>
      Smart Score: <strong>{aiRecommendation.score}/100</strong>
    </p>
  </div>
)}

    {smartRoutes.map((route, index) => (
      <div
        key={route.routeIndex}
        style={{
          padding: "20px",
          marginBottom: "15px",
          border: "1px solid #e5e7eb",
          borderRadius: "14px",
          background:
            selectedRoute?.routeIndex === route.routeIndex
              ? "#ecfdf5"
              : "#f9fafb",
        }}
      >
        <h3>
          🛣️ Route {index + 1}
          {index === 0 && " ⭐ Recommended"}
        </h3>

        <p>
          📏 Distance: {route.distance || "N/A"}
        </p>

        <p>
          ⏱️ Normal Time: {route.normalDuration || "N/A"}
        </p>

        <p>
          🚦 Traffic Time: {route.trafficDuration || "N/A"}
        </p>

        <p>
          🌦️ Weather Risk: {route.weatherRisk ?? "N/A"}
        </p>

        <p>
          🛡️ Route Risk: {route.routeRisk ?? "N/A"}
        </p>

        <p>
          🧠 Smart Score: {route.smartScore ?? "N/A"}
        </p>

        <button
          onClick={() => {
            setSelectedRoute(route);

            setRouteDistance(route.distance || "");
            setRouteDuration(route.normalDuration || "");
            setTrafficDuration(route.trafficDuration || "");

            alert(`Route ${index + 1} selected.`);
          }}
          style={{
            background:
              selectedRoute?.routeIndex === route.routeIndex
                ? "#15803d"
                : "#2563eb",
            color: "white",
            padding: "10px 25px",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          {selectedRoute?.routeIndex === route.routeIndex
            ? "✅ Selected"
            : "Select Route"}
        </button>
      </div>
    ))}
    {selectedRoute && (
  <div
    style={{
      marginTop: "30px",
      padding: "25px",
      background: "rgba(255,255,255,0.95)",
      borderRadius: "18px",
      boxShadow: "0 5px 18px rgba(0,0,0,0.08)",
      color: "#172033",
    }}
  >
    <h2>💰 Plan Your Trip Budget</h2>

    <p style={{ color: "#4b5563" }}>
      Route {selectedRoute.routeIndex + 1} selected. Now enter your
      total budget for the entire trip.
    </p>

    <label
      style={{
        display: "block",
        marginBottom: "8px",
        fontWeight: "bold",
      }}
    >
      Total Trip Budget
    </label>

    <input
      type="number"
      min="1"
      placeholder="Enter total budget"
      value={totalBudget}
      onChange={(e) => setTotalBudget(e.target.value)}
      style={{
        width: "100%",
        padding: "12px",
        borderRadius: "8px",
        border: "1px solid #ccc",
        fontSize: "16px",
        boxSizing: "border-box",
      }}
    />

    <button
      onClick={async () => {
    if (!totalBudget || Number(totalBudget) <= 0) {
      alert("Please enter a valid total budget.");
      return;
    }

    try {
      setBudgetLoading(true);
      setBudgetError("");
      setBudgetPlan(null);

      const response = await axios.post(
        "http://localhost:5000/api/trips/budget-plan",
        {
  totalBudget: Number(totalBudget),
  travelers: Number(travelers),
  tripDays: Number(tripDays),
  travelMode,

  source,
  destination,
  travelDate,
  returnDate,

  selectedRoute: {
    routeIndex: selectedRoute.routeIndex,
    distance: selectedRoute.distance,
    normalDuration: selectedRoute.normalDuration,
    trafficDuration: selectedRoute.trafficDuration,
  },
}
      );

      if (response.data.success) {
        setBudgetPlan(response.data.budgetPlan);
      } else {
        setBudgetError(
          response.data.message || "Unable to create budget plan."
        );
      }
    } catch (error) {
      console.error("Budget planning error:", error);
      setBudgetError(
        "Unable to connect to budget planning service."
      );
    } finally {
      setBudgetLoading(false);
    }
  }}
      style={{
        marginTop: "15px",
        background: "#16a34a",
        color: "white",
        padding: "12px 30px",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "bold",
        fontSize: "16px",
      }}
    >
      💰 Plan Budget
    </button>
  </div>
)}
{budgetLoading && (
  <p style={{ marginTop: "15px", color: "#2563eb" }}>
    💰 Creating your budget plan...
  </p>
)}

{budgetError && (
  <p style={{ marginTop: "15px", color: "#dc2626" }}>
    ⚠️ {budgetError}
  </p>
)}

{budgetPlan && (
  <div
    style={{
      marginTop: "25px",
      padding: "25px",
      background: "#f0fdf4",
      borderRadius: "18px",
      border: "1px solid #bbf7d0",
      color: "#172033",
    }}
  >
    <h2>💰 Your Budget Plan</h2>

    <p>
      <strong>Total Budget:</strong> ₹{budgetPlan.totalBudget}
    </p>

    <p>
      <strong>Travelers:</strong> {budgetPlan.travelers}
    </p>

    <p>
      <strong>Trip Days:</strong> {budgetPlan.tripDays}
    </p>

    <hr />

    <h3>📊 Allocation</h3>

    <p>🚗 Travel: ₹{budgetPlan.allocation.travel}</p>
    <p>🏨 Accommodation: ₹{budgetPlan.allocation.accommodation}</p>
    <p>🍽️ Food: ₹{budgetPlan.allocation.food}</p>
    <p>🎯 Activities: ₹{budgetPlan.allocation.activities}</p>
    <p>
      🚨 Emergency Reserve: ₹
      {budgetPlan.allocation.emergencyReserve}
    </p>
    <p>💵 Buffer: ₹{budgetPlan.allocation.buffer}</p>

    <hr />

    <p>
      <strong>
        Total Allocated: ₹{budgetPlan.totalAllocated}
      </strong>
    </p>

    <p>
      <strong>
        Remaining: ₹{budgetPlan.remaining}
      </strong>
    </p>
  </div>
)}
  </div>
)}
      </LoadScript>
    </div>
  );
}

export default RoutePlanner;