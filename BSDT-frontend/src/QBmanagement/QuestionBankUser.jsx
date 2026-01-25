import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./CSS/QuestionBank.css";
import SurveyForm from "./Components/SurveyForm";
import { useLocation } from "react-router-dom";
import apiClient from "../api";
import QuizIcon from "@mui/icons-material/Quiz";

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY;

// Language configurations matching Dashboard
const LANGUAGES = [
  { code: "en", name: "ENGLISH", flag: "🇬🇧", googleCode: "en" },
  { code: "bn", name: "বাংলা", flag: "🇧🇩", googleCode: "bn" },
  { code: "zh", name: "中文", flag: "🇨🇳", googleCode: "zh-CN" }, // Mandarin Chinese
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
  // Additional major African languages (if not already included)
  { code: "ha", name: "HAUSA", flag: "🇳🇬", googleCode: "ha" },
  { code: "yo", name: "YORÙBÁ", flag: "🇳🇬", googleCode: "yo" },
  { code: "am", name: "አማርኛ", flag: "🇪🇹", googleCode: "am" },
];

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

const QB = ({ language: propLanguage, setLanguage: propSetLanguage }) => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("mine");
  const [sharedQuestions, setSharedQuestions] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [translatedLabels, setTranslatedLabels] = useState({});
  
  // Use language code from props or localStorage
  const [language, setLanguage] = useState(
    propLanguage || localStorage.getItem("language") || "en"
  );

  const labelsToTranslate = [
    "My Questions",
    "Shared with Me",
    "Loading questions…",
    "Question Bank",
    "Manage and organize your survey questions",
  ];

  // Listen for language changes from navbar (same as Dashboard)
  useEffect(() => {
    const handleLanguageChange = (event) => {
      const newLanguage = event.detail.language;
      setLanguage(newLanguage);
      if (propSetLanguage) {
        propSetLanguage(newLanguage);
      }
    };

    window.addEventListener("languageChanged", handleLanguageChange);
    
    return () => {
      window.removeEventListener("languageChanged", handleLanguageChange);
    };
  }, [propSetLanguage]);

  // Sync with prop language changes
  useEffect(() => {
    if (propLanguage && propLanguage !== language) {
      setLanguage(propLanguage);
    }
  }, [propLanguage]);

  // Fetch questions
  useEffect(() => {
    const load = async () => {
      try {
        const resp = await apiClient.get("/api/question-bank", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = resp.data;
        if (Array.isArray(data)) setQuestions(data);
      } catch (err) {
        console.error("Failed to load questions:", err);
      }
    };
    load();
  }, []);

  // Fetch shared questions
  useEffect(() => {
    if (activeTab !== "shared") return;

    const fetchSharedQuestions = async () => {
      try {
        const resp = await apiClient.get("/api/question-bank/shared", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = resp.data;
        if (Array.isArray(data)) setSharedQuestions(data);
      } catch (err) {
        console.error("Failed to load shared questions:", err);
      }
    };

    fetchSharedQuestions();
  }, [activeTab]);

  // Load translations (same pattern as Dashboard)
  const loadTranslations = async () => {
    if (language === "en") {
      setTranslatedLabels({});
      return;
    }

    // Get the Google Translate language code for the current language
    const currentLangObj = LANGUAGES.find(l => l.code === language);
    const targetLang = currentLangObj ? currentLangObj.googleCode : "en";

    const translations = await translateText(labelsToTranslate, targetLang);
    const translated = {};
    labelsToTranslate.forEach((key, idx) => {
      translated[key] = translations[idx];
    });
    setTranslatedLabels(translated);
  };

  useEffect(() => {
    loadTranslations();
  }, [language]);

  const getLabel = (text) =>
    language === "en" ? text : translatedLabels[text] || text;

  if (questions.length === 0 && activeTab === "mine") {
    return (
      <div className="modern-qb-container">
        <div className="qb-loading-state">
          <QuizIcon className="loading-icon" />
          <p>{getLabel("Loading questions…")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="modern-qb-container">
      {/* Header Section */}
      <div className="qb-header-section">
        <div className="header-title">
          <QuizIcon className="header-icon" />
          <div>
            <h2>{getLabel("Question Bank")}</h2>
            <p className="header-subtitle">
              {getLabel("Manage and organize your survey questions")}
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="qb-tab-navigation">
          <button
            className={`tab-btn ${activeTab === "mine" ? "active" : ""}`}
            onClick={() => setActiveTab("mine")}
          >
            <i className="bi bi-person me-2"></i>
            {getLabel("My Questions")}
          </button>
          <button
            className={`tab-btn ${activeTab === "shared" ? "active" : ""}`}
            onClick={() => setActiveTab("shared")}
          >
            <i className="bi bi-people me-2"></i>
            {getLabel("Shared with Me")}
          </button>
        </div>
      </div>

      {/* Question Content */}
      <div className="qb-content-wrapper">
        {activeTab === "mine" && (
          <SurveyForm
            questions={questions}
            setQuestions={setQuestions}
            activeTab={activeTab}
            language={language}
            setLanguage={setLanguage}
            getLabel={getLabel}
          />
        )}

        {activeTab === "shared" && (
          <SurveyForm
            questions={sharedQuestions}
            setQuestions={() => {}}
            activeTab={activeTab}
            language={language}
            setLanguage={setLanguage}
            getLabel={getLabel}
          />
        )}
      </div>
    </div>
  );
};

export default QB;