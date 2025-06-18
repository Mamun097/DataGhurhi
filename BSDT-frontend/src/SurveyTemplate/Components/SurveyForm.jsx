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
  // Modified: Changed to array for multiple images
  const [backgroundImages, setBackgroundImages] = useState(
    imageFromParent ? [imageFromParent] : []
  );
  const [translatedLabels, setTranslatedLabels] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [localDescriptionText, setLocalDescriptionText] = useState(
    description || ""
  );
  // Modified: Array to store dimensions and alignment for each image
  const [imageDimensions, setImageDimensions] = useState(
    imageFromParent ? [{ width: "100%", height: "auto", alignment: "center" }] : []
  );

  const MAX_WIDTH = 1200; // Fixed max width in pixels
  const MAX_HEIGHT = 400; // Fixed max height in pixels

  const labelsToTranslate = useMemo(
    () => [
      "Updating",
      "Saving",
      "Publishing",
      "Add Description",
      "Remove Banner",
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
      "View Response",
      "Upload Banner Image",
      "Enter Survey Title",
      "Add Section",
      "Survey updated successfully!",
      "Survey Saved successfully!",
      "Section",
      "Enter Section Title",
      "Delete Section",
      "Merge with above",
      "Select the type of question you want to add",
      "Multiple Choice Question",
      "Text",
      "Rating",
      "Linear Scale",
      "Checkbox",
      "Dropdown",
      "Date/Time",
      "Likert Scale",
      "Tick Box Grid",
      "Multiple Choice",
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
      "No banner image selected",
      "Left",
      "Right",
      "Center",
      "Enter your question here",
      "Add Option",
      "Shuffle option order",
      "Required",
      "Enable Marking System",
      "Short answer text",
      "Long answer text (paragraph)",
      "Add tag",
      "Long Answer",
      "Crop Your Image",
      "Crop",
      "Cancel",
      "Upload",
      "Aspect Ratio:",
      "Response Validation",
      "Greater Than",
      "Greater Than or Equal To",
      "Less Than",
      "Less Than or Equal To",
      "Equal To",
      "Not Equal To",
      "Between",
      "Not Between",
      "Is Number",
      "Is Not Number",
      "Contains",
      "Does Not Contain",
      "Email",
      "URL",
      "Maximum character Count",
      "Minimum character Count",
      "Contains",
      "Doesn't Contain",
      "Matches",
      "Doesn't Match",
      "Custom Error Message (Optional)",
      "Number",
      "Text",
      "Regex",
      "Length",
      "Levels:",
      "Enter your question here",
      "Linear Scale",
      "Min",
      "Max",
      "Show Labels",
      "Likert Scale",
      "Add Row",
      "Add Column",
      "Rows",
      "Columns",
      "Require a response in each row",
      "Shuffle row order",
      "Require at least one selection",
      "Shuffle option order",
      "Date",
      "Time",
      "Select Date/Time",
      "Image Width (px)",
      "Image Height (px)",
      "Image Alignment",
    ],
    []
  );

  const getLabel = (text) => translatedLabels[text] || text;

  // Modified: Updated useEffect to handle array of images
  useEffect(() => {
    setBackgroundImages(imageFromParent ? [imageFromParent] : []);
    setImageDimensions(
      imageFromParent ? [{ width: "100%", height: "auto", alignment: "center" }] : []
    );
  }, [imageFromParent]);

  useEffect(() => {
    setLocalDescriptionText(description || "");
  }, [description]);

  useEffect(() => {
    const loadTranslations = async () => {
      if (!GOOGLE_API_KEY) {
        console.warn(
          "Google Translate API key is missing. Translations will not be loaded."
        );
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
          const englishMap = {};
          labelsToTranslate.forEach((label) => (englishMap[label] = label));
          setTranslatedLabels(englishMap);
        }
      }
    };
    loadTranslations();
  }, [language, labelsToTranslate]);

  // Modified: Updated to append new image to array
  const updateAndRelayBackgroundImage = (newImageSrc) => {
    setBackgroundImages((prev) => [...prev, newImageSrc]);
    setImageDimensions((prev) => [
      ...prev,
      { width: "100%", height: "auto", alignment: "center" },
    ]);
    if (setImageInParent) {
      setImageInParent(newImageSrc); // Maintain compatibility with parent
    }
  };

  const handleAddSection = () => {
    const newSectionId =
      sections.length > 0 ? Math.max(...sections.map((s) => s.id)) + 1 : 1;
    const newSection = { id: newSectionId, title: "", questions: [] };
    setSections([...sections, newSection]);
  };

  // Modified: Updated to remove image at specific index
  const handleRemoveImage = (index) => {
    setBackgroundImages((prev) => prev.filter((_, i) => i !== index));
    setImageDimensions((prev) => prev.filter((_, i) => i !== index));
    const fileInput = document.getElementById("bannerImageInput");
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleAddOrEditDescriptionClick = () => {
    setLocalDescriptionText(description || "");
    setIsEditingDescription(true);
  };

  const handleCancelEditDescription = () => {
    setIsEditingDescription(false);
  };

  const handleDeleteDescription = () => {
    setDescription(null);
    setLocalDescriptionText("");
    setIsEditingDescription(false);
  };

  // Modified: Updated to handle dimensions for specific image index
  const handleDimensionChange = (e, dimension, index) => {
    const value = e.target.value;
    if (
      value === "" ||
      (Number(value) > 0 &&
        Number(value) <= (dimension === "width" ? MAX_WIDTH : MAX_HEIGHT))
    ) {
      setImageDimensions((prev) =>
        prev.map((dim, i) =>
          i === index
            ? { ...dim, [dimension]: value ? `${value}px` : "auto" }
            : dim
        )
      );
    }
  };

  // Modified: Updated to handle alignment for specific image index
  const handleAlignmentChange = (alignment, index) => {
    setImageDimensions((prev) =>
      prev.map((dim, i) => (i === index ? { ...dim, alignment } : dim))
    );
  };

  // Modified: Updated payload to include array of images
  const sendSurveyData = async (url) => {
    setIsLoading(true);
    const bearerTokenString = localStorage.getItem("token");
    let userIdInPayload = null;

    if (!bearerTokenString) {
      console.error("No token found in localStorage. Cannot authenticate.");
      toast.error(
        getLabel("Authentication error. Please log in again.") ||
          "Authentication error. Please log in again."
      );
      setIsLoading(false);
      return;
    }

    try {
      let tokenToUse = bearerTokenString;
      try {
        const parsedToken = JSON.parse(bearerTokenString);
        if (parsedToken && typeof parsedToken === "object") {
          if (parsedToken.id) userIdInPayload = parsedToken.id;
        }
      } catch (e) {
        console.warn(
          "Token from localStorage is not JSON. 'id' for user_id payload field cannot be extracted this way."
        );
      }
    } catch (e) {
      console.warn("Error processing token from localStorage:", e);
    }

    try {
      const payload = {
        survey_id: survey_id,
        project_id: project_id,
        survey_template: {
          sections,
          backgroundImages, // Modified: Send array of images
          title,
          description: description,
          questions,
          imageDimensions, // Modified: Send array of dimensions
        },
        title: title,
        user_id: userIdInPayload,
      };

      const response = await axios.put(url, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${
            bearerTokenString.startsWith("{")
              ? JSON.parse(bearerTokenString).token
              : bearerTokenString
          }`,
        },
      });

      if (response.status === 200 || response.status === 201) {
        const isSave = url.includes("save");
        const isUpdate = surveyStatus === "published";

        let successMessageKey = "Survey updated successfully!";
        if (isSave) {
          successMessageKey = "Survey Saved successfully!";
        } else if (!isUpdate) {
          successMessageKey = "Survey Published successfully!";
        }
        toast.success(getLabel(successMessageKey));

        navigate(
          `/view-survey/${
            response.data.data?.survey_id || response.data.survey_id
          }`,
          {
            state: {
              project_id,
              survey_details: response.data.data,
              input_title: title,
            },
          }
        );
      } else {
        const action = url.includes("save")
          ? "saving"
          : surveyStatus !== "published"
          ? "publishing"
          : "updating";
        console.error(`Error ${action} survey:`, response.statusText);
        toast.error(
          getLabel(`Error ${action} survey!`) ||
            `Error ${action} survey. Please try again.`
        );
      }
    } catch (error) {
      const action = url.includes("save")
        ? "saving"
        : surveyStatus !== "published"
        ? "publishing"
        : "updating";
      const errorMsg = error.response?.data?.message || error.message;
      const errorKey = `Error ${action} survey!`;
      console.error(
        `Error ${action} survey:`,
        errorMsg,
        error.response,
        error.stack
      );
      toast.error(
        getLabel(errorKey) || `${errorKey.replace("!", "")}: ${errorMsg}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () =>
    sendSurveyData("http://localhost:2000/api/surveytemplate/save");
  const handlePublish = () =>
    sendSurveyData("http://localhost:2000/api/surveytemplate");
  const handleUpdate = () =>
    sendSurveyData("http://localhost:2000/api/surveytemplate");
  const handleSurveyResponses = () => {
    navigate(`/survey-responses/${survey_id}`);
  };

  return (
    <div className="px-2 px-md-3">
      {/* Action Buttons */}
      <div className="mb-3 p-md-0 button-group-mobile-compact justify-content-start">
        {surveyStatus === "published" ? (
          <button
            onClick={handleUpdate}
            disabled={isLoading}
            className="btn btn-outline-primary btn-sm me-2"
          >
            {isLoading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-1"
                  role="status"
                  aria-hidden="true"
                ></span>
                {getLabel("Updating")}
              </>
            ) : (
              <>
                <i className="bi bi-pencil"></i> {getLabel("Update")}
              </>
            )}
          </button>
        ) : (
          <>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="btn btn-outline-secondary btn-sm me-2"
            >
              {isLoading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-1"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  {getLabel("Saving")}
                </>
              ) : (
                <>
                  <i className="bi bi-save"></i> {getLabel("Save")}
                </>
              )}
            </button>
            <button
              onClick={handlePublish}
              disabled={isLoading}
              className="btn btn-outline-success btn-sm me-2"
            >
              {isLoading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-1"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  {getLabel("Publishing")}
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle"></i> {getLabel("Publish")}
                </>
              )}
            </button>
          </>
        )}
        {surveyLink && (
          <>
            <a
              href={`http://localhost:5173/v/${surveyLink}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline-info btn-sm me-2"
            >
              <i className="bi bi-link-45deg"></i> {getLabel("View Survey Link")}
            </a>
            <button
              onClick={handleSurveyResponses}
              className="btn btn-outline-info btn-sm"
            >
              <i className="bi bi-bar-chart"></i> {getLabel("View Response")}
            </button>
          </>
        )}
      </div>

      {/* Container for title and description */}
      <div className="mb-3 shadow-sm rounded" style={{ backgroundColor: "white", padding: "20px" }}>
        {/* Title Input */}
        <div style={{ position: "relative", width: "100%" }}>
          <input
            type="text"
            className="form-control text-center"
            placeholder={getLabel("Enter Survey Title")}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              color: "#333",
              fontWeight: "bold",
              borderRadius: "4px",
            }}
          />
        </div>

        {/* Description Section */}
        <div className="mt-3">
          {isEditingDescription ? (
            <div className="card p-3 shadow-sm">
              <h5 className="card-title">
                {description
                  ? getLabel("Edit Description")
                  : getLabel("Add New Description")}
              </h5>
              <textarea
                className="form-control"
                rows="4"
                value={localDescriptionText}
                onChange={(e) => setLocalDescriptionText(e.target.value)}
                placeholder={getLabel("Enter your survey description here")}
              />
              <div className="text-end mt-3">
                <button
                  className="btn btn-secondary btn-sm me-2"
                  onClick={handleCancelEditDescription}
                >
                  {getLabel("Cancel")}
                </button>
              </div>
            </div>
          ) : (
            description && (
              <div className="card p-3 shadow-sm">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start">
                  <div className="mb-2 mb-md-0">
                    <h5 className="card-title">
                      {getLabel("Survey Description")}
                    </h5>
                    <p className="card-text" style={{ whiteSpace: "pre-wrap" }}>
                      {description}
                    </p>
                  </div>
                  <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center mt-2 mt-md-0">
                    <button
                      className="btn btn-sm btn-outline-primary mb-2 mb-sm-0 me-sm-2"
                      onClick={handleAddOrEditDescriptionClick}
                    >
                      <i className="bi bi-pencil"></i> {getLabel("Edit")}
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={handleDeleteDescription}
                    >
                      <i className="bi bi-trash"></i> {getLabel("Delete")}
                    </button>
                  </div>
                </div>
              </div>
            )
          )}
          {!description && !isEditingDescription && (
            <button
              className="btn btn-outline-info btn-sm mt-3"
              onClick={handleAddOrEditDescriptionClick}
            >
              <i className="bi bi-plus-circle"></i>{" "}
              {getLabel("Add Description")}
            </button>
          )}
        </div>
      </div>

      {/* Modified: Container for multiple banner images */}
      <div className="mb-3 shadow-sm rounded" style={{ backgroundColor: "white", padding: "20px" }}>
        {/* Modified: Render each image with its controls */}
        {backgroundImages.length > 0 ? (
          backgroundImages.map((image, index) => (
            <div key={`banner-${index}`} className="container mb-4">
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  display: "flex",
                  justifyContent: imageDimensions[index]?.alignment || "center",
                }}
              >
                <img
                  src={image}
                  alt={`${getLabel("Survey Banner")} ${index + 1}`}
                  className="img-fluid"
                  style={{
                    width: imageDimensions[index]?.width || "100%",
                    height: imageDimensions[index]?.height || "auto",
                    maxWidth: `${MAX_WIDTH}px`,
                    maxHeight: `${MAX_HEIGHT}px`,
                    objectFit: "cover",
                  }}
                />
              </div>
              {/* Image Controls */}
              <div className="mt-3 button-group-mobile-compact justify-content-center">
                <button
                  className="btn btn-outline-danger btn-sm me-1"
                  onClick={() => handleRemoveImage(index)}
                  title={getLabel("Remove current banner image")}
                >
                  <i className="bi bi-trash"></i> {getLabel("Remove Banner")}
                </button>
              </div>
              <div className="d-flex flex-wrap justify-content-center align-items-center mt-3">
                <div className="d-flex align-items-center me-3">
                  <label className="me-2">{getLabel("Image Width (px)")}</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    style={{ width: "80px" }}
                    value={
                      imageDimensions[index]?.width === "100%" ||
                      imageDimensions[index]?.width === "auto"
                        ? ""
                        : parseInt(imageDimensions[index]?.width || "0")
                    }
                    onChange={(e) => handleDimensionChange(e, "width", index)}
                    placeholder="Auto"
                    min="1"
                    max={MAX_WIDTH}
                  />
                </div>
                <div className="d-flex align-items-center me-3">
                  <label className="me-2">{getLabel("Image Height (px)")}</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    style={{ width: "80px" }}
                    value={
                      imageDimensions[index]?.height === "auto"
                        ? ""
                        : parseInt(imageDimensions[index]?.height || "0")
                    }
                    onChange={(e) => handleDimensionChange(e, "height", index)}
                    placeholder="Auto"
                    min="1"
                    max={MAX_HEIGHT}
                  />
                </div>
                <div className="d-flex align-items-center">
                  <label className="me-2">{getLabel("Image Alignment")}</label>
                  <div className="btn-group btn-group-sm">
                    <input
                      type="radio"
                      className="btn-check"
                      name={`alignment-${index}`}
                      id={`align-left-${index}`}
                      checked={imageDimensions[index]?.alignment === "left"}
                      onChange={() => handleAlignmentChange("left", index)}
                    />
                    <label
                      className="btn btn-outline-secondary"
                      htmlFor={`align-left-${index}`}
                    >
                      {getLabel("Left")}
                    </label>
                    <input
                      type="radio"
                      className="btn-check"
                      name={`alignment-${index}`}
                      id={`align-center-${index}`}
                      checked={imageDimensions[index]?.alignment === "center"}
                      onChange={() => handleAlignmentChange("center", index)}
                    />
                    <label
                      className="btn btn-outline-secondary"
                      htmlFor={`align-center-${index}`}
                    >
                      {getLabel("Center")}
                    </label>
                    <input
                      type="radio"
                      className="btn-check"
                      name={`alignment-${index}`}
                      id={`align-right-${index}`}
                      checked={imageDimensions[index]?.alignment === "right"}
                      onChange={() => handleAlignmentChange("right", index)}
                    />
                    <label
                      className="btn btn-outline-secondary"
                      htmlFor={`align-right-${index}`}
                    >
                      {getLabel("Right")}
                    </label>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div
            className="img-fluid d-flex align-items-center justify-content-center"
            style={{
              width: "100%",
              minHeight: "150px",
              backgroundColor: "#e9ecef",
              border: "2px dashed #ced4da",
              color: "#6c757d",
            }}
          >
            <span>{getLabel("No banner image selected")}</span>
          </div>
        )}

        {/* Modified: Upload button for adding new images */}
        <div className="mt-3 button-group-mobile-compact justify-content-center">
          <label className="btn btn-outline-secondary btn-sm me-1">
            <i className="bi bi-image"></i> {getLabel("Upload Banner Image")}
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                handleImageUpload(e, updateAndRelayBackgroundImage);
              }}
              id="bannerImageInput"
            />
          </label>
        </div>
      </div>

      {/* Sections */}
      <div className="mt-4">
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
        <button
          className="btn btn-outline-primary mt-3 d-block mx-auto"
          onClick={handleAddSection}
        >
          ➕ {getLabel("Add Section")}
        </button>
      </div>
      <ToastContainer position="bottom-right" autoClose={3000} newestOnTop />
    </div>
  );
};

export default SurveyForm;