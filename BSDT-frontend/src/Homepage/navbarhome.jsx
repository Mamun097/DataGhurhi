import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./navbarhome.css";

import logo_buet from "../assets/logos/cse_buet.png";
import logo_ric from "../assets/logos/ric.png";
import logo_ict from "../assets/logos/ict.png";
import logo_edge from "../assets/logos/edge.png";

import {
  FaHome,
  FaSignInAlt,
  FaInfoCircle,
  FaQuestionCircle,
  FaSearch,
} from "react-icons/fa";

// Your Google Translate API key (from your Google Cloud Console)
const GOOGLE_API_KEY =  import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY;

const NavbarHome = (props) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [language, setLanguage] = useState(localStorage.getItem("language") || "English"); // Use localStorage if available
  const [translations, setTranslations] = useState({});
  const navigate = useNavigate();
  const labelsToTranslate = [
    "Go to Profile",
    "Logout",
    "Home",
    "About",
    "FAQ",
    "Search for projects, surveys, accounts...",
  ];

  // Function to fetch translations from Google Translate API
  const translateText = async (textArray, targetLang) => {
    try {
      const response = await axios.post(
        `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_API_KEY}`,
        {
          q: textArray,
          target: targetLang,
          format: "text",
        }
      );
      return response.data.data.translations.map((t) => t.translatedText);
    } catch (error) {
      console.error("Translation error:", error);
      return textArray; // If there's an error, fallback to original text
    }
  };

  // Toggle language between English and Bengali
  const toggleLanguage = () => {
    const newLang = language === "English" ? "bn" : "en"; // 'bn' for Bengali, 'en' for English
    setLanguage(newLang === "bn" ? "বাংলা" : "English");
    localStorage.setItem("language", newLang === "bn" ? "বাংলা" : "English");
  };

  // Fetch translations when language changes
  useEffect(() => {
    const loadTranslations = async () => {
      const labels = [
        "Home",
        "Login",
        "About",
        "FAQ",
        "Search for projects, surveys, accounts...",
      ];

      // If language is English, don't translate
      if (language === "English") {
        setTranslations({});
        return;
      }

      const translated = await translateText(labels, language === "বাংলা" ? "bn" : "en");

      const translatedMap = {};
      labels.forEach((label, idx) => {
        translatedMap[label] = translated[idx];
      });

      setTranslations(translatedMap);
    };

    loadTranslations();
  }, [language]);

  // Function to get the translated text based on selected language
  const getLabel = (text) => translations[text] || text;

  // Handle the search query
  const handleSearch = () => {
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery);
    }
  };

  // Handle the login action
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
        <img src={logo_ict} alt="ICT Logo" className="logo3" />
        <img src={logo_edge} alt="EDGE Logo" className="logo4" />
      </div>

      {/* Search Bar */}
      <div className="search-container">
        <input
          type="text"
          placeholder={getLabel("Search for projects, surveys, accounts...")}
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <FaSearch className="search-icon" onClick={handleSearch} />
      </div>

      {/* Navigation Links */}
      <ul className="nav-links">
        <li>
          <a href="/home">
            <FaHome className="nav-icon" />
            <span>{getLabel("Home")}</span>
          </a>
        </li>
        <li>
          <button onClick={handleLoginClick} className="nav-link-button">
            <FaSignInAlt className="nav-icon" />
            <span>{getLabel("Login")}</span>
          </button>
        </li>
        <li>
          <a href="/about">
            <FaInfoCircle className="nav-icon" />
            <span>{getLabel("About")}</span>
          </a>
        </li>
        <li>
          <a href="/faq">
            <FaQuestionCircle className="nav-icon" />
            <span>{getLabel("FAQ")}</span>
          </a>
        </li>

        {/* Language Toggle */}
        <li>
          <div className="language-toggle">
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
              <span className={language === "বাংলা" ? "active" : ""}>
                বাংলা
              </span>
            </div>
          </div>
        </li>
      </ul>
    </motion.nav>
  );
};

export default NavbarHome;
