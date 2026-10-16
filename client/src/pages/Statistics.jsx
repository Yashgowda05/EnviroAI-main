import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaRoute,
  FaRoad,
  FaClock,
  FaLeaf,
  FaCar,
  FaBus,
  FaTrain,
  FaWalking,
} from "react-icons/fa";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";

import "../styles/statistics.css";

// Illustrative data for the initial interface.
// Replace this data with records from your backend.
const monthlyTrips = [
  { month: "May", trips: 4, distance: 120 },
  { month: "Jun", trips: 7, distance: 240 },
  { month: "Jul", trips: 5, distance: 180 },
  { month: "Aug", trips: 9, distance: 320 },
  { month: "Sep", trips: 6, distance: 210 },
  { month: "Oct", trips: 8, distance: 280 },
];

const travelModes = [
  { name: "Car", value: 35 },
  { name: "Bus", value: 30 },
  { name: "Train", value: 20 },
  { name: "Walking", value: 10 },
  { name: "Cycling", value: 5 },
];

const recentTrips = [
  {
    id: 1,
    destination: "Mysuru",
    distance: 145,
    duration: "3h 15m",
    mode: "Bus",
    date: "2026-10-12",
  },
  {
    id: 2,
    destination: "Mangaluru",
    distance: 350,
    duration: "7h 30m",
    mode: "Train",
    date: "2026-10-09",
  },
  {
    id: 3,
    destination: "Nandi Hills",
    distance: 62,
    duration: "1h 45m",
    mode: "Car",
    date: "2026-10-05",
  },
];

const modeIcons = {
  Car: <FaCar />,
  Bus: <FaBus />,
  Train: <FaTrain />,
  Walking: <FaWalking />,
  Cycling: <FaRoad />,
};

function Statistics() {
  const navigate = useNavigate();

  // Sample summary values. Connect these to real trip records later.
  const stats = {
    totalTrips: 39,
    totalDistance: 1350,
    totalHours: 48,
    co2Saved: 42.5,
  };

  const totalModeTrips = travelModes.reduce(
    (total, mode) => total + mode.value,
    0
  );

  return (
    <div className="statistics-page">
      <header className="statistics-header">
        <button
          className="back-button"
          onClick={() => navigate("/dashboard")}
        >
          <FaArrowLeft /> Dashboard
        </button>

        <div>
          <h1>Travel Statistics</h1>
          <p>
            Analyze your travel patterns and environmental impact.
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={() => window.location.reload()}
        >
          Refresh
        </button>
      </header>

      <section className="statistics-summary">
        <div className="statistics-card">
          <div className="statistics-icon">
            <FaRoute />
          </div>

          <p>Total Trips</p>
          <h2>{stats.totalTrips}</h2>
          <span>Trips planned</span>
        </div>

        <div className="statistics-card">
          <div className="statistics-icon">
            <FaRoad />
          </div>

          <p>Total Distance</p>
          <h2>{stats.totalDistance.toLocaleString()} km</h2>
          <span>Recorded or planned distance</span>
        </div>

        <div className="statistics-card">
          <div className="statistics-icon">
            <FaClock />
          </div>

          <p>Travel Time</p>
          <h2>{stats.totalHours} hrs</h2>
          <span>Estimated journey duration</span>
        </div>

        <div className="statistics-card">
          <div className="statistics-icon">
            <FaLeaf />
          </div>

          <p>CO₂ Saved</p>
          <h2>{stats.co2Saved} kg</h2>
          <span>Illustrative estimate</span>
        </div>
      </section>

      <section className="statistics-charts">
        <div className="chart-card">
          <h2>Monthly Trips</h2>
          <p>Number of trips planned each month</p>

          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrips}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#344158"
                />

                <XAxis
                  dataKey="month"
                  stroke="#b8c5d9"
                />

                <YAxis stroke="#b8c5d9" />

                <Tooltip />

                <Bar
                  dataKey="trips"
                  name="Trips"
                  fill="#10b981"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <h2>Travel Mode Distribution</h2>
          <p>Illustrative percentage breakdown</p>

          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={travelModes}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={95}
                  label={({ name, value }) =>
                    `${name} ${Math.round(
                      (value / totalModeTrips) * 100
                    )}%`
                  }
                >
                  {travelModes.map((mode, index) => (
                    <Cell
                      key={mode.name}
                      fill={[
                        "#10b981",
                        "#3b82f6",
                        "#f59e0b",
                        "#a78bfa",
                        "#f472b6",
                      ][index]}
                    />
                  ))}
                </Pie>

                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card chart-wide">
          <h2>Monthly Distance</h2>
          <p>Distance recorded or planned per month</p>

          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrips}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#344158"
                />

                <XAxis
                  dataKey="month"
                  stroke="#b8c5d9"
                />

                <YAxis
                  stroke="#b8c5d9"
                  unit=" km"
                />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="distance"
                  name="Distance"
                  stroke="#38bdf8"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="recent-trips">
        <div className="section-heading">
          <div>
            <h2>Recent Trips</h2>
            <p>Your latest planned journeys</p>
          </div>

          <button onClick={() => navigate("/plan-trip")}>
            Plan a Trip
          </button>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Destination</th>
                <th>Distance</th>
                <th>Duration</th>
                <th>Travel Mode</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {recentTrips.map((trip) => (
                <tr key={trip.id}>
                  <td>{trip.destination}</td>
                  <td>{trip.distance} km</td>
                  <td>{trip.duration}</td>

                  <td>
                    <span className="travel-mode">
                      {modeIcons[trip.mode]}
                      {trip.mode}
                    </span>
                  </td>

                  <td>{trip.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="statistics-footer">
        <FaLeaf />
        <p>
          Choose public transport, walking, or cycling when practical
          to help reduce your travel footprint.
        </p>
      </footer>
    </div>
  );
}

export default Statistics;