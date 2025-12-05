import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const TextUser = ({ index, question, userResponse, setUserResponse }) => {
  const userAnswer =
    userResponse.find((response) => response.questionText === question.text)
      ?.userResponse || "";
  const [error, setError] = useState("");

  return (
    <div className="mt-2 ms-2 me-2">
      <h5 className="mb-2" style={{ fontSize: "1.2rem" }}>
        {index}
        {". "}
        {question.text || "Untitled Question"}
        {question.required && <span className="text-danger ms-1">*</span>}
      </h5>
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
      <textarea
        rows="1"
        type="text"
        className="form-control mt-3"
        value={userAnswer}
        onFocus={(e) => e.target.select()}
        disabled={true}
        aria-label="Text input"
      />
      {error && <small className="text-danger">{error}</small>}
    </div>
  );
};

export default TextUser;
