import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const DateTimeQuestion = ({
  index,
  question,
  userResponse,
  setUserResponse,
  showNumbering,
}) => {
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
      updatedResponse[existingResponseIndex].userResponse = selectedValue;
      setUserResponse(updatedResponse);
    } else {
      // Add new response
      const newResponse = {
        questionText: question.text,
        userResponse: selectedValue,
      };
      setUserResponse([...userResponse, newResponse]);
    }
  };

  return (
    <div className="mt-2 ms-2">
      {/* Question Text */}
      <h5 className="mb-2" style={{ fontSize: "1.2rem" }}>
        {showNumbering ? `${index}. ` : ""}
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

      {/* Date/Time Input */}
      <div className="mt-3 mb-3">
        <input
          type={question.meta.dateType === "time" ? "time" : "date"}
          className="form-control form-control w-auto"
          value={userAnswer || ""}
          onChange={handleAnswerChange}
          required={question.required}
          disabled={question.disabled}
        />
      </div>
    </div>
  );
};

export default DateTimeQuestion;
