import { useEffect } from "react";
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
  isLoggedInRequired,
  setIsLoggedInRequired,
  shuffleQuestions,
  setShuffleQuestions,
  isQuiz,
  setIsQuiz,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
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

  useEffect(() => {
    if (isQuiz) {
      setIsLoggedInRequired(true);
    }
    if (isOpen) {
      // Prevent scrolling on the main page
      document.body.style.overflow = "hidden";
    } else {
      // Restore scrolling when modal is hidden
      document.body.style.overflow = "unset";
    }

    // Cleanup: Restore scrolling if component unmounts
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

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
          {/* --- Publication Related Switches --- */}
          <div className="settings-group">
            <h3 className="settings-heading">Response Collection</h3>
            <ToggleSwitch
              id="login-required"
              label="Is login required?"
              description="User will be required to log into DataGhurhi to participate"
              checked={isLoggedInRequired}
              onChange={(e) => {
                setIsLoggedInRequired(e.target.checked);
              }}
            />
          </div>

          <div className="settings-group">
            <h3 className="settings-heading">Presentation</h3>
            <ToggleSwitch
              id="shuffle-questions"
              label="Shuffle Question Order"
              description=""
              checked={shuffleQuestions}
              onChange={(e) => {
                setShuffleQuestions(e.target.checked);
              }}
            />
          </div>

          {/* --- Make this a quiz --- */}
          <div className="settings-group">
            <h3 className="settings-heading">Make this a quiz</h3>
            <ToggleSwitch
              id="make-quiz"
              label="Quiz"
              description="Enable quiz features like grading and feedback (only for multiple choice questions)"
              checked={isQuiz}
              onChange={(e) => {
                setIsQuiz(e.target.checked);
                setIsLoggedInRequired(
                  isLoggedInRequired === false ? e.target.checked : true
                );
              }}
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

              {/* --- Time --- */}
              {/* User can set start and end time for quiz availability */}
              <div className="settings-group">
                <h3 className="settings-heading">Quiz availability</h3>
                <div className="settings-datetime-item">
                  <label htmlFor="start-time" style={{ fontWeight: "500" }}>
                    Start time
                  </label>
                  <input
                    type="datetime-local"
                    id="start-time"
                    className="settings-datetime-input"
                    value={startTime || ""}
                    // If endTime is null, then endTime = startTime + 30 minutes
                    onChange={(e) => {
                      setStartTime(e.target.value);
                      if (!endTime) {
                        setEndTime(
                          new Date(
                            new Date(e.target.value).getTime() + 30 * 60000
                          )
                            .toISOString()
                            .slice(0, 16)
                        );
                      }
                    }}
                  />
                </div>
                <div className="settings-datetime-item">
                  {/* If endTime is before startTime, show a warning */}
                  <label htmlFor="end-time" style={{ fontWeight: "500" }}>
                    End time
                  </label>
                  {startTime &&
                    endTime &&
                    new Date(endTime) < new Date(startTime) && (
                      <p style={{ color: "red", marginTop: "4px" }}>
                        End time cannot be before start time.
                      </p>
                    )}

                  <input
                    type="datetime-local"
                    id="end-time"
                    className="settings-datetime-input"
                    value={endTime || ""}
                    onChange={(e) => {
                      setEndTime(e.target.value);
                    }}
                  />
                </div>
              </div>
              {/* --- Respondent settings --- */}
              <div className="settings-group">
                <h3 className="settings-heading">Respondent settings</h3>
                {/* <ToggleSwitch
                  id="see-missed"
                  label="Missed questions"
                  description="Respondents can see which questions were answered incorrectly"
                  checked={seeMissedQuestions}
                  onChange={(e) => setSeeMissedQuestions(e.target.checked)}
                /> */}
                <ToggleSwitch
                  id="see-correct"
                  label="Correct answers"
                  description="Respondents can see correct answers"
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
              </div>

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
