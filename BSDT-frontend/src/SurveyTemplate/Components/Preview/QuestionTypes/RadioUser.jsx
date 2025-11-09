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
      const shuffled = [...options];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Swap elements
      }
      return shuffled;
    }
    return options;
  }, [question]);

  return (
    <div className="mt-2 ms-2">
      {/* Question Text */}
      <h5 className="mb-2" style={{ fontSize: "1.2rem" }}>
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
          <div key={idx} className="form-check mb-3 ps-2 ms-3">
            <input
              type="radio"
              className="form-check-input me-2"
              name={`radio-${question.id}`}
              id={`radio-opt-${question.id}-${idx}`}
              value={option.text}
              checked={userAnswer === option.text}
              onChange={(e) => {
                handleAnswerChange(e);
                setOtherSelected(false); // Reset otherSelected when selecting regular options
              }}
              onClick={handleAnswerClick}
              required={question.required}
              disabled={question.disabled}
            />
            <label
              className="form-check-label pe-2 mt-2"
              htmlFor={`radio-opt-${question.id}-${idx}`}
            >
              {option.text || `Option ${idx + 1}`}
            </label>
          </div>
        ))}
      </div>
      {question.otherAsOption && (
        <div className="form-check mb-3 ps-2 ms-3 d-flex align-items-center">
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
          />
          <label
            className="form-check-label pe-2"
            htmlFor={`radio-other-${question.id}`}
          >
            Other
          </label>
          <input
            type="text"
            className="form-control ms-2"
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

export default Radio;
