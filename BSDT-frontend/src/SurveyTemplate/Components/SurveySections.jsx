import React, { useEffect, useState } from "react";
import SurveyQuestions from "../Components/SurveyQuestions";
import AddQuestion from "../Components/AddNewQuestion";
import "./LLL-Generated-Question/ChatbotLoading.css";
import Option from "../QuestionTypes/QuestionSpecificUtils/OptionClass";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../CSS/SurveySections.css";

const SurveySections = ({
  section,
  setSections,
  sections,
  questions,
  setQuestions,
  language,
  setLanguage,
  getLabel,
}) => {
  const [newQuestion, setNewQuestion] = useState(false);

  useEffect(() => {
  }, [sections]);

  const questionInfo = {
    id: questions.length + 1,
    section: section.id,
  };

  const addNewQuestion = (type) => {
    const baseQuestion = {
      id: questions.length + 1,
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
        newQ.meta.options = [
          new Option(getLabel("Option 1"), 0),
          new Option(getLabel("Option 2"), 0),
        ];
        break;
      case "checkbox":
      case "dropdown":
        newQ.meta.options = [getLabel("Option 1"), getLabel("Option 2")];
        break;
      case "tickboxGrid":
        newQ.meta.rows = [getLabel("Row 1"), getLabel("Row 2")];
        newQ.meta.columns = [getLabel("Column 1"), getLabel("Column 2")];
        break;
      case "linearScale":
        newQ.meta = {
          min: 1,
          max: 5,
          leftLabel: getLabel("Poor"),
          rightLabel: getLabel("Excellent"),
        };
        break;
      case "rating":
        newQ.meta.scale = 5;
        break;
      case "datetime":
        newQ.meta.dateType = "date";
        break;
      case "likert":
        newQ.meta.rows = [getLabel("Subtext 1"), getLabel("Subtext 2"), getLabel("Subtext 3")];
        newQ.meta.columns = [
          getLabel("Strongly Disagree"),
          getLabel("Disagree"),
          getLabel("Neutral"),
          getLabel("Agree"),
          getLabel("Strongly Agree"),
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

  const addGeneratedQuestion = (generatedQuestion) => {
    setQuestions([...questions, generatedQuestion]);
  };

  const questionCount = questions.filter(
    (question) => question.section === section.id
  ).length;

  const onPressDeleteSection = () => {
    const updatedSections = sections.filter((sec) => sec.id !== section.id);
    const reindexedSections = updatedSections.map((sec, index) => ({
      ...sec,
      id: index + 1,
    }));

    const sectionIdBeingDeleted = section.id;
    const filteredQuestions = questions.filter(
      (question) => question.section !== sectionIdBeingDeleted
    );

    const updatedQuestions = filteredQuestions.map((question) => {
      if (question.section > sectionIdBeingDeleted) {
        return { ...question, section: question.section - 1 };
      }
      return question;
    });

    setSections(reindexedSections);
    setQuestions(updatedQuestions);
  };

  const handleUpdatingSectionTitle = (newTitle) => {
    setSections(
      sections.map((sec) =>
        sec.id === section.id ? { ...sec, title: newTitle } : sec
      )
    );
  };

  const handleMergeWithAbove = () => {
    if (section.id === 1) {
        toast.warn("Cannot merge the first section.");
        return;
    }
    const targetSectionId = section.id - 1;
    const currentSectionId = section.id;

    const updatedQuestions = questions.map((question) => {
        if (question.section === currentSectionId) {
            return { ...question, section: targetSectionId };
        }
        if (question.section > currentSectionId) {
            return { ...question, section: question.section - 1 };
        }
        return question;
    });
    
    let updatedSections = sections.filter((sec) => sec.id !== currentSectionId);
    updatedSections = updatedSections.map((sec) => {
        if (sec.id > currentSectionId) {
            return { ...sec, id: sec.id - 1 };
        }
        return sec;
    });

    setQuestions(updatedQuestions);
    setSections(updatedSections);
  };

  return (
    <div className="survey-section__container container-fluid shadow border bg-white rounded p-3 mt-3 mb-3">
      {sections.length !== 1 && (
        <div className="survey-section__header">
          <h4 className="survey-section__id-display text-left">
            <i>{getLabel("Section") || "Section"} </i> 
            {section.id}
          </h4>
          <textarea
            className="survey-section__title-input form-control mt-2 mb-4"
            placeholder={getLabel("Enter Section Title") || "Enter Section Title"}
            value={section.title || ""}
            onChange={(e) => {
              handleUpdatingSectionTitle(e.target.value);
            }}
          />
        </div>
      )}

      <div className="survey-section__questions-area">
        <SurveyQuestions
          section={section}
          questions={questions}
          setQuestions={setQuestions}
          language={language}
          setLanguage={setLanguage}
          getLabel={getLabel}
        />
      </div>

      <div className="survey-section__actions-area mt-3">
        <AddQuestion
          newQuestion={newQuestion}
          setNewQuestion={setNewQuestion}
          addNewQuestion={addNewQuestion}
          addGeneratedQuestion={addGeneratedQuestion}
          questionInfo={questionInfo}
          language={language}
          setLanguage={setLanguage}
          getLabel={getLabel}
        />
        <div className="survey-section__buttons d-flex justify-content-end mt-2">
          {sections.length > 1 && section.id !== 1 && (
            <button
              className="btn btn-outline-primary btn-sm me-2" 
              onClick={handleMergeWithAbove}
            >
              {getLabel("Merge with above")}
            </button>
          )}
          {sections.length > 1 && (
             <button
                className="btn btn-outline-danger btn-sm" // Removed mt-2
                onClick={onPressDeleteSection}
             >
                {getLabel("Delete Section")}
             </button>
          )}
        </div>
      </div>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
};

export default SurveySections;