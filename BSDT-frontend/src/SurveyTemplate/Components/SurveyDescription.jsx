import { useState, useEffect } from "react";

const SurveyDescription = ({
  description,
  setDescription,
  getLabel,
}) => {
  // State for description editing
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [localDescriptionText, setLocalDescriptionText] = useState(description || "");

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
    <>
      <div className="mt-4 text-center">
        {!description && !isEditingDescription && (
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={handleAddOrEditDescriptionClick}
          >
            <i className="bi bi-plus-circle me-2"></i>{" "}
            {getLabel("Add Description")}
          </button>
        )}
      </div>

      <div>
        {isEditingDescription ? (
          <div className="card p-3 shadow-sm">
            <h5 className="card-title">
              {description
                ? getLabel("Edit Description")
                : getLabel("Add New Description")}
            </h5>
            <textarea
              className="form-control"
              rows="6"
              value={localDescriptionText}
              onChange={(e) => setLocalDescriptionText(e.target.value)}
              onFocus={(e) => e.target.select()}
              placeholder={getLabel("Enter your survey description here")}
            />
            <div className="text-end mt-3">
              <button
                className="btn btn-outline-danger btn-sm me-2"
                onClick={handleCancelEditDescription}
              >
                {getLabel("Cancel")}
              </button>
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={handleSaveDescription}
              >
                <i className="bi bi-save me-1"></i>{" "}
                {getLabel("Save Description")}
              </button>
            </div>
          </div>
        ) : (
          description && (
            <div className="card p-3 border-black">
              <h5 className="card-title text-center font-weight-bold">
                {getLabel("Survey Description")}
              </h5>
              <p className="card-text" style={{ whiteSpace: "pre-wrap" }}>
                {description}
              </p>
              <div className="flex flex-column mt-2 text-end">
                <button
                  className="btn btn-outline-secondary me-sm-2"
                  onClick={handleAddOrEditDescriptionClick}
                >
                  <i className="bi bi-pencil"></i> {getLabel("Edit")}
                </button>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={handleDeleteDescription}
                >
                  <i className="bi bi-trash"></i> {getLabel("Delete")}
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </>
  );
};

export default SurveyDescription;