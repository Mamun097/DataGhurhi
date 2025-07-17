import React, { useState, useEffect, useMemo } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../CSS/SurveyForm.css";
import { handleImageUpload } from "../utils/handleImageUpload";
import SurveySections from "./SurveySections";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PublicationSettingsModal from "../utils/publication_modal_settings";
import ShareSurveyModal from "../utils/ShareSurveyModal";
import CollaborationModal from "../utils/CollaborationModal";

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
  logo: logoFromParent,
  logoAlignment: logoAlignmentFromParent,
  logoText: logoTextFromParent,
  image: imageFromParent,
  project_id,
  survey_id,
  surveyStatus,
  surveyLink,
  description,
  setDescription,
  language,
  setLanguage,
  isLoggedInRequired = false,
  setIsLoggedInRequired,
}) => {
  // State for the logo
  const [logo, setLogo] = useState(logoFromParent);
  const [logoAlignment, setLogoAlignment] = useState(logoAlignmentFromParent || "left");
  const [logoText, setLogoText] = useState(logoTextFromParent || "");

  // State for the background image
  const [currentBackgroundImage, setCurrentBackgroundImage] = useState(
    imageFromParent || ""
  );

  useEffect(() => {
    setLogo(logoFromParent || null);
    setLogoAlignment(logoAlignmentFromParent || "left");
    setLogoText(logoTextFromParent || "");
    setCurrentBackgroundImage(imageFromParent || "");
  }, [
    logoFromParent,
    logoAlignmentFromParent,
    logoTextFromParent,
    imageFromParent,
  ]);

  // State for the translated labels
  const [translatedLabels, setTranslatedLabels] = useState({});

  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [showCollaborationModal, setShowCollaborationModal] = useState(false);

  // State for the description editing
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [localDescriptionText, setLocalDescriptionText] = useState(
    description || ""
  );

  // State for the publication modal
  const [showPublicationModal, setShowPublicationModal] = useState(false);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [actionType, setActionType] = useState(""); // 'publish' or 'update'
  const [showShareModal, setShowShareModal] = useState(false);

  const labelsToTranslate = useMemo(
    () => [
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
      "Date",
      "Time",
      "Select Date/Time",
      "Preview",
    ],
    []
  );

  const getLabel = (text) => translatedLabels[text] || text;

  useEffect(() => {
    setLogo(logoFromParent || null);
    setCurrentBackgroundImage(imageFromParent || "");
  }, [logoFromParent, imageFromParent]);

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
          // Fallback to English if translation fails
          const englishMap = {};
          labelsToTranslate.forEach((label) => (englishMap[label] = label));
          setTranslatedLabels(englishMap);
        }
      }
    };
    loadTranslations();
  }, [language, labelsToTranslate]);

  // Function to update the logo and relay it to the parent component
  const updateAndRelayLogo = (newLogo) => {
    setLogo(newLogo);
    if (setLogoInParent) {
      setLogoInParent(newLogo);
    }
  };

  // Function to handle Logo alignment changes
  const handleLogoAlignmentChange = (alignment) => {
    if (["left", "center", "right"].includes(alignment)) {
      setLogoAlignment(alignment);
    }
  };

  // Function to update the background image and relay it to the parent component
  const updateAndRelayBackgroundImage = (newImageSrc) => {
    setCurrentBackgroundImage(newImageSrc);
    if (setImageInParent) {
      setImageInParent(newImageSrc);
    }
  };

  const handleAddSection = () => {
    const newSectionId =
      sections.length > 0 ? Math.max(...sections.map((s) => s.id)) + 1 : 1;
    const newSection = { id: newSectionId, title: "", questions: [] };
    setSections([...sections, newSection]);
  };

  // Function to remove the current logo
  const handleRemoveLogo = () => {
    updateAndRelayLogo(null);
    const fileInput = document.getElementById("bannerLogoInput");
    if (fileInput) {
      fileInput.value = "";
    }
  };

  // Function to remove the current background image
  const handleRemoveImage = () => {
    updateAndRelayBackgroundImage("");
    const fileInput = document.getElementById("bannerImageInput");
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
    setLocalDescriptionText("");
    setIsEditingDescription(false);
  };

  const handleOpenPublicationModal = (action) => {
    setActionType(action);
    setShowPublicationModal(true);
  };

  const handleClosePublicationModal = () => {
    setShowPublicationModal(false);
  };

  const handleConfirmPublication = (isLoggedIn, isShuffled) => {
    setShowPublicationModal(false);
    setIsLoggedInRequired(isLoggedIn);
    setShuffleQuestions(isShuffled);
    let url;
    if (actionType === "publish" || actionType === "update") {
      url = "http://localhost:2000/api/surveytemplate";
    } else {
      console.error("Invalid action type for publication.");
      return;
    }
    sendSurveyData(url, isLoggedIn, isShuffled);
  };

  const sendSurveyData = async (url, isLoggedInStatus, isShuffled) => {
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
          logo: logo,
          logoAlignment: logoAlignment,
          logoText: logoText,
          backgroundImage: currentBackgroundImage,
          title,
          description: description,
          questions,
        },
        title: title,
        user_id: userIdInPayload,
        response_user_logged_in_status: isLoggedInStatus,
        shuffle_questions: isShuffled,
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
    sendSurveyData(
      "http://localhost:2000/api/surveytemplate/save",
      isLoggedInRequired,
      shuffleQuestions
    );

  const handlePublish = () => handleOpenPublicationModal("publish");

  const handleUpdate = () => handleOpenPublicationModal("update");

  const handleSurveyResponses = () => {
    // send survey title
    navigate(`/survey-responses/${survey_id}`, {
      state: { title: title },
    });
  };

  const handlePreview = async () => {
    // save all data and navigate to preview
    await handleSave();
    // After saving, navigate to preview with all necessary data
    navigate("/preview", {
      state: {
        title: title,
        sections: sections,
        questions: questions,
        logo: logo,
        logoAlignment: logoAlignment,
        logoText: logoText,
        image: currentBackgroundImage,
        description: description,
        language: language,
      },
    });
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
            {isLoading && actionType === "update" ? (
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
              {isLoading && actionType === "publish" ? (
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
            <button
              onClick={() => setShowShareModal(true)}
              className="btn btn-outline-info btn-sm me-2"
              title="Share survey link"
            >
              <i className="bi bi-share"></i> {getLabel("Share Survey")}
            </button>
            <button
              onClick={() => setShowCollaborationModal(true)}
              className="btn btn-outline-warning btn-sm me-2"
              title="Manage collaborators"
            >
              <i className="bi bi-people"></i> {getLabel("Collaborate")}
            </button>

            <ShareSurveyModal
              show={showShareModal}
              handleClose={() => setShowShareModal(false)}
              surveyLink={surveyLink}
              surveyTitle={title}
            />
            <button
              onClick={handleSurveyResponses}
              className="btn btn-outline-info btn-sm me-2"
            >
              <i className="bi bi-bar-chart"></i> {getLabel("View Response")}
            </button>
            <button
              className="btn btn-outline-secondary btn-sm me-2"
              onClick={() => handlePreview()}
            >
              <i className="bi bi-eye"></i> {getLabel("Preview")}
            </button>
          </>
        )}
      </div>

      {/* Survey Logo */}
      <div
        style={{
          backgroundColor: "#f8f9fa",
          paddingTop: "20px",
        }}
        className="shadow border-0 rounded-lg"
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            textAlign:
              logoAlignment === "left"
                ? "left"
                : logoAlignment === "center"
                ? "center"
                : "right",
          }}
        >
          {logo ? (
            <img
              src={logo}
              alt={getLabel("Survey Logo") || "Survey Logo"}
              className="img-fluid"
              style={{
                maxHeight: "200px",
                objectFit: "cover",
                display: "inline-block",
              }}
            />
          ) : (
            <div
              className="d-flex align-items-center justify-content-center"
              style={{
                width: "100%",
                minHeight: "400px",
                backgroundColor: "#e9ecef",
                border: "2px dashed #ced4da",
                color: "#6c757d",
              }}
            >
              <span className="text-muted">{getLabel("No Logo Uploaded")}</span>
            </div>
          )}
        </div>

        {/* Logo Controls */}
        <div className="mt-3 d-flex flex-column align-items-center">
          {/* Upload & Remove Buttons */}
          <div className="mt-3 button-group-mobile-compact justify-content-center">
            <label className="btn btn-outline-secondary btn-sm me-1">
              <i className="bi bi-image me-2"></i> {getLabel("Upload Logo")}
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  handleImageUpload(e, updateAndRelayLogo);
                }}
                id="bannerLogoInput"
              />
            </label>
            {logo && (
              <button
                className="btn btn-outline-danger btn-sm me-1"
                onClick={handleRemoveLogo}
                title={getLabel("Remove current Logo")}
              >
                <i className="bi bi-trash"></i> {getLabel("Remove Logo")}
              </button>
            )}
          </div>

          {/* Alignment Buttons */}
          {logo && (
            <div className="mt-2 button-group-mobile-compact justify-content-center">
              {["left", "center", "right"].map((align) => (
                <button
                  key={align}
                  className={`btn btn-sm me-1 ${
                    logoAlignment === align
                      ? "btn-primary"
                      : "btn-outline-primary"
                  }`}
                  onClick={() => handleLogoAlignmentChange(align)}
                >
                  {align.charAt(0).toUpperCase() + align.slice(1)}
                </button>
              ))}
            </div>
          )}

          {/* Logo Text Input */}
          {logo && (logoAlignment === "left" || logoAlignment === "right") && (
            <div className="mt-3 w-100">
              <textarea
                rows="4"
                className="form-control text-center shadow-sm"
                placeholder={getLabel(
                  "Enter Logo Text - aligned left or right automatically"
                )}
                value={logoText}
                onChange={(e) => setLogoText(e.target.value)}
                style={{
                  color: "#333",
                  fontWeight: "bold",
                  borderRadius: "8px",
                  border: "2px solid #e9ecef",
                  padding: "12px 16px",
                }}
              />
            </div>
          )}

          {logo && logoAlignment === "center" && (
            <div className="mt-3 w-100">
              <input
                type="text"
                className="form-control text-center"
                placeholder={getLabel(
                  "Enter Logo Text - aligned below automatically"
                )}
                value={logoText}
                onChange={(e) => setLogoText(e.target.value)}
                style={{
                  color: "#333",
                  fontWeight: "bold",
                  borderRadius: "4px",
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Survey Banner */}
      <div
        style={{ backgroundColor: "white", paddingBottom: "20px" }}
        className="shadow-sm rounded mt-4"
      >
        <div style={{ position: "relative", width: "100%" }}>
          {currentBackgroundImage ? (
            <img
              src={currentBackgroundImage}
              alt={getLabel("Survey Banner") || "Survey Banner"}
              className="img-fluid"
              style={{
                width: "100%",
                height: "auto",
                maxHeight: "400px",
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              className="img-fluid d-flex align-items-center justify-content-center"
              style={{
                width: "100%",
                height: "auto",
                minHeight: "400px",
                backgroundColor: "#e9ecef",
                border: "2px dashed #ced4da",
                color: "#6c757d",
              }}
            >
              {/* <span>{getLabel("No banner image selected")}</span> */}
            </div>
          )}
          {/* <input
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
          /> */}
        </div>

        {/* Banner and Description Controls */}
        <div className="mt-3 button-group-mobile-compact justify-content-center">
          <label className="btn btn-outline-secondary btn-sm me-1">
            <i className="bi bi-image me-2"></i>{" "}
            {getLabel("Upload Banner Image")}
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
          {currentBackgroundImage && (
            <button
              className="btn btn-outline-danger btn-sm me-1"
              onClick={handleRemoveImage}
              title={getLabel("Remove current banner image")}
            >
              <i className="bi bi-trash"></i> {getLabel("Remove Banner")}
            </button>
          )}
        </div>
      </div>

      {/* Title Input */}
      <div className="mt-4 text-center shadow border-0 rounded-lg">
        <div className="mb-3">
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

        {!description && !isEditingDescription && (
          <button
            className="btn btn-outline-info btn-sm"
            onClick={handleAddOrEditDescriptionClick}
          >
            <i className="bi bi-plus-circle me-2"></i>{" "}
            {getLabel("Add Description")}
          </button>
        )}
      </div>

      <div
        style={{ backgroundColor: "#f8f9fa" }}
        className="shadow border-0 rounded-lg"
      >
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
              <button
                className="btn btn-primary btn-sm"
                onClick={handleSaveDescription}
              >
                <i className="bi bi-save me-1"></i>{" "}
                {getLabel("Save Description")}
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
      </div>

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

      {/* Render the modal */}
      <PublicationSettingsModal
        show={showPublicationModal}
        handleClose={handleClosePublicationModal}
        handleConfirm={handleConfirmPublication}
        isLoggedInRequired={isLoggedInRequired}
        shuffleQuestions={shuffleQuestions}
        setShuffleQuestions={setShuffleQuestions}
        action={actionType}
      />
      <CollaborationModal
        show={showCollaborationModal}
        handleClose={() => setShowCollaborationModal(false)}
        surveyId={Number(survey_id)}
        surveyTitle={title}
      />
      <ToastContainer position="bottom-right" autoClose={3000} newestOnTop />
    </div>
  );
};

export default SurveyForm;
