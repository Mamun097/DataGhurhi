import axios from "axios";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../CSS/SurveyForm.css";
import CollaborationModal from "../utils/CollaborationModal";
import PublicationSettingsModal from "../utils/publication_modal_settings";
import ShareSurveyModal from "../utils/ShareSurveyModal";
import SurveySections from "./SurveySections";
import SurveyLogo from "./SurveyLogo";
import SurveyBanner from "./SurveyBanner";
import SurveyDescription from "./SurveyDescription";
import apiClient from "../../api";

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
  const [logoAlignment, setLogoAlignment] = useState(logoAlignmentFromParent || "center");
  const [logoText, setLogoText] = useState(logoTextFromParent || "");

  // State for the background image
  const [currentBackgroundImage, setCurrentBackgroundImage] = useState(imageFromParent || "");

  // State for the translated labels
  const [translatedLabels, setTranslatedLabels] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [showCollaborationModal, setShowCollaborationModal] = useState(false);

  // State for the publication modal
  const [showPublicationModal, setShowPublicationModal] = useState(false);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [actionType, setActionType] = useState(""); // 'publish' or 'update'
  const [showShareModal, setShowShareModal] = useState(false);
  const [responseCount, setResponseCount] = useState(null);

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

  useEffect(() => {
    if (!survey_id) {
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Authentication token not found.");
      return;
    }
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    console.log(API_BASE_URL);
    const eventSource = new EventSource(
      `${API_BASE_URL}/api/surveytemplate/stream/${survey_id}?token=${token}`
    );
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.count !== undefined) {
        setResponseCount(data.count);
      }
      if (data.error) {
        console.error("Stream error:", data.error);
        eventSource.close();
      }
    };

    eventSource.onerror = (err) => {
      console.error("EventSource failed:", err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [survey_id]);

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
      url = "/api/surveytemplate";
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

      const response = await apiClient.put(url, payload, {
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
      "/api/surveytemplate/save",
      isLoggedInRequired,
      shuffleQuestions
    );

  const handlePublish = () => handleOpenPublicationModal("publish");

  const handleUpdate = () => handleOpenPublicationModal("update");

  const handleSurveyResponses = () => {
    navigate(`/survey-responses/${survey_id}`, {
      state: { title: title },
    });
  };

  const handlePreview = async () => {
    await handleSave();
    navigate("/preview", {
      state: {
        slug: surveyLink,
      },
    });
  };

  return (
    <div className="px-2 px-md-3 py-5">
      {/* Action Buttons */}
      <div className="button-group-compact">
  {surveyStatus === "published" ? (
    <button
      onClick={handleUpdate}
      disabled={isLoading}
      className="btn-compact"
    >
      {isLoading && actionType === "update" ? (
        <>
          <span className="spinner"></span>
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
        className="btn-compact"
      >
        {isLoading ? (
          <>
            <span className="spinner"></span>
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
        className="btn-compact"
      >
        {isLoading && actionType === "publish" ? (
          <>
            <span className="spinner"></span>
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
        className="btn-compact info"
        title="Share survey link"
      >
        <i className="bi bi-share"></i> {getLabel("Survey Link")}
      </button>

      <button
        onClick={() => setShowCollaborationModal(true)}
        className="btn-compact info"
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
        className="btn-compact success"
      >
        <i className="bi bi-bar-chart"></i>
        <span className="ms-1">{getLabel("View Response")}</span>
        {responseCount !== null && (
          <span className="badge-small">{responseCount}</span>
        )}
      </button>

      <button
        className="btn-compact success"
        onClick={() => handlePreview()}
      >
        <i className="bi bi-eye"></i> {getLabel("Preview")}
      </button>
    </>
  )}
</div>

      <hr className="my-4" />

      {/* Survey Logo */}
      <SurveyLogo
        logo={logo}
        setLogo={setLogo}
        logoAlignment={logoAlignment}
        setLogoAlignment={setLogoAlignment}
        logoText={logoText}
        setLogoText={setLogoText}
        getLabel={getLabel}
        setLogoInParent={setLogo}
      />

      {(logo || currentBackgroundImage) && <hr className="my-4" />}

      {/* Survey Banner */}
      <SurveyBanner
        currentBackgroundImage={currentBackgroundImage}
        setCurrentBackgroundImage={setCurrentBackgroundImage}
        getLabel={getLabel}
        setImageInParent={setCurrentBackgroundImage}
      />

      {currentBackgroundImage && <hr className="my-4" />}

      {/* Survey Title Input */}
      <div className="mt-4 mb-3">
        <input
          type="text"
          className="form-control text-center border-black"
          placeholder={getLabel("Enter Survey Title")}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onFocus={(e) => e.target.select()}
          style={{
            color: "#333",
            fontWeight: "bold",
            borderRadius: "4px",
          }}
        />
      </div>

      {/* Survey Description */}
      <SurveyDescription
        description={description}
        setDescription={setDescription}
        getLabel={getLabel}
      />

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