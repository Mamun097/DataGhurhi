import React, { useEffect } from "react";
import { useState } from "react";
import SurveyQuestions from "../Components/SurveyQuestions";
import AddQuestion from "../Components/AddNewQuestion";
//import {handleDeleteSection} from "./SurveyForm";

const SurveySections = ({
  section,
  setSections,
  sections,
  questions,
  setQuestions,
  viewAs,
}) => {
  const [newQuestion, setNewQuestion] = useState(false);

  useEffect(() => {
    console.table("sections: ", sections); // Logs the array in a structured table format
  }, [sections]);
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
      meta: {},
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
        newQ.meta.rows = ["Subtext 1", "Subtext 2", "Subtext 3"];
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
  const onPressDeleteSection = () => {
    //console.log("Sections before deletion: ", sections);
    // Filter out the deleted section
    const updatedSections = sections.filter((sec) => sec.id !== section.id);

    // Reassign section IDs to maintain sequential order
    const reindexedSections = updatedSections.map((sec, index) => ({
      ...sec,
      id: index + 1,
    }));

    const filteredQuestions = questions.filter(
      (question) => question.section !== section.id
    );

    // Update the questions to match the new section IDs
    const updatedQuestions = filteredQuestions.map((question) => {
      if (question.section > section.id) {
        return { ...question, section: question.section - 1 };
      }
      return question;
    });

    setSections(reindexedSections);
    setQuestions(updatedQuestions);
    //console.log("Sections after deletion: ", reindexedSections);
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
  };

  return (
    <div className="container-fluid shadow border bg-white rounded p-3 mt-3 mb-3">
      {sections.length !== 1 && (
        <div>
          <h4 className="text-left">
            <i>Section </i>
            {section.id}
          </h4>
          <textarea
            className="form-control mt-2 mb-4"
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
        viewAs={viewAs}
      />
      {!viewAs && (
        <div>
          {/* Add Question Component */}
          <AddQuestion
            newQuestion={newQuestion}
            setNewQuestion={setNewQuestion}
            addNewQuestion={addNewQuestion}
          />
          <div className="d-flex justify-content-end mt-2">
            {sections.length !== 1 && section.id !== 1 && (
              <button
                className="btn btn-outline-primary btn-sm mt-2 me-2"
                onClick={() => {
                  handleMergeWithAbove();
                }}
              >
                Merge with above
              </button>
            )}
            <button
              className="btn btn-outline-danger btn-sm mt-2"
              onClick={() => {
                onPressDeleteSection();
              }}
            >
              Delete Section
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SurveySections;
