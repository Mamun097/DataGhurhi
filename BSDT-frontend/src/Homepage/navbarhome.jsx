import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "./navbarhome.css";
import logo_bcc from "../assets/logos/bcc.png";
import logo_buet from "../assets/logos/buet.png";
import logo_ict from "../assets/logos/ict.png";
import logo_edge from "../assets/logos/edge.png";
import logo_ric from "../assets/logos/ric.png";
import { FaHome, FaUserPlus, FaSignInAlt, FaInfoCircle, FaQuestionCircle, FaSearch } from "react-icons/fa";

const NavbarHome = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate(); 

  const handleSearch = () => {
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery);
    }
  };
    // Function to handle login click
    const handleLoginClick = () => {
      const token = localStorage.getItem("token"); // Check if token exists
      if (token) {
        navigate("/dashboard"); // Redirect to dashboard if logged in
      } else {
        navigate("/login"); // Redirect to login page if not logged in
      }
    };

  return (
    <motion.nav className="navbar">
      {/* Logo Section */}
      <div className="logo-container">
        <img src={logo_buet} alt="BUET Logo" className="logo" />
        <img src={logo_ric} alt="RIC Logo" className="logo" />
        <img src={logo_ict} alt="ICT Logo" className="logo" />
        <img src={logo_edge} alt="EDGE Logo" className="logo" />
      </div>

      {/* Always Visible Search Box */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search for projects, surveys, accounts..."
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <FaSearch className="search-icon" onClick={handleSearch} />
      </div>

      {/* Navigation Links */}
      <ul className="nav-links">
        <li><a href="home"><FaHome className="nav-icon" /><span>Home</span></a></li>
        <li><a href="signup"><FaUserPlus className="nav-icon" /><span>Sign Up</span></a></li>
        {/* Use onClick to navigate based on token existence */}
        <li onClick={handleLoginClick} style={{ cursor: "pointer" }}>
          <FaSignInAlt className="nav-icon" /><span>Log in</span>
        </li>
        <li><a href="about"><FaInfoCircle className="nav-icon" /><span>About</span></a></li>
        <li><a href="faq"><FaQuestionCircle className="nav-icon" /><span>FAQ</span></a></li>
      </ul>

    </motion.nav>
  );
};

export default NavbarHome;
