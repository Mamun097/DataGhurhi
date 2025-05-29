import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const Checkbox = ({ question, userResponse, setUserResponse }) => {
  const userAnswer = userResponse.find(
    (response) => response.questionText === question.text
  )?.userResponse;

  // Modified handleAnswerChange to update existing response or add new one
  const handleAnswerChange = (e) => {
    const selectedValue = e.target.value;
    const existingResponseIndex = userResponse.findIndex(
      (response) => response.questionText === question.text
    );

    if (existingResponseIndex !== -1) {
      // Update existing response
      const updatedResponse = [...userResponse];
      // if the value is already in the response, remove it; otherwise, add it
      if (
        updatedResponse[existingResponseIndex].userResponse.includes(
          selectedValue
        )
      ) {
        updatedResponse[existingResponseIndex].userResponse = updatedResponse[
          existingResponseIndex
        ].userResponse.filter((value) => value !== selectedValue);
      } else {
        updatedResponse[existingResponseIndex].userResponse.push(selectedValue);
      }
      setUserResponse(updatedResponse);
    } else {
      // Add new response
      const newResponse = {
        questionText: question.text,
        userResponse: [selectedValue],
      };
      setUserResponse([...userResponse, newResponse]);
    }
  };

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
        {question.meta?.options?.map((option, idx) => (
          <div
            key={idx}
            className="form-check d-flex align-items-center gap-2 p-2 mb-2 ms-2"
          >
            <input
              type="checkbox"
              className="form-check-input"
              id={`checkbox-opt-${question.id}-${idx}`}
              value={option}
              checked={userAnswer ? userAnswer.includes(option) : false}
              onChange={handleAnswerChange}
              required={question.required}
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
              {option || `Option ${idx + 1}`}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Checkbox;
