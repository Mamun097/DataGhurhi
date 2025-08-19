import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Avatar, Menu, MenuItem, IconButton } from "@mui/material";
import { IoPersonCircle } from "react-icons/io5";
import {
  FaHome,
  FaSignOutAlt,
  FaInfoCircle,
  FaQuestionCircle,
  FaSearch,
  FaChartBar,
} from "react-icons/fa";

import logo_dataghurhi from "../assets/logos/dataghurhi.png";
import "./navbarAcholder.css";
import apiClient from "../api";

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY;

const translateText = async (textArray, targetLang) => {
  try {
    const response = await axios.post(
      `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_API_KEY}`,
      { q: textArray, target: targetLang, format: "text" }
    );
    return response.data.data.translations.map((t) => t.translatedText);
  } catch (error) {
    console.error("Translation error:", error);
    return textArray;
  }
};

const logOut = () => {
  localStorage.clear();
  localStorage.setItem("language", "English");
  window.location.href = "/";
};

const NavbarAcholder = ({
  language,
  setLanguage,
  isAdmin: propIsAdmin,
  userType: propUserType,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [profilePicUrl, setProfilePicUrl] = useState(null);
  const [name, setName] = useState("");
  const [translatedLabels, setTranslatedLabels] = useState({});
  const [searchFilter, setSearchFilter] = useState("all");
  const [isAdmin, setIsAdmin] = useState(false);
  const [userType, setUserType] = useState("normal");
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const navigate = useNavigate();
  const open = Boolean(anchorEl);

  const labelsToTranslate = [
    "Go to Profile",
    "Logout",
    "Home",
    "About",
    "FAQ",
    "Search for projects, surveys, accounts...",
    "All",
    "Project",
    "Survey",
    "Account",
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await apiClient.get("/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 200) {
          const user = res.data.user;
          setName(user.name);
          setProfilePicUrl(user.image);
          setUserType(user.user_type);
          setIsAdmin(user.user_type === "admin");
        }
      } catch (error) {
        console.error("Failed to fetch profile info:", error);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    if (propIsAdmin !== undefined) setIsAdmin(propIsAdmin);
    if (propUserType !== undefined) setUserType(propUserType);
  }, [propIsAdmin, propUserType]);

  useEffect(() => {
    if (language === "English") {
      setTranslatedLabels({});
      return;
    }

    const loadTranslations = async () => {
      const translated = await translateText(labelsToTranslate, "bn");
      const map = {};
      labelsToTranslate.forEach((label, i) => (map[label] = translated[i]));
      setTranslatedLabels(map);
    };

    loadTranslations();
  }, [language]);

  const getLabel = (text) =>
    language === "English" ? text : translatedLabels[text] || text;

  const toggleLanguage = () => {
    const newLang = language === "English" ? "বাংলা" : "English";
    localStorage.setItem("language", newLang);
    setLanguage(newLang);
  };

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      try {
        const response = await apiClient.get("/api/search", {
          params: {
            query: searchQuery,
            filter: searchFilter === "all" ? "" : searchFilter,
          },
        });

      navigate("/search-results", {
        state: {
          results: res.data.results,
          query: searchQuery,
        },
      });
    } catch (err) {
      console.error("Search failed:", err);
    }
    }
  };

return (
  <motion.nav className="NavbarAcholderContainer">
    <div className="NavbarAcholderTopSection">
      
        <div className="NavbarAcholderLogoSection">
          <div className="NavbarAcholderLogoItem">
            <img src={logo_dataghurhi} alt="DataGhurhi logo" />
            <span>DataGhurhi</span>
          </div>
        </div>
      


      {/* Search + Language inline */}

      
        {/* Language Switch now inline with search */}
        <div className="NavbarAcholderLangSwitchInline">
          <label className="NavbarAcholderSwitch">
            <input
              type="checkbox"
              onChange={toggleLanguage}
              checked={language === "বাংলা"}
            />
            <span className="NavbarAcholderSlider"></span>
          </label>
          <div className="NavbarAcholderLangLabels">
            <span className={language === "English" ? "LangActive" : ""}>
              English
            </span>
            <span className={language === "বাংলা" ? "LangActive" : ""}>
              বাংলা
            </span>
          </div>
      </div>


      <div className="NavbarAcholderSearchSection">
        <select
          className="NavbarAcholderSearchFilter"
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
        >
          <option value="all">{getLabel("All")}</option>
          <option value="project">{getLabel("Project")}</option>
          <option value="survey">{getLabel("Survey")}</option>
          <option value="account">{getLabel("Account")}</option>
        </select>

        <div className="NavbarAcholderSearchBox">
          <input
            type="text"
            placeholder={getLabel(
              "Search for projects, surveys, accounts..."
            )}
            className="NavbarAcholderSearchInput"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <FaSearch
            className="NavbarAcholderSearchIcon"
            onClick={handleSearch}
          />
        </div>
     


    {/* NAVIGATION MENU */}
    <ul
      className={`NavbarAcholderNavList ${
        isMobile && menuOpen ? "NavbarAcholderPopupOpen" : ""
      }`}
    >
      <li onClick={() => isMobile && setMenuOpen(false)}>
        <a href="/dashboard">
          <FaHome className="NavbarAcholderIcon" />
          <span>{getLabel("Home")}</span>
        </a>
      </li>

      <li onClick={() => isMobile && setMenuOpen(false)}>
        <a href="/about">
          <FaInfoCircle className="NavbarAcholderIcon" />
          <span>{getLabel("About")}</span>
        </a>
      </li>

      <li onClick={() => isMobile && setMenuOpen(false)}>
        <a href="/faq">
          <FaQuestionCircle className="NavbarAcholderIcon" />
          <span>{getLabel("FAQ")}</span>
        </a>
      </li>

      {!isAdmin && userType !== "admin" && (
        <li onClick={() => isMobile && setMenuOpen(false)}>
          <a href="/analysis">
            <FaChartBar className="NavbarAcholderIcon" />
            <span>{language === "English" ? "Analysis" : "বিশ্লেষণ"}</span>
          </a>
        </li>
      )}
</ul>
      {/* Profile dropdown always last */}
     
       <div className="NavbarAcholderProfile">
  <div className="NavbarAcholderAvatarWrap">
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

    <div className="NavbarAcholderUserName">
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

         </div>

     {isMobile && (
      <button className="NavbarAcholderHamburger" onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </button>
    )}   
     </div>
  </motion.nav> 
);

};

export default NavbarAcholder;
