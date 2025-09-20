import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const LinearScaleQuestion = ({
  index,
  question,
  userResponse,
  setUserResponse,
}) => {
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
    <div className="mt-2 ms-2 me-2">
      {/* Question Text */}
      <h5
        className="mb-3"
        style={{
          fontSize: "clamp(1rem, 4vw, 1.2rem)",
          lineHeight: "1.4",
          wordBreak: "break-word",
        }}
      >
        {index}{". "}
        {question.text || "Untitled Question"}
        {question.required && <span className="text-danger ms-1">*</span>}
      </h5>

      {/* Image Preview */}
      {question.imageUrls && question.imageUrls.length > 0 && (
        <div className="mt-4 mb-4">
          {question.imageUrls.map((img, idx) => (
            <div key={idx} className="mb-3 bg-gray-50">
              <div
                className={`d-flex justify-content-${
                  img.alignment || "center"
                }`}
              >
                <img
                  src={img.url}
                  alt={`Question ${idx}`}
                  className="img-fluid rounded"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "clamp(200px, 50vw, 300px)",
                    objectFit: "contain",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Scale Display */}
      <div className="mt-3 mb-3">
        {/* Labels and Radio Buttons Container */}
        <div
          className="d-flex flex-wrap align-items-center justify-content-center scale-container"
          style={{ maxWidth: "100%", overflowX: "auto" }}
        >
          {/* Left Label (Top on mobile) */}
          {leftLabel && (
            <div
              className="text-muted text-center left-label"
              style={{
                minWidth: "clamp(20px, 5vw, 30px)",
                marginRight: "0.25rem",
                fontSize: "clamp(0.8rem, 3vw, 0.9rem)",
                alignSelf: "center",
              }}
            >
              {leftLabel}
            </div>
          )}

          {/* Scale Values and Radio Buttons */}
          <div
            className="d-flex flex-wrap justify-content-center gap-2 scale-options"
            style={{ flex: "1 1 auto", minWidth: 0 }}
          >
            {scaleOptions.map((value) => (
              <div
                key={value}
                className="text-center"
                style={{
                  minWidth: "clamp(30px, 8vw, 40px)",
                  flex: "0 1 auto",
                }}
              >
                {/* Scale Value (on top) */}
                <div
                  className="text-muted"
                  style={{ fontSize: "clamp(0.8rem, 3vw, 0.9rem)" }}
                >
                  {value}
                </div>
                {/* Radio Button */}
                <input
                  type="radio"
                  className="form-check-input"
                  name={`linear-scale-${question.id}`}
                  value={value}
                  checked={userAnswer === value}
                  onChange={handleAnswerChange}
                  required={question.required}
                  disabled={question.disabled}
                  style={{
                    width: "clamp(16px, 4vw, 18px)",
                    height: "clamp(16px, 4vw, 18px)",
                    marginTop: "0.25rem",
                  }}
                />
              </div>
            ))}
          </div>

          {/* Right Label (Bottom on mobile) */}
          {rightLabel && (
            <div
              className="text-muted text-center right-label"
              style={{
                minWidth: "clamp(20px, 5vw, 30px)",
                marginLeft: "0.25rem",
                fontSize: "clamp(0.8rem, 3vw, 0.9rem)",
                alignSelf: "center",
              }}
            >
              {rightLabel}
            </div>
          )}
        </div>
      </div>

      {/* Responsive styles */}
      <style jsx>{`
        @media (max-width: 576px) {
          .scale-container {
            flex-direction: column !important;
            align-items: center;
          }
          .scale-options {
            flex-direction: column !important;
            align-items: center;
            gap: 0.5rem !important;
          }
          .left-label {
            padding-right: 0 !important;
            padding-bottom: 0.25rem;
            min-width: 100% !important;
          }
          .right-label {
            padding-left: 0 !important;
            padding-top: 0.25rem;
            min-width: 100% !important;
          }
          .form-check-input {
            transform: scale(0.9);
          }
          .text-muted {
            font-size: clamp(0.7rem, 2.5vw, 0.8rem) !important;
          }
          h5 {
            fontsize: clamp(0.9rem, 3.5vw, 1rem) !important;
          }
        }
      `}</style>
    </div>
  );
};

export default LinearScaleQuestion;
