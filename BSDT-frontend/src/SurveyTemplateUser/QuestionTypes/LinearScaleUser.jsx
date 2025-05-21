import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const LinearScaleQuestion = ({ question, questions, setQuestions }) => {
  // Default min and max values
  const minValue = question.min || 1;
  const maxValue = question.max || 5;
  const leftLabel = question.leftLabel || "";
  const rightLabel = question.rightLabel || "";

  // Generate range of values for the scale
  const scaleOptions = Array.from(
    { length: maxValue - minValue + 1 },
    (_, i) => minValue + i
  );

  // Handle radio button selection
  const handleAnswerChange = (e) => {
    const newAnswer = Number(e.target.value);
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

      {/* Linear Scale Options */}
      <div className="d-flex flex-column mb-3">
        {/* Labels (if present) */}
        {(leftLabel || rightLabel) && (
          <div className="d-flex justify-content-between mb-2">
            <span>{leftLabel || "Low"}</span>
            <span>{rightLabel || "High"}</span>
          </div>
        )}

        {/* Radio Buttons */}
        <div className="d-flex justify-content-between">
          {scaleOptions.map((value) => (
            <div key={value} className="form-check form-check-inline">
              <input
                type="radio"
                className="form-check-input"
                name={`linear-scale-${question.id}`}
                value={value}
                checked={question.answer === value}
                onChange={handleAnswerChange}
                required={question.required}
                disabled={question.disabled} // Optional: if you want to disable interaction
              />
              <label className="form-check-label">{value}</label>
            </div>
          ))}
        </div>
      </div>

      {/* Required Question Indicator */}
      {question.required && question.answer === undefined && (
        <small className="text-danger">This question is required.</small>
      )}
    </div>
  );
};

export default LinearScaleQuestion;