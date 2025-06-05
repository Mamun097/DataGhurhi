// src/Components/SurveyForm.jsx
import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useMemo } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../CSS/SurveyForm.css"; 
import { handleImageUpload } from "../utils/handleImageUpload"; 
import SurveySections from "./SurveySections";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY;


// ... (translateText function remains the same) ...
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
    return textArray; // Return original text array on error
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
  const [currentBackgroundImage, setCurrentBackgroundImage] = useState(imageFromParent || "");
  const [translatedLabels, setTranslatedLabels] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [localDescriptionText, setLocalDescriptionText] = useState(description || "");

  const labelsToTranslate = useMemo(() => [
    "Updating", "Saving", "Publishing", "Add Description", "Remove Banner",
    "Save Description", "Edit Description", "Add New Description", "Survey Description",
    "Enter your survey description here", "Cancel", "Edit", "Delete", "Save",
    "Publish", "Update", "View Survey Link", "Upload Banner Image", "Enter Survey Title",
    "Add Section", "Survey updated successfully!", "Survey Saved successfully!", "Section",
    "Enter Section Title", "Delete Section", "Merge with above",
    "Select the type of question you want to add", "Multiple Choice Question", "Text",
    "Rating", "Linear Scale", "Checkbox", "Dropdown", "Date/Time", "Likert Scale",
    "Multiple Choice Grid", "Survey Templates", "This survey has already been published.",
    "Loading templates…", "Untitled Survey", "Survey Template", "Add Question",
    "Generate Question using LLM", "Error saving survey!", "Survey Published successfully!",
    "Error publishing survey!", "Error updating survey!", "No banner image selected"
  ], []);

  const getLabel = (text) => translatedLabels[text] || text;

  useEffect(() => {
    setCurrentBackgroundImage(imageFromParent || "");
  }, [imageFromParent]);

  useEffect(() => {
    setLocalDescriptionText(description || "");
  }, [description]);

  useEffect(() => {
    const loadTranslations = async () => {
      if (!GOOGLE_API_KEY) {
        console.warn("Google Translate API key is missing. Translations will not be loaded.");
        const englishMap = {};
        labelsToTranslate.forEach((label) => (englishMap[label] = label));
        setTranslatedLabels(englishMap);
        return;
      }
      const langCode = language === "বাংলা" || language === "bn" ? "bn" : "en";
      if (langCode === "en") {
        const englishMap = {};
        labelsToTranslate.forEach((label) => (englishMap[label] = label));
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
            // Fallback to English if translation fails
            const englishMap = {};
            labelsToTranslate.forEach((label) => (englishMap[label] = label));
            setTranslatedLabels(englishMap);
        }
      }
    };
    loadTranslations();
  }, [language, labelsToTranslate]); // GOOGLE_API_KEY is not needed as a dep for useEffect if its absence is handled inside

  // ... (other functions: updateAndRelayBackgroundImage, handleAddSection, etc. remain the same) ...
  const updateAndRelayBackgroundImage = (newImageSrc) => {
    setCurrentBackgroundImage(newImageSrc);
    if (setImageInParent) {
      setImageInParent(newImageSrc);
    }
  };

  const handleAddSection = () => {
    // Ensure new sections have a unique ID if possible, or use index as key carefully
    const newSectionId = sections.length > 0 ? Math.max(...sections.map(s => s.id)) + 1 : 1;
    const newSection = { id: newSectionId, title: "", questions: [] };
    setSections([...sections, newSection]);
  };

  const handleRemoveImage = () => {
    updateAndRelayBackgroundImage("");
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
    setDescription(null); // Or ""
    setLocalDescriptionText("");
    setIsEditingDescription(false);
  };

  const sendSurveyData = async (url) => {
    setIsLoading(true);
    const bearerTokenString = localStorage.getItem("token");
    let userIdInPayload = null;

    if (!bearerTokenString) {
      console.error("No token found in localStorage. Cannot authenticate.");
      toast.error(getLabel("Authentication error. Please log in again.") || "Authentication error. Please log in again.");
      setIsLoading(false);
      return;
    }

    try {
      // Attempt to parse, but handle if it's not JSON (e.g., just the token string)
      let tokenToUse = bearerTokenString;
      try {
        const parsedToken = JSON.parse(bearerTokenString);
        if (parsedToken && typeof parsedToken === 'object') {
            if(parsedToken.id) userIdInPayload = parsedToken.id;
            // If the token is an object containing the actual token (e.g., { token: "actual_jwt" })
            // and your backend expects just the JWT, you might need to extract it.
            // For this example, let's assume bearerTokenString is either the direct token or a JSON obj with an id.
            // If it's an object and doesn't contain the actual token string for the header, adjust here.
            // tokenToUse = parsedToken.token || bearerTokenString; // Example if token is nested
        }
      } catch (e) {
        // If not JSON, assume bearerTokenString is the token itself. id extraction won't work here.
        console.warn("Token from localStorage is not JSON. 'id' for user_id payload field cannot be extracted this way.");
      }
      // If Authorization header expects just the token string, and localStorage stores it as JSON like {"token":"value"},
      // ensure tokenToUse is the actual string. For now, assuming bearerTokenString is directly usable or backend handles it.

    } catch (e) {
      console.warn("Error processing token from localStorage:", e);
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
        title: title, // Survey title
        user_id: userIdInPayload, // user_id from token if available
      };

      const response = await axios.put(url, payload, {
        headers: {
          "Content-Type": "application/json",
          // Assuming bearerTokenString is the raw token to be sent
          Authorization: `Bearer ${bearerTokenString.startsWith('{') ? JSON.parse(bearerTokenString).token : bearerTokenString}`, // Adjust if token is nested
        },
      });

      if (response.status === 200 || response.status === 201) {
        const isSave = url.includes('save');
        const isUpdate = surveyStatus === 'published';
        
        let successMessageKey = "Survey updated successfully!";
        if (isSave) {
            successMessageKey = "Survey Saved successfully!";
        } else if (!isUpdate) { // It's a new publish
            successMessageKey = "Survey Published successfully!";
        }
        toast.success(getLabel(successMessageKey));

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
        // This block might not be reached if axios throws error for non-2xx status
        const action = url.includes('save') ? 'saving' : (surveyStatus !== 'published' ? 'publishing' : 'updating');
        console.error(`Error ${action} survey:`, response.statusText);
        toast.error(getLabel(`Error ${action} survey!`) || `Error ${action} survey. Please try again.`);
      }
    } catch (error) {
      const action = url.includes('save') ? 'saving' : (surveyStatus !== 'published' ? 'publishing' : 'updating');
      const errorMsg = error.response?.data?.message || error.message;
      const errorKey = `Error ${action} survey!`;
      console.error(`Error ${action} survey:`, errorMsg, error.response, error.stack);
      toast.error(getLabel(errorKey) || `${errorKey.replace('!', '')}: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };


  const handleSave = () => sendSurveyData("http://localhost:2000/api/surveytemplate/save");
  const handlePublish = () => sendSurveyData("http://localhost:2000/api/surveytemplate"); // Assuming this is publish
  const handleUpdate = () => sendSurveyData("http://localhost:2000/api/surveytemplate"); // And this is update

    return (
      <div className="container-fluid px-2 px-md-3">
        {/* Action Buttons: Apply the new class here */}
        {/* Added button-group-mobile-compact and justify-content-start */}
        <div className="mb-3 p-md-0 button-group-mobile-compact justify-content-start">
          {surveyStatus === "published" ? (
            <button onClick={handleUpdate} disabled={isLoading} className="btn btn-outline-primary btn-sm me-2"> {/* Ensure btn-sm is present */}
              {isLoading ? (<><span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>{getLabel("Updating")}</>) : (<><i className="bi bi-pencil"></i> {getLabel("Update")}</>)}
            </button>
          ) : (
            <>
              <button onClick={handleSave} disabled={isLoading} className="btn btn-outline-secondary btn-sm me-2"> {/* Ensure btn-sm */}
                  {isLoading ? (<><span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>{getLabel("Saving")}</>) : (<><i className="bi bi-save"></i> {getLabel("Save")}</>)}
              </button>
              <button onClick={handlePublish} disabled={isLoading} className="btn btn-outline-success btn-sm me-2"> {/* Ensure btn-sm */}
                  {isLoading ? (<><span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>{getLabel("Publishing")}</>) : (<><i className="bi bi-check-circle"></i> {getLabel("Publish")}</>)}
              </button>
            </>
          )}
          {surveyLink && (
            <a
              href={`http://localhost:5173/v/${surveyLink}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline-info btn-sm" // Ensure btn-sm. Removed me-2 if it's last, otherwise me-1 or me-2 for spacing.
            >
              <i className="bi bi-link-45deg"></i> {getLabel("View Survey Link")}
            </a>
          )}
        </div>

        <div style={{ backgroundColor: "white", paddingBottom: "20px" }} className="shadow-sm rounded">
          {/* ... (banner image and title input remain the same) ... */}
          <div style={{ position: "relative", width: "100%" }}>
            {currentBackgroundImage ? (
              <img
                src={currentBackgroundImage}
                alt={getLabel("Survey Banner") || "Survey Banner"}
                className="img-fluid"
                style={{ width: "100%", height: "auto", maxHeight: "400px", objectFit: "cover" }}
              />
            ) : (
              <div
                className="img-fluid d-flex align-items-center justify-content-center"
                style={{ width: "100%", minHeight: "150px", backgroundColor: "#e9ecef", border: "2px dashed #ced4da", color: "#6c757d" }}
              >
                <span>{getLabel("No banner image selected")}</span>
              </div>
            )}
            <input
              type="text"
              className="form-control text-center survey-title-overlay"
              placeholder={getLabel("Enter Survey Title")}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                color: "white",
                fontWeight: "bold",
                background: "rgba(0, 0, 0, 0.6)",
                border: "none",
                borderRadius: "4px",
              }}
            />
          </div>


          {/* Banner and Description Controls: Apply the new class here */}
          {/* Added button-group-mobile-compact and justify-content-center */}
          <div className="mt-3 mb-3 button-group-mobile-compact justify-content-center">
            <label className="btn btn-outline-secondary btn-sm me-1"> 
              <i className="bi bi-image"></i> {getLabel("Upload Banner Image")}
              <input type="file" accept="image/*" hidden
                onChange={(e) => { handleImageUpload(e, updateAndRelayBackgroundImage); }}
                id="bannerImageInput"
              />
            </label>
            {currentBackgroundImage && (
              <button className="btn btn-outline-danger btn-sm me-1" onClick={handleRemoveImage} title={getLabel("Remove current banner image")}> {/* Ensure btn-sm, me-1 */}
                <i className="bi bi-trash"></i> {getLabel("Remove Banner")}
              </button>
            )}
            {!description && !isEditingDescription && (
              <button className="btn btn-outline-info btn-sm" onClick={handleAddOrEditDescriptionClick}> {/* Ensure btn-sm. No margin if last button */}
                <i className="bi bi-plus-circle"></i> {getLabel("Add Description")}
              </button>
            )}
          </div>
          <div className="container mt-3">
            {isEditingDescription ? (
              <div className="card p-3 shadow-sm">
                <h5 className="card-title">{description ? getLabel("Edit Description") : getLabel("Add New Description")}</h5>
                <textarea
                  className="form-control"
                  rows="4"
                  value={localDescriptionText}
                  onChange={(e) => setLocalDescriptionText(e.target.value)}
                  placeholder={getLabel("Enter your survey description here")}
                />
                <div className="text-end mt-3">
                  <button className="btn btn-secondary btn-sm me-2" onClick={handleCancelEditDescription}>
                    {getLabel("Cancel")}
                  </button>
                  <button className="btn btn-primary btn-sm" onClick={handleSaveDescription}>
                    <i className="bi bi-save me-1"></i> {getLabel("Save Description")}
                  </button>
                </div>
              </div>
            ) : (
              description && (
                <div className="card p-3 shadow-sm">
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start">
                    <div className="mb-2 mb-md-0">
                      <h5 className="card-title">{getLabel("Survey Description")}</h5>
                      <p className="card-text" style={{ whiteSpace: "pre-wrap" }}>{description}</p>
                    </div>
                    <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center mt-2 mt-md-0">
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

          <div className="mt-4 container">
            {sections.map((section, index) => (
              <SurveySections
                key={section.id || `section-${index}`}
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
            <button className="btn btn-outline-primary mt-3 d-block mx-auto" onClick={handleAddSection}>
              ➕ {getLabel("Add Section")}
            </button>
          </div>
        </div>
        <ToastContainer position="bottom-right" autoClose={3000} newestOnTop />
      </div>
    );
  };

export default SurveyForm;