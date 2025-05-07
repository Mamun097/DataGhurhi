import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logo_buet from "../assets/logos/cse_buet.png";
import logo_ict from "../assets/logos/ict.png";
import logo_edge from "../assets/logos/edge.png";
import logo_ric from "../assets/logos/ric.png";
import "./landingpage.css";
import { useEffect } from "react"; // already likely imported

const slideContent = {
  English: [
    {
      title: "🚀 Create and Design Surveys",
      description: [
        "Generate, deploy, and analyze intelligent surveys powered by Jorip.AI.",
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
        "Turn data into insights with beautiful charts and graphs.",
        "Generate demographic and statistical analysis by selecting attributes.",
        "Export charts and reports in Word or PDF formats.",
        "Supports pie charts, bar graphs, scatter plots, histograms, box plots, and more.",
        "Generate bilingual reports (Bangla & English) directly.",
      ],
      image: "/assets/images/visualize_slide.png",
    },
  ],
  বাংলা: [
    {
      title: "🚀 জরিপ তৈরি করুন ও সাজান",
      description: [
        "জরিপ.এআই দিয়ে জরিপ তৈরি, প্রকাশ এবং বিশ্লেষণ করুন।",
        "মাল্টিপল চয়েস, চেকবক্স, লাইকার্ট স্কেল, র‍্যাংকিং, ম্যাট্রিক্স গ্রিড ও ওপেন-এন্ডেড প্রশ্ন সমর্থিত।",
        "প্রস্তুত টেমপ্লেট ব্যবহার করুন বা নিজেই তৈরি করুন।",
        "বাংলা ও ইংরেজি উভয় ভাষায় ফর্ম তৈরি করুন।",
      ], 
      image: "/assets/images/survey_slide.png",
    },
    {
      title: "🤝 টিমের সাথে দ্রুত ও সম্মিলিত সম্পাদনা",
      description: [
        "সহকর্মীদের আমন্ত্রণ জানান এবং রিয়েল-টাইমে একসাথে কাজ করুন।",
        "রোল-ভিত্তিক অ্যাক্সেস নিয়ন্ত্রণের মাধ্যমে নিরাপত্তা নিশ্চিত করুন।",
        "ইন্টারনেট ছাড়াও কাজ করার সুযোগ; সংযোগ ফিরলে স্বয়ংক্রিয়ভাবে সংরক্ষিত হয়।",
        "শেয়ার্ড টেমপ্লেট ও সম্মিলিত সম্পাদনার সুবিধা।",
      ],
      image: "/assets/images/collaborate_slide.png",
    },
    {
      title: "📊 দ্রুত ভিজ্যুয়ালাইজ করুন",
      description: [
        "সহজেই তথ্য বিশ্লেষণ করুন এবং দরকারি গ্রাফ তৈরি করুন।",
        "বয়স, লিঙ্গ, অঞ্চল ইত্যাদির উপর ভিত্তি করে ডেমোগ্রাফিক বিশ্লেষণ।",
        "পিডিএফ বা ওয়ার্ড আকারে রিপোর্ট এক্সপোর্ট করুন।",
        "পাই চার্ট, বার গ্রাফ, হিট ম্যাপ, স্ক্যাটার প্লট, বক্স প্লট প্রভৃতি সমর্থিত।",
        "বাংলা ও ইংরেজিতে স্বয়ংক্রিয় রিপোর্ট তৈরি করুন।",
      ],
      image: "/assets/images/visualize_slide.png",
    },
  ],
};

const LandingPage = () => {
  const [language, setLanguage] = useState(localStorage.getItem("language") || "English"); // Default to English if not set
 
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = slideContent[language];
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () =>
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "English" ? "বাংলা" : "English"));
    localStorage.setItem("language", language); // Store the selected language in local storage
  };
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // 5 seconds

    return () => clearInterval(interval); // cleanup on unmount
  }, [slides.length]);

  return (
    <div className="landing-container">
      <div className="hero-section">
        <motion.h1
          className="title"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          {language === "English" ? (
            <>
              Welcome to <span className="highlight">Jorip.AI</span>
            </>
          ) : (
            <>
              <span className="highlight">জরিপ.এআই</span> এ স্বাগতম
            </>
          )}
        </motion.h1>

        <motion.div
          className="animated-circle"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        />

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
                src={slides[currentSlide].image}
                alt="Slide visual"
                className="slide-image"
              />
              <div className="slide-content">
                <h2>{slides[currentSlide].title}</h2>
                <ul className="slide-list">
                  {slides[currentSlide].description.map((point, idx) => (
                    <li key={idx}>{point}</li>
                  ))}
                </ul>
                 <div className="cta-buttons">
                <button
                  className="primary-btn"
                  onClick={() => (window.location.href = "/signup")}
                >
                  {language === "English" ? "Join Today" : "আজই জয়েন করুন"}
                </button>
                <button
                  className="secondary-btn"
                  onClick={() => (window.location.href = "/login")}
                >
                  {language === "English" ? "Log In" : "লগ ইন"}
                </button>
              </div>
              </div>
             
            </div>
          </motion.div>
        </AnimatePresence>

        <button className="nav-btn right" onClick={nextSlide}>
          ›
        </button>
      </div>

      <footer className="footer">
        {/* <p>
          {language === "English"
            ? "© 2025 Jorip.AI. All rights reserved."
            : "© ২০২৫ জরিপ.এআই। সকল অধিকার সংরক্ষিত।"}
        </p> */}
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
