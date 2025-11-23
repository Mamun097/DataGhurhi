import React, { useEffect, useState, useCallback, useRef } from "react";
import SurveyQuestions from "../Components/SurveyQuestions";
import AddQuestion from "../Components/AddNewQuestion";
import "./LLL-Generated-Question/ChatbotLoading.css";
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

const TrashIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="currentColor"
    viewBox="0 0 16 16"
  >
    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
    <path
      fillRule="evenodd"
      d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"
    />
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
  isQuiz,
  defaultPointValue,
  totalMarks,
  setTotalMarks,
}) => {
  const [showLogicDropdown, setShowLogicDropdown] = useState(false);
  const [selectedTriggerQuestionText, setSelectedTriggerQuestionText] =
    useState(section.triggerQuestionText || "");
  const logicRef = useRef(null);

  const sectionQuestionCount = questions.filter(
    (q) => q.section === section.id
  ).length;

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
    updateSectionLogic,
  ]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (logicRef.current && !logicRef.current.contains(event.target)) {
        setShowLogicDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [logicRef]);

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

  const addNewQuestion = (type, index) => {
    const baseQuestion = {
      id: 0,
      type: type,
      section: section.id,
      required: false,
      image: null,
    };
    let newQ = { ...baseQuestion, meta: {} };

    switch (type) {
      case "radio":
        newQ.meta.options = [getLabel("Option 1"), getLabel("Option 2")];
        if (isQuiz) {
          newQ.points = defaultPointValue || 1;
        }
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
          getLabel("Row 1"),
          getLabel("Row 2"),
          getLabel("Row 3"),
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

    setQuestions((prevQuestions) => {
      const updatedQuestions = [...prevQuestions];
      updatedQuestions.splice(index, 0, newQ);
      return updatedQuestions.map((q, idx) => ({ ...q, id: idx + 1 }));
    });
  };

  const addGeneratedQuestion = (generatedQuestion, index) => {
    let processedQuestion = { ...generatedQuestion, section: section.id };

    setQuestions((prevQuestions) => {
      const updatedQuestions = [...prevQuestions];
      updatedQuestions.splice(index, 0, processedQuestion);
      return updatedQuestions.map((q, idx) => ({ ...q, id: idx + 1 }));
    });
  };

  const addImportedQuestion = (importedQuestions, index) => {
    const questionsWithSection = importedQuestions.map((q) => ({
      ...q,
      section: section.id,
    }));

    setQuestions((prevQuestions) => {
      const updatedQuestions = [...prevQuestions];
      updatedQuestions.splice(index, 0, ...questionsWithSection);
      return updatedQuestions.map((q, idx) => ({ ...q, id: idx + 1 }));
    });
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

  const eligibleTriggerQuestions = getEligibleTriggerQuestions();
  const optionsForSelectedQuestion = getOptionsForSelectedQuestion();
  const handleToggleAutoNumbering = () => {
    setSections((prevSections) =>
      prevSections.map((sec) =>
        sec.id === section.id
          ? { ...sec, autoNumbering: !sec.autoNumbering }
          : sec
      )
    );
  };
  const handleToggleTitle = () => {
    setSections((prevSections) =>
      prevSections.map((sec) =>
        sec.id === section.id ? { ...sec, showTitle: !sec.showTitle } : sec
      )
    );
  };

  return (
    <div className="survey-section__container container-fluid shadow border bg-transparent rounded p-3 mt-5 mb-3">
      <div className="survey-section__header d-flex justify-content-between align-items-start">
        <div className="flex-grow-1">
          {sections.length > 1 && (
            <h1 className="survey-section__id-display text-left mb-3">
              <i>{getLabel("Section") || "Section"} </i>
              {section.id}
            </h1>
          )}
          {section.showTitle && (
            <textarea
              className="survey-section__title-input form-control mt-2 mb-4"
              placeholder={
                getLabel("Enter Section Title") || "Enter Section Title"
              }
              value={section.title || ""}
              onChange={(e) => handleUpdatingSectionTitle(e.target.value)}
              onFocus={(e) => e.target.select()}
            />
          )}
        </div>

        <div className="d-flex align-items-center justify-content-end mb-2 gap-3">
          {/* Auto Numbering */}
          <div className="d-flex align-items-center">
            <input
              type="checkbox"
              id={`auto-numbering-${section.id}`}
              checked={section.autoNumbering || false}
              onChange={handleToggleAutoNumbering}
              className="form-check-input me-1"
            />
            <label
              htmlFor={`auto-numbering-${section.id}`}
              className="form-check-label"
            >
              {getLabel("Auto Numbering")}
            </label>
          </div>

          {/* Title toggle slider */}
          <div className="d-flex align-items-center">
            <label className="form-check-label me-1">{getLabel("Title")}</label>
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                id={`title-toggle-${section.id}`}
                checked={section.showTitle || false}
                onChange={handleToggleTitle}
              />
            </div>
          </div>
        </div>

        {section.id > 1 && (
          <div className="logic-container position-relative" ref={logicRef}>
            <button
              className="btn btn-light btn-sm ms-2"
              onClick={handleLogicToggle}
              aria-label="Open conditional logic settings"
            >
              <ThreeDotsIcon />
            </button>

            {showLogicDropdown && (
              <div className="logic-modal shadow-lg rounded border-0 p-3">
                <div className="logic-modal__header mb-3">
                  <h6 className="fw-bold mb-1">
                    {getLabel("Conditional Logic")}
                  </h6>
                  <p className="text-muted small mb-0">
                    {getLabel("Show this section only if...")}
                  </p>
                </div>

                <div className="logic-modal__body">
                  <div className="mb-3">
                    <label className="form-label small fw-medium">
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
                    <div className="mb-3">
                      <label className="form-label small fw-medium">
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
                    className="btn btn-outline-danger btn-sm w-100 mt-2 d-flex align-items-center justify-content-center gap-2"
                    onClick={removeSectionLogic}
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {sectionQuestionCount === 0 && (
        <div className="survey-section__add-question-area mb-3">
          <AddQuestion
            isQuiz={isQuiz}
            addNewQuestion={addNewQuestion}
            addGeneratedQuestion={addGeneratedQuestion}
            addImportedQuestion={addImportedQuestion}
            questionInfo={{
              id: questions.length + 1,
              index: questions.length,
              section: section.id,
            }}
            getLabel={getLabel}
          />
        </div>
      )}

      <div className="survey-section__questions-area">
        <SurveyQuestions
          section={section}
          questions={questions}
          setQuestions={setQuestions}
          addNewQuestion={addNewQuestion}
          addGeneratedQuestion={addGeneratedQuestion}
          addImportedQuestion={addImportedQuestion}
          language={language}
          setLanguage={setLanguage}
          getLabel={getLabel}
          autoNumbering={section.autoNumbering}
          isQuiz={isQuiz}
          defaultPointValue={defaultPointValue}
          totalMarks={totalMarks}
          setTotalMarks={setTotalMarks}
        />
      </div>

      <div className="survey-section__actions-area mt-3">
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
