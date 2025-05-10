import React from "react";
import { useState } from "react";
import SurveyQuestions from "../Components/SurveyQuestions";
import AddQuestion from "../Components/AddNewQuestion";

const SurveySections = ({
  section,
  setSections,
  sections,
  questions,
  setQuestions,
}) => {
  const [newQuestion, setNewQuestion] = useState(false);
  const addNewQuestion = (type) => {
    const baseQuestion = {
      id: questions.length + 1,
      text: "Enter your question here",
      type: type,
      section: section.id,
      required: false,
      image: null,
    };
  
    let newQ = {
      ...baseQuestion,
      meta: {}
    };
  
    switch (type) {
      case "radio":
      case "checkbox":
      case "dropdown":
        newQ.meta.options = ["Option 1", "Option 2"];
        break;
  
      case "tickboxGrid":
        newQ.meta.rows = ["Row 1", "Row 2"];
        newQ.meta.columns = ["Column 1", "Column 2"];
        break;
  
      case "linearScale":
        newQ.meta = {
          min: 1,
          max: 5,
          leftLabel: "Poor",
          rightLabel: "Excellent",
        };
        break;
  
      case "rating":
        newQ.meta.scale = 5;
        break;
  
      case "datetime":
        newQ.meta.dateType = "date";
        break;
  
      case "likert":
        newQ.meta.rows = [
          "Subtext 1",
          "Subtext 2",
          "Subtext 3",
        ];
        newQ.meta.columns = [
          "Strongly Disagree",
          "Disagree",
          "Neutral",
          "Agree",
          "Strongly Agree",
        ];
        break;
  
      case "text":
        newQ.meta.options = [];
        break;
  
      default:
        break;
    }
  
    setQuestions([...questions, newQ]);
    setNewQuestion(false);
  };
  
  // Function to calculate the number of questions present in the current section
  const questionCount = questions.filter(
    (question) => question.section === section.id
  ).length;

  // Function to delete a section
  const handleDeleteSection = () => {
    const updatedQuestions = questions.filter(
      (question) => question.section !== section.id
    );
    const updatedSections = sections.filter((sec) => sec.id !== section.id);
    questions.forEach((question) => {
      if (question.section > section.id) {
        question.section -= questionCount;
      }
    });

    setQuestions(updatedQuestions);
    setSections(updatedSections);
  };

  // Function to update the section title
  const handleUpdatingSectionTitle = (newTitle) => {
    setSections(
      sections.map((sec) =>
        sec.id === section.id ? { ...sec, title: newTitle } : sec
      )
    );
  };

  // Function to merge the current section with the above section
  const handleMergeWithAbove = () => {
    const updatedQuestions = questions.map((question) =>
      question.section === section.id
        ? { ...question, section: section.id - 1 }
        : question
    );

    const updatedSections = sections.filter((sec) => sec.id !== section.id);
    sections.map((sec) => {
      if (sec.id > section.id) {
        sec.id -= 1;
      }
    });
    questions.forEach((question) => {
      if (question.section > section.id) {
        question.section -= 1;
      }
    });

    setQuestions(updatedQuestions);
    setSections(updatedSections);
  }

  return (
    <div className="container mt-2 p-4 border rounded shadow bg-white">
      {sections.length !== 1 && (
        <div>
          <b>
            <i>Section {section.id}</i>
          </b>
          <textarea
            className="form-control mt-2"
            placeholder="Enter Section Title"
            value={section.title}
            onChange={(e) => {
              handleUpdatingSectionTitle(e.target.value);
            }}
          />
        </div>
      )}

      {/* Survey Questions Component */}
      <SurveyQuestions
        section={section}
        questions={questions}
        setQuestions={setQuestions}
      />
      {/* Add Question Component */}
      <AddQuestion
        newQuestion={newQuestion}
        setNewQuestion={setNewQuestion}
        addNewQuestion={addNewQuestion}
      />
      <div className="d-flex justify-content-end mt-2">
        {sections.length !== 1 && section.id !== 1 && (
          <button
            className="btn btn-secondary btn-sm me-2"
            onClick={() => {
              handleMergeWithAbove();
            }}
          >
            Merge with above
          </button>
        )}
        <button
          className="btn btn-danger btn-sm mt-2"
          onClick={() => {
            handleDeleteSection();
          }}
        >
          Delete Section
        </button>
      </div>
    </div>
  );
};

export default SurveySections;
