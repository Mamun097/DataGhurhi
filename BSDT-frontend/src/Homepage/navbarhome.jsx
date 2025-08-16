import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./navbarhome.css";
import apiClient from "../api";

import logo_dataghurhi from "../assets/logos/dataghurhi.png";

import {
  FaHome,
  FaSignInAlt,
  FaInfoCircle,
  FaQuestionCircle,
  FaSearch,
} from "react-icons/fa";

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY;

const NavbarHome = ({ language, setLanguage }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFilter, setSearchFilter] = useState("all");
  const [translations, setTranslations] = useState({});
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
      return textArray;
    }
  };

  const toggleLanguage = () => {
    const newLang = language === "English" ? "বাংলা" : "English";
    setLanguage(newLang);
    localStorage.setItem("language", newLang);
  };

  useEffect(() => {
    const loadTranslations = async () => {
      const labels = [
        "Home",
        "Login",
        "About",
        "FAQ",
        "Write your search query here...",
        "All",
        "Project",
        "Survey",
        "Account",
      ];

      if (language === "English") {
        setTranslations({});
        return;
      }

      const translated = await translateText(labels, "bn");
      const translatedMap = {};
      labels.forEach((label, idx) => {
        translatedMap[label] = translated[idx];
      });

      setTranslations(translatedMap);
    };

    loadTranslations();
  }, [language]);

  const getLabel = (text) => translations[text] || text;

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      try {
        const response = await apiClient.get("/api/search", {
          params: {
            query: searchQuery,
            filter: searchFilter === "all" ? "" : searchFilter,
          },
        });

        const results = response.data.results;
        navigate("/search-results", {
          state: {
            results,
            query: searchQuery,
          },
        });
      } catch (error) {
        console.error(
          "Search request failed:",
          error.response?.data || error.message
        );
      }
    }
  };

  const handleLoginClick = () => {
    const token = localStorage.getItem("token");
    navigate(token ? "/dashboard" : "/login");
  };

  return (
    <motion.nav className="navbar">
      <div className="navbar-top-row">
        <div className="navbar-left">
          <div className="logo-list-item">
            <img src={logo_dataghurhi} alt="DataGhurhi logo" />
            <span>DataGhurhi</span>
          </div>
        </div>
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
            <span className={language === "বাংলা" ? "active" : ""}>বাংলা</span>
          </div>
        </div>

        <div className="search-container">
          <select
            className="search-filter"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
          >
            <option value="all">{getLabel("All")}</option>
            <option value="project">{getLabel("Project")}</option>
            <option value="survey">{getLabel("Survey")}</option>
            <option value="account">{getLabel("Account")}</option>
          </select>

          <div className="search-box-wrapper">
            <input
              type="text"
              placeholder={getLabel("Write your search query here...")}
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <FaSearch className="search-icon-inside" onClick={handleSearch} />
          </div>
        </div>

        {isMobile && (
          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            ☰ 
          </button>
        )}
      </div>

      {/* Nav Popup */}
      <ul className={`nav-links ${isMobile && menuOpen ? "popup-open" : ""}`}>
        <li onClick={() => isMobile && setMenuOpen(false)}>
          <a href="/home">
            <FaHome className="nav-icon" />
            <span>{getLabel("Home")}</span>
          </a>
        </li>
        <li onClick={() => isMobile && setMenuOpen(false)}>
          <button onClick={handleLoginClick} className="nav-link-button">
            <FaSignInAlt className="nav-icon" />
            <span>{getLabel("Login")}</span>
          </button>
        </li>
        <li onClick={() => isMobile && setMenuOpen(false)}>
          <a href="/about">
            <FaInfoCircle className="nav-icon" />
            <span>{getLabel("About")}</span>
          </a>
        </li>
        <li onClick={() => isMobile && setMenuOpen(false)}>
          <a href="/faq">
            <FaQuestionCircle className="nav-icon" />
            <span>FAQ</span>
          </a>
        </li>
      </ul>
    </motion.nav>
  );
};

export default NavbarHome;
