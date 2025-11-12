import React from "react";
import "../CSS/SettingsModal.css";

// A helper component to create a consistent toggle switch
const ToggleSwitch = ({ id, checked, onChange, label, description }) => (
  <div className="settings-toggle-item">
    <div className="settings-toggle-label">
      <label htmlFor={id} style={{ fontWeight: "500" }}>
        {label}
      </label>
      {description && <p className="settings-description">{description}</p>}
    </div>
    <label className="switch">
      <input id={id} type="checkbox" checked={checked} onChange={onChange} />
      <span className="slider round"></span>
    </label>
  </div>
);

const SettingsModal = ({
  isOpen,
  onClose,
  isQuiz,
  setIsQuiz,
  timeLimit,
  setTimeLimit,
  releaseMarks,
  setReleaseMarks,
  seeMissedQuestions,
  setSeeMissedQuestions,
  seeCorrectAnswers,
  setSeeCorrectAnswers,
  seePointValues,
  setSeePointValues,
  defaultPointValue,
  setDefaultPointValue,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{"Settings"}</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-content">
          {/* --- Make this a quiz --- */}
          <div className="settings-group">
            <ToggleSwitch
              id="make-quiz"
              label="Quiz"
              description="Enable quiz features like grading and feedback (only for multiple choice questions)"
              checked={isQuiz}
              onChange={(e) => setIsQuiz(e.target.checked)}
            />
          </div>

          {/* Conditionally render quiz settings only if isQuiz is true */}
          {isQuiz && (
            <>
              {/* --- Release marks --- */}
              <div className="settings-group">
                <h3 className="settings-heading">Release marks</h3>
                <div className="settings-radio-group">
                  <div className="settings-radio-item">
                    <input
                      type="radio"
                      id="release-immediately"
                      name="release-marks"
                      value="immediately"
                      checked={releaseMarks === "immediately"}
                      onChange={(e) => setReleaseMarks(e.target.value)}
                    />
                    <label htmlFor="release-immediately">
                      Immediately after each submission
                    </label>
                  </div>
                  {/* <div className="settings-radio-item">
                    <input
                      type="radio"
                      id="release-later"
                      name="release-marks"
                      value="later"
                      checked={releaseMarks === "later"}
                      onChange={(e) => setReleaseMarks(e.target.value)}
                    />
                    <label htmlFor="release-later">
                      Later, after manual review
                    </label>
                    <p className="settings-description-inline">
                      (Turns on email collection)
                    </p>
                  </div> */}
                </div>
              </div>

              {/* --- Time limit --- */}
              <div className="settings-group">
                <h3 className="settings-heading">Time limit - minutes</h3>
                <div className="settings-number-item">
                  <p className="settings-description">
                    Set a time limit for completing the quiz
                  </p>
                  <input
                    type="number"
                    id="time-limit"
                    min="1"
                    step="1"
                    value={timeLimit}
                    onChange={(e) =>
                      setTimeLimit(Math.max(0, Number(e.target.value)))
                    }
                    className="settings-number-input"
                  />
                </div>
              </div>

              {/* --- Respondent settings --- */}
              {/* <div className="settings-group">
                <h3 className="settings-heading">Respondent settings</h3>
                <ToggleSwitch
                  id="see-missed"
                  label="Missed questions"
                  description="Respondents can see which questions were answered incorrectly"
                  checked={seeMissedQuestions}
                  onChange={(e) => setSeeMissedQuestions(e.target.checked)}
                />
                <ToggleSwitch
                  id="see-correct"
                  label="Correct answers"
                  description="Respondents can see correct answers after grades are released"
                  checked={seeCorrectAnswers}
                  onChange={(e) => setSeeCorrectAnswers(e.target.checked)}
                />
                <ToggleSwitch
                  id="see-points"
                  label="Point values"
                  description="Respondents can see total points and points received for each question"
                  checked={seePointValues}
                  onChange={(e) => setSeePointValues(e.target.checked)}
                />
              </div> */}

              {/* --- Global quiz defaults --- */}
              <div className="settings-group">
                <h3 className="settings-heading">Global quiz defaults</h3>
                <div className="settings-number-item">
                  <label htmlFor="default-points" style={{ fontWeight: "500" }}>
                    Default question point value
                  </label>
                  <p className="settings-description">
                    Point values for every new question
                  </p>
                  <input
                    type="number"
                    id="default-points"
                    min="0"
                    step="1"
                    value={defaultPointValue}
                    onChange={(e) =>
                      setDefaultPointValue(Math.max(0, Number(e.target.value)))
                    }
                    className="settings-number-input"
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
