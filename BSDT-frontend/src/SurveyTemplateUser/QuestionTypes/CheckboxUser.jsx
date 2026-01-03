import React, { useMemo, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const Checkbox = ({
  index,
  question,
  userResponse,
  setUserResponse,
  showNumbering,
}) => {
  const userAnswer = userResponse.find(
    (response) => response.questionText === question.text
  )?.userResponse;

  const [otherOption, setOtherOption] = useState("");
  const [otherSelected, setOtherSelected] = useState(false);

  // Handles adding/removing selections from the response array
  const handleAnswerChange = (e) => {
    const selectedValue = e.target.value;
    const existingResponseIndex = userResponse.findIndex(
      (response) => response.questionText === question.text
    );

    if (existingResponseIndex !== -1) {
      // Update existing response
      const updatedResponse = [...userResponse];
      const currentAnswers =
        updatedResponse[existingResponseIndex].userResponse;

      // If the value is already in the response, remove it; otherwise, add it
      if (currentAnswers.includes(selectedValue)) {
        updatedResponse[existingResponseIndex].userResponse =
          currentAnswers.filter((value) => value !== selectedValue);

        // If no answers remain, remove the question response
        if (updatedResponse[existingResponseIndex].userResponse.length === 0) {
          updatedResponse.splice(existingResponseIndex, 1);
        }
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

  // Handles changes to the "Other" text box
  const handleEditOtherOption = (e) => {
    const newOtherOption = e.target.value;
    setOtherOption(newOtherOption);

    // If "Other" is currently selected, update userResponse with the new text
    if (otherSelected) {
      setUserResponse((prevUserResponse) => {
        const existingQuestionIndex = prevUserResponse.findIndex(
          (response) => response.questionText === question.text
        );

        if (existingQuestionIndex !== -1) {
          const originalOptions = question.meta?.options || [];
          // Find out the index of the user's "Other" response by filtering out the original options
          const otherIndex = prevUserResponse[
            existingQuestionIndex
          ].userResponse.findIndex((resp) => !originalOptions.includes(resp));
          if (otherIndex !== -1) {
            // Update the "Other" response with the new text
            const updatedResponse = [...prevUserResponse];
            updatedResponse[existingQuestionIndex].userResponse[otherIndex] =
              newOtherOption;
            return updatedResponse;
          }
        }
        return prevUserResponse;
      });
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

  // 1. Get the text of the last visible option
  const lastOptionText =
    shuffledOptions.length > 0
      ? shuffledOptions[shuffledOptions.length - 1]
      : "";

  // 2. Check if it contains Bangla characters
  const isLastOptionBangla = /[\u0980-\u09FF]/.test(lastOptionText);

  // 3. Define the label text
  const otherLabel = isLastOptionBangla ? "অন্যান্য" : "Other";

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

      {/* Checkbox Options */}
      <div className="mt-2 ms-2">
        {/* Map over the memoized (and possibly shuffled) options */}
        {shuffledOptions.map((option, idx) => {
          const optionValue =
            typeof option === "object" && option?.text ? option.text : option;

          return (
            <div
              key={idx}
              // className="form-check d-flex align-items-center gap-2 p-2 mb-2 ms-2"
              className="form-check p-2 mb-2 ms-2"
              style={{
                display: "flex",
                gap: "0.75rem",
                alignItems: "flex-start",
              }}
            >
              <input
                type="checkbox"
                className="form-check-input"
                id={`checkbox-opt-${question.id}-${idx}`}
                value={optionValue}
                checked={userAnswer ? userAnswer.includes(optionValue) : false}
                onChange={handleAnswerChange}
                required={
                  question.required && (!userAnswer || userAnswer.length === 0)
                }
                disabled={question.disabled}
                style={{
                  cursor: question.disabled ? "not-allowed" : "pointer",
                  alignSelf: "flex-start",
                  flex: "0 0 auto",
                  width: "1.25rem",
                  height: "1.25rem",
                  marginTop: "0.35rem",
                }}
              />
              <label
                className="form-check-label mb-0"
                htmlFor={`checkbox-opt-${question.id}-${idx}`}
                style={{
                  fontSize: "1rem",
                  cursor: question.disabled ? "not-allowed" : "pointer",
                  flex: "1 1 0",
                  whiteSpace: "normal",
                  margin: 0,
                  lineHeight: 1.9,
                }}
              >
                {optionValue || `Option ${idx + 1}`}
              </label>
            </div>
          );
        })}
      </div>

      {question.otherAsOption && (
        <>
          <div
            className="form-check mb-3 ps-2 ms-3"
            style={{
              display: "flex",
              gap: "0.75rem",
              alignItems: "flex-start",
              flexWrap: "wrap",
            }}
          >
            <input
              type="checkbox"
              value={otherOption}
              checked={userAnswer ? userAnswer.includes(otherOption) : false}
              onChange={(e) => {
                setOtherSelected((prev) => !prev);
                handleAnswerChange(e);
              }}
              required={
                question.required && (!userAnswer || userAnswer.length === 0)
              }
              disabled={question.disabled}
              className="form-check-input"
              name={`checkbox-${question.id}`}
              id={`checkbox-other-${question.id}`}
              style={{
                flex: "0 0 auto",
                marginTop: "0.35rem",
                cursor: question.disabled ? "not-allowed" : "pointer",
              }}
            />

            <label
              className="form-check-label"
              htmlFor={`checkbox-other-${question.id}`}
              style={{
                flex: "1 1 auto",
                margin: 0,
                lineHeight: 1.9,
                cursor: question.disabled ? "not-allowed" : "pointer",
              }}
            >
              {otherLabel}
            </label>
          </div>
          <input
            type="text"
            className="form-control"
            style={{
              maxWidth: "300px",
              // marginLeft: "1.1rem",
              // marginTop: "0.25rem",
            }}
            placeholder="Write your own option"
            value={otherOption}
            onChange={handleEditOtherOption}
            required={otherSelected}
            disabled={!otherSelected}
          />
        </>
      )}
    </div>
  );
};

export default Checkbox;
