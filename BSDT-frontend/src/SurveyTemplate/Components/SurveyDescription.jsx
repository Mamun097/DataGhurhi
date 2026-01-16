import { useState, useEffect } from "react";
import "./SurveyDescription.css";

const SurveyDescription = ({ description, setDescription, getLabel }) => {
  // State for description editing
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [localDescriptionText, setLocalDescriptionText] = useState(
    description || ""
  );

  // Sync local description text with prop changes
  useEffect(() => {
    setLocalDescriptionText(description || "");
  }, [description]);

  // Handler functions
  const handleAddOrEditDescriptionClick = () => {
    setLocalDescriptionText(description || "");
    setIsEditingDescription(true);
  };

  const handleSaveDescription = () => {
    setDescription(localDescriptionText);
    setIsEditingDescription(false);
  };

  const handleCancelEditDescription = () => {
    setIsEditingDescription(false);
  };

  const handleDeleteDescription = () => {
    setDescription(null);
    setLocalDescriptionText("");
    setIsEditingDescription(false);
  };

  return (
    <div className="survey-description-container">
      {!description && !isEditingDescription && (
        <div className="survey-description-add-btn-wrapper">
          <button
            className="btn btn-outline-secondary survey-description-btn survey-description-btn-sm"
            onClick={handleAddOrEditDescriptionClick}
          >
            <i className="bi bi-plus-circle"></i>
            <span>{getLabel("Add Description")}</span>
          </button>
        </div>
      )}

      {isEditingDescription ? (
        <div className="card survey-description-card p-3 shadow-sm">
          <h5 className="survey-description-card-title">
            {description
              ? getLabel("Edit Description")
              : getLabel("Add New Description")}
          </h5>
          <textarea
            className="survey-description-textarea"
            rows="6"
            value={localDescriptionText}
            onChange={(e) => setLocalDescriptionText(e.target.value)}
            onFocus={(e) => e.target.select()}
            placeholder={getLabel("Enter your survey description here")}
          />
          <div className="survey-description-actions">
            <button
              className="btn btn-outline-danger survey-description-btn survey-description-btn-sm"
              onClick={handleCancelEditDescription}
            >
              {getLabel("Cancel")}
            </button>
            <button
              className="btn btn-outline-secondary survey-description-btn survey-description-btn-sm"
              onClick={handleSaveDescription}
            >
              <i className="bi bi-save"></i>
              <span>{getLabel("Save Description")}</span>
            </button>
          </div>
        </div>
      ) : (
        description && (
          <div className="card survey-description-card p-3 border-black">
            <h5 className="survey-description-card-title text-center font-weight-bold">
              {getLabel("Survey Description")}
            </h5>
            <p
              className="survey-description-card-text"
              style={{ whiteSpace: "pre-wrap" }}
            >
              {description}
            </p>
            <div className="survey-description-actions-view">
              <button
                className="btn btn-outline-secondary survey-description-btn survey-description-btn-sm"
                onClick={handleAddOrEditDescriptionClick}
              >
                <i className="bi bi-pencil"></i>
                <span>{getLabel("Edit")}</span>
              </button>
              <button
                className="btn btn-outline-danger survey-description-btn survey-description-btn-sm"
                onClick={handleDeleteDescription}
              >
                <i className="bi bi-trash"></i>
                <span>{getLabel("Delete")}</span>
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default SurveyDescription;
