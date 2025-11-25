// src/Pages/Index.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "../CSS/SurveyForm.css";
import SurveyForm from "../Components/SurveyForm";
import { useLocation, useParams } from "react-router-dom";
import NavbarAcholder from "../../ProfileManagement/navbarAccountholder";
import apiClient from "../../api";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY;

// Translation helper function
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
    return textArray; // Fallback to original
  }
};

const Index = () => {
  const location = useLocation();

  const { survey_id } = useParams();
  const { project_id, input_title, survey_status } = location.state || {};

  const [language, setLanguage] = useState(
    localStorage.getItem("language") || "en"
  );
  const [translatedLabels, setTranslatedLabels] = useState({});

  const [savedTemplates, setSavedTemplates] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Props for SurveyForm
  const [survey, setSurvey] = useState(null);
  const [title, setTitle] = useState(input_title);
  const [template, setTemplate] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [surveyStatus, setSurveyStatus] = useState(survey_status);

  const useCustom = surveyStatus === "saved" || surveyStatus === "published";
  console.log("useCustom: ", useCustom);

  const labelsToTranslate = [
    "Survey Templates",
    "This survey has already been published.",
    "Loading templates…",
    "Untitled Survey",
    "Save",
    "Publish",
    "Update",
    "View Survey Link",
    "Upload Banner Image",
    "Enter Survey Title",
    "Add Section",
    "Survey updated successfully!",
    "Survey Saved successfully!",
    "Section",
    "Enter Section Title",
    "Delete Section",
    "Merge with above",
  ];

  // Translate UI labels based on language
  useEffect(() => {
    const loadTranslations = async () => {
      if (language === "en") {
        const englishMap = {};
        labelsToTranslate.forEach((label) => (englishMap[label] = label));
        setTranslatedLabels(englishMap);
        return;
      }

      const translated = await translateText(labelsToTranslate, language);
      const translatedMap = {};
      labelsToTranslate.forEach((label, idx) => {
        translatedMap[label] = translated[idx];
      });

      setTranslatedLabels(translatedMap);
    };

    loadTranslations();
  }, [language]);

  const getLabel = (text) => translatedLabels[text] || text;

  // Load saved/published survey details or saved templates
  useEffect(() => {
    const load = async () => {
      if (useCustom) {
        try {
          const bearerTokenString = localStorage.getItem("token");

          if (!bearerTokenString) {
            toast.error("Authentication token not found. Please log in.");
            console.error("No bearer token in localStorage");
            return;
          }

          const token = bearerTokenString.startsWith("{")
            ? JSON.parse(bearerTokenString).token
            : bearerTokenString;

          const resp = await apiClient.get(`/api/surveytemplate/${survey_id}`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          const data = resp?.data?.data || resp?.data;
          console.log("Survey data loaded successfully:", data);

          if (!data) {
            console.warn("Survey data is empty or undefined");
            toast.warn("Survey data is empty.");
            return;
          }

          setSurvey(data);
          setTitle(data.title || input_title);
          setTemplate(data.template || null);
          setBackgroundImage(data.template?.backgroundImage || null);
          setSurveyStatus(data.survey_status || surveyStatus);

          // toast.success("Survey loaded successfully!");
        } catch (err) {
          console.error("Error loading survey:", {
            message: err.message,
            status: err.response?.status,
            statusText: err.response?.statusText,
            data: err.response?.data,
            url: err.config?.url,
          });

          if (err.response?.status === 401) {
            toast.error("Unauthorized. Please log in again.");
          } else if (err.response?.status === 404) {
            toast.error("Survey not found.");
          } else if (err.response?.status === 500) {
            toast.error("Server error. Please try again later.");
          } else {
            toast.error("Failed to load survey. Please try again.");
          }
        }
      } else {
        try {
          const resp = await apiClient.get("/api/get-saved-survey");
          const data = resp.data;
          setSavedTemplates(data);

          if (data.length > 0) {
            const first = data[0];

            setTitle(input_title || "Untitled Survey");
            setTemplate(first.template);
          }
        } catch (err) {
          console.error("Failed to load templates:", err);
        }
      }
    };

    load();
  }, [useCustom, survey_id, input_title]);

  const handleSelect = (idx) => {
    setSelectedIndex(idx);
    const tmpl = savedTemplates[idx];
    setTitle(input_title || tmpl.title || "Untitled Survey");
    setTemplate(tmpl.template);
    setBackgroundImage(tmpl.image_url);

    setSurvey(null);
    setTemplate(tmpl.template);
  };

  if (!useCustom && savedTemplates.length === 0) {
    return <p className="text-center mt-5">{getLabel("Loading templates…")}</p>;
  }

  return (
    <>
      <NavbarAcholder language={language} setLanguage={setLanguage} />
      <div
        className="container-fluid bg-green py-5"
        style={{ paddingTop: "80px", minHeight: "100vh" }}
      >
        <div className="row">
          {/* Sidebar */}
          <div className="sidebar-container">
            <div className="sidebar-content">
              {!useCustom && (
                <>
                  <h2 className="sidebar-title">
                    {getLabel("Survey Templates")}
                  </h2>
                  <div className="template-list">
                    {savedTemplates.map((tmpl, idx) => (
                      <div
                        key={tmpl.id}
                        className={`template-card ${
                          idx === selectedIndex ? "selected" : ""
                        }`}
                        onClick={() => handleSelect(idx)}
                      >
                        <div className="template-card-body">
                          <h5 className="template-title">{tmpl.title}</h5>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Main form */}
          <div className="col-12 col-md-8 mt-3 bg-transparent gap-3">
            {template && (
              <SurveyForm
                title={title}
                setTitle={setTitle}
                image={backgroundImage}
                project_id={project_id}
                survey_id={survey_id}
                surveyStatus={surveyStatus}
                language={language}
                setLanguage={setLanguage}
                template={template}
                survey={survey}
              />
            )}
          </div>
          <div className="d-none d-md-block col-md-2" />
        </div>
        {/* <ToastContainer position="top-center" autoClose={4000} /> */}
      </div>
    </>
  );
};

export default Index;
