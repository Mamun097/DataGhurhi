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
import SettingsModal from "./SurveySettings";
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
  load,
  useCustom,
  setUseCustom,
  title,
  setTitle,
  image,
  project_id,
  survey_id,
  surveyStatus,
  language,
  setLanguage,
  template,
  survey,
}) => {
  const navigate = useNavigate();
  console.log("SUrvey Status:", surveyStatus);
  // State for the logo
  const [logo, setLogo] = useState(template?.logo ?? null);
  const [logoAlignment, setLogoAlignment] = useState(
    template?.logoAlignment ?? "center"
  );
  const [logoText, setLogoText] = useState(template?.logoText ?? "");

  // State for the background image
  const [currentBackgroundImage, setCurrentBackgroundImage] = useState(
    image ?? ""
  );

  // State for description
  const [description, setDescription] = useState(template?.description ?? "");

  // State for Sections
  const [sections, setSections] = useState(template?.sections ?? []);

  // State for Questions
  const [questions, setQuestions] = useState(template?.questions ?? []);

  // State for the translated labels
  const [translatedLabels, setTranslatedLabels] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // State for Collaboration Modal
  const [showCollaborationModal, setShowCollaborationModal] = useState(false);

  // State for the publication modal
  const [showPublicationModal, setShowPublicationModal] = useState(false);
  const [actionType, setActionType] = useState(""); // 'publish' or 'update'

  // State for Survey Share modal.
  const [showShareModal, setShowShareModal] = useState(false);
  const [surveyLink, setSurveyLink] = useState(survey?.survey_link || null);

  const [responseCount, setResponseCount] = useState(null);

  // State for survey settings
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  // Functions for Survey Settings Modal
  const openSettingsModal = () => setShowSettingsModal(true);
  const closeSettingsModal = () => setShowSettingsModal(false);

  const [isLoggedInRequired, setIsLoggedInRequired] = useState(
    survey?.response_user_logged_in_status || null
  );
  const [shuffleQuestions, setShuffleQuestions] = useState(
    survey?.shuffle_questions || false
  );

  // State for Quiz settings
  const [isQuiz, setIsQuiz] = useState(template?.is_quiz || false);
  const [startTime, setStartTime] = useState(
    template?.quiz_settings?.start_time || null
  );
  const [endTime, setEndTime] = useState(
    template?.quiz_settings?.end_time || null
  );

  const [releaseMarks, setReleaseMarks] = useState(
    template?.quiz_settings?.release_marks || "immediately"
  ); // 'immediately' or 'later'
  const [seeMissedQuestions, setSeeMissedQuestions] = useState(
    template?.quiz_settings?.see_missed_questions || false
  );
  const [seeCorrectAnswers, setSeeCorrectAnswers] = useState(
    template?.quiz_settings?.see_correct_answers || false
  );
  const [seePointValues, setSeePointValues] = useState(
    template?.quiz_settings?.see_point_values || false
  );
  const [defaultPointValue, setDefaultPointValue] = useState(
    template?.quiz_settings?.default_point_value || 0
  );
  const [totalMarks, setTotalMarks] = useState(template?.total_marks || 0);

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
    if (template || survey) {
      const tpl = template || survey?.template || {};
      const srv = survey || {};

      setSections(tpl.sections ?? srv.sections ?? []);
      setQuestions(tpl.questions ?? srv.questions ?? []);
      setLogo(tpl.logo ?? srv.logo ?? null);
      setLogoAlignment(tpl.logoAlignment ?? srv.logoAlignment ?? "left");
      setLogoText(tpl.logoText ?? srv.logoText ?? "");
      setCurrentBackgroundImage(
        tpl.backgroundImage ?? srv.backgroundImage ?? image ?? ""
      );
      setDescription(tpl.description ?? srv.description ?? "");
      setIsLoggedInRequired(
        srv.response_user_logged_in_status ?? tpl.isLoggedInRequired ?? false
      );

      // Quiz related
      setIsQuiz(tpl.is_quiz ?? srv.is_quiz ?? false);
      setStartTime(
        tpl.quiz_settings?.start_time ?? srv.quiz_settings?.start_time ?? null
      );
      setEndTime(
        tpl.quiz_settings?.end_time ?? srv.quiz_settings?.end_time ?? null
      );
      setReleaseMarks(
        tpl.quiz_settings?.release_marks ??
          srv.quiz_settings?.release_marks ??
          "immediately"
      );
      setSeeMissedQuestions(
        tpl.quiz_settings?.see_missed_questions ??
          srv.quiz_settings?.see_missed_questions ??
          false
      );
      setSeeCorrectAnswers(
        tpl.quiz_settings?.see_correct_answers ??
          srv.quiz_settings?.see_correct_answers ??
          false
      );
      setSeePointValues(
        tpl.quiz_settings?.see_point_values ??
          srv.quiz_settings?.see_point_values ??
          false
      );
      setDefaultPointValue(
        tpl.quiz_settings?.default_point_value ??
          srv.quiz_settings?.default_point_value ??
          0
      );
      setTotalMarks(tpl.total_marks ?? srv.total_marks ?? 0);

      // Publication / survey meta
      setShuffleQuestions(
        srv.shuffle_questions ?? tpl.shuffle_questions ?? false
      );
      setSurveyLink(srv.survey_link ?? tpl.survey_link ?? null);
      setResponseCount(srv.response_count ?? null);

      // modals / UI flags
      setShowCollaborationModal(false);
      setShowPublicationModal(false);
      setShowShareModal(false);
      setShowSettingsModal(false);
    }
  }, [template, survey, image]);

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

  const handleConfirmPublication = () => {
    setShowPublicationModal(false);

    let url;
    if (actionType === "publish" || actionType === "update") {
      url = "/api/surveytemplate";
    } else {
      console.error("Invalid action type for publication.");
      return;
    }
    sendSurveyData(url, isLoggedInRequired, shuffleQuestions);
  };

  const sendSurveyData = async (url, isLoggedInStatus, isShuffled) => {
    setIsLoading(true);
    let userIdInPayload = null;
    const bearerTokenString = localStorage.getItem("token");

    if (!bearerTokenString) {
      toast.error("Authentication token not found. Please log in.");
      console.error("No bearer token in localStorage");
      return;
    }

    const token = bearerTokenString.startsWith("{")
      ? JSON.parse(bearerTokenString).token
      : bearerTokenString;

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
          is_quiz: isQuiz,
          quiz_settings: {
            release_marks: releaseMarks,
            see_missed_questions: seeMissedQuestions,
            see_correct_answers: seeCorrectAnswers,
            see_point_values: seePointValues,
            default_point_value: defaultPointValue,
            start_time: startTime,
            end_time: endTime,
            total_marks: totalMarks,
          },
          isLoggedInRequired: isLoggedInRequired,
          shuffleQuestions: shuffleQuestions,
        },
        title: title,
        user_id: userIdInPayload,
        response_user_logged_in_status: isLoggedInStatus,
        shuffle_questions: isShuffled,
        banner: currentBackgroundImage,
      };

      const response = await apiClient.put(url, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200 || response.status === 201) {
        const isSave = url.includes("save");
        const isUpdate = surveyStatus === "published";

        // let successMessageKey = "Survey updated successfully!";
        // if (isSave) {
        //   successMessageKey = "Survey Saved successfully!";
        // } else if (!isUpdate) {
        //   successMessageKey = "Survey Published successfully!";
        // }
        // toast.success(getLabel(successMessageKey));
        if (!isSave && surveyStatus === "saved") {
          load();
          navigate(`/view-survey/${survey_id}`, {
            state: {
              project_id: project_id,
              input_title: title || "Untitled Survey",
              survey_status: "published",
            },
          });
        }

        if (!useCustom) {
          setUseCustom(true);
          let status = "";
          if (isSave) {
            status = "saved";
          } else {
            status = "published";
          }
          navigate(`/view-survey/${survey_id}`, {
            state: {
              project_id: project_id,
              input_title: title || "Untitled Survey",
              survey_status: status,
            },
          });
        }
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

  // If survey is already published, then sendSurveyData is used, otherwise handleSave is used
  const handlePreview = async () => {
    if (surveyStatus !== "published") {
      // Save the survey first
      setIsLoading(true);
      await handleSave();
      setIsLoading(false);
    } else {
      setIsLoading(true);
      await sendSurveyData(
        "/api/surveytemplate",
        isLoggedInRequired,
        shuffleQuestions
      );
      setIsLoading(false);
    }

    // Navigate to preview page
    navigate("/preview", {
      state: {
        slug: surveyLink,
      },
    });
  };

  return (
    <div className="px-2 px-md-3 " style={{ paddingTop: "100px" }}>
      {/* Action Buttons */}
      {/* Floating Top Navigation Bar */}
      <div className="floating-top-bar">
        {surveyStatus === "published" ? (
          <button
            onClick={handleUpdate}
            disabled={isLoading}
            className="fab-btn"
          >
            {isLoading && actionType === "update" ? (
              <span className="spinner"></span>
            ) : (
              <>
                <i className="bi bi-pencil"></i>
                <span className="btn-label">{getLabel("Update")}</span>
              </>
            )}
          </button>
        ) : (
          <>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="fab-btn"
            >
              {isLoading ? (
                <span className="spinner"></span>
              ) : (
                <>
                  <i className="bi bi-save"></i>
                  <span className="btn-label">{getLabel("Save")}</span>
                </>
              )}
            </button>

            <button
              onClick={handlePublish}
              disabled={isLoading}
              className="fab-btn"
            >
              {isLoading && actionType === "publish" ? (
                <span className="spinner"></span>
              ) : (
                <>
                  <i className="bi bi-check-circle"></i>
                  <span className="btn-label">{getLabel("Publish")}</span>
                </>
              )}
            </button>
          </>
        )}
        <button
          onClick={() => setShowCollaborationModal(true)}
          className="fab-btn"
        >
          <i className="bi bi-people"></i>
          <span className="btn-label">{getLabel("Collaborate")}</span>
        </button>

        {surveyStatus == "published" && (
          <button onClick={() => handlePreview()} className="fab-btn">
            <i className="bi bi-eye"></i>
            <span className="btn-label">{getLabel("Preview")}</span>
          </button>
        )}

        {surveyLink && (
          <>
            <button onClick={() => setShowShareModal(true)} className="fab-btn">
              <i className="bi bi-share"></i>
              <span className="btn-label">{getLabel("Survey Link")}</span>
            </button>

            <button onClick={handleSurveyResponses} className="fab-btn">
              <i className="bi bi-bar-chart"></i>
              <span className="btn-label">{getLabel("View Response")}</span>
              {responseCount !== null && (
                <span className="badge-small">{responseCount}</span>
              )}
            </button>
          </>
        )}
        <button onClick={openSettingsModal} className="fab-btn">
          <i className="bi bi-gear"></i>
          <span className="btn-label">{getLabel("Settings")}</span>
        </button>
      </div>

      <hr className="my-4 custom-hr" />

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

      {(logo || currentBackgroundImage) && <hr className="my-4 custom-hr" />}

      {/* Survey Banner */}
      <SurveyBanner
        currentBackgroundImage={currentBackgroundImage}
        setCurrentBackgroundImage={setCurrentBackgroundImage}
        getLabel={getLabel}
        setImageInParent={setCurrentBackgroundImage}
      />

      {currentBackgroundImage && <hr className="my-4 custom-hr" />}

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
            isQuiz={isQuiz}
            defaultPointValue={defaultPointValue}
            totalMarks={totalMarks}
            setTotalMarks={setTotalMarks}
          />
        ))}
        <div className="text-center my-4">
          <button className="add-sec-btn" onClick={handleAddSection}>
            ➕ {getLabel("Add Section")}
          </button>
        </div>
      </div>

      {/* Render the modal */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={closeSettingsModal}
        isLoggedInRequired={isLoggedInRequired}
        setIsLoggedInRequired={setIsLoggedInRequired}
        shuffleQuestions={shuffleQuestions}
        setShuffleQuestions={setShuffleQuestions}
        isQuiz={isQuiz}
        setIsQuiz={setIsQuiz}
        startTime={startTime}
        setStartTime={setStartTime}
        endTime={endTime}
        setEndTime={setEndTime}
        releaseMarks={releaseMarks}
        setReleaseMarks={setReleaseMarks}
        seeMissedQuestions={seeMissedQuestions}
        setSeeMissedQuestions={setSeeMissedQuestions}
        seeCorrectAnswers={seeCorrectAnswers}
        setSeeCorrectAnswers={setSeeCorrectAnswers}
        seePointValues={seePointValues}
        setSeePointValues={setSeePointValues}
        defaultPointValue={defaultPointValue}
        setDefaultPointValue={setDefaultPointValue}
      />

      <PublicationSettingsModal
        isOpen={showPublicationModal}
        onClose={handleClosePublicationModal}
        handleConfirm={handleConfirmPublication}
        action={actionType}
      />

      <CollaborationModal
        isOpen={showCollaborationModal}
        onClose={() => setShowCollaborationModal(false)}
        surveyId={Number(survey_id)}
        surveyTitle={title}
      />
      <ShareSurveyModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        surveyLink={surveyLink}
        surveyTitle={title}
      />
      <ToastContainer position="bottom-right" autoClose={2000} newestOnTop />
    </div>
  );
};

export default SurveyForm;
