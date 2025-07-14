import React, { useEffect, useState, useCallback } from "react";
import SurveyQuestions from "../Components/SurveyQuestions";
import AddQuestion from "../Components/AddNewQuestion";
import "./LLL-Generated-Question/ChatbotLoading.css";
import Option from "../QuestionTypes/QuestionSpecificUtils/OptionClass";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../CSS/SurveySections.css";

const ThreeDotsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="1"></circle>
    <circle cx="12" cy="5" r="1"></circle>
    <circle cx="12" cy="19" r="1"></circle>
  </svg>
);

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
  const [showLogicDropdown, setShowLogicDropdown] = useState(false);
  const [selectedTriggerQuestionText, setSelectedTriggerQuestionText] = useState(
    section.triggerQuestionText || ""
  );

  const updateSectionLogic = useCallback(
    (questionText, option) => {
      setSections((prevSections) =>
        prevSections.map((sec) => {
          if (sec.id === section.id) {
            return {
              ...sec,
              triggerQuestionText: questionText,
              triggerOption: option,
            };
          }
          return sec;
        })
      );
    },
    [section.id, setSections]
  );

  const getOptionsForSelectedQuestion = useCallback(() => {
    if (!selectedTriggerQuestionText) return [];
    const question = questions.find(
      (q) => q.text === selectedTriggerQuestionText
    );
    if (!question || !question.meta || !question.meta.options) return [];

    return question.meta.options.map((opt) => {
      if (typeof opt === "string") return { text: opt, value: opt };
      if (typeof opt === "object" && opt !== null)
        return { text: opt.text || opt.label, value: opt.text || opt.label };
      return { text: "", value: "" };
    });
  }, [selectedTriggerQuestionText, questions]);


  useEffect(() => {
    setSelectedTriggerQuestionText(section.triggerQuestionText || "");
  }, [section.triggerQuestionText]);

  useEffect(() => {
    if (section.triggerQuestionText && section.triggerOption) {
      const options = getOptionsForSelectedQuestion();
      const isOptionStillValid = options.some(
        (opt) => opt.value === section.triggerOption
      );
      if (!isOptionStillValid) {
        updateSectionLogic(section.triggerQuestionText, "");
        toast.warn(
          "A conditional logic option became invalid and was reset. Please re-select it."
        );
      }
    }
  }, [
    questions, 
    section.triggerQuestionText, 
    section.triggerOption, 
    getOptionsForSelectedQuestion, 
    updateSectionLogic
  ]);


  const handleLogicToggle = () => {
    setShowLogicDropdown(!showLogicDropdown);
  };

  const handleTriggerQuestionChange = (e) => {
    const questionText = e.target.value;
    setSelectedTriggerQuestionText(questionText);
    updateSectionLogic(questionText, "");
  };
  
  const handleTriggerOptionChange = (e) => {
    const optionValue = e.target.value;
    updateSectionLogic(selectedTriggerQuestionText, optionValue);
  };

  const removeSectionLogic = () => {
    setSelectedTriggerQuestionText("");
    updateSectionLogic("", "");
    setShowLogicDropdown(false);
  };

  const getEligibleTriggerQuestions = () => {
    return questions.filter(
      (q) =>
        q.section < section.id &&
        (q.type === "mcq" || q.type === "radio" || q.type === "dropdown")
    );
  };

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
        newQ.meta.rows = [
          getLabel("Subtext 1"),
          getLabel("Subtext 2"),
          getLabel("Subtext 3"),
        ];
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
    let processedQuestion = { ...generatedQuestion };
    processedQuestion.id = questions.length + 1;
    processedQuestion.section = section.id;
    if (
      processedQuestion.type === "radio" ||
      processedQuestion.type === "checkbox"
    ) {
      if (processedQuestion.meta && processedQuestion.meta.options) {
        processedQuestion.meta.options = processedQuestion.meta.options.map(
          (option) => {
            if (typeof option === "string") {
              return new Option(option, 0);
            } else if (option && typeof option === "object") {
              return new Option(
                option.text || option.label || option,
                option.value || 0
              );
            }
            return new Option(option, 0);
          }
        );
      } else {
        processedQuestion.meta = {
          ...processedQuestion.meta,
          options: [
            new Option(getLabel("Option 1"), 0),
            new Option(getLabel("Option 2"), 0),
          ],
        };
      }
    }
    if (processedQuestion.type === "dropdown") {
      if (processedQuestion.meta && processedQuestion.meta.options) {
        if (
          processedQuestion.meta.options[0] &&
          typeof processedQuestion.meta.options[0] === "object"
        ) {
          processedQuestion.meta.options = processedQuestion.meta.options.map(
            (opt) => opt.text || opt.label || opt
          );
        }
      }
    }
    setQuestions((prevQuestions) => [...prevQuestions, processedQuestion]);
  };

  const addImportedQuestion = (importedQuestions) => {
    setQuestions((prevQuestions) => [...prevQuestions, ...importedQuestions]);
  };

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

    let updatedSections = sections.filter(
      (sec) => sec.id !== currentSectionId
    );
    updatedSections = updatedSections.map((sec) => {
      if (sec.id > currentSectionId) {
        return { ...sec, id: sec.id - 1 };
      }
      return sec;
    });

    setQuestions(updatedQuestions);
    setSections(updatedSections);
  };

  const eligibleTriggerQuestions = getEligibleTriggerQuestions();
  const optionsForSelectedQuestion = getOptionsForSelectedQuestion();

  return (
    <div className="survey-section__container container-fluid shadow border bg-white rounded p-3 mt-3 mb-3">
      <div className="survey-section__header d-flex justify-content-between align-items-start">
        <div className="flex-grow-1">
          {sections.length !== 1 && (
            <>
              <h4 className="survey-section__id-display text-left">
                <i>{getLabel("Section") || "Section"} </i>
                {section.id}
              </h4>
              <textarea
                className="survey-section__title-input form-control mt-2 mb-4"
                placeholder={
                  getLabel("Enter Section Title") || "Enter Section Title"
                }
                value={section.title || ""}
                onChange={(e) => handleUpdatingSectionTitle(e.target.value)}
              />
            </>
          )}
        </div>

        {section.id > 1 && (
          <div className="position-relative">
            <button
              className="btn btn-light btn-sm ms-2"
              onClick={handleLogicToggle}
            >
              <ThreeDotsIcon />
            </button>
            {showLogicDropdown && (
              <div className="logic-dropdown p-2 rounded shadow-sm border bg-light">
                <h6>{getLabel("Conditional Logic")}</h6>
                <p className="text-muted small">
                  {getLabel("Show this section only if...")}
                </p>
                <div className="mb-2">
                  <label className="form-label small">
                    {getLabel("Question")}
                  </label>
                  <select
                    className="form-select form-select-sm"
                    value={selectedTriggerQuestionText}
                    onChange={handleTriggerQuestionChange}
                  >
                    <option value="">
                      {getLabel("Select a question...")}
                    </option>
                    {eligibleTriggerQuestions.map((q) => (
                      <option key={q.id} value={q.text}>
                        {q.text}
                      </option>
                    ))}
                  </select>
                </div>
                {selectedTriggerQuestionText && (
                  <div className="mb-2">
                    <label className="form-label small">
                      {getLabel("Is equal to")}
                    </label>
                    <select
                      className="form-select form-select-sm"
                      value={section.triggerOption || ""}
                      onChange={handleTriggerOptionChange}
                    >
                      <option value="">
                        {getLabel("Select an option...")}
                      </option>
                      {optionsForSelectedQuestion.map((opt, index) => (
                        <option key={index} value={opt.value}>
                          {opt.text}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <button
                  className="btn btn-outline-danger btn-sm w-100 mt-2"
                  onClick={removeSectionLogic}
                >
                  {getLabel("Remove Logic")}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

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
          addImportedQuestion={addImportedQuestion}
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
              className="btn btn-outline-danger btn-sm"
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