import React, { useMemo, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const Dropdown = ({ index, question, userResponse, setUserResponse }) => {
  const userAnswer = userResponse.find(
    (response) => response.questionText === question.text
  )?.userResponse;
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
  const isOtherSelected =
    userAnswer && userAnswer !== "" && !shuffledOptions.includes(userAnswer);

  const [otherOption, setOtherOption] = useState(
    isOtherSelected ? userAnswer : ""
  );
  const [otherSelected, setOtherSelected] = useState(isOtherSelected);
  const selectValue = isOtherSelected ? "__OTHER__" : userAnswer || "";
  const updateUserResponse = (selectedValue) => {
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

  // This is the new handler for the <select> element
  const handleAnswerChange = (e) => {
    const selectedValue = e.target.value;
    if (selectedValue === "__OTHER__") {
      setOtherSelected(true);
      updateUserResponse(otherOption); // Update response with "Other" text
    } else {
      setOtherSelected(false);
      updateUserResponse(selectedValue); // Update response with standard option
    }
  };

  // This handles changes to the "Other" text box
  const handleEditOtherOption = (e) => {
    const newOtherOption = e.target.value;
    setOtherOption(newOtherOption);

    // If "Other" is currently selected, update userResponse with the new text
    if (otherSelected) {
      updateUserResponse(newOtherOption);
    }
  };
  return (
    <div className="mt-2 ms-2">
      {/* Question Text */}
      <h5 className="mb-2" style={{ fontSize: "1.2rem" }}>
        {index}
        {". "}
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
          value={selectValue}
          onChange={handleAnswerChange}
          required={question.required}
          disabled={question.disabled}
        >
          <option value="" disabled>
            Select an option
          </option>
          {question.otherAsOption && <option value="__OTHER__">Other</option>}

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
      {question.otherAsOption && otherSelected && (
        <div className="mt-3">
          <input
            type="text"
            className="form-control"
            style={{ maxWidth: "300px" }}
            placeholder="Write your own option"
            value={otherOption}
            onChange={handleEditOtherOption}
            required={otherSelected}
          />
        </div>
      )}
    </div>
  );
};

export default Dropdown;
