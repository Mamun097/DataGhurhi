import React, { useCallback, useState, useRef, useEffect } from "react";
import Checkbox from "./Checkbox";
import Radio from "./Radio";
import Text from "./Text";
import DropdownQuestion from "./Dropdown";
import RatingQuestion from "./Rating";
import Likert from "./LikertScale";
import LinearScaleQuestion from "./LinearScale";
import TickBoxGrid from "../QuestionTypes/TickBoxGrid";
import DateTimeQuestion from "./DateTime";
import TagManager from "./QuestionSpecificUtils/Tag";
import "../CSS/SurveyForm.css";
const QuestionContainer = ({
  index,
  question,
  questions,
  setQuestions,
  language,
  setLanguage,
  getLabel,
  autoNumbering,
  isQuiz,
  defaultPointValue,
  totalMarks,
  setTotalMarks,
}) => {
  // Handle changing question text
  const handleTextChange = useCallback(
    (e) => {
      const newText = e.target.value;
      setQuestions((prev) =>
        prev.map((q) => (q.id === question.id ? { ...q, text: newText } : q))
      );
    },
    [question.id, setQuestions]
  );

  //  Handle changing question type
  const handleTypeChange = useCallback(
    (e) => {
      const newType = e.target.value;
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === question.id
            ? {
                ...q,
                type: newType,
                meta: q.meta || {}, // preserve options/meta data
              }
            : q
        )
      );
    },
    [question.id, setQuestions]
  );

  // Render the selected question type's UI
  const renderQuestionType = () => {
    const commonProps = {
      index,
      question,
      questions,
      setQuestions,
      language,
      setLanguage,
      getLabel,
      isQuiz,
      defaultPointValue,
      totalMarks,
      setTotalMarks,
    };

    switch (question.type) {
      case "radio":
      case "checkbox":
      case "dropdown": {
        let options = question.meta?.options || [];

        //for option object
        if (options.some((opt) => typeof opt === "object")) {
          options = options.map((opt) => opt.text || opt.label || "");
        }
        if (options.length === 0) {
          options = [getLabel("Option 1"), getLabel("Option 2")];
        }

        commonProps.question.meta.options = options;

        return question.type === "radio" ? (
          <Radio {...commonProps} />
        ) : question.type === "checkbox" ? (
          <Checkbox {...commonProps} />
        ) : (
          <DropdownQuestion {...commonProps} />
        );
      }

      case "text":
        return <Text {...commonProps} />;

      case "rating":
        commonProps.question.meta.scale = question.meta.scale || 5;
        return <RatingQuestion {...commonProps} />;

      case "likert":
        commonProps.question.meta.rows = question.meta.rows || [
          getLabel("Row 1"),
          getLabel("Row 2"),
          getLabel("Row 3"),
        ];
        commonProps.question.meta.columns = question.meta.columns || [
          getLabel("Strongly Disagree"),
          getLabel("Disagree"),
          getLabel("Neutral"),
          getLabel("Agree"),
          getLabel("Strongly Agree"),
        ];
        return <Likert {...commonProps} />;

      case "linearScale":
        commonProps.question.meta.min = question.meta.min || 1;
        commonProps.question.meta.max = question.meta.max || 5;
        commonProps.question.meta.leftLabel =
          question.meta.leftLabel || getLabel("Poor");
        commonProps.question.meta.rightLabel =
          question.meta.rightLabel || getLabel("Excellent");

        return <LinearScaleQuestion {...commonProps} />;

      case "datetime":
        commonProps.question.meta.dateType = question.meta.dateType || "date";
        return <DateTimeQuestion {...commonProps} />;
      case "tickboxGrid":
        commonProps.question.meta.rows = question.meta.rows || [
          getLabel("Row 1"),
          getLabel("Row 2"),
        ];
        commonProps.question.meta.columns = question.meta.columns || [
          getLabel("Column 1"),
          getLabel("Column 2"),
        ];

        return <TickBoxGrid {...commonProps} />;
      default:
        return null;
    }
  };
  const [showTag, setShowTag] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto"; // reset height
      textarea.style.height = textarea.scrollHeight + "px"; // adjust to content
    }
  }, [question.text]); // run on every text change

  return (
    <div className="mb-4 p-3 border rounded bg-light shadow-sm">
      {/* Tag Section Header */}
      <div className="tag-toggle-container">
        <button className="tag-toggle-btn" onClick={() => setShowTag(!showTag)}>
          <i className="bi bi-tags me-1" style={{ color: " #25856f" }}></i>
          {showTag ? getLabel("Hide Tags") : getLabel("Show Tags")}
        </button>
      </div>

      {showTag && (
        <div className="tag-section">
          <TagManager
            questionId={question.id}
            questionText={question.text}
            questions={questions}
            setQuestions={setQuestions}
            getLabel={getLabel}
          />
        </div>
      )}

      <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2 mb-3">
        <em>
          {autoNumbering ? `${index}. ` : ""}
          {/* <hr />
            Type: <strong>{getLabel("Checkbox")}</strong> */}
        </em>
        {/* Question Input */}
        <textarea
          ref={textareaRef}
          className="question-input"
          placeholder={getLabel("Enter your question here")}
          value={question.text || ""}
          onChange={handleTextChange}
        />

        {/* Type Dropdown */}
        <select
          className="question-select"
          value={question.type}
          onChange={handleTypeChange}
        >
          <option value="checkbox">{getLabel("Checkbox")}</option>
          <option value="radio">{getLabel("Radio")}</option>
          <option value="text">{getLabel("Text")}</option>
          <option value="dropdown">{getLabel("Dropdown")}</option>
          <option value="rating">{getLabel("Rating")}</option>
          <option value="likert">{getLabel("Likert Scale")}</option>
          <option value="linearScale">{getLabel("Linear Scale")}</option>
          <option value="datetime">{getLabel("Date/Time")}</option>
          <option value="tickboxGrid">{getLabel("Tick Box Grid")}</option>
        </select>
      </div>

      {/* Dynamic Question UI */}
      <div className="question-type-body">{renderQuestionType()}</div>
    </div>
  );
};

export default QuestionContainer;
