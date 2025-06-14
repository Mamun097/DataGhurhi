// src/Components/SurveyResponses.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import NavbarAcholder from "../../ProfileManagement/navbarAccountholder";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY;

const translateText = async (textArray, targetLang) => {
  if (!GOOGLE_API_KEY) {
    console.warn("Google Translate API key is missing. Translations will not be loaded.");
    return textArray;
  }
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

const parseCSV = (csvText) => {
  if (!csvText || typeof csvText !== 'string') return { headers: [], rows: [] };
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length === 0) return { headers: [], rows: [] };
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const rows = lines.slice(1).map(line =>
    line.split(',').map(cell => cell.trim().replace(/"/g, ''))
  );
  return { headers, rows };
};

const SurveyResponses = () => {
  const { survey_id } = useParams();
  const [responses, setResponses] = useState({ headers: [], rows: [] });
  const [rawCsv, setRawCsv] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState(localStorage.getItem("language") || 'en');
  const [translatedLabels, setTranslatedLabels] = useState({});

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const labelsToTranslate = useMemo(() => [
    "Survey Responses",
    "Download CSV",
    "Loading...",
    "Loading Survey Responses...",
    "Failed to load responses",
    "No responses found for this survey.",
    "Survey ID is missing from the URL.",
    "Authentication token not found. Please log in again.",
    "Received empty or invalid data from the server.",
    "An unknown error occurred."
  ], []);

  const getLabel = (text) => translatedLabels[text] || text;

  // Load translations
  useEffect(() => {
    const loadTranslations = async () => {
      const englishMap = {};
      labelsToTranslate.forEach(label => (englishMap[label] = label));

      if (!GOOGLE_API_KEY) {
        console.warn("Google Translate API key is missing. Translations will not be loaded.");
        setTranslatedLabels(englishMap);
        return;
      }

      const langCode = language === "বাংলা" || language === "bn" ? "bn" : "en";
      if (langCode === "en") {
        setTranslatedLabels(englishMap);
      } else {
        try {
          const translated = await translateText(labelsToTranslate, langCode);
          const translatedMap = {};
          labelsToTranslate.forEach((label, idx) => {
            translatedMap[label] = translated[idx];
          });
          setTranslatedLabels(translatedMap);
        } catch (e) {
          console.error("Error during translation effect:", e);
          setTranslatedLabels(englishMap); // Fallback to English
        }
      }
    };
    loadTranslations();
  }, [language, labelsToTranslate]);

  // Fetch survey responses
  useEffect(() => {
    const fetchSurveyResponses = async () => {
      setIsLoading(true);
      setError(null);
      if (!survey_id) {
        setError("Survey ID is missing from the URL.");
        setIsLoading(false);
        return;
      }
      const bearerTokenString = localStorage.getItem("token");
      if (!bearerTokenString) {
        setError("Authentication token not found. Please log in again.");
        setIsLoading(false);
        return;
      }
      const token = bearerTokenString.startsWith("{") ? JSON.parse(bearerTokenString).token : bearerTokenString;
      try {
        const response = await axios.get(
          `http://localhost:2000/api/generatecsv/${survey_id}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        if (typeof response.data === 'string' && response.data.trim()) {
          setRawCsv(response.data);
          setResponses(parseCSV(response.data));
        } else {
          setResponses({ headers: [], rows: [] });
          setError("Received empty or invalid data from the server.");
        }
      } catch (err) {
        console.error("Error fetching survey responses:", err);
        setError(err.response?.data?.message || err.message || "An unknown error occurred.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSurveyResponses();
  }, [survey_id]);

  const handleDownload = () => {
    if (!rawCsv) return;
    const blob = new Blob([rawCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `survey_${survey_id}_responses.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <NavbarAcholder language={language} setLanguage={setLanguage} />
      <div className="container my-4">
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <h2 className="mb-0">{getLabel("Survey Responses")}</h2>
          <button
            className="btn btn-outline-primary"
            onClick={handleDownload}
            disabled={!rawCsv || isLoading}
          >
            <i className="bi bi-download me-2"></i>
            {getLabel("Download CSV")}
          </button>
        </div>

        {isLoading && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">{getLabel("Loading...")}</span>
            </div>
            <p className="mt-2">{getLabel("Loading Survey Responses...")}</p>
          </div>
        )}

        {error && !isLoading && (
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">{getLabel("Failed to load responses")}</h4>
            <p>{getLabel(error)}</p>
          </div>
        )}

        {!isLoading && !error && (
          responses.rows.length > 0 ? (
            <div className="table-responsive shadow-sm bg-white rounded">
              <table className="table table-striped table-hover mb-0">
                <thead className="table-dark" style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                  <tr>
                    {responses.headers.map((header, index) => (
                      <th key={index} scope="col">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {responses.rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="alert alert-info text-center">
              {getLabel("No responses found for this survey.")}
            </div>
          )
        )}
      </div>
      <ToastContainer position="bottom-right" autoClose={3000} newestOnTop />
    </>
  );
};

export default SurveyResponses;