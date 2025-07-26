import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./CSS/SurveyForm.css";
import SurveyForm from "./Components/SurveyForm";
import { useLocation } from "react-router-dom";

// Google Translate API Key
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY;

// Function to translate the text using Google Translate API
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
    return textArray; // fallback
  }
};

const QB = ({ language, setLanguage }) => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("mine");
  const [sharedQuestions, setSharedQuestions] = useState([]);
  const [questions, setQuestions] = useState([]); // ✅ FIXED: was `false`

  const [translations, setTranslations] = useState({});

  const labelsToTranslate = [
    "My Questions",
    "Shared with Me",
    "Loading questions…",
    "Question Bank",
  ];

  // Fetch questions
  useEffect(() => {
    const load = async () => {
      try {
        const resp = await axios.get("http://103.94.135.115:2000/api/question-bank", {
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
        const resp = await axios.get("http://103.94.135.115:2000/api/question-bank/shared", {
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

  // Fetch translations
  useEffect(() => {
    const loadTranslations = async () => {
      const translated = await translateText(
        labelsToTranslate,
        language === "English" ? "en" : "bn"
      );

      const translatedMap = {};
      labelsToTranslate.forEach((label, idx) => {
        translatedMap[label] = translated[idx];
      });

      setTranslations(translatedMap);
    };

    loadTranslations();
  }, [language]);

  const getLabel = (text) => translations[text] || text;

  if (questions.length === 0) {
    return <p className="text-center mt-5">{getLabel("Loading questions…")}</p>;
  }

  return (
    <div className="bg-white rounded shadow p-4 mb-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="text-success mb-0 text-center w-100">
          <i className="bi bi-journal-text me-2"></i> {getLabel("Question Bank")}
        </h1>
      </div>

      <div className="d-flex justify-content-end gap-2 mb-3">
        <button
          className={`btn btn-sm ${activeTab === "mine" ? "btn-success" : "btn-outline-success"}`}
          onClick={() => setActiveTab("mine")}
        >
          <i className="bi bi-person me-1"></i> {getLabel("My Questions")}
        </button>
        <button
          className={`btn btn-sm ${activeTab === "shared" ? "btn-success" : "btn-outline-success"}`}
          onClick={() => setActiveTab("shared")}
        >
          <i className="bi bi-people me-1"></i> {getLabel("Shared with Me")}
        </button>
      </div>

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
  );
};

export default QB;
