import React from "react";
// import "bootstrap/dist/css/bootstrap.min.css";
import Checkbox from "../QuestionTypes/Checkbox"; // Assuming this is the editable version
import { useState } from "react";
import "../CSS/SurveyForm.css";
const CheckboxViewOnly = ({ question, surveyTitle, projectTitle,newQuestion, setNewQuestion }) => {
  const [isEditing, setIsEditing] = useState(false);
  const {
    text,
    image,
    required,
    meta_data = {},
    owner_name
  } = question;

  const options = meta_data.options || [];
  const tags = meta_data.tag || [];

  const userId = parseInt(localStorage.getItem("userId"), 10);
  console.log("User ID from localStorage:", userId);
  console.log("Question ID:", question.user_id);
  const isOwner = question.user_id === userId;
  console.log("Is Owner:", isOwner);

  if (isEditing && isOwner ) {
    // Optionally render the editable version directly (careful with infinite loop)
    return (
      <>
      <Checkbox
        question={question}
        setIsEditing={setIsEditing}
        setNewQuestion={setNewQuestion}
        newQuestion={newQuestion}
        
        
      />
      {/* Edit Button (only for owner) */}
            {isOwner && (
              <div className="text-end mb-2">
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <i className="bi bi-pencil"></i> {isEditing ? "Cancel" : "Edit"}
                </button>
              </div>
            )}
      </> 
    );
  }

  return (
    <div className="p-3 mb-4 border rounded shadow-sm bg-light">
      {/* Header Info */}
      <div className="d-flex justify-content-between align-items-start mb-2">
        <span className="badge bg-secondary">Checkbox</span>
        <div className="text-end text-muted small">
          {owner_name && <div><strong>Owner:</strong> {owner_name}</div>}
          {surveyTitle && <div><strong>Survey:</strong> {surveyTitle}</div>}
          {projectTitle && <div><strong>Project:</strong> {projectTitle}</div>}
        </div>
      </div>

      {/* Question Title and Tags */}
      <div className="d-flex justify-content-between align-items-start mb-2">
        <h5 className="me-3">
          {required && <span className="text-danger me-1">*</span>}
          {text}
        </h5>
        {tags.length > 0 && (
          <div className="d-flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span key={index} className="badge bg-info text-dark">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Image Preview */}
      {image && (
        <div className="mb-3 text-center">
          <img
            src={image}
            alt="Question Visual"
            className="img-fluid rounded"
            style={{ maxHeight: "400px" }}
          />
        </div>
      )}

      {/* Static Options */}
      <div className="ms-1">
        {options.length > 0 ? (
          options.map((option, idx) => (
            <div className="form-check mb-2" key={idx}>
              <input
                className="form-check-input"
                type="checkbox"
                disabled
                id={`checkbox-${question.id}-${idx}`}
              />
              <label
                className="form-check-label"
                htmlFor={`checkbox-${question.id}-${idx}`}
              >
                {option}
              </label>
            </div>
          ))
        ) : (
          <div className="text-muted fst-italic">No options provided</div>
        )}
      </div>
      {/* Edit Button (only for owner) */}
          {isOwner && (
            <div className="text-end mb-2">
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => setIsEditing(!isEditing)}
              >
                <i className="bi bi-pencil"></i> {isEditing ? "Cancel" : "Edit"}
              </button>
            </div>
          )}
        
    </div>
  );
};

export default CheckboxViewOnly;
