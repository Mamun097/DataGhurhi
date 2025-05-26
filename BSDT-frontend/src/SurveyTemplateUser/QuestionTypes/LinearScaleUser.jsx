import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const LinearScaleQuestion = ({ question, userResponse, setUserResponse }) => {
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

  const userAnswer = userResponse.find(
    (response) => response.questionText === question.text
  )?.userResponse;

  // Modified handleAnswerChange to update existing response or add new one
  const handleAnswerChange = (e) => {
    const selectedValue = Number(e.target.value);
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

      {/* Scale Display */}
      <div className="mt-3 mb-3">
        {/* Top row: Scale Values */}
        <div className="d-flex justify-content-center gap-3 mb-2">
          {scaleOptions.map((value) => (
            <div key={value} style={{ width: "32px", textAlign: "center" }}>
              <span className="text-muted">{value}</span>
            </div>
          ))}
        </div>

        {/* Second row: Radio buttons + labels */}
        <div className="d-flex justify-content-center align-items-center gap-3">
          {/* Left label */}
          {leftLabel && (
            <div
              className="me-2"
              style={{ minWidth: "40px", textAlign: "right" }}
            >
              <span className="text-muted">{leftLabel}</span>
            </div>
          )}

          {/* Radio buttons */}
          {scaleOptions.map((value) => (
            <div key={value} style={{ width: "32px", textAlign: "center" }}>
              <input
                type="radio"
                className="form-check-input"
                name={`linear-scale-${question.id}`}
                value={value}
                checked={userAnswer === value}
                onChange={handleAnswerChange}
                required={question.required}
                disabled={question.disabled}
              />
            </div>
          ))}

          {/* Right label */}
          {rightLabel && (
            <div
              className="ms-2"
              style={{ minWidth: "40px", textAlign: "left" }}
            >
              <span className="text-muted">{rightLabel}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LinearScaleQuestion;
