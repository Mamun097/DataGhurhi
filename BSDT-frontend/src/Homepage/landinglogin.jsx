import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import "./landinglogin.css"; // NEW CSS file (I'll provide if needed)
import { ToastContainer, toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import apiClient from "../api";

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
" Visualize datasets with clear, attractive charts",
"Generate demographic and statistical analyses",
"Export charts and reports to Word or PDF",  
"Supports multiple chart types",
"Create bilingual reports (Bangla & English)",
    ],
    image: "/assets/images/visualize_slide.png",
  },
];

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY;

// Translation Fn
const translateText = async (textArr, lang) => {
  if (!Array.isArray(textArr) || !textArr.length) return textArr;
  try {
    const res = await axios.post(
      `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_API_KEY}`,
      { q: textArr, target: lang, format: "text" }
    );
    return res.data.data.translations.map((t) => t.translatedText);
  } catch {
    return textArr;
  }
};

const LandingLogin = () => {
  const [language, setLanguage] = useState(localStorage.getItem("language") || "English");
  const [translatedSlide, setTranslatedSlide] = useState([]);
  const [translatedButton, setTranslatedButton] = useState({ join: "", login: "" });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loadingTranslation, setLoadingTranslation] = useState(false);
  const token = localStorage.getItem("token");

  // Login states
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [emailError, setEmailError] = useState("");

  const togglePasswordVisibility = () => setShowPassword((p) => !p);

  const slides = language === "English" || loadingTranslation ? slidesEnglish : translatedSlide;

  useEffect(() => {
    const fetchSlides = async () => {
      if (language === "English") return setTranslatedSlide([]);
      setLoadingTranslation(true);

      const translated = await Promise.all(
        slidesEnglish.map(async (s) => ({
          title: (await translateText([s.title], "bn"))[0],
          description: await translateText(s.description, "bn"),
          image: s.image,
        }))
      );

      setTranslatedSlide(translated);
      setLoadingTranslation(false);
    };
    fetchSlides();
  }, [language]);

  useEffect(() => {
    const translateCTA = async () => {
      if (language === "English") return setTranslatedButton({ join: "", login: "" });
      const [j, l] = await translateText(["Join Today", "Log In"], "bn");
      setTranslatedButton({ join: j, login: l });
    };
    translateCTA();
  }, [language]);

  const toggleLanguage = () => {
    const newLang = language === "English" ? "বাংলা" : "English";
    setLanguage(newLang);
    localStorage.setItem("language", newLang);
  };

  useEffect(() => {
    const i = setInterval(() => setCurrentSlide((p) => (p + 1) % slides.length), 8000);
    return () => clearInterval(i);
  }, [slides]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    if (e.target.name === "email") {
      const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setEmailError(pattern.test(e.target.value) ? "" : "Invalid Email");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (emailError) return toast.error("Enter valid email");

    try {
      const res = await apiClient.post("/api/login", formData, { withCredentials: true });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", "user");
      localStorage.setItem("user_id", res.data.user_id);
      toast.success("Login Success");
      setTimeout(() => (window.location.href = "/dashboard"), 1500);
    } catch {
      toast.error("Wrong email or password");
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
      <img src={logo_dataghurhi} className="dg-logo" />

      <span className="dg-beta-version">
        Beta
      </span>
    </div>
  </div>

  {/* TITLE */}
  <h1 className="dg-title">
    {language === "English" ? (
      <>
        Welcome to{"\u00A0"}
        <span className="dg-brand"> DataGhurhi</span>
      </>
    ) : (
      <>
        <span className="dg-brand">ডাটাঘুড়ি</span>তে স্বাগতম
      </>
    )}
  </h1>

  {/* LANGUAGE TOGGLE */}
  <div className="dg-lang">
    <label className="dg-switch">
      <input
        type="checkbox"
        checked={language === "বাংলা"}
        onChange={toggleLanguage}
      />
      <span className="dg-slider"></span>
    </label>
    <span className="dg-lang-text ">{language}</span>
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
              {language === "English" ? "Join Today" : translatedButton.join}
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
      {language === "English" ? "Login to Your Account" : "লগইন করুন"}
    </h2>

    <form onSubmit={handleSubmit} className="dg-form">

      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        required
      />
      {emailError && <p className="dg-error">{emailError}</p>}

      <div className="dg-pass-box">
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <span className="dg-eye" onClick={togglePasswordVisibility}>
          {showPassword ? <FaEye /> : <FaEyeSlash />}
        </span>
      </div>

      <button className="dg-btn dg-btn-primary">
        {language === "English" ? "Log In" : translatedButton.login}
      </button>

    </form>

    <p className="dg-link">
      {language === "English" ?"Don’t have an account?" : "কোন অ্যাকাউন্ট নেই"} <a href="/signup">Sign Up</a>
    </p>
    <a href="/forgot-password" className="dg-forgot">
      Forgot Password?
    </a>
</div>
  </motion.div>
</div>


  );
};

export default LandingLogin;
