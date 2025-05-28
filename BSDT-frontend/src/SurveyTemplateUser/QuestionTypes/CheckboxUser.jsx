import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const Checkbox = ({ question, questions, setQuestions }) => {
  // Handle checkbox selection
  const handleCheckboxChange = (option) => {
    const updatedQuestions = questions.map((q) => {
      if (q.id === question.id) {
        const currentAnswers = Array.isArray(q.answer) ? q.answer : [];
        const newAnswers = currentAnswers.includes(option)
          ? currentAnswers.filter((ans) => ans !== option) // Uncheck
          : [...currentAnswers, option]; // Check
        return { ...q, answer: newAnswers };
      }
      return q;
    });
    setQuestions(updatedQuestions);
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

      {/* Checkbox Options */}
      <div>
        {question.meta?.options?.map((option, idx) => (
          <div key={idx} className="form-check mb-2">
            <input
              type="checkbox"
              className="form-check-input"
              id={`checkbox-opt-${question.id}-${idx}`}
              checked={Array.isArray(question.answer) && question.answer.includes(option)}
              onChange={() => handleCheckboxChange(option)}
              disabled={question.disabled} // Optional: if you want to disable interaction
            />
            <label
              className="form-check-label"
              htmlFor={`checkbox-opt-${question.id}-${idx}`}
            >
              {option || `Option ${idx + 1}`}
            </label>
          </div>
        ))}
      </div>

      {/* Required Question Indicator */}
      {question.required && !Array.isArray(question.answer) && (
        <small className="text-danger">This question is required.</small>
      )}
    </div>
  );
};

export default Checkbox;