import React, { useMemo } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const Dropdown = ({ question, userResponse, setUserResponse }) => {
  const userAnswer = userResponse.find(
    (response) => response.questionText === question.text
  )?.userResponse;

  // This handler updates the user's response state
  const handleAnswerChange = (e) => {
    const selectedValue = e.target.value;
    const existingResponseIndex = userResponse.findIndex(
      (response) => response.questionText === question.text
    );
    if (existingResponseIndex !== -1) {
      // Update existing response if found
      const updatedResponse = [...userResponse];
      updatedResponse[existingResponseIndex].userResponse = selectedValue;
      setUserResponse(updatedResponse);
    } else {
      // Add a new response if not found
      const newResponse = {
        questionText: question.text,
        userResponse: selectedValue,
      };
      setUserResponse([...userResponse, newResponse]);
    }
  };

  const shuffledOptions = useMemo(() => {
    const options = question.meta?.options || [];
    // Shuffle only if the flag is explicitly true
    if (question.meta?.enableOptionShuffle === true) {
      // Create a copy and shuffle it using the Fisher-Yates algorithm
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

      {/* Dropdown Options */}
      <div className="mt-3 mb-3">
        <select
          className="form-select"
          style={{ maxWidth: "200px" }}
          value={userAnswer || ""}
          onChange={handleAnswerChange}
          required={question.required}
          disabled={question.disabled}
        >
          <option value="" disabled>
            Select an option
          </option>
          
          {shuffledOptions.map((option, idx) => {
            const optionValue =
              typeof option === "object" && option?.text ? option.text : option;
            return (
              <option key={idx} value={optionValue} className="max-md-2">
                {optionValue || `Option ${idx + 1}`}
              </option>
            );
          })}
        </select>
      </div>
    </div>
  );
};

export default Dropdown;