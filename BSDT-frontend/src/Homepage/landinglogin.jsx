import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import "./landinglogin.css";
import { ToastContainer, toast } from "react-toastify";
import { FaEye, FaEyeSlash, FaChevronDown, FaCheck } from "react-icons/fa";
import apiClient from "../api";
import ReCAPTCHA from "react-google-recaptcha";
import { Menu, MenuItem } from "@mui/material";

// LOGOS & SLIDES from Landing Page
import logo_dataghurhi from "../assets/logos/dataghurhi.png";

const slidesEnglish = [
  {
    title: "🚀 Build and Spread Surveys",
    description: [  
      "Create, design, and analyze digital surveys easily",
      "Generate shareable links and QR codes",
      "Supports multiple question types",
      "Use ready-made or custom templates",
      "Build surveys in English & Bangla",
    ],
    image: "/assets/images/survey_slide.png",
  },
  {
    title: "🤝 Collaborate with Teams",
    description: [
      "Real-time collaboration on surveys and datasets",
      "Role-based access control",
      "Offline work with auto-sync",
      "Shared templates and collaborative editing"
    ],
    image: "/assets/images/collaborate_slide.png",
  },
  {
    title: "📊 Quick Overview",
    description: [
      "Visualize datasets with clear, attractive charts",
      "Generate demographic and statistical analyses",
      "Export charts and reports to Word or PDF",  
      "Supports multiple chart types",
      "Create bilingual reports (Bangla & English)",
    ],
    image: "/assets/images/visualize_slide.png",
  },
];

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY;
const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

// Language configurations matching navbar and dashboard
const LANGUAGES = [
  { code: "en", name: "ENGLISH", flag: "🇬🇧", googleCode: "en" },
  { code: "bn", name: "বাংলা", flag: "🇧🇩", googleCode: "bn" },
  { code: "zh", name: "中文", flag: "🇨🇳", googleCode: "zh-CN" },
  { code: "hi", name: "हिन्दी", flag: "🇮🇳", googleCode: "hi" },
  { code: "es", name: "ESPAÑOL", flag: "🇪🇸", googleCode: "es" },
  { code: "ar", name: "العربية", flag: "🇸🇦", googleCode: "ar" },
  { code: "fr", name: "FRANÇAIS", flag: "🇫🇷", googleCode: "fr" },
  { code: "pt", name: "PORTUGUÊS", flag: "🇵🇹", googleCode: "pt" },
  { code: "ru", name: "РУССКИЙ", flag: "🇷🇺", googleCode: "ru" },
  { code: "ur", name: "اردو", flag: "🇵🇰", googleCode: "ur" },
  { code: "id", name: "BAHASA INDONESIA", flag: "🇮🇩", googleCode: "id" },
  { code: "de", name: "DEUTSCH", flag: "🇩🇪", googleCode: "de" },
  { code: "ja", name: "日本語", flag: "🇯🇵", googleCode: "ja" },
  { code: "sw", name: "KISWAHILI", flag: "🇰🇪", googleCode: "sw" },
  { code: "mr", name: "मराठी", flag: "🇮🇳", googleCode: "mr" },
  { code: "te", name: "తెలుగు", flag: "🇮🇳", googleCode: "te" },
  { code: "tr", name: "TÜRKÇE", flag: "🇹🇷", googleCode: "tr" },
  { code: "ta", name: "தமிழ்", flag: "🇮🇳", googleCode: "ta" },
  { code: "vi", name: "TIẾNG VIỆT", flag: "🇻🇳", googleCode: "vi" },
  { code: "ko", name: "한국어", flag: "🇰🇷", googleCode: "ko" },
  { code: "it", name: "ITALIANO", flag: "🇮🇹", googleCode: "it" },
  { code: "th", name: "ไทย", flag: "🇹🇭", googleCode: "th" },
  { code: "gu", name: "ગુજરાતી", flag: "🇮🇳", googleCode: "gu" },
  { code: "fa", name: "فارسی", flag: "🇮🇷", googleCode: "fa" },
  { code: "pl", name: "POLSKI", flag: "🇵🇱", googleCode: "pl" },
  { code: "uk", name: "УКРАЇНСЬКА", flag: "🇺🇦", googleCode: "uk" },
  { code: "kn", name: "ಕನ್ನಡ", flag: "🇮🇳", googleCode: "kn" },
  { code: "ml", name: "മലയാളം", flag: "🇮🇳", googleCode: "ml" },
  { code: "or", name: "ଓଡ଼ିଆ", flag: "🇮🇳", googleCode: "or" },
  { code: "my", name: "မြန်မာ", flag: "🇲🇲", googleCode: "my" },
  { code: "ha", name: "HAUSA", flag: "🇳🇬", googleCode: "ha" },
  { code: "yo", name: "YORÙBÁ", flag: "🇳🇬", googleCode: "yo" },
  { code: "am", name: "አማርኛ", flag: "🇪🇹", googleCode: "am" },
];

// Translation Function
const translateText = async (textArray, targetLang) => {
  if (!Array.isArray(textArray) || !textArray.length) return textArray;
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

const LandingLogin = () => {
  // Language state - use code instead of full name
  const [language, setLanguage] = useState(
    localStorage.getItem("language") || "en"
  );
  const [translatedSlides, setTranslatedSlides] = useState([]);
  const [translatedLabels, setTranslatedLabels] = useState({});
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loadingTranslation, setLoadingTranslation] = useState(false);

  // Login states
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [emailError, setEmailError] = useState("");
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  
  // reCAPTCHA availability state
  const [isRecaptchaAvailable, setIsRecaptchaAvailable] = useState(true);
  const [recaptchaError, setRecaptchaError] = useState(false);
  const [langMenuAnchor, setLangMenuAnchor] = useState(null);

  const togglePasswordVisibility = () => setShowPassword((p) => !p);
  
  const langMenuOpen = Boolean(langMenuAnchor);

  // Labels to translate
  const labelsToTranslate = React.useMemo(
    () => [
      "Welcome to",
      "Join Today",
      "Log In",
      "Login to Your Account",
      "Email",
      "Password",
      "Invalid Email",
      "Enter valid email",
      "Please complete the reCAPTCHA verification",
      "Login Success",
      "Wrong email or password",
      "Don't have an account?",
      "Sign Up",
      "Forgot Password?",
      "Security verification temporarily unavailable. You can proceed with login.",
      "Beta",
    ],
    []
  );

  const getLabel = (text) =>
    language === "en" ? text : translatedLabels[text] || text;

  // Load translations for labels
  const loadTranslations = useCallback(async () => {
    if (language === "en") {
      setTranslatedLabels({});
      return;
    }

    const currentLangObj = LANGUAGES.find(l => l.code === language);
    const targetLang = currentLangObj ? currentLangObj.googleCode : "en";

    const translations = await translateText(labelsToTranslate, targetLang);
    const mapped = {};
    labelsToTranslate.forEach((label, idx) => {
      mapped[label] = translations[idx];
    });
    setTranslatedLabels(mapped);
  }, [language, labelsToTranslate]);

  // Load translations for slides
  const loadSlideTranslations = useCallback(async () => {
    if (language === "en") {
      setTranslatedSlides([]);
      setLoadingTranslation(false);
      return;
    }

    setLoadingTranslation(true);

    const currentLangObj = LANGUAGES.find(l => l.code === language);
    const targetLang = currentLangObj ? currentLangObj.googleCode : "en";

    const translated = await Promise.all(
      slidesEnglish.map(async (slide) => ({
        title: (await translateText([slide.title], targetLang))[0],
        description: await translateText(slide.description, targetLang),
        image: slide.image,
      }))
    );

    setTranslatedSlides(translated);
    setLoadingTranslation(false);
  }, [language]);

  // Listen for language changes from navbar or other components
  useEffect(() => {
    const handleLanguageChange = (event) => {
      const newLanguage = event.detail.language;
      setLanguage(newLanguage);
      localStorage.setItem("language", newLanguage);
    };

    window.addEventListener("languageChanged", handleLanguageChange);
    
    return () => {
      window.removeEventListener("languageChanged", handleLanguageChange);
    };
  }, []);

  useEffect(() => {
    loadTranslations();
  }, [language, loadTranslations]);

  useEffect(() => {
    loadSlideTranslations();
  }, [language, loadSlideTranslations]);

  // Determine which slides to show
  const slides = language === "en" || loadingTranslation ? slidesEnglish : translatedSlides;

  // Check if reCAPTCHA is available
  useEffect(() => {
    if (!RECAPTCHA_SITE_KEY || RECAPTCHA_SITE_KEY === 'undefined' || RECAPTCHA_SITE_KEY.trim() === '') {
      setIsRecaptchaAvailable(false);
      console.warn("reCAPTCHA site key not configured. Login will proceed without verification.");
    }
  }, []);

  // Get current language object
  const currentLangObj = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  // Handle language change from dropdown
  const handleLanguageChange = (langCode) => {
    setLanguage(langCode);
    localStorage.setItem("language", langCode);
    setLangMenuAnchor(null);

    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent("languageChanged", { 
      detail: { language: langCode } 
    }));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [slides]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    if (e.target.name === "email") {
      const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setEmailError(pattern.test(e.target.value) ? "" : getLabel("Invalid Email"));
    }
  };

  const handleRecaptchaChange = (token) => {
    setRecaptchaToken(token);
    setRecaptchaError(false);
  };

  const handleRecaptchaError = () => {
    setRecaptchaError(true);
    setIsRecaptchaAvailable(false);
    console.error("reCAPTCHA failed to load. Proceeding without verification.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (emailError) return toast.error(getLabel("Enter valid email"));
    
    // Only require reCAPTCHA if it's available and working
    if (isRecaptchaAvailable && !recaptchaToken && !recaptchaError) {
      return toast.error(getLabel("Please complete the reCAPTCHA verification"));
    }

    try {
      const loginData = { ...formData };
      
      // Only include recaptchaToken if reCAPTCHA is available
      if (isRecaptchaAvailable && recaptchaToken) {
        loginData.recaptchaToken = recaptchaToken;
      }
      
      const res = await apiClient.post("/api/login", loginData, { withCredentials: true });
      
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", "user");
      localStorage.setItem("user_type", res.data.user_type || "normal");
      localStorage.setItem("user_id", res.data.user_id);
      toast.success(getLabel("Login Success"));
      setTimeout(() => (window.location.href = "/dashboard"), 1500);
    } catch (error) {
      toast.error(getLabel("Wrong email or password"));
      if (isRecaptchaAvailable) {
        setRecaptchaToken(null);
      }
    }
  };

  return (
    <div className="dg-container">

      {/* LEFT SIDE LANDING */}
      <div className="dg-left">

        {/* Header Row */}
        <div className="dg-hero-row">

          {/* LOGO + BETA VERSION BELOW */}
          <div className="dg-logo-wrap">
            <div className="dg-logo-container">
              <img src={logo_dataghurhi} className="dg-logo" alt="DataGhurhi Logo" />
              <span className="dg-beta-version">
                {getLabel("Beta")}
              </span>
            </div>
          </div>

          {/* TITLE */}
          <h1 className="dg-title">
            {language === "en" ? (
              <>
                {getLabel("Welcome to")}{"\u00A0"}
                <span className="dg-brand">DataGhurhi</span>
              </>
            ) : language === "bn" ? (
              <>
                <span className="dg-brand">ডাটাঘুড়ি</span>তে স্বাগতম
              </>
            ) : (
              <>
                {getLabel("Welcome to")}{"\u00A0"}
                <span className="dg-brand">DataGhurhi</span>
              </>
            )}
          </h1>

          {/* LANGUAGE DROPDOWN */}
          <div className="dg-lang">
            <button 
              className="dg-lang-button"
              onClick={(e) => setLangMenuAnchor(e.currentTarget)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                background: 'white',
                cursor: 'pointer',
                fontSize: '20px',
                transition: 'all 0.3s ease',
              }}
            >
              <span>{currentLangObj.flag}</span>
              <FaChevronDown style={{ fontSize: '12px', color: '#666' }} />
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
                      fontWeight: language === lang.code ? '600' : '400',
                      color: '#333'
                    }}>
                      {lang.name}
                    </span>
                  </div>
                  {language === lang.code && (
                    <FaCheck style={{ color: '#4caf50', fontSize: '14px' }} />
                  )}
                </MenuItem>
              ))}
            </Menu>
          </div>

        </div>

        {/* Slider Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            className="dg-slide-card"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.4 }}
          >
            <img
              src={slides[currentSlide]?.image}
              className="dg-slide-img"
              alt="Slide"
            />

            <div className="dg-slide-text">
              <h2>{slides[currentSlide]?.title}</h2>
              <ul>
                {slides[currentSlide]?.description.map((pt, i) => (
                  <li key={i}>{pt}</li>
                ))}
              </ul>

              <div className="dg-cta">
                <button
                  className="dg-btn dg-btn-primary"
                  onClick={() => (window.location.href = "/signup")}
                >
                  {getLabel("Join Today")}
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

      </div>

      {/* RIGHT SIDE LOGIN */}
      <motion.div
        className="dg-right"
        initial={{ x: 60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7 }}
      >
        <div className="dg-login-box">

          <h2 className="dg-login-title">
            {getLabel("Login to Your Account")}
          </h2>

          <form onSubmit={handleSubmit} className="dg-form">

            <input
              type="email"
              name="email"
              placeholder={getLabel("Email")}
              value={formData.email}
              onChange={handleChange}
              required
            />
            {emailError && <p className="dg-error">{emailError}</p>}

            <div className="dg-pass-box">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder={getLabel("Password")}
                value={formData.password}
                onChange={handleChange}
                required
              />
              <span className="dg-eye" onClick={togglePasswordVisibility}>
                {showPassword ? <FaEye /> : <FaEyeSlash />}
              </span>
            </div>

            {/* Conditional reCAPTCHA or Warning Message */}
            <div className="dg-recaptcha">
              {isRecaptchaAvailable && !recaptchaError ? (
                <ReCAPTCHA
                  sitekey={RECAPTCHA_SITE_KEY}
                  onChange={handleRecaptchaChange}
                  onErrored={handleRecaptchaError}
                  onExpired={() => setRecaptchaToken(null)}
                  hl={currentLangObj.googleCode}
                />
              ) : (
                <div style={{
                  padding: '10px',
                  backgroundColor: '#fff3cd',
                  border: '1px solid #ffc107',
                  borderRadius: '4px',
                  color: '#856404',
                  fontSize: '14px',
                  marginBottom: '10px'
                }}>
                  ⚠️ {getLabel("Security verification temporarily unavailable. You can proceed with login.")}
                </div>
              )}
            </div>

            <button className="dg-btn dg-btn-primary" type="submit">
              {getLabel("Log In")}
            </button>

          </form>

          <p className="dg-link">
            {getLabel("Don't have an account?")} <a href="/signup">{getLabel("Sign Up")}</a>
          </p>
          <a href="/forgot-password" className="dg-forgot">
            {getLabel("Forgot Password?")}
          </a>
        </div>
      </motion.div>

      <ToastContainer />
    </div>
  );
};

export default LandingLogin;