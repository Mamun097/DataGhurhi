import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const RatingQuestion = ({
  index,
  question,
  userResponse,
  setUserResponse,
  showNumbering,
}) => {
  // Default scale
  const scale = question.meta?.scale || 5;
  // Find the user's answer if it exists
  const userAnswer = userResponse.find(
    (response) => response.questionText === question.text
  )?.userResponse;

  // Function to handle when a user selects a rating
  // It updates the userResponse state with the selected rating for this question
  const handleAnswerChange = (selectedRating) => {
    const existingResponseIndex = userResponse.findIndex(
      (response) => response.questionText === question.text
    );
    if (existingResponseIndex !== -1) {
      // If a response already exists, update it with the new rating
      const updatedResponse = [...userResponse];
      updatedResponse[existingResponseIndex].userResponse = selectedRating;
      setUserResponse(updatedResponse);
    } else {
      // If no response exists, add a new response with the selected rating
      const newResponse = {
        questionText: question.text,
        userResponse: selectedRating,
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

      {/* Rating Stars */}
      <div
        className="d-flex flex-wrap justify-content-center mt-3 mb-3 gap-2"
        style={{ maxWidth: "100%", overflowX: "auto" }}
      >
        {[...Array(scale)].map((_, idx) => (
          <div key={idx} className="text-center" style={{ minWidth: 40 }}>
            <button
              type="button"
              className="btn btn-link p-0 border-0"
              onClick={() => handleAnswerChange(idx + 1)}
              style={{
                color: idx + 1 <= userAnswer ? "#ffc107" : "#6c757d",
                fontSize: "24px",
                cursor: "pointer",
              }}
            >
              {idx + 1 <= userAnswer ? (
                <i className="bi bi-star-fill"></i>
              ) : (
                <i className="bi bi-star"></i>
              )}
            </button>
            <div className="text-muted" style={{ fontSize: "14px" }}>
              {idx + 1}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RatingQuestion;
