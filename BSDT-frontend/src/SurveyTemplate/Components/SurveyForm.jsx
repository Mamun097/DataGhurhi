// src/Components/SurveyForm.jsx
import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useMemo } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import { handleImageUpload } from "../utils/handleImageUpload"; // Assuming this utility exists
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
  image: imageFromParent, 
  setImage: setImageInParent, 
  project_id,
  survey_id,
  surveyStatus,
  surveyLink,
  description,
  setDescription,
  language,
  setLanguage,
}) => {
  // Internal state for SurveyForm's current view of the background image
  const [currentBackgroundImage, setCurrentBackgroundImage] = useState(imageFromParent || "");
  const [themeColor, setThemeColor] = useState(null);
  const [translatedLabels, setTranslatedLabels] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [localDescriptionText, setLocalDescriptionText] = useState(description || "");
  

const labelsToTranslate = useMemo(() => [
  "Updating",
  "Saving",
  "Publishing",
  "Add Description",
  "Remove Banner",
  "Save Description",
  "Edit Description",
  "Add New Description",
  "Survey Description",
  "Enter your survey description here",
  "Cancel",
  "Edit",
  "Delete",
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
], []);

const getLabel = (text) => translatedLabels[text] || text;
 
// Effect to sync internal background image state when prop from parent changes
useEffect(() => {
  setCurrentBackgroundImage(imageFromParent || "");
}, [imageFromParent]);

// Effect to sync local description text when description prop from parent changes
useEffect(() => {
  setLocalDescriptionText(description || "");
}, [description]);

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
}, [language, labelsToTranslate]);

  const updateAndRelayBackgroundImage = (newImageSrc) => {
    setCurrentBackgroundImage(newImageSrc); 
    if (setImageInParent) {
      setImageInParent(newImageSrc);
    }
  };

  const handleAddSection = () => {
    const newSection = { id: sections.length + 1 };
    setSections([...sections, newSection]);
  };

  const handleRemoveImage = () => {
    updateAndRelayBackgroundImage(""); 
    setThemeColor(null);
    const fileInput = document.getElementById('bannerImageInput');
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleAddOrEditDescriptionClick = () => {
    setLocalDescriptionText(description || "");
    setIsEditingDescription(true);
  };

  const handleSaveDescription = () => {
    setDescription(localDescriptionText);
    setIsEditingDescription(false);
  };

  const handleCancelEditDescription = () => {
    setIsEditingDescription(false);
  };

  const handleDeleteDescription = () => {
    setDescription(null);
    setIsEditingDescription(false);
  };

  const sendSurveyData = async (url) => {
    setIsLoading(true);
    const bearerTokenString = localStorage.getItem("token"); 
    let userIdInPayload = null;

    if (!bearerTokenString) {
      console.error("No token found in localStorage. Cannot authenticate.");
      alert("Authentication error. Please log in again.");
      setIsLoading(false);
      return; 
    }

    try {
      const parsedToken = JSON.parse(bearerTokenString);
      if (parsedToken && typeof parsedToken === 'object' && parsedToken.id) {
        userIdInPayload = parsedToken.id;
      } else {
        console.warn("Could not extract 'id' from token in localStorage for user_id payload field. The backend might infer user from Authorization header.");
      }
    } catch (e) {
      console.warn("Token from localStorage is not JSON. User_id for payload may need alternative extraction or is handled by backend via Authorization header.");

    }

    try {
      const payload = {
        survey_id: survey_id,
        project_id: project_id,
        survey_template: {
          sections,
          backgroundImage: currentBackgroundImage,
          title,
          description: description, 
          questions,
        },
        title: title,
        user_id: userIdInPayload, 
      };

      const response = await axios.put(url, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${bearerTokenString}`, 

        },
      });

      if (response.status === 201) {
        const action = url.includes('save') ? 'Saved' : (surveyStatus !== 'published' ? 'Published' : 'Updated');
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
      } else {
        const action = url.includes('save') ? 'saving' : 'publishing/updating';
        console.error(`Error ${action} survey:`, response.statusText);
        alert(`Error ${action} survey. Please try again.`);
      }
    } catch (error) {
      const action = url.includes('save') ? 'saving' : 'publishing/updating';
      console.error(
        `Error ${action} survey:`,
        error.response?.data || error.message,
        error.stack // Log stack trace for more details
      );
      alert(`An error occurred while ${action}. Please check the console and try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => sendSurveyData("http://localhost:2000/api/surveytemplate/save");
  const handlePublish = () => sendSurveyData("http://localhost:2000/api/surveytemplate");
  const handleUpdate = () => sendSurveyData("http://localhost:2000/api/surveytemplate");

  return (
    <div>
      {/* Action Buttons (Save, Publish, Update) */}
      <div className="mb-3">
        {surveyStatus === "published" ? (
          <button onClick={handleUpdate} disabled={isLoading} className="btn btn-outline-primary">
             {isLoading ? (<><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>{getLabel("Updating")}</>) : (<><i className="bi bi-pencil"></i> {getLabel("Update")}</>)}
          </button>
        ) : (
          <>
            <button onClick={handleSave} disabled={isLoading} className="btn btn-outline-secondary me-3">
                {isLoading ? (<><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>{getLabel("Saving")}</>) : (<><i className="bi bi-save"></i> {getLabel("Save")}</>)}
            </button>
            <button onClick={handlePublish} disabled={isLoading} className="btn btn-outline-success">
                {isLoading ? (<><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>{getLabel("Publishing")}</>) : (<><i className="bi bi-check-circle"></i> {getLabel("Publish")}</>)}

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

      {/* Survey Content Area */}
      <div style={{ backgroundColor: themeColor || "white", paddingBottom: "20px" }}>
        {/* Banner Image and Title */}
        <div style={{ position: "relative", width: "100%" }}>
          {currentBackgroundImage ? ( // Use internal state for display
            <img src={currentBackgroundImage} alt="Survey Banner" className="img-fluid" style={{ width: "100%", height: "400px", objectFit: "cover" }} />
          ) : (
            <div className="img-fluid d-flex align-items-center justify-content-center" style={{ width: "100%", height: "400px", backgroundColor: "#e9ecef", border: "2px dashed #ced4da", color: "#6c757d" }}>
              <span>No banner image selected</span>
            </div>
          )}
          <input type="text" className="form-control text-center" placeholder="Enter Survey Title" value={title} onChange={(e) => setTitle(e.target.value)} style={{ position: "absolute", top: "80%", left: "50%", transform: "translate(-50%, -50%)", color: "white", fontWeight: "bold", background: "rgba(0, 0, 0, 0.5)", border: "none", borderRadius: "4px", padding: "10px", width: "50%" }}/>
        </div>

        {/* Banner and Description Controls */}
        <div className="text-center mt-3 mb-3">
          <label className="btn btn-outline-secondary me-2">
            <i className="bi bi-image"></i> {getLabel("Upload Banner Image")}
            <input type="file" accept="image/*" hidden
              onChange={(e) => {
                handleImageUpload(e, updateAndRelayBackgroundImage, setThemeColor); 
              }}
              id="bannerImageInput"

            />
          </label>
          {currentBackgroundImage && ( 
            <button className="btn btn-outline-danger me-2" onClick={handleRemoveImage} title="Remove current banner image">
              <i className="bi bi-trash"></i> {getLabel("Remove Banner")}
            </button>
          )}
          {!description && !isEditingDescription && (
            <button className="btn btn-outline-info" onClick={handleAddOrEditDescriptionClick}>
              <i className="bi bi-plus-circle"></i> {getLabel("Add Description")}
            </button>
          )}
        </div>

        {/* Description Display or Editor Area */}
        <div className="container mt-2">
          {isEditingDescription ? (
            <div className="card p-3 shadow-sm">
              <h5 className="card-title mb-2">{description ? getLabel("Edit Description") : getLabel("Add New Description")}</h5>
              <textarea
                className="form-control mb-3"
                rows="5"
                value={localDescriptionText}
                onChange={(e) => setLocalDescriptionText(e.target.value)}
                placeholder={getLabel("Enter your survey description here")}
              />
              <div className="text-end">
                <button className="btn btn-secondary me-2" onClick={handleCancelEditDescription}>
                  {getLabel("Cancel")}
                </button>
                <button className="btn btn-primary" onClick={handleSaveDescription}>
                  <i className="bi bi-save me-1"></i> {getLabel("Save Description")}
                </button>
              </div>
            </div>
          ) : (
            description && (
              <div className="card p-3 shadow-sm">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h5 className="card-title">{getLabel("Survey Description")}</h5>
                    <p className="card-text" style={{ whiteSpace: "pre-wrap" }}>{description}</p>
                  </div>
                  <div className="d-flex flex-column flex-sm-row align-items-sm-center">
                    <button className="btn btn-sm btn-outline-primary mb-2 mb-sm-0 me-sm-2" onClick={handleAddOrEditDescriptionClick}>
                      <i className="bi bi-pencil"></i> {getLabel("Edit")}
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={handleDeleteDescription}>
                      <i className="bi bi-trash"></i> {getLabel("Delete")}
                    </button>
                  </div>
                </div>
              </div>
            )
          )}
        </div>

        {/* Survey Sections and Questions */}
        <div className="mt-4 container"> {/* Added container for consistency */}
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
    <ToastContainer />
  </div>
  );
};

export default SurveyForm;