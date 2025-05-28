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
    if (filter === "mine") return q.user_id === userId;
    if (filter === "public") return q.privacy === "public" && q.user_id !== userId;

    return true;
  })
  .filter((q) => {
    const search = searchTerm.toLowerCase();
    const friendlyType = typeAlias[q.type] || q.type;

    const combined = [
      q.text,
      q.type,
      friendlyType,
      q.privacy,
      q.project_name || "",
      q.survey_name || "",
      q.owner_name || "",
      JSON.stringify(q.meta_data),
    ].join(" ").toLowerCase();

    return combined.includes(search);
  });
  // Group by project name

  // Group by project name
const groupedByProject = filteredQuestions.reduce((acc, q) => {
  const group = q.project_name || "No Project";
  if (!acc[group]) acc[group] = [];
  acc[group].push(q);
  return acc;
}, {});

const groupedQuestions = groupByProject
  ? filteredQuestions.reduce((acc, q) => {
      const key = q.project_name || "No Project";
      if (!acc[key]) acc[key] = [];
      acc[key].push(q);
      return acc;
    }, {})
  : null;



  return (
    <div>
        <input
          type="text"
          placeholder="Search anything (e.g., mcq, poor, radio)"
          className="form-control mb-3"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="position-relative mb-3">
          <button
            className="btn btn-outline-secondary btn-sm"
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
                  className={`btn btn-sm mb-1 ${filter === "all" ? "btn-primary" : "btn-outline-primary"}`}
                >
                  All
                </button>
                <button
                  onClick={() => {
                    setFilter("mine");
                    setShowFilters(false);
                  }}
                  className={`btn btn-sm mb-1 ${filter === "mine" ? "btn-success" : "btn-outline-success"}`}
                >
                  My Questions
                </button>
                <button
                  onClick={() => {
                    setFilter("public");
                    setShowFilters(false);
                  }}
                  className={`btn btn-sm ${filter === "public" ? "btn-warning" : "btn-outline-warning"}`}
                >
                  Public
                </button>
              </div>

              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={groupByProject}
                  onChange={() => setGroupByProject(!groupByProject)}
                  id="groupToggle"
                />
                <label className="form-check-label" htmlFor="groupToggle">
                  Group by Project
                </label>
              </div>
            </div>
          )}
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
