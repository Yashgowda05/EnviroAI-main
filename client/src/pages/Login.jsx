import "../styles/login.css";
import { motion } from "framer-motion";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";


function Login() {
  const navigate = useNavigate();

const [formData, setFormData] = useState({
  email: "",
  password: "",
});

const handleChange = (e) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value,
  });
};
const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const response = await axios.post(
      "http://localhost:5000/api/auth/login",
      formData
    );

    // Save JWT Token
    localStorage.setItem("token", response.data.token);

    // Save User Details
    localStorage.setItem("token", response.data.token);

localStorage.setItem(
  "user",
  JSON.stringify(response.data.user)
);

toast.success(response.data.message);

navigate("/dashboard");

  } catch (error) {

    toast.error(
  error.response?.data?.message || "Login Failed"
);

  }
};
  return (
    <div className="login-container">
      <motion.div
        className="login-card"
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1>🌍 EnviroAI</h1>

        <h2>Welcome Back</h2>

      <form onSubmit={handleSubmit}>

  <input
    type="email"
    name="email"
    placeholder="Email Address"
    value={formData.email}
    onChange={handleChange}
  />

  <input
    type="password"
    name="password"
    placeholder="Password"
    value={formData.password}
    onChange={handleChange}
  />

  <button type="submit">
    Login
  </button>

</form>

        <p>
  Don't have an account?{" "}
  <Link to="/register">
    <span>Register</span>
  </Link>
</p>
      </motion.div>
    </div>
  );
}

export default Login;