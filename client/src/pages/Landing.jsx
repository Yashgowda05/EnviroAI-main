import { useNavigate } from "react-router-dom";
import {
  FaRobot,
  FaCloudSun,
  FaMapMarkedAlt,
  FaLeaf,
} from "react-icons/fa";
import { motion } from "framer-motion";

import "../styles/landing.css";
import Navbar from "../components/Navbar";

function Landing() {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <div className="hero">
        {/* Replaces the missing travel.mp4 video */}
        <div className="travel-background"></div>

        <div className="overlay"></div>

        <div className="hero-content">
          <motion.h1
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            Travel Smarter with AI
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            AI-Based Environmental Mapping & Route Assistant
          </motion.p>

          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.6,
              delay: 0.8,
              type: "spring",
              stiffness: 120,
            }}
            onClick={() => navigate("/register")}
          >
            Get Started
          </motion.button>
        </div>
      </div>

      {/* Features Section */}
      <section className="features">
        <h2>Why Choose EnviroAI?</h2>

        <p>
          Smart travel powered by Artificial Intelligence,
          Weather Intelligence, and Environmental Analytics.
        </p>

        <div className="feature-grid">
          <motion.div
            className="feature-card"
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
          >
            <h3>
              <FaRobot className="feature-icon" />
              AI Route Planning
            </h3>

            <p>
              Intelligent route suggestions based on weather,
              traffic and environmental conditions.
            </p>
          </motion.div>

          <motion.div
            className="feature-card"
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <h3>
              <FaCloudSun className="feature-icon" />
              Live Weather
            </h3>

            <p>
              Real-time weather forecasts and alerts for safer
              travel planning.
            </p>
          </motion.div>

          <motion.div
            className="feature-card"
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            <h3>
              <FaMapMarkedAlt className="feature-icon" />
              Smart Navigation
            </h3>

            <p>
              Discover the safest and fastest routes with AI
              recommendations.
            </p>
          </motion.div>

          <motion.div
            className="feature-card"
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay: 0.6 }}
          >
            <h3>
              <FaLeaf className="feature-icon" />
              Environmental Analysis
            </h3>

            <p>
              Monitor AQI and environmental conditions before
              starting your journey.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="stats">
        <div className="stat-box">
          <h2>10K+</h2>
          <p>Happy Travelers</p>
        </div>

        <div className="stat-box">
          <h2>95%</h2>
          <p>Safe Routes</p>
        </div>

        <div className="stat-box">
          <h2>24/7</h2>
          <p>AI Assistance</p>
        </div>

        <div className="stat-box">
          <h2>150+</h2>
          <p>Cities Covered</p>
        </div>
      </section>
    </>
  );
}

export default Landing;