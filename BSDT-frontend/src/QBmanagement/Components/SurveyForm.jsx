import React, { useState, useRef, useEffect } from "react";
import SurveyQuestions from "./SurveyQuestions";
import AddQuestion from "./AddNewQuestion";
import Option from "../QuestionTypes/QuestionSpecificUtils/OptionClass";
import 'bootstrap-icons/font/bootstrap-icons.css';


const SurveyForm = ({ questions, setQuestions, activeTab }) => {
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
    if (filter === "public") return q.privacy === "public" && q.user_id !== userId;
    return true;
  });


 
  


  return (
    <div>
        <div className="d-flex align-items-start mb-3 gap-2">
          <input
            type="text"
            placeholder="Search anything (e.g., keyword, project name)"
            className="form-control"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <div className="position-relative">
            <button
              className="btn btn-outline-secondary"
              onClick={() => setShowSearchFilters((prev) => !prev)}
            >
              <i className="bi bi-search"></i> Search Filter
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
                <label className="fw-bold small mb-2">Search In:</label>
                <div className="d-flex flex-column gap-2">
                  {[
                    { label: "Keyword", key: "keyword" },
                    { label: "Project Name", key: "project" },
                    { label: "Type", key: "type" },
                    { label: "Tag", key: "tag" },
                    { label: "Survey Name", key: "survey" },
                    { label: "Owner Name", key: "owner" },
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
                      <label className="form-check-label small ms-1" htmlFor={`search-${key}`}>
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
      <i className="bi bi-funnel me-2"></i> Filters
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
            className={`btn btn-sm mb-1 ${filter === "all" ? "btn-primary text-white" : "btn-light"}`}
          >
            All
          </button>

          <button
            onClick={() => {
              setFilter("mine");
              setShowFilters(false);
            }}
            className={`btn btn-sm mb-1 ${filter === "mine" ? "btn-success text-white" : "btn-light"}`}
          >
            My Questions
          </button>

          <button
            onClick={() => {
              setFilter("public");
              setShowFilters(false);
            }}
            className={`btn btn-sm mb-1 ${filter === "public" ? "btn-warning text-white" : "btn-light"}`}
          >
            Public
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
        )
      }



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
