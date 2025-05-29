import React, { useState, useEffect, useRef } from "react";
import SurveyQuestions from "./SurveyQuestions";
import AddQuestion from "./AddNewQuestion";
import Option from "../QuestionTypes/QuestionSpecificUtils/OptionClass";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../CSS/SurveyForm.css"; // Assuming you have a CSS file for styling
import axios from "axios";

// Google Translate API Key (make sure you set this up correctly in your environment)
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY;

// Function to translate the text using Google Translate API
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
    return textArray; // If there's an error, fallback to original text
  }
};

const SurveyForm = ({ questions, setQuestions, activeTab , language, setLanguage }) => {
  const [newQuestion, setNewQuestion] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all"); // "all" | "mine" | "public"
  const [groupByProject, setGroupByProject] = useState(false); // toggle grouping
  const [showFilters, setShowFilters] = useState(false);
  const [searchFields, setSearchFields] = useState({
    keyword: true,
    project: false,
    tag: false,
    type: false,
    survey: false,
    owner: false,
  });
  const [showSearchFilters, setShowSearchFilters] = useState(false);
  const [translations, setTranslations] = useState({});
 
  const bottomRef = useRef(null);
  const userId = parseInt(localStorage.getItem("userId"), 10);

  const addNewQuestion = (type) => {
    const baseQuestion = {
      user_id: userId,
      text: "Enter your question here",
      type,
      image: null,
      meta_data: {},
      privacy: "private",
      new: true,
    };

    switch (type) {
      case "radio":
        baseQuestion.meta_data.options = [
          new Option("Option 1", 0),
          new Option("Option 2", 0),
        ];
        break;
      case "checkbox":
      case "dropdown":
        baseQuestion.meta_data.options = ["Option 1", "Option 2"];
        break;
      case "tickboxGrid":
        baseQuestion.meta_data.rows = ["Row 1", "Row 2"];
        baseQuestion.meta_data.columns = ["Column 1", "Column 2"];
        break;
      case "linearScale":
        baseQuestion.meta_data = {
          min: 1,
          max: 5,
          leftLabel: "Poor",
          rightLabel: "Excellent",
        };
        break;
      case "rating":
        baseQuestion.meta_data.scale = 5;
        break;
      case "datetime":
        baseQuestion.meta_data.dateType = "date";
        break;
      case "likert":
        baseQuestion.meta_data.rows = ["Subtext 1", "Subtext 2", "Subtext 3"];
        baseQuestion.meta_data.columns = [
          "Strongly Disagree",
          "Disagree",
          "Neutral",
          "Agree",
          "Strongly Agree",
        ];
        break;
      case "text":
        baseQuestion.meta_data.options = [];
        break;
      default:
        break;
    }

    // Add question
    const updatedQuestions = [...questions, baseQuestion];
    setQuestions(updatedQuestions);

    // Scroll after short delay (so DOM updates first)
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100); // short delay is needed for state update to reflect in DOM
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

  const filteredQuestions = questions
    .filter((q) => {
      const search = searchTerm.toLowerCase().trim();
      if (!search) return true;

      const typeAliasText = typeAlias[q.type] || q.type;

      const matches = [];

      if (searchFields.keyword) {
        const combined = [
          q.text,
          q.type,
          typeAliasText,
          q.privacy,
          JSON.stringify(q.meta_data),
        ]
          .join(" ")
          .toLowerCase();
        matches.push(combined.includes(search));
      }

      if (searchFields.project) {
        matches.push((q.project_name || "").toLowerCase().includes(search));
      }

      if (searchFields.type) {
        matches.push(typeAliasText.toLowerCase().includes(search));
      }

      if (searchFields.tag) {
        matches.push((q.tags || []).join(" ").toLowerCase().includes(search));
      }

      if (searchFields.survey) {
        matches.push((q.survey_name || "").toLowerCase().includes(search));
      }

      if (searchFields.owner) {
        matches.push((q.owner_name || "").toLowerCase().includes(search));
      }

      // If no checkbox is selected, default to match all fields
      const hasAnyFieldSelected = Object.values(searchFields).some(Boolean);

      if (!hasAnyFieldSelected) {
        const fallbackCombined = [
          q.text,
          q.type,
          typeAliasText,
          q.privacy,
          q.project_name,
          q.survey_name,
          q.owner_name,
          (q.tags || []).join(" "),
          JSON.stringify(q.meta_data),
        ]
          .join(" ")
          .toLowerCase();
        return fallbackCombined.includes(search);
      }

      return matches.some(Boolean);
    })
    .filter((q) => {
      if (filter === "mine") return q.user_id === userId;
      if (filter === "public")
        return q.privacy === "public" && q.user_id !== userId;
      return true;
    });

  // Fetch translations when language changes
  useEffect(() => {
    const loadTranslations = async () => {
      const labels = [
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
        "Search Filter",
        "Search Filter",
        "Add Question",
        "Question Type",
        "Question Text",
        "Add Option",
        "Add Row",
        "Add Column",
        "Delete",
        "Save Question",

      ];

      const translated = await translateText(
        labels,
        language === "বাংলা" ? "bn" : "en"
      );

      const translatedMap = {};
      labels.forEach((label, idx) => {
        translatedMap[label] = translated[idx];
      });

      setTranslations(translatedMap);
    };

    loadTranslations();
  }, [language]);

  // Toggle language between English and Bengali
  const toggleLanguage = () => {
    const newLang = language === "English" ? "bn" : "en"; // 'bn' for Bengali, 'en' for English
    setLanguage(newLang === "bn" ? "বাংলা" : "English");
    localStorage.setItem("language", newLang === "bn" ? "বাংলা" : "English");
  };

  // Function to get the translated text based on selected language
  const getLabel = (text) => translations[text] || text;

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
                  { label: getLabel("Type"), key: "type" },
                  { label: getLabel("Tag"), key: "tag" },
                  { label: getLabel("Survey Name"), key: "survey" },
                  { label: getLabel("Owner Name"), key: "owner" },
                ].map(({ label, key }) => (
                  <div className="form-check form-check-sm m-0 p-0" key={key}>
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`search-${key}`} // Corrected template literal here
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
                      {" "}
                      {/* Corrected htmlFor here */}
                      {label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
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
            />
          </div>
        ))
      ) : (
        <SurveyQuestions
          questions={filteredQuestions}
          setQuestions={setQuestions}
          newQuestion={newQuestion}
          setNewQuestion={setNewQuestion}
        />
      )}

      {/* Scroll target */}
      <div ref={bottomRef} />
    </div>
  );
};

export default SurveyForm;
