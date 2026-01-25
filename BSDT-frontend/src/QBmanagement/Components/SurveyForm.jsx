import React, { useState, useEffect, useRef } from "react";
import SurveyQuestions from "./SurveyQuestions";
import AddQuestion from "./AddNewQuestion";
import Option from "../QuestionTypes/QuestionSpecificUtils/OptionClass";
import "../CSS/QuestionBank.css";
import axios from "axios";

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY;

// Language configurations matching Dashboard
const LANGUAGES = [
  { code: "en", name: "ENGLISH", flag: "🇬🇧", googleCode: "en" },
  { code: "bn", name: "বাংলা", flag: "🇧🇩", googleCode: "bn" },
  { code: "zh", name: "中文", flag: "🇨🇳", googleCode: "zh-CN" }, // Mandarin Chinese
  { code: "hi", name: "हिन्दी", flag: "🇮🇳", googleCode: "hi" },
  { code: "es", name: "ESPAÑOL", flag: "🇪🇸", googleCode: "es" },
  { code: "ar", name: "العربية", flag: "🇸🇦", googleCode: "ar" },
  { code: "fr", name: "FRANÇAIS", flag: "🇫🇷", googleCode: "fr" },
  { code: "pt", name: "PORTUGUÊS", flag: "🇵🇹", googleCode: "pt" },
  { code: "ru", name: "РУССКИЙ", flag: "🇷🇺", googleCode: "ru" },
  { code: "ur", name: "اردو", flag: "🇵🇰", googleCode: "ur" },
  { code: "id", name: "BAHASA INDONESIA", flag: "🇮🇩", googleCode: "id" },
  { code: "de", name: "DEUTSCH", flag: "🇩🇪", googleCode: "de" },
  { code: "ja", name: "日本語", flag: "🇯🇵", googleCode: "ja" },
  { code: "sw", name: "KISWAHILI", flag: "🇰🇪", googleCode: "sw" },
  { code: "mr", name: "मराठी", flag: "🇮🇳", googleCode: "mr" },
  { code: "te", name: "తెలుగు", flag: "🇮🇳", googleCode: "te" },
  { code: "tr", name: "TÜRKÇE", flag: "🇹🇷", googleCode: "tr" },
  { code: "ta", name: "தமிழ்", flag: "🇮🇳", googleCode: "ta" },
  { code: "vi", name: "TIẾNG VIỆT", flag: "🇻🇳", googleCode: "vi" },
  { code: "ko", name: "한국어", flag: "🇰🇷", googleCode: "ko" },
  { code: "it", name: "ITALIANO", flag: "🇮🇹", googleCode: "it" },
  { code: "th", name: "ไทย", flag: "🇹🇭", googleCode: "th" },
  { code: "gu", name: "ગુજરાતી", flag: "🇮🇳", googleCode: "gu" },
  { code: "fa", name: "فارسی", flag: "🇮🇷", googleCode: "fa" },
  { code: "pl", name: "POLSKI", flag: "🇵🇱", googleCode: "pl" },
  { code: "uk", name: "УКРАЇНСЬКА", flag: "🇺🇦", googleCode: "uk" },
  { code: "kn", name: "ಕನ್ನಡ", flag: "🇮🇳", googleCode: "kn" },
  { code: "ml", name: "മലയാളം", flag: "🇮🇳", googleCode: "ml" },
  { code: "or", name: "ଓଡ଼ିଆ", flag: "🇮🇳", googleCode: "or" },
  { code: "my", name: "မြန်မာ", flag: "🇲🇲", googleCode: "my" },
  // Additional major African languages (if not already included)
  { code: "ha", name: "HAUSA", flag: "🇳🇬", googleCode: "ha" },
  { code: "yo", name: "YORÙBÁ", flag: "🇳🇬", googleCode: "yo" },
  { code: "am", name: "አማርኛ", flag: "🇪🇹", googleCode: "am" },
];

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

const SurveyForm = ({ questions, setQuestions, activeTab, language, setLanguage, getLabel: parentGetLabel }) => {
  const [newQuestion, setNewQuestion] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [groupByProject, setGroupByProject] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchLogic, setSearchLogic] = useState("intersection");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [searchFields, setSearchFields] = useState({
    keyword: true,
    project: false,
    tag: false,
    type: false,
    survey: false,
    owner: false,
  });
  const [showSearchFilters, setShowSearchFilters] = useState(false);
  const [translatedLabels, setTranslatedLabels] = useState({});

  const bottomRef = useRef(null);
  const userId = parseInt(localStorage.getItem("userId"), 10);

  const addNewQuestion = (type) => {
    console.log("Adding new question of type:", type);
    const baseQuestion = {
      user_id: userId,
      text: "Enter your question here",
      type,
      image: null,
      meta: {},
      privacy: "private",
      new: true,
    };

    switch (type) {
      case "radio":
        baseQuestion.meta.options = [
          new Option("Option 1", 0),
          new Option("Option 2", 0),
        ];
        break;
      case "checkbox":
        baseQuestion.meta.options = ["Option 1", "Option 2"];
        break;
      case "dropdown":
        baseQuestion.meta.options = ["Option 1", "Option 2"];
        break;
      case "tickboxGrid":
        baseQuestion.meta.rows = ["Row 1", "Row 2"];
        baseQuestion.meta.columns = ["Column 1", "Column 2"];
        break;
      case "linearScale":
        baseQuestion.meta = {
          min: 1,
          max: 5,
          leftLabel: "Poor",
          rightLabel: "Excellent",
        };
        break;
      case "rating":
        baseQuestion.meta.scale = 5;
        break;
      case "datetime":
        baseQuestion.meta.dateType = "date";
        break;
      case "likert":
        baseQuestion.meta.rows = ["Subtext 1", "Subtext 2", "Subtext 3"];
        baseQuestion.meta.columns = [
          "Strongly Disagree",
          "Disagree",
          "Neutral",
          "Agree",
          "Strongly Agree",
        ];
        break;
      case "text":
        baseQuestion.meta.options = [];
        break;
      default:
        break;
    }

    const updatedQuestions = [...questions, baseQuestion];
    setQuestions(updatedQuestions);

    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const typeAlias = {
    radio: "mcq",
    checkbox: "checkbox",
    dropdown: "dropdown",
    linearScale: "linear scale",
    likert: "likert",
    rating: "rating",
    datetime: "date",
    text: "text",
    tickboxGrid: "grid",
  };

  const detectLanguage = (text) => {
    const banglaRegex = /[\u0980-\u09FF]/;
    return banglaRegex.test(text) ? "bn" : "en";
  };

  const filteredQuestions = questions
    .filter((q) => {
      const keywords = searchTerm
        .toLowerCase()
        .split(" ")
        .map((k) => k.trim())
        .filter(Boolean);
      if (keywords.length === 0) return true;

      const typeAliasText = typeAlias[q.type] || q.type;

      const fieldMatchers = {
        keyword: [
          q.text,
          q.type,
          typeAliasText,
          q.privacy,
          JSON.stringify(q.meta),
        ]
          .join(" ")
          .toLowerCase(),
        project: (q.project_name || "").toLowerCase(),
        type: typeAliasText.toLowerCase(),
        tag: (q.tags || []).join(" ").toLowerCase(),
        survey: (q.survey_name || "").toLowerCase(),
        owner: (q.owner_name || "").toLowerCase(),
      };

      const selectedFields = Object.keys(searchFields).filter(
        (key) => searchFields[key]
      );

      if (selectedFields.length === 0) {
        const fallbackCombined = Object.values(fieldMatchers).join(" ");
        return keywords.every((kw) => fallbackCombined.includes(kw));
      }

      if (searchLogic === "intersection") {
        return keywords.every((kw) =>
          selectedFields.some((field) => fieldMatchers[field]?.includes(kw))
        );
      } else {
        return keywords.some((kw) =>
          selectedFields.some((field) => fieldMatchers[field]?.includes(kw))
        );
      }
    })
    .filter((q) => {
      if (filter === "mine") return q.user_id === userId;
      if (filter === "public")
        return q.privacy === "public" && q.user_id !== userId;
      return true;
    })
    .filter((q) => {
      if (languageFilter === "all") return true;
      return detectLanguage(q.text) === languageFilter;
    });

  // Load translations (same pattern as Dashboard)
  const loadTranslations = async () => {
    if (language === "en") {
      setTranslatedLabels({});
      return;
    }

    const labelsToTranslate = [
      "My Questions",
      "Shared with Me",
      "Search Filter",
      "Filters",
      "All",
      "My Questions",
      "Users' Questions",
      "Loading questions…",
      "Search anything (e.g., keyword, project name)",
      "Search In:",
      "Keyword",
      "Project Name",
      "Type",
      "Tag",
      "Survey Name",
      "Owner Name",
      "Add Question",
      "Question Type",
      "Question Text",
      "Add Option",
      "Add Row",
      "Add Column",
      "Delete",
      "Save Question",
      "Result Option:",
      "Both keyword",
      "Any selected keyword",
      "Language",
      "All Languages",
      "English",
      "Bangla",
      "Question Type",
    ];

    // Get the Google Translate language code for the current language
    const currentLangObj = LANGUAGES.find(l => l.code === language);
    const targetLang = currentLangObj ? currentLangObj.googleCode : "en";

    const translations = await translateText(labelsToTranslate, targetLang);
    const translated = {};
    labelsToTranslate.forEach((key, idx) => {
      translated[key] = translations[idx];
    });
    setTranslatedLabels(translated);
  };

  useEffect(() => {
    loadTranslations();
  }, [language]);

  // Use parent getLabel if provided, otherwise use local one
  const getLabel = (text) => {
    if (parentGetLabel) {
      return parentGetLabel(text);
    }
    return language === "en" ? text : translatedLabels[text] || text;
  };

  return (
    <div>
      <div className="d-flex align-items-start mb-3 gap-2">
        <input
          type="text"
          placeholder={getLabel(
            "Search anything (e.g., keyword, project name)"
          )}
          className="form-control"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="position-relative">
          <button
            className="btn btn-outline-secondary"
            onClick={() => setShowSearchFilters((prev) => !prev)}
          >
            <i className="bi bi-search"></i> {getLabel("Search Filter")}
          </button>

          {showSearchFilters && (
            <div
              className="card p-4 position-absolute"
              style={{
                zIndex: 1000,
                top: "110%",
                right: 0,
                minWidth: "240px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            >
              <label className="fw-bold small mb-2">
                {getLabel("Search In:")}
              </label>
              <div className="d-flex flex-column gap-2">
                {[
                  { label: getLabel("Keyword"), key: "keyword" },
                  { label: getLabel("Project Name"), key: "project" },
                  { label: getLabel("Question Type"), key: "type" },
                  { label: getLabel("Tag"), key: "tag" },
                  { label: getLabel("Survey Name"), key: "survey" },
                  { label: getLabel("Owner Name"), key: "owner" },
                ].map(({ label, key }) => (
                  <div className="form-check form-check-sm m-0 p-0" key={key}>
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`search-${key}`}
                      style={{ transform: "scale(0.85)" }}
                      checked={searchFields[key]}
                      onChange={() =>
                        setSearchFields((prev) => ({
                          ...prev,
                          [key]: !prev[key],
                        }))
                      }
                    />
                    <label
                      className="form-check-label small ms-1"
                      htmlFor={`search-${key}`}
                    >
                      {label}
                    </label>
                  </div>
                ))}
                <hr />
                <div className="form-check form-check-sm m-0 p-0">
                  <label className="form-check-label small mb-2">
                    {getLabel("Result Option:")}
                  </label>
                  <div className="d-flex align-items-center">
                    <select
                      className="form-select form-select-sm me-2"
                      value={searchLogic}
                      onChange={(e) => setSearchLogic(e.target.value)}
                    >
                      <option value="intersection">
                        {getLabel("Both keyword")}
                      </option>
                      <option value="union">
                        {getLabel("Any selected keyword")}
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="position-relative">
          <select
            className="form-select form-select-sm"
            style={{
              zIndex: 1000,
              top: "110%",
              width: "140px",
              display: "inline-block",
              marginLeft: "0px",
              marginRight: "0px",
              backgroundColor: "#ffffff",
              borderColor: "#4bb77d",
              borderWidth: "1.5px",
              borderRadius: "0.5rem",
              paddingTop: "1px",
              maxHeight: "fit-content",
              fontStyle: "normal",
              fontWeight: "600",
              color: "#4bb77d",
            }}
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value)}
          >
            <option value="all">{getLabel("All Languages")}</option>
            <option value="en">{getLabel("English")}</option>
            <option value="bn">{getLabel("Bangla")}</option>
          </select>
        </div>

        <div className="position-relative">
          <button
            className="btn btn-outline-secondary"
            onClick={() => setShowFilters(!showFilters)}
          >
            <i className="bi bi-funnel me-2"></i> {getLabel("Filters")}
          </button>

          {showFilters && (
            <div
              className="card p-3 position-absolute"
              style={{
                zIndex: 1000,
                top: "110%",
                left: 0,
                minWidth: "220px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            >
              <div className="btn-group d-flex flex-column mb-2">
                <button
                  onClick={() => {
                    setFilter("all");
                    setShowFilters(false);
                  }}
                  className={`btn btn-sm mb-1 ${
                    filter === "all" ? "btn-primary text-white" : "btn-light"
                  }`}
                >
                  {getLabel("All")}
                </button>

                <button
                  onClick={() => {
                    setFilter("mine");
                    setShowFilters(false);
                  }}
                  className={`btn btn-sm mb-1 ${
                    filter === "mine" ? "btn-success text-white" : "btn-light"
                  }`}
                >
                  {getLabel("My Questions")}
                </button>

                <button
                  onClick={() => {
                    setFilter("public");
                    setShowFilters(false);
                  }}
                  className={`btn btn-sm mb-1 ${
                    filter === "public" ? "btn-warning text-white" : "btn-light"
                  }`}
                >
                  {getLabel("Users' Questions")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {activeTab === "mine" && (
        <AddQuestion
          newQuestion={newQuestion}
          setNewQuestion={setNewQuestion}
          addNewQuestion={addNewQuestion}
          language={language}
          setLanguage={setLanguage}
          getLabel={getLabel}
        />
      )}

      {groupByProject ? (
        Object.entries(groupedQuestions).map(([project, projectQuestions]) => (
          <div key={project}>
            <h5 className="mt-4">{project}</h5>
            <SurveyQuestions
              questions={projectQuestions}
              setQuestions={setQuestions}
              newQuestion={newQuestion}
              setNewQuestion={setNewQuestion}
              language={language}
              getLabel={getLabel}
            />
          </div>
        ))
      ) : (
        <SurveyQuestions
          questions={filteredQuestions}
          setQuestions={setQuestions}
          newQuestion={newQuestion}
          setNewQuestion={setNewQuestion}
          language={language}
          getLabel={getLabel}
        />
      )}

      <div ref={bottomRef} />
    </div>
  );
};

export default SurveyForm;