import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { Avatar, Menu, MenuItem, IconButton } from "@mui/material";
import { IoPersonCircle } from "react-icons/io5";

import logo_buet from "../assets/logos/cse_buet.png";
import logo_ict from "../assets/logos/ict.png";
import logo_edge from "../assets/logos/edge.png";
import logo_ric from "../assets/logos/ric.png";
import { FaChartBar } from "react-icons/fa";
import {
  FaHome,
  FaSignOutAlt,
  FaInfoCircle,
  FaQuestionCircle,
  FaSearch,
} from "react-icons/fa";
import "./navbarAccountholder.css";

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY;

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

const logOut = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userType");
  localStorage.removeItem("role");
  localStorage.removeItem("userId");
  localStorage.setItem("language", "English");
  window.location.href = "/";
};

const NavbarAcholder = (props) => {
  const language = props.language || localStorage.getItem("language");
  const setLanguage = props.setLanguage;
  const [searchQuery, setSearchQuery] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [profilePicUrl, setProfilePicUrl] = useState(null);
  const [name, setName] = useState("");
  const [translatedLabels, setTranslatedLabels] = useState({});
  
  // Updated: Get admin status from both props and local check
  const [isAdmin, setIsAdmin] = useState(false);
  const [userType, setUserType] = useState('normal');

  const labelsToTranslate = [
    "Go to Profile",
    "Logout",
    "Home",
    "About",
    "FAQ",
    "Search for projects, surveys, accounts...",
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get("http://localhost:2000/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 200) {
          const user = response.data.user;
          setName(user.name);
          setProfilePicUrl(user.image);
          
          // Update local admin state
          const currentUserType = user.user_type;
          setUserType(currentUserType);
          setIsAdmin(currentUserType === 'admin');
        }
      } catch (error) {
        console.error("Failed to load profile info:", error);
      }
    };

    fetchProfile();
  }, []);

  // Update admin state when props change
  useEffect(() => {
    if (props.isAdmin !== undefined) {
      setIsAdmin(props.isAdmin);
    }
    if (props.userType !== undefined) {
      setUserType(props.userType);
    }
  }, [props.isAdmin, props.userType]);

  useEffect(() => {
    const loadTranslations = async () => {
      if (language === "English") {
        setTranslatedLabels({});
        return;
      }

      const translated = await translateText(labelsToTranslate, "bn");
      const translatedMap = {};
      labelsToTranslate.forEach((label, idx) => {
        translatedMap[label] = translated[idx];
      });

      setTranslatedLabels(translatedMap);
    };

    loadTranslations();
  }, [language]);

  const getLabel = (text) =>
    language === "English" ? text : translatedLabels[text] || text;

  const toggleLanguage = () => {
    localStorage.setItem("language", language === "English" ? "বাংলা" : "English");
    setLanguage(localStorage.getItem("language"));
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery);
    }
  };

  return (
    <motion.nav className="navbar">
      <div className="logo-container">
        <img src={logo_buet} alt="BUET Logo" className="logo1" />
        <img src={logo_ric} alt="RIC Logo" className="logo2" />
        <img src={logo_ict} alt="ICT Logo" className="logo3" />
        <img src={logo_edge} alt="EDGE Logo" className="logo4" />
      </div>

      {/* Only show search bar for non-admin users */}
      {!isAdmin && userType !== 'admin' && (
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
      )}

      <ul className="nav-links">
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

        <li>
          <FaHome className="nav-icon" />
          <a href="/">
            <span> {getLabel("Home")} </span>
          </a>
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
            <span>FAQ</span>
          </a>
        </li>

        {/* Only show Analysis link for non-admin users */}
        {!isAdmin && userType !== 'admin' && (
          <li>
            <a href="/analysis">
              <FaChartBar className="nav-icon" />
              <span>
                {language === "English" ? "Analysis" : "বিশ্লেষণ"}
              </span>
            </a>
          </li>
        )}

        <li>
          <div className="navbar-profile">
            <div className="avatar-container">
              <IconButton
                onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{ p: 0 }}
              >
                {profilePicUrl ? (
                  <Avatar alt={name} src={profilePicUrl} />
                ) : (
                  <Avatar>{name?.[0]?.toUpperCase() || "U"}</Avatar>
                )}
              </IconButton>
              <div className="profile-name">
                {name?.trim().split(" ").slice(-1)[0] || "User"}
              </div>
            </div>

            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={() => setAnchorEl(null)}
              onClick={() => setAnchorEl(null)}
              PaperProps={{
                elevation: 3,
                sx: {
                  mt: 1.5,
                  borderRadius: "12px",
                  filter: "drop-shadow(0px 4px 10px rgba(0,0,0,0.1))",
                },
              }}
            >
              <MenuItem onClick={() => (window.location.href = "/dashboard")}>
                <IoPersonCircle style={{ marginRight: "8px" }} />
                {getLabel("Go to Profile")}
              </MenuItem>
              <MenuItem onClick={logOut}>
                <FaSignOutAlt style={{ marginRight: "8px" }} />
                {getLabel("Logout")}
              </MenuItem>
            </Menu>
          </div>
        </li>
      </ul>
    </motion.nav>
  );
};

export default NavbarAcholder;