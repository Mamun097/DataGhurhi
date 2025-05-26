import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const Radio = ({ question, questions, setQuestions }) => {
  // Handle radio button selection
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
      {question.imageUrl && (
        <img
          src={question.imageUrl}
          alt="Question Image"
          className="img-fluid mb-2"
          style={{ maxHeight: "200px" }}
        />
      )}

      {/* Radio Options */}
      <div>
        {question.meta?.options?.map((option, idx) => (
          <div key={idx} className="form-check mb-2">
            <input
              type="radio"
              className="form-check-input"
              name={`radio-${question.id}`}
              id={`radio-opt-${question.id}-${idx}`}
              value={option.text}
              checked={question.answer === option.text}
              onChange={handleAnswerChange}
              required={question.required}
              disabled={question.disabled} // Optional: if you want to disable interaction
            />
            <label
              className="form-check-label"
              htmlFor={`radio-opt-${question.id}-${idx}`}
            >
              {option.text || `Option ${idx + 1}`}
            </label>
          </div>
        ))}
      </div>

      {/* Required Question Indicator */}
      {question.required && !question.answer && (
        <small className="text-danger">This question is required.</small>
      )}
    </div>
  );
};

export default Radio;