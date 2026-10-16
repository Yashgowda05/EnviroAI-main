import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import AnimatedBackground from "../components/AnimatedBackground";
import axios from "axios";
import "../styles/dashboard.css";
import {
  FaUserCircle,
  FaCloudSun,
  FaLeaf,
  FaRoute,
  FaRobot,
  FaChartBar,
} from "react-icons/fa";

function Dashboard() {
  const navigate = useNavigate();
  const [weather, setWeather] = useState(null);
  const [aqi, setAqi] = useState(null);
  const [tripStats, setTripStats] = useState({
  total: 0,
  upcoming: 0,
  ongoing: 0,
  completed: 0,
  deleted: 0,
});

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };
  useEffect(() => {

  const fetchWeather = (latitude, longitude) => {

  axios
    .get(
      `http://localhost:5000/api/weather?lat=${latitude}&lon=${longitude}`
    )
    .then((res) => {

      setWeather(res.data.data);

      return axios.get(
        `http://localhost:5000/api/aqi?lat=${latitude}&lon=${longitude}`
      );

    })
    .then((res) => {

      setAqi(res.data.data);

    })
    .catch((err) => {
      console.error("Error:", err);
    });

};

  if (navigator.geolocation) {

    navigator.geolocation.getCurrentPosition(

      (position) => {
  console.log("📍 GPS LOCATION:");
  console.log("Latitude:", position.coords.latitude);
  console.log("Longitude:", position.coords.longitude);
  console.log("Accuracy:", position.coords.accuracy, "meters");

  fetchWeather(
    position.coords.latitude,
    position.coords.longitude
  );
},

      (error) => {

        console.error(error);

      }

    );

  }
  axios
  .get("http://localhost:5000/api/trips")
  .then((res) => {
    const trips = res.data.trips || [];

    setTripStats({
      total: trips.length,
      upcoming: trips.filter(
        (trip) => trip.status === "Upcoming"
      ).length,
      ongoing: trips.filter(
        (trip) => trip.status === "Ongoing"
      ).length,
      completed: trips.filter(
        (trip) => trip.status === "Completed"
      ).length,
      deleted: trips.filter(
        (trip) => trip.status === "Deleted"
      ).length,
    });
  })
  .catch((err) => {
    console.error("Error fetching trip statistics:", err);
  });

}, []);

  return (
    <div className="dashboard">

      {/* Navbar */}

      <nav className="dashboard-navbar">

        <h2>🌍 EnviroAI</h2>

        <button
          className="logout-btn"
          onClick={handleLogout}
        >
          Logout
        </button>

      </nav>

      {/* Dashboard Content */}

      <div className="dashboard-content">

        <h1>Welcome 👋</h1>

        <p>Your AI Travel Assistant Dashboard</p>

        <div className="dashboard-grid">

         <div
  className="dashboard-card"
  onClick={() => navigate("/profile")}
  role="button"
  tabIndex={0}
  onKeyDown={(event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      navigate("/profile");
    }
  }}
  aria-label="Open your profile"
>
  <FaUserCircle className="card-icon" />

  <h3>Profile</h3>

  <p>Manage your account</p>
</div>

   <div className="dashboard-card">
  <FaCloudSun className="card-icon" />

  <h3>Weather</h3>

  {weather ? (
    <>
      <p>📍 {weather.name}</p>
      <p>🌡 {weather.main.temp} °C</p>
      <p>{weather.weather[0].description}</p>
      <p>💧 Humidity: {weather.main.humidity}%</p>
    </>
  ) : (
    <p>Loading...</p>
  )}
</div>

          <div className="dashboard-card">
  <FaLeaf className="card-icon" />

  <h3>Air Quality</h3>

  {aqi ? (
    <>
      <p>🌿 AQI: {aqi.list[0].main.aqi}</p>

      <p>
        {
          [
            "😊 Good",
            "🙂 Fair",
            "😐 Moderate",
            "😷 Poor",
            "☠️ Very Poor",
          ][aqi.list[0].main.aqi - 1]
        }
      </p>

      <p>PM2.5: {aqi.list[0].components.pm2_5}</p>

      <p>PM10: {aqi.list[0].components.pm10}</p>
    </>
  ) : (
    <p>Loading...</p>
  )}
</div>

         <div
  className="dashboard-card"
  onClick={() => navigate("/route")}
  style={{ cursor: "pointer" }}
>
  <FaRoute className="card-icon" />
  <h3>Plan My Trip</h3>
  <p>Plan your complete journey</p>
</div>

      <div
  className="dashboard-card"
  onClick={() => navigate("/assistant")}
  role="button"
  tabIndex={0}
  onKeyDown={(event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      navigate("/assistant");
    }
  }}
  aria-label="Open AI Travel Assistant"
>
  <FaRobot className="card-icon" />

  <h3>AI Assistant</h3>

  <p>Travel Suggestions</p>
</div>

          <div
  className="dashboard-card"
  onClick={() => navigate("/statistics")}
  style={{ cursor: "pointer" }}
>
  <FaChartBar className="card-icon" />

  <h3>Statistics</h3>

  <p>View your travel statistics</p>
</div>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;