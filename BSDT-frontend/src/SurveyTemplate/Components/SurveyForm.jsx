import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { handleImageUpload } from "../utils/handleImageUpload";
import SurveySections from "./SurveySections";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY;

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

const SurveyForm = ({
  title,
  setTitle,
  sections,
  setSections,
  questions,
  setQuestions,
  image,
  project_id,
  survey_id,
  surveyStatus,
  surveyLink,
  language,
  setLanguage,
}) => {
  const [backgroundImage, setBackgroundImage] = useState(image || "");
  const [themeColor, setThemeColor] = useState(null);
  const [translatedLabels, setTranslatedLabels] = useState({});
  const navigate = useNavigate();

  const labelsToTranslate = [
    "Save",
    "Publish",
    "Update",
    "View Survey Link",
    "Upload Banner Image",
    "Enter Survey Title",
    "Add Section",
    "Survey updated successfully!",
    "Survey Saved successfully!",
    "Section", "Enter Section Title", "Delete Section", "Merge with above",
    "Select the type of question you want to add",
    "Multiple Choice Question",
    "Text",
    "Rating",
    "Linear Scale",
    "Checkbox",
    "Dropdown",
    "Date/Time",
    "Likert Scale",
    "Multiple Choice Grid",
    "Survey Templates",
    "This survey has already been published.",
    "Loading templates…",
    "Untitled Survey",
    "Survey Template",
    "Add Question",
    "Generate Question using LLM",
    "Error saving survey!",
    "Survey Published successfully!",
    "Error publishing survey!",
    "Error updating survey!",
  ];

  const getLabel = (text) => translatedLabels[text] || text;

  useEffect(() => {
    if (image) setBackgroundImage(image);
  }, [image]);

useEffect(() => {
  const loadTranslations = async () => {
    const langCode = language === "বাংলা" || language === "bn" ? "bn" : "en";

    if (langCode === "en") {
      const englishMap = {};
      labelsToTranslate.forEach((label) => (englishMap[label] = label));
      setTranslatedLabels(englishMap);
    } else {
      const translated = await translateText(labelsToTranslate, langCode);
      const translatedMap = {};
      labelsToTranslate.forEach((label, idx) => {
        translatedMap[label] = translated[idx];
      });
      setTranslatedLabels(translatedMap);
    }
  };

  loadTranslations();
}, [language]);


  const handleAddSection = () => {
    const newSection = { id: sections.length + 1, title: "Section Title..." };
    setSections([...sections, newSection]);
  };

  const handleSave = async () => {
    try {
      const response = await axios.put(
        "http://localhost:2000/api/surveytemplate/save",
        {
          survey_id,
          project_id,
          survey_template: {
            sections,
            backgroundImage,
            title,
            description: null,
            questions,
          },
          title,
          user_id: `${localStorage.getItem("token").id}`,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 201) {
        toast.success(getLabel("Survey Saved successfully!"))
        navigate(
          `/view-survey/${response.data.data?.survey_id || response.data.survey_id}`,
          {
            state: {
              project_id,
              survey_details: response.data.data,
              input_title: title,
            },
          }
        );
      }
    } catch (error) {
      toast.error(getLabel("Error saving survey!"))
      console.error("Error saving survey:", error);
    }
  };

  const handlePublish = async () => {
    try {
      const response = await axios.put(
        "http://localhost:2000/api/surveytemplate",
        {
          survey_id,
          project_id,
          survey_template: {
            sections,
            backgroundImage,
            title,
            description: null,
            questions,
          },
          title,
          user_id: `${localStorage.getItem("token").id}`,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 201) {
        toast.success(getLabel("Survey Published successfully!"))
        navigate(
          `/view-survey/${response.data.data?.survey_id || response.data.survey_id}`,
          {
            state: {
              project_id,
              survey_details: response.data.data,
              input_title: title,
            },
          }
        );
      }
    } catch (error) {
      toast.error(getLabel("Error publishing survey!"))
      console.error("Error publishing survey:", error);
    }
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        "http://localhost:2000/api/surveytemplate",
        {
          survey_id,
          project_id,
          survey_template: {
            sections,
            backgroundImage,
            title,
            description: null,
            questions,
          },
          title,
          user_id: token?.id,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
        toast.success(getLabel("Survey updated successfully!"))
        navigate(
          `/view-survey/${response.data.data?.survey_id || response.data.survey_id}`,
          {
            state: {
              project_id,
              survey_details: response.data.data,
              input_title: title,
            },
          }
        );
      }
    } catch (error) {
      toast.error(getLabel("Error updating survey!"))
      console.error("Error updating survey:", error);
    }
  };

  return (
    <div>
    <ToastContainer position="top-center" autoClose={4000} />
      <div className="mb-3">
        {surveyStatus === "published" ? (
          <button className="btn btn-outline-primary" onClick={handleUpdate}>
            <i className="bi bi-pencil"></i> {getLabel("Update")}
          </button>
        ) : (
          <>
            <button className="btn btn-outline-secondary me-3" onClick={handleSave}>
              <i className="bi bi-save"></i> {getLabel("Save")}
            </button>
            <button className="btn btn-outline-success" onClick={handlePublish}>
              <i className="bi bi-check-circle"></i> {getLabel("Publish")}
            </button>
          </>
        )}
        {surveyLink && (
          <a
            href={`http://localhost:5173/v/${surveyLink}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline-info ms-3"
          >
            <i className="bi bi-link-45deg"></i> {getLabel("View Survey Link")}
          </a>
        )}
      </div>

      <div style={{ backgroundColor: themeColor || "white" }}>
        <div style={{ position: "relative", width: "100%" }}>
          <img
            src={backgroundImage}
            alt="Survey Banner"
            className="img-fluid"
            style={{ width: "100%", height: "400px", objectFit: "cover" }}
          />
          <input
            type="text"
            className="form-control text-center"
            placeholder={getLabel("Enter Survey Title")}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              position: "absolute",
              top: "80%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              color: "white",
              fontWeight: "bold",
              background: "rgba(0, 0, 0, 0.5)",
            }}
          />
        </div>

        <div className="text-center mt-3">
          <label className="btn btn-outline-secondary">
            <i className="bi bi-image"></i> {getLabel("Upload Banner Image")}
            <input
              type="file"
              hidden
              onChange={(e) => handleImageUpload(e, setBackgroundImage, setThemeColor)}
            />
          </label>
        </div>

        <div className="mt-4">
          {sections.map((section) => (
            <SurveySections
              key={section.id}
              section={section}
              sections={sections}
              setSections={setSections}
              questions={questions}
              setQuestions={setQuestions}
              language={language}
              setLanguage={setLanguage}
              getLabel={getLabel}
            />
          ))}
          <button className="btn btn-outline-primary mt-3" onClick={handleAddSection}>
            ➕ {getLabel("Add Section")}
          </button>
        </div>
      </div>
      
    </div>
  );
};

export default SurveyForm;
