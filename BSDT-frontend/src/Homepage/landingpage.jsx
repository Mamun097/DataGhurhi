import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import logo_buet from "../assets/logos/cse_buet.png";
import logo_ict from "../assets/logos/ict.png";
import logo_edge from "../assets/logos/edge.png";
import logo_ric from "../assets/logos/ric.png";
import "./landingpage.css";

const slidesEnglish = [
  {
    title: "🚀 Build and Share Surveys",
    description: [
      "Create, design and analyze digital surveys powered by Jorip.AI.",
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
    title: "📊 Visualize Instantly",
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
  const response = await axios.post(
    `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_API_KEY}`,
    {
      q: textArray,
      target: targetLang,
      format: "text",
    }
  );
  return response.data.data.translations.map((t) => t.translatedText);
};

const LandingPage = () => {
  const [language, setLanguage] = useState(localStorage.getItem("language") || "English");
  const [translatedSlides, setTranslatedSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loadingTranslation, setLoadingTranslation] = useState(false);
  const token = localStorage.getItem("token");

  const slidesToUse =
    language === "English" || loadingTranslation ? slidesEnglish : translatedSlides;

  useEffect(() => {
    const fetchTranslations = async () => {
      if (language === "English") {
        setTranslatedSlides([]);
        return;
      }

      const cached = localStorage.getItem("translatedSlides");
      if (cached) {
        setTranslatedSlides(JSON.parse(cached));
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
        setTranslatedSlides(translated);
        localStorage.setItem("translatedSlides", JSON.stringify(translated));
      } catch (error) {
        console.error("Translation failed:", error);
      }
      setLoadingTranslation(false);
    };

    fetchTranslations();
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

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slidesToUse.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slidesToUse.length) % slidesToUse.length);

  return (
    <div className="landing-container">
      <div className="hero-section">
        <motion.h1 className="title" initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
          {language === "English" ? (
            <>Welcome to <span className="highlight">Jorip.AI</span></>
          ) : (
            <><span className="highlight">জরিপ.এআই</span> এ স্বাগতম</>
          )}
        </motion.h1>

        <motion.div className="animated-circle" animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 2 }} />

        <div className="language-toggle-landing">
          <label className="switch">
            <input type="checkbox" onChange={toggleLanguage} checked={language === "বাংলা"} />
            <span className="slider"></span>
          </label>
          <div className="language-labels">
            <span className={language === "English" ? "active" : ""}>English</span>
            <span className={language === "বাংলা" ? "active" : ""}>বাংলা</span>
          </div>
        </div>
      </div>

      <div className="slider-container">
        <button className="nav-btn left" onClick={prevSlide}>‹</button>
        <AnimatePresence mode="wait">
          {loadingTranslation ? (
            <div className="loading-message">Translating content...</div>
          ) : (
            <motion.div key={currentSlide} className="slide" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} transition={{ duration: 0.5 }}>
              <div className="slide-wrapper">
                <img src={slidesToUse[currentSlide]?.image} alt="Slide visual" className="slide-image" />
                <div className="slide-content">
                  <h2>{slidesToUse[currentSlide]?.title}</h2>
                  <ul className="slide-list">
                    {slidesToUse[currentSlide]?.description.map((point, idx) => (
                      <li key={idx}>{point}</li>
                    ))}
                  </ul>
                  <div className="cta-buttons">
                    <button className="primary-btn" onClick={() => (window.location.href = "/signup")}>
                      {language === "English" ? "Join Today" : "আজই জয়েন করুন"}
                    </button>
                    <button className="secondary-btn" onClick={() => token ? (window.location.href = "/dashboard") : (window.location.href = "/login")}>
                      {language === "English" ? "Log In" : "লগ ইন"}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <button className="nav-btn right" onClick={nextSlide}>›</button>
      </div>

      <footer className="footer">
        <div className="footer-logo-container">
          <img src={logo_buet} alt="BUET Logo" className="footer-logo1" />
          <img src={logo_ric} alt="RIC Logo" className="footer-logo2" />
          <img src={logo_ict} alt="ICT Logo" className="footer-logo3" />
          <img src={logo_edge} alt="EDGE Logo" className="footer-logo4" />
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
