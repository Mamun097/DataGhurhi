import React, { useMemo } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const Checkbox = ({ question, userResponse, setUserResponse }) => {
  const userAnswer = userResponse.find(
    (response) => response.questionText === question.text
  )?.userResponse;

  // Handles adding/removing selections from the response array
  const handleAnswerChange = (e) => {
    const selectedValue = e.target.value;
    const existingResponseIndex = userResponse.findIndex(
      (response) => response.questionText === question.text
    );

    if (existingResponseIndex !== -1) {
      // Update existing response
      const updatedResponse = [...userResponse];
      const currentAnswers = updatedResponse[existingResponseIndex].userResponse;

      // If the value is already in the response, remove it; otherwise, add it
      if (currentAnswers.includes(selectedValue)) {
        updatedResponse[existingResponseIndex].userResponse =
          currentAnswers.filter((value) => value !== selectedValue);
      } else {
        currentAnswers.push(selectedValue);
      }
      setUserResponse(updatedResponse);
    } else {
      // Add new response if one doesn't exist for this question
      const newResponse = {
        questionText: question.text,
        userResponse: [selectedValue],
      };
      setUserResponse([...userResponse, newResponse]);
    }
  };

  const shuffledOptions = useMemo(() => {
    const options = question.meta?.options || [];
    if (question.meta?.enableOptionShuffle === true) {
      const shuffled = [...options];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Swap elements
      }
      return shuffled;
    }
    return options;
  }, [question]); // Dependency: re-calculate only if the question object changes

  return (
    <div className="mt-2 ms-2">
      {/* Question Text */}
      <h5 className="mb-2" style={{ fontSize: "1.2rem" }}>
        {question.text || "Untitled Question"}
        {question.required && <span className="text-danger ms-1">*</span>}
      </h5>

      {/* Image Preview */}
      {question.imageUrls && question.imageUrls.length > 0 && (
        <div className="mt-4 mb-4">
          {question.imageUrls.map((img, idx) => (
            <div key={idx} className="mb-3 bg-gray-50">
              <div
                className={`d-flex justify-content-${img.alignment || "start"}`}
              >
                <img
                  src={img.url}
                  alt={`Question ${idx}`}
                  className="img-fluid rounded"
                  style={{ maxHeight: 400 }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Checkbox Options */}
      <div className="mt-2 ms-2">
        {/* Map over the memoized (and possibly shuffled) options */}
        {shuffledOptions.map((option, idx) => {
          const optionValue =
            typeof option === "object" && option?.text ? option.text : option;

          return (
            <div
              key={idx}
              className="form-check d-flex align-items-center gap-2 p-2 mb-2 ms-2"
            >
              <input
                type="checkbox"
                className="form-check-input"
                id={`checkbox-opt-${question.id}-${idx}`}
                value={optionValue}
                checked={userAnswer ? userAnswer.includes(optionValue) : false}
                onChange={handleAnswerChange}
                required={question.required && (!userAnswer || userAnswer.length === 0)}
                disabled={question.disabled}
                style={{ cursor: question.disabled ? "not-allowed" : "pointer" }}
              />
              <label
                className="form-check-label mb-0"
                htmlFor={`checkbox-opt-${question.id}-${idx}`}
                style={{
                  fontSize: "1rem",
                  cursor: question.disabled ? "not-allowed" : "pointer",
                }}
              >
                {optionValue || `Option ${idx + 1}`}
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Checkbox;