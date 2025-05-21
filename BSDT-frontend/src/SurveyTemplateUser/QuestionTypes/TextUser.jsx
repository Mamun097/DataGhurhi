import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const Text = ({ question, questions, setQuestions }) => {
  const [error, setError] = useState("");
  const validationType = question.meta?.validationType || null;
  const condition = question.meta?.condition || null;
  const validationText = question.meta?.validationText || "";
  const errorText = question.meta?.errorText || "Invalid input";

  // Handle text input change with validation
  const handleAnswerChange = (e) => {
    const value = e.target.value;
    let isValid = true;

    // Apply validation if defined
    if (validationType && condition) {
      switch (validationType) {
        case "Number":
          const numValue = Number(value);
          const numValidationText = Number(validationText);
          switch (condition) {
            case "Greater Than":
              isValid = !isNaN(numValue) && numValue > numValidationText;
              break;
            case "Greater Than or Equal To":
              isValid = !isNaN(numValue) && numValue >= numValidationText;
              break;
            case "Less Than":
              isValid = !isNaN(numValue) && numValue < numValidationText;
              break;
            case "Less Than or Equal To":
              isValid = !isNaN(numValue) && numValue <= numValidationText;
              break;
            case "Equal To":
              isValid = !isNaN(numValue) && numValue === numValidationText;
              break;
            case "Not Equal To":
              isValid = !isNaN(numValue) && numValue !== numValidationText;
              break;
            case "Is Number":
              isValid = !isNaN(numValue);
              break;
            case "Is Not Number":
              isValid = isNaN(numValue);
              break;
            default:
              isValid = true;
          }
          break;
        case "Text":
          switch (condition) {
            case "Contains":
              isValid = value.includes(validationText);
              break;
            case "Does Not Contain":
              isValid = !value.includes(validationText);
              break;
            case "Email":
              isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
              break;
            case "URL":
              isValid = /^(https?:\/\/)?[\w\-]+(\.[\w\-]+)+[/#?]?.*$/.test(value);
              break;
            default:
              isValid = true;
          }
          break;
        case "Length":
          const len = value.length;
          const lenValidationText = Number(validationText);
          switch (condition) {
            case "Maximum character Count":
              isValid = len <= lenValidationText;
              break;
            case "Minimum character Count":
              isValid = len >= lenValidationText;
              break;
            default:
              isValid = true;
          }
          break;
        case "RegularExpression":
          try {
            const regex = new RegExp(validationText);
            switch (condition) {
              case "Contains":
                isValid = regex.test(value);
                break;
              case "Doesn't Contain":
                isValid = !regex.test(value);
                break;
              case "Matches":
                isValid = regex.test(value) && value.match(regex)[0] === value;
                break;
              case "Doesn't Match":
                isValid = !regex.test(value) || value.match(regex)[0] !== value;
                break;
              default:
                isValid = true;
            }
          } catch {
            isValid = true; // Skip invalid regex
          }
          break;
        default:
          isValid = true;
      }
    }

    // Update answer and error state
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === question.id ? { ...q, answer: value } : q
      )
    );
    setError(isValid ? "" : errorText);
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

      {/* Text Input */}
      <div className="mb-3">
        <input
          type={validationType === "Email" ? "email" : validationType === "URL" ? "url" : "text"}
          className={`form-control ${error ? "is-invalid" : ""}`}
          placeholder="Enter your answer here"
          value={question.answer || ""}
          onChange={handleAnswerChange}
          required={question.required}
          disabled={question.disabled} // Optional: if you want to disable interaction
        />
        {error && <div className="invalid-feedback">{error}</div>}
      </div>

      {/* Required Question Indicator */}
      {question.required && !question.answer && (
        <small className="text-danger">This question is required.</small>
      )}
    </div>
  );
};

export default Text;