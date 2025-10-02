import React, { useState, useEffect } from "react";
import "../CSS/SurveySettingsDrawer.css";

const SurveySettingsDrawer = ({
  isOpen,
  onClose,
  collectResponse: initialCollectResponse,
  endingDate: initialEndingDate,
  onSave,
}) => {
  const [pendingCollectResponse, setPendingCollectResponse] = useState(
    initialCollectResponse
  );
  const [pendingEndingDate, setPendingEndingDate] = useState(
    initialEndingDate || ""
  );

  useEffect(() => {
    if (isOpen) {
      setPendingCollectResponse(initialCollectResponse);
      setPendingEndingDate(initialEndingDate || "");
    }
  }, [isOpen, initialCollectResponse, initialEndingDate]);

  const handleToggleChange = (isToggled) => {
    setPendingCollectResponse(isToggled);
  };

  const handleDateChange = (newDate) => {
    setPendingEndingDate(newDate);
  };

  const handleSave = () => {
    onSave({
      collectResponse: pendingCollectResponse,
      endingDate: pendingEndingDate,
    });
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <div className="drawer-overlay" onClick={handleCancel}></div>
      <div className={`drawer-container ${isOpen ? "open" : ""}`}>
        <div className="drawer-header">
          <h4 className="drawer-title">Survey Settings</h4>
          <button onClick={handleCancel} className="drawer-close-btn">
            &times;
          </button>
        </div>
        <div className="drawer-body">
          <div className="form-group">
            <label htmlFor="collectResponseToggle" className="form-label">
              Accepting Responses
            </label>
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                id="collectResponseToggle"
                checked={pendingCollectResponse}
                onChange={(e) => handleToggleChange(e.target.checked)}
              />
              <label
                className="form-check-label"
                htmlFor="collectResponseToggle"
              >
                {pendingCollectResponse ? "On" : "Off"}
              </label>
            </div>
            <small className="form-text text-muted">
              Manually turn response collection on or off.
            </small>
          </div>

          <div className="form-group mt-4">
            <label htmlFor="endingDateInput" className="form-label">
              Automatically Close on Date
            </label>
            <input
              type="datetime-local"
              id="endingDateInput"
              className="form-control"
              value={pendingEndingDate}
              onChange={(e) => handleDateChange(e.target.value)}
            />
            <small className="form-text text-muted">
              Optional. The survey will stop collecting responses after this
              date.
            </small>
          </div>
        </div>
        <div className="drawer-footer">
          <button className="btn btn-secondary" onClick={handleCancel}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            Save Changes
          </button>
        </div>
      </div>
    </>
  );
};

export default SurveySettingsDrawer;
