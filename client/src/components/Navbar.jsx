import { FaGlobeAsia } from "react-icons/fa";

import "../styles/navbar.css";

import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">
  <FaGlobeAsia className="logo-icon" />
  <span>EnviroAI</span>
</div>

      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/login">Login</Link></li>
        <li><Link to="/register">Register</Link></li>
      </ul>
    </nav>
  );
}

export default Navbar;