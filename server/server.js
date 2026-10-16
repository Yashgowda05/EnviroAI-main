const profileRoutes = require("./routes/profileRoutes");
const assistantRoutes = require("./routes/assistantRoutes");
const express = require("express");
const cors = require("cors");
const weatherRoutes = require("./routes/weatherRoutes");
const aqiRoutes = require("./routes/aqiRoutes");
require("dotenv").config();

const connectDB = require("./config/database");

const authRoutes = require("./routes/authRoutes");

const tripRoutes = require("./routes/tripRoutes");

const riskRoutes = require("./routes/riskRoutes");

const app = express();  

app.use(cors());

app.use(express.json());
app.use("/api/auth/profile", profileRoutes);
const PORT = process.env.PORT;

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/aqi", aqiRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/trips/risk", riskRoutes);

app.use("/api/assistant", assistantRoutes);
app.get("/", (req, res) => {
  res.send("🚀 EnviroAI Backend is Running...");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});