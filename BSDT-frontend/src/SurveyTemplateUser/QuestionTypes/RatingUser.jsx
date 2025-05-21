import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const RatingQuestion = ({ question, questions, setQuestions }) => {
  // Default scale
  const scale = question.meta?.scale || 5;

  // Handle rating selection
  const handleAnswerChange = (value) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === question.id ? { ...q, answer: value } : q
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

      {/* Rating Stars */}
      <div className="d-flex justify-content-center mb-3">
        {[...Array(scale)].map((_, i) => {
          const value = i + 1;
          return (
            <div key={i} className="text-center mx-2">
              <button
                type="button"
                className="btn p-0"
                onClick={() => handleAnswerChange(value)}
                aria-label={`Rate ${value} out of ${scale}`}
                disabled={question.disabled} // Optional: if you want to disable interaction
              >
                <i
                  className={
                    question.answer >= value ? "bi bi-star-fill" : "bi bi-star"
                  }
                  style={{
                    fontSize: "24px",
                    color: question.answer >= value ? "#ffc107" : "#6c757d",
                  }}
                ></i>
              </button>
              <div>{value}</div>
            </div>
          );
        })}
      </div>

      {/* Required Question Indicator */}
      {question.required && question.answer === undefined && (
        <small className="text-danger">This question is required.</small>
      )}
    </div>
  );
};

export default RatingQuestion;