// src/Pages/Index.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  const { survey_id } = useParams();
  const {
    project_id,
    survey_details,
    input_title,
    response_user_logged_in_status,
  } = location.state || {};
  console.log("Survey Details:", survey_details);

  const [language, setLanguage] = useState(
    localStorage.getItem("language") || "en"
  );
  const [translatedLabels, setTranslatedLabels] = useState({});

  const [templates, setTemplates] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Props for SurveyForm
  const [title, setTitle] = useState(input_title);

  const [sections, setSections] = useState([{ id: 1, title: "Section 1" }]);
  const [questions, setQuestions] = useState([]);

  // State for logo
  const [logo, setLogo] = useState(null);
  const [logoAlignment, setLogoAlignment] = useState("left");
  const [logoText, setLogoText] = useState("");

  const [backgroundImage, setBackgroundImage] = useState(null);
  const [surveyStatus, setSurveyStatus] = useState(null);
  const [surveyLink, setSurveyLink] = useState(null);
  const [description, setDescription] = useState(null);
  const [isLoggedInRequired, setIsLoggedInRequired] = useState(
    response_user_logged_in_status || false
  );
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
    //window.scrollTo({ top: 0, behavior: "smooth" });
    const load = async () => {
      if (useCustom) {
        console.log("Loading custom survey details:", survey_details);
        // ==== 1) Load from survey_details ====
        setTitle(input_title || survey_details.title || "Untitled Survey");
        setSections(survey_details.template.sections || []);
        setQuestions(survey_details.template.questions || []);
        setLogo(survey_details.template.logo || null);
        setLogoAlignment(survey_details.template.logoAlignment || "left");
        setLogoText(survey_details.template.logoText || "");
        setBackgroundImage(survey_details.template.backgroundImage || null);
        setSurveyStatus(survey_details.survey_status || null);
        setSurveyLink(survey_details.survey_link || null);
        setDescription(survey_details.template.description || null);
        setIsLoggedInRequired(
          survey_details.response_user_logged_in_status || false
        );
      } else {
        try {
          const resp = await apiClient.get("/api/get-saved-survey");
          const data = resp.data;
          setTemplates(data);

          if (data.length > 0) {
            const first = data[0];
            setTitle(
              input_title ||
                survey_details.title ||
                first.title ||
                "Untitled Survey"
            );
            setQuestions(first.template);
            setLogo(null);
            setLogoAlignment("left");
            setLogoText("");
            setBackgroundImage(first.image_url);
            setIsLoggedInRequired(
              first.response_user_logged_in_status || false
            );
          }
        } catch (err) {
          console.error("Failed to load templates:", err);
        }
      }
    };

    load();
  }, [useCustom, survey_details, input_title]);

  const handleSelect = (idx) => {
    setSelectedIndex(idx);
    const tmpl = templates[idx];
    setTitle(input_title || tmpl.title || "Untitled Survey");
    setQuestions(tmpl.template);
    setLogo(null);
    setLogoAlignment("");
    setLogoText("");
    setBackgroundImage(tmpl.image_url);
  };

  if (!useCustom && templates.length === 0) {
    return <p className="text-center mt-5">{getLabel("Loading templates…")}</p>;
  }

  const handleBackButton = () => {
    navigate(`/view-project/${project_id}`, {
      state: { role: "owner" },
    });
  };

  return (
    <>
      <NavbarAcholder language={language} setLanguage={setLanguage} />
      <div
        className="container-fluid bg-green py-5"
        style={{ paddingTop: "80 px" }}
      >
        <div className="row">
          {/* Sidebar */}
          <div className="sidebar-container">
            <div className="sidebar-content">
              {/* Back button - takes to home */}
              <div className="mt-2 mb-2">
                <button
                  onClick={() => handleBackButton()}
                  style={{
                    padding: "8px 20px",
                    fontSize: "1rem",
                    color: "#000000ff",
                    backgroundColor: "#ffffffff",
                    border: "2px solid #25856fff",
                    borderRadius: "5px",
                    cursor: "pointer",
                    pointerEvents: "auto",
                    marginTop: "10px",
                    fontSize: "1rem",
                  }}
                  title="Go back to Projects}"
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  {getLabel("Back")}
                </button>
              </div>

              {!useCustom && surveyStatus !== "published" && (
                <>
                  <h2 className="sidebar-title">
                    {getLabel("Survey Templates")}
                  </h2>
                  <div className="template-list">
                    {templates.map((tmpl, idx) => (
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

              {!useCustom && surveyStatus === "published" && (
                <div className="alert alert-warning text-center">
                  {getLabel("This survey has already been published.")}
                </div>
              )}
            </div>
          </div>

          {/* Main form */}
          <div className="col-12 col-md-8 mt-3 bg-transparent gap-3">
            <SurveyForm
              title={title}
              setTitle={setTitle}
              sections={sections}
              setSections={setSections}
              questions={questions}
              setQuestions={setQuestions}
              logo={logo}
              logoAlignment={logoAlignment}
              logoText={logoText}
              image={backgroundImage}
              project_id={project_id}
              survey_id={survey_id}
              surveyStatus={surveyStatus}
              surveyLink={surveyLink}
              description={description}
              setDescription={setDescription}
              language={language}
              setLanguage={setLanguage}
              isLoggedInRequired={isLoggedInRequired}
              setIsLoggedInRequired={setIsLoggedInRequired}
              template={survey_details?.template || null}
            />
          </div>
          <div className="d-none d-md-block col-md-2" />
        </div>
        <ToastContainer position="top-center" autoClose={4000} />
      </div>
    </>
  );
};

export default Index;
