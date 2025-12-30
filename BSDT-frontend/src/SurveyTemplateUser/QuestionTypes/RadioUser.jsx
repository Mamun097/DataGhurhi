import React, { useMemo, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const Radio = ({ index, question, userResponse, setUserResponse }) => {
  const userAnswer = userResponse.find(
    (response) => response.questionText === question.text
  )?.userResponse;

  const [otherOption, setOtherOption] = useState("");
  const [otherSelected, setOtherSelected] = useState(false);

  // Handles selection of a new radio option
  const handleAnswerChange = (e) => {
    const selectedValue = e.target.value;
    setUserResponse((prevUserResponse) => {
      const existingQuestionIndex = prevUserResponse.findIndex(
        (response) => response.questionText === question.text
      );

      if (existingQuestionIndex !== -1) {
        // Update existing question response
        return prevUserResponse.map((resp, index) =>
          index === existingQuestionIndex
            ? { ...resp, userResponse: selectedValue }
            : resp
        );
      }
      // If the question response does not exist, create a new one
      return [
        ...prevUserResponse,
        {
          questionText: question.text,
          userResponse: selectedValue,
        },
      ];
    });
  };

  // Handles click to allow deselection of the same option
  const handleAnswerClick = (e) => {
    const clickedValue = e.target.value;
    if (userAnswer === clickedValue) {
      // If the same option is clicked, remove it (deselect)
      setUserResponse((prevUserResponse) =>
        prevUserResponse.filter(
          (response) => response.questionText !== question.text
        )
      );
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
          return prevUserResponse.map((resp, index) =>
            index === existingQuestionIndex
              ? { ...resp, userResponse: newOtherOption }
              : resp
          );
        }
        return prevUserResponse;
      });
    }
  };

  const shuffledOptions = useMemo(() => {
    const options = question.meta?.options || [];
    if (question.meta?.enableOptionShuffle === true) {
      console.log("Shuffling options for question:", question.text);
      const shuffled = [...options];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Swap elements
      }
      return shuffled;
    }
    return options;
  }, [question]);
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

      {/* Radio Options */}
      <div>
        {shuffledOptions.map((option, idx) => (
          <div
            key={idx}
            // className="form-check mb-3 ps-2 ms-3"
            className="form-check p-2 mb-2 ms-2"
            style={{
              display: "flex",
              gap: "0.75rem",
              alignItems: "flex-start",
            }}
          >
            <input
              type="radio"
              className="form-check-input"
              name={`radio-${question.id}`}
              id={`radio-opt-${question.id}-${idx}`}
              value={option}
              checked={userAnswer === option}
              onChange={(e) => {
                handleAnswerChange(e);
                setOtherSelected(false); // Reset otherSelected when selecting regular options
              }}
              onClick={handleAnswerClick}
              required={question.required}
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
              className="form-check-label pe-2 mt-2"
              htmlFor={`radio-opt-${question.id}-${idx}`}
              style={{
                fontSize: "1rem",
                cursor: question.disabled ? "not-allowed" : "pointer",
                flex: "1 1 0",
                whiteSpace: "normal",
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              {option || `Option ${idx + 1}`}
            </label>
          </div>
        ))}
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
              type="radio"
              value={otherOption}
              checked={userAnswer === otherOption}
              onChange={(e) => {
                handleAnswerChange(e);
                setOtherSelected((prev) => !prev);
              }}
              onClick={(e) => {
                handleAnswerClick(e);
                if (userAnswer === otherOption) {
                  setOtherSelected(false); // Set to false when deselecting "Other"
                }
              }}
              required={question.required}
              disabled={question.disabled}
              className="form-check-input me-2"
              name={`radio-${question.id}`}
              id={`radio-other-${question.id}`}
              style={{
                flex: "0 0 auto",
                marginTop: "0.35rem",
                cursor: question.disabled ? "not-allowed" : "pointer",
              }}
            />
            <label
              className="form-check-label pe-2"
              htmlFor={`radio-other-${question.id}`}
              style={{
                flex: "1 1 auto",
                margin: 0,
                lineHeight: 1.2,
                cursor: question.disabled ? "not-allowed" : "pointer",
              }}
            >
              {otherLabel}
            </label>
          </div>
          <input
            type="text"
            className="form-control"
            style={{ maxWidth: "300px" }}
            placeholder="Write your own option"
            value={otherOption}
            onChange={handleEditOtherOption}
            required={otherSelected}
          />
        </>
      )}
    </div>
  );
};

export default Radio;
