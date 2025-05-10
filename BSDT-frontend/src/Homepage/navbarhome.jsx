import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./navbarhome.css";

import logo_buet from "../assets/logos/cse_buet.png";
import logo_ric from "../assets/logos/ric.png";
import logo_ict from "../assets/logos/ict.png";
import logo_edge from "../assets/logos/edge.png";

import {
  FaHome,
  FaUserPlus,
  FaSignInAlt,
  FaInfoCircle,
  FaQuestionCircle,
  FaSearch,
} from "react-icons/fa";

const NavbarHome = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [language, setLanguage] = useState(localStorage.getItem("language") || "English");
  const navigate = useNavigate();

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "English" ? "বাংলা" : "English"));
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery);
    }
  };

  const handleLoginClick = () => {
    const token = localStorage.getItem("token");
    navigate(token ? "/dashboard" : "/login");
  };

  return (
    <motion.nav className="navbar">
      {/* Logo Section */}
      <div className="logo-container">
        <img src={logo_buet} alt="BUET Logo" className="logo1" />
        <img src={logo_ric} alt="RIC Logo" className="logo2" />
        <img src={logo_ict} alt="ICT Logo"  className="logo3"/>
        <img src={logo_edge} alt="EDGE Logo" className="logo4" />
      </div>

      <div className="search-container">
        <input
          type="text"
          placeholder={
            language === "English"
              ? "Search for projects, surveys, accounts..."
              : "প্রজেক্ট, সার্ভে, অ্যাকাউন্ট অনুসন্ধান করুন..."
          }
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <FaSearch className="search-icon" onClick={handleSearch} />
      </div>

      <ul className="nav-links">
        <li>
          <a href="/home">
            <FaHome className="nav-icon" />
            {language === "English" ? "Home" : "হোম"}
          </a>
        </li>
        {/* <li>
          <a href="/signup">
            <FaUserPlus className="nav-icon" />
            {language === "English" ? "Sign Up" : "সাইন আপ"}
          </a>
        </li> */}
        <li>
          <a onClick={handleLoginClick}>
            <FaSignInAlt className="nav-icon" />
            {language === "English" ? "Login" : "লগইন"}
          </a>
        </li>
        <li>
          <a href="/about">
            <FaInfoCircle className="nav-icon" />
            {language === "English" ? "About" : "সম্পর্কে"}
          </a>
        </li>
        <li>
          <a href="/faq">
            <FaQuestionCircle className="nav-icon" />
            {language === "English" ? "FAQ" : "প্রশ্নাবলী"}
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
  );
};

export default NavbarHome;
