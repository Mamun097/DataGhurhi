// src/Pages/Index.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "../CSS/SurveyForm.css";
import SurveyForm from "../Components/SurveyForm";
import { useLocation, useParams } from "react-router-dom";
import NavbarAcholder from "../../ProfileManagement/navbarAccountholder";
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
  const { project_id, survey_details, input_title } = location.state || {};

  const [language, setLanguage] = useState(
    localStorage.getItem("language") || "en"
  );
  const [translatedLabels, setTranslatedLabels] = useState({});

  const [templates, setTemplates] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [title, setTitle] = useState(input_title || "Untitled Survey");
  const [sections, setSections] = useState([{ id: 1, title: "Section 1" }]);
  const [questions, setQuestions] = useState([]);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [surveyStatus, setSurveyStatus] = useState(null);
  const [surveyLink, setSurveyLink] = useState(null);

  const useCustom = survey_details?.template != null;

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

  // Load survey details or templates
  useEffect(() => {
    const load = async () => {
      if (useCustom) {
        setTitle(survey_details.title || "Untitled Survey");
        setSections(survey_details.template.sections || []);
        setQuestions(survey_details.template.questions || []);
        setBackgroundImage(survey_details.template.backgroundImage || null);
        setSurveyStatus(survey_details.survey_status || null);
        setSurveyLink(survey_details.survey_link || null);
      } else {
        try {
          const resp = await axios.get(
            "http://localhost:2000/api/get-saved-survey"
          );
          const data = resp.data;
          setTemplates(data);

          if (data.length > 0) {
            const first = data[0];
            setTitle(input_title || "Untitled Survey");
            setQuestions(first.template);
            setBackgroundImage(first.image_url);
          }
        } catch (err) {
          console.error("Failed to load templates:", err);
        }
      }
    };

    load();
  }, [useCustom, survey_details]);

  const handleSelect = (idx) => {
    setSelectedIndex(idx);
    const tmpl = templates[idx];
    setTitle(input_title || "Untitled Survey");
    setQuestions(tmpl.template);
    setBackgroundImage(tmpl.image_url);
  };

  if (!useCustom && templates.length === 0) {
    return <p className="text-center mt-5">{getLabel("Loading templates…")}</p>;
  }

  return (
    <>
      <NavbarAcholder language={language} setLanguage={setLanguage} />
      <div className="container-fluid">
        <div className="row">
          {/* Sidebar */}
          <div className="col-2">
            <div className="mt-5">
              {!useCustom && surveyStatus !== "published" && (
                <>
                  <h2 className="mb-4">{getLabel("Survey Templates")}</h2>
                  <div className="d-flex flex-column gap-3">
                    {templates.map((tmpl, idx) => (
                      <div
                        key={tmpl.id}
                        className={`card text-center shadow-sm ${
                          idx === selectedIndex ? "border-primary" : ""
                        }`}
                        style={{ cursor: "pointer" }}
                        onClick={() => handleSelect(idx)}
                      >
                        <div className="card-body">
                          <h5 className="card-title">{tmpl.title}</h5>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {!useCustom && surveyStatus === "published" && (
                <div className="alert alert-warning text-center">
                 {getLabel("This survey has already been published.")}
                </div>
              )}
            </div>
          </div>

          {/* Main form */}
          <div className="col-8 mt-5">
            <SurveyForm
              title={title}
              setTitle={setTitle}
              sections={sections}
              setSections={setSections}
              questions={questions}
              setQuestions={setQuestions}
              image={backgroundImage}
              setImage={setBackgroundImage}
              project_id={project_id}
              survey_id={survey_id}
              surveyStatus={surveyStatus}
              surveyLink={surveyLink}
              language={language}
              setLanguage={setLanguage}
         
            />
          </div>

          {/* Right gutter */}
          <div className="col-2" />
        </div>
        <ToastContainer position="top-center" autoClose={4000} />
      </div>
    </>
  );
};

export default Index;
