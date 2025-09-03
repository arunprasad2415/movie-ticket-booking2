import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Navbar.css";
const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <span>CineBook</span>
      </div>
      <div className="navbar-buttons">
        <button className="nav-btn" onClick={() => navigate("/login")}>
          Login
        </button>
        <button className="nav-btn" onClick={() => navigate("/register")}>
          Register
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
