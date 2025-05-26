import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const Dropdown = ({ question, questions, setQuestions }) => {
  // Handle dropdown selection
  const handleAnswerChange = (e) => {
    const newAnswer = e.target.value;
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === question.id ? { ...q, answer: newAnswer } : q
      )
    );
  };

  return (
    <div className="mb-3">
      {/* Question Text */}
      <h5 className="mb-2" style={{ fontSize: "1.2rem" }}>
        {question.text || "Untitled Question"}
        {question.required && <span className="text-danger ms-1">*</span>}
      </h5>

      {/* Image Preview */}
      {question.image && (
        <img
          src={question.image}
          alt="Question Image"
          className="img-fluid mb-2"
          style={{ maxHeight: "400px" }}
        />
      )}

      {/* Dropdown Options */}
      <div className="mb-3">
        <select
          className="form-select"
          value={question.answer || ""}
          onChange={handleAnswerChange}
          required={question.required}
          disabled={question.disabled} // Optional: if you want to disable interaction
        >
          <option value="" disabled>
            Select an option
          </option>
          {question.meta?.options?.map((option, idx) => (
            <option key={idx} value={option}>
              {option || `Option ${idx + 1}`}
            </option>
          ))}
        </select>
      </div>

      {/* Required Question Indicator */}
      {question.required && !question.answer && (
        <small className="text-danger">This question is required.</small>
      )}
    </div>
  );
};

export default Dropdown;