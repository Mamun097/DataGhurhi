import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import logo_buet from "../assets/logos/cse_buet.png";
import logo_ict from "../assets/logos/ict.png";
import logo_edge from "../assets/logos/edge.png";
import logo_ric from "../assets/logos/ric.png";
import "./landingpage.css";
import logo_dataghurhi from "../assets/logos/dataghurhi.png";

const slidesEnglish = [
  {
    title: "🚀 Build and Spread Surveys",
    description: [
      "Create, design and analyze digital surveys powered by our tool.",
      "Supports question types: multiple-choice, checkboxes, Likert scale, ranking, matrix grids, and open-ended.",
      "Choose from ready-made templates or create custom ones.",
      "Craft questionnaires in both English and Bangla.",
    ],
    image: "/assets/images/survey_slide.png",
  },
  {
    title: "🤝 Collaborate with Teams",
    description: [
      "Invite collaborators to work on survey forms and datasets in real-time.",
      "Role-based access to ensure security and control.",
      "Offline support with sync capability when internet resumes.",
      "Supports shared templates and collaborative editing features.",
    ],
    image: "/assets/images/collaborate_slide.png",
  },
  {
    title: "📊 Quick Overview",
    description: [
      "Visualize dataset with beautiful charts and graphs.",
      "Generate demographic and statistical analysis by selecting attributes.",
      "Export charts and reports in Word or PDF formats.",
      "Supports pie charts, bar graphs, scatter plots, histograms, box plots, and more.",
      "Generate bilingual reports (Bangla & English) directly.",
    ],
    image: "/assets/images/visualize_slide.png",
  },
];

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY;

const translateText = async (textArray, targetLang) => {
  if (!Array.isArray(textArray) || textArray.length === 0) return textArray;

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
    console.error(
      "Translation API error:",
      error.response?.data || error.message
    );
    return textArray; // fallback to original text if API fails
  }
};

const LandingPage = () => {
  const [language, setLanguage] = useState(
    localStorage.getItem("language") || "English"
  );
  const [translatedSlide, settranslatedSlide] = useState([]);
  const [translatedHero, setTranslatedHero] = useState({
    joinText: "",
    loginText: "",
  });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loadingTranslation, setLoadingTranslation] = useState(false);
  const token = localStorage.getItem("token");

  const slidesToUse =
    language === "English" || loadingTranslation
      ? slidesEnglish
      : translatedSlide;

  useEffect(() => {
    const fetchTranslations = async () => {
      if (language === "English") {
        settranslatedSlide([]);
        return;
      }

      const cached = localStorage.getItem("translatedSlide");
      if (cached) {
        settranslatedSlide(JSON.parse(cached));
        return;
      }

      setLoadingTranslation(true);
      try {
        const translated = await Promise.all(
          slidesEnglish.map(async (slide) => {
            const titleTranslated = await translateText([slide.title], "bn");
            const descTranslated = await translateText(slide.description, "bn");
            return {
              title: titleTranslated[0],
              description: descTranslated,
              image: slide.image,
            };
          })
        );
        settranslatedSlide(translated);
        localStorage.setItem("translatedSlide", JSON.stringify(translated));
      } catch (error) {
        console.error("Translation failed:", error);
      }
      setLoadingTranslation(false);
    };

    fetchTranslations();
  }, [language]);

  useEffect(() => {
    const translateHeroTexts = async () => {
      if (language === "English") {
        setTranslatedHero({
          joinText: "",
          loginText: "",
        });
        return;
      }

      try {
        const result = await translateText(["Join Today", "Log In"], "bn");
        setTranslatedHero({
          joinText: result[0],
          loginText: result[1],
        });
      } catch (e) {
        console.error("Hero translation failed", e);
      }
    };

    translateHeroTexts();
  }, [language]);

  const toggleLanguage = () => {
    const newLang = language === "English" ? "বাংলা" : "English";
    setLanguage(newLang);
    localStorage.setItem("language", newLang);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slidesToUse.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [slidesToUse]);

  const nextSlide = () =>
    setCurrentSlide((prev) => (prev + 1) % slidesToUse.length);
  const prevSlide = () =>
    setCurrentSlide(
      (prev) => (prev - 1 + slidesToUse.length) % slidesToUse.length
    );

  return (
    <div className="landing-container">
      <div className="hero-section">
        <motion.div
          className="hero-title-row"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          {" "}
          <motion.img
            src={logo_dataghurhi}
            alt="DataGhurhi Logo"
            className="inline-logo"
            animate={{ x: [-8, 8, -8] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          />
          <h1 className="title">
            {language === "English" ? (
              <>
                Welcome to <span className="highlight">DataGhurhi</span>
              </>
            ) : (
              <>
                <span className="highlight">ডাটাঘুড়ি</span>তে স্বাগতম
              </>
            )}
          </h1>
        </motion.div>

        <div className="language-toggle-landing">
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
      </div>

      <div className="slider-container">
        <button className="nav-btn left" onClick={prevSlide}>
          ‹
        </button>
        <AnimatePresence mode="wait">
          {loadingTranslation ? (
            <div className="loading-message">Translating content...</div>
          ) : (
            <motion.div
              key={currentSlide}
              className="slide"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
            >
              <div className="slide-wrapper">
                <img
                  src={slidesToUse[currentSlide]?.image}
                  alt="Slide visual"
                  className="slide-image"
                />
                <div className="slide-content">
                  <h2>{slidesToUse[currentSlide]?.title}</h2>
                  <ul className="slide-list">
                    {slidesToUse[currentSlide]?.description.map(
                      (point, idx) => (
                        <li key={idx}>{point}</li>
                      )
                    )}
                  </ul>
                  <div className="cta-buttons">
                    <button
                      className="primary-btn"
                      onClick={() => (window.location.href = "/signup")}
                    >
                      {language === "English"
                        ? "Join Today"
                        : translatedHero.joinText}
                    </button>
                    <button
                      className="secondary-btn"
                      onClick={() =>
                        token
                          ? (window.location.href = "/dashboard")
                          : (window.location.href = "/login")
                      }
                    >
                      {language === "English"
                        ? "Log In"
                        : translatedHero.loginText}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <button className="nav-btn right" onClick={nextSlide}>
          ›
        </button>
      </div>
{/* 
      <footer className="footer">
        <div className="footer-logo-container">
          <img src={logo_buet} alt="BUET Logo" className="footer-logo1" />
          <img src={logo_ric} alt="RIC Logo" className="footer-logo2" />
          <img src={logo_ict} alt="ICT Logo" className="footer-logo3" />
          <img src={logo_edge} alt="EDGE Logo" className="footer-logo4" />
        </div>
      </footer> */}
    </div>
  );
};

export default LandingPage;
