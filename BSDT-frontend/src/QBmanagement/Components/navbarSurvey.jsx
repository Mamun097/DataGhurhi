import React, { useState } from "react";
import { motion } from "framer-motion";
import "../CSS/navbarSurvey.css";

import logo_buet from "../../assets/logos/buet.png";
import logo_ict from "../../assets/logos/ict.png";
import logo_edge from "../../assets/logos/edge.png";
import logo_ric from "../../assets/logos/ric.png";
import {
  FaHome,
  FaUser,
  FaSignOutAlt,
  FaInfoCircle,
  FaQuestionCircle,
  FaSearch,
} from "react-icons/fa";

const logOut = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userType");
  localStorage.removeItem("role");
  localStorage.removeItem("userId");
  localStorage.setItem("language", "English");
  window.location.href = "/";
};
const NavbarSurvey = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [language, setLanguage] = useState("English");

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "English" ? "বাংলা" : "English"));
  };
  const handleSearch = () => {
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery);
    }
  };

  return (
    <div>
    <motion.nav className="navbar">
      {/* Logo Section */}
      <div className="logo-container">
        <img src={logo_buet} alt="BUET Logo" className="logo" />
        <img src={logo_ric} alt="RIC Logo" className="logo" />
        <img src={logo_ict} alt="ICT Logo" className="logo" />
        <img src={logo_edge} alt="EDGE Logo" className="logo" />
      </div>

      {/* Navigation Links */}
      <ul className="nav-links">
        <li>
          <a href="home">
            <FaHome className="nav-icon" />
            <span> {language === "English" ? "Home" : "হোম"} </span>
          </a>
        </li> 
        <li>
          <a href="profile">
            <FaUser className="nav-icon" />
            <span>{language === "English" ? "Profile" : "প্রোফাইল"}</span>
          </a>
        </li> 
        <li>
          <a href="login" onClick={logOut}>
            <FaSignOutAlt className="nav-icon" />
            <span>{language === "English" ? "Logout" : "লগআউট"}</span>
          </a>
        </li>
        <li>
          <a href="about">
            <FaInfoCircle className="nav-icon" />
            <span> {language === "English" ? "About" : "সম্পর্কে"}</span>
          </a>
        </li>
        <li>
          <a href="faq">
            <FaQuestionCircle className="nav-icon" />
            <span>{language === "English" ? "FAQ" : "প্রশ্নাবলী"}</span>
          </a>
        </li>
        <li className="language-toggle">
          <label className="switch">
            <input
              type="checkbox"
              onChange={toggleLanguage}
              checked={language === "বাংলা"}
            />
            <span className="slider"></span>
          </label>
          <div className="language-labels">
            <span className={language === "English" ? "active" : ""}>
              English
            </span>
            <span className={language === "বাংলা" ? "active" : ""}>বাংলা</span>
          </div>
        </li>
      </ul>
    </motion.nav>
    </div>
  );
};

export default NavbarSurvey;
