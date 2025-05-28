import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const DateTimeQuestion = ({ question, questions, setQuestions }) => {
  // Handle date/time input change
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

      {/* Date/Time Input */}
      <div className="mb-3">
        <input
          type={question.dateType === "time" ? "time" : "date"}
          className="form-control form-control-sm w-auto"
          value={question.answer || ""}
          onChange={handleAnswerChange}
          required={question.required}
          disabled={question.disabled} // Optional: if you want to disable interaction
        />
      </div>

      {/* Required Question Indicator */}
      {question.required && !question.answer && (
        <small className="text-danger">This question is required.</small>
      )}
    </div>
  );
};

export default DateTimeQuestion;