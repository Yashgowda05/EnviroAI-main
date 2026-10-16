import "../styles/register.css";
import { motion } from "framer-motion";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function Register() {
  const navigate = useNavigate();

const [formData, setFormData] = useState({
  name: "",
  email: "",
    phone: "",

  password: "",
  confirmPassword: "",

});
const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);
const handleChange = (e) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value,
  });
};
const handleSubmit = async (e) => {
  e.preventDefault();
if (formData.password !== formData.confirmPassword) {
  toast.error("Passwords do not match");
  return;
}
if (formData.password.length < 6) {
  toast.warning("Password must be at least 6 characters");
  return;
}
if (formData.name.trim().length < 3) {
  toast.error("Name must contain at least 3 characters");
  return;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!emailRegex.test(formData.email)) {
  toast.error("Enter a valid email address");
  return;
}

if (!/^\d{10}$/.test(formData.phone)) {
  toast.error("Phone number must be exactly 10 digits");
  return;
}
  try {
    const { name, email, phone, password } = formData;

const response = await axios.post(
  "http://localhost:5000/api/auth/register",
 {
  name,
  email,
  phone,
  password,
}
);

    toast.success(response.data.message);

    navigate("/login");

  } catch (error) {

    toast.error(
  error.response?.data?.message || "Registration Failed"
);

  }
};
  return (
    <div className="register-container">

      <motion.div
        className="register-card"
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >

        <h1>🌍 EnviroAI</h1>

        <h2>Create Your Account</h2>

<form onSubmit={handleSubmit}>

  <input
    type="text"
    name="name"
    placeholder="Full Name"
    value={formData.name}
    onChange={handleChange}
  />

  <input
    type="email"
    name="email"
    placeholder="Email Address"
    value={formData.email}
    onChange={handleChange}
  />
  <input
  type="tel"
  name="phone"
  placeholder="Phone Number"
  value={formData.phone}
  onChange={handleChange}
  maxLength={10}
/>

  {/* Password */}

  <div className="password-field">
    <input
      type={showPassword ? "text" : "password"}
      name="password"
      placeholder="Password"
      value={formData.password}
      onChange={handleChange}
    />

    <button
      type="button"
      className="eye-icon"
      onClick={() => setShowPassword(!showPassword)}
    >
      {showPassword ? <FaEyeSlash /> : <FaEye />}
    </button>
  </div>

  {/* Confirm Password */}

  <div className="password-field">
    <input
      type={showConfirmPassword ? "text" : "password"}
      name="confirmPassword"
      placeholder="Confirm Password"
      value={formData.confirmPassword}
      onChange={handleChange}
    />

    <button
      type="button"
      className="eye-icon"
      onClick={() =>
        setShowConfirmPassword(!showConfirmPassword)
      }
    >
      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
    </button>
  </div>

  <button type="submit">
    Create Account
  </button>

</form>

        <p>
  Already have an account?{" "}
  <Link to="/login">
    <span>Login</span>
  </Link>
</p>

      </motion.div>

    </div>
  );
}

export default Register;