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
  FaCreditCard,
  FaChevronDown,
  FaCheck,
} from "react-icons/fa";
import { FaLock } from "react-icons/fa";

import logo_dataghurhi from "../assets/logos/dataghurhi.png";
import "./navbarAcholder.css";
import apiClient from "../api";

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY;

// Language configurations with flag emojis and codes
const LANGUAGES = [
  { code: "en", name: "ENGLISH", flag: "🇬🇧", googleCode: "en" },
  { code: "bn", name: "বাংলা", flag: "🇧🇩", googleCode: "bn" },
  { code: "es", name: "ESPAÑOL", flag: "🇪🇸", googleCode: "es" },
  { code: "fr", name: "FRANÇAIS", flag: "🇫🇷", googleCode: "fr" },
  { code: "it", name: "ITALIANO", flag: "🇮🇹", googleCode: "it" },
  { code: "de", name: "DEUTSCH", flag: "🇩🇪", googleCode: "de" },
  { code: "pt", name: "PORTUGUÊS", flag: "🇵🇹", googleCode: "pt" },
  { code: "ar", name: "العربية", flag: "🇸🇦", googleCode: "ar" },
  { code: "hi", name: "हिन्दी", flag: "🇮🇳", googleCode: "hi" },
  { code: "zh", name: "中文", flag: "🇨🇳", googleCode: "zh" },
];

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

const logOut = async () => {
  try {
    const formData = new FormData();
    formData.append("user_id", localStorage.getItem("user_id"));
    const url = import.meta.env.VITE_API_URL + "/api/delete-temp-folder/";
    await fetch(url, {
      method: "POST",
      body: formData,
    });
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem("language", "en");
    window.location.href = "/";
  } catch (err) {
    console.error("Error logging out:", err);
  }
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
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1200);
  const [langMenuAnchor, setLangMenuAnchor] = useState(null);
  const [currentLanguage, setCurrentLanguage] = useState("en");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const open = Boolean(anchorEl);
  const langMenuOpen = Boolean(langMenuAnchor);

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
    "Profile",
    "Security",
    "Subscription",
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
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
    // Load saved language from localStorage
    const savedLang = localStorage.getItem("language") || "en";
    setCurrentLanguage(savedLang);
  }, []);

  useEffect(() => {
    if (propIsAdmin !== undefined) setIsAdmin(propIsAdmin);
    if (propUserType !== undefined) setUserType(propUserType);
  }, [propIsAdmin, propUserType]);

  useEffect(() => {
    if (currentLanguage === "en") {
      setTranslatedLabels({});
      return;
    }

    const loadTranslations = async () => {
      const targetLang = LANGUAGES.find(l => l.code === currentLanguage)?.googleCode || "en";
      const translated = await translateText(labelsToTranslate, targetLang);
      const map = {};
      labelsToTranslate.forEach((label, i) => (map[label] = translated[i]));
      setTranslatedLabels(map);
    };

    loadTranslations();
  }, [currentLanguage]);

  const getLabel = (text) =>
    currentLanguage === "en" ? text : translatedLabels[text] || text;

  const handleLanguageChange = (langCode) => {
    setCurrentLanguage(langCode);
    localStorage.setItem("language", langCode);
    setLanguage(langCode);
    setLangMenuAnchor(null);

    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent("languageChanged", { 
      detail: { language: langCode } 
    }));
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

  const currentLangObj = LANGUAGES.find(l => l.code === currentLanguage) || LANGUAGES[0];

  return (
    <motion.nav className="NavbarAcholderContainer">
      <div className="NavbarAcholderTopSection">
        <div className="NavbarAcholderLogoSection">
          <div className="NavbarAcholderLogoItem">
            <div className="LogoWithBeta">
              <img
                src={logo_dataghurhi}
                alt="DataGhurhi logo"
                className="MainLogo"
                onClick={() => navigate("/")}
              />
              <span className="LogoBetaTag">Beta</span>
            </div>
            <span>DataGhurhi</span>
          </div>
        </div>

        <div className="NavbarAcholderSearchWrapper">
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
          </div>
        </div>

        {/* Language Dropdown Button */}
        <div className="NavbarAcholderLangDropdown">
          <button 
            className="NavbarAcholderLangButton"
            onClick={(e) => setLangMenuAnchor(e.currentTarget)}
          >
            <span className="NavbarAcholderLangFlag">{currentLangObj.flag}</span>
            <FaChevronDown className="NavbarAcholderLangChevron" />
          </button>

          <Menu
            anchorEl={langMenuAnchor}
            open={langMenuOpen}
            onClose={() => setLangMenuAnchor(null)}
            PaperProps={{
              elevation: 3,
              sx: {
                mt: 1.5,
                borderRadius: "12px",
                filter: "drop-shadow(0px 4px 10px rgba(0,0,0,0.1))",
                minWidth: 180,
                maxHeight: 400,
              },
            }}
          >
            {LANGUAGES.map((lang) => (
              <MenuItem
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className="NavbarAcholderLangMenuItem"
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 16px',
                  '&:hover': {
                    backgroundColor: '#f0f0f0',
                  },
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '20px' }}>{lang.flag}</span>
                  <span style={{ 
                    fontSize: '14px', 
                    fontWeight: currentLanguage === lang.code ? '600' : '400',
                    color: '#333'
                  }}>
                    {lang.name}
                  </span>
                </div>
                {currentLanguage === lang.code && (
                  <FaCheck style={{ color: '#4caf50', fontSize: '14px' }} />
                )}
              </MenuItem>
            ))}
          </Menu>
        </div>

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
                  minWidth: 180,
                },
              }}
            >
              {token && (
                <>
                  <MenuItem
                    onClick={() => (window.location.href = "/edit-profile")}
                  >
                    <IoPersonCircle style={{ marginRight: "8px" }} />
                    {getLabel("Profile")}
                  </MenuItem>

                  <MenuItem
                    onClick={() =>
                      (window.location.href = "/security-settings")
                    }
                  >
                    <FaLock style={{ marginRight: "8px" }} />
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      {getLabel("Security")}
                    </span>
                  </MenuItem>

                  <MenuItem
                    onClick={() => (window.location.href = "/subscription")}
                  >
                    <FaCreditCard style={{ marginRight: "8px" }} />
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      {getLabel("Subscription")}
                    </span>
                  </MenuItem>

                  <hr style={{ margin: "8px 0", borderColor: "#130d0dff" }} />
                </>
              )}

              <MenuItem onClick={() => (window.location.href = "/about")}>
                <FaInfoCircle style={{ marginRight: "8px" }} />
                {getLabel("About")}
              </MenuItem>

              <MenuItem onClick={() => (window.location.href = "/faq")}>
                <FaQuestionCircle style={{ marginRight: "8px" }} />
                {getLabel("FAQ")}
              </MenuItem>

              {token && (
                <>
                  <hr style={{ margin: "8px 0", borderColor: "#130d0dff" }} />

                  <MenuItem onClick={logOut}>
                    <FaSignOutAlt style={{ marginRight: "8px" }} />
                    {getLabel("Logout")}
                  </MenuItem>
                </>
              )}
            </Menu>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default NavbarAcholder;