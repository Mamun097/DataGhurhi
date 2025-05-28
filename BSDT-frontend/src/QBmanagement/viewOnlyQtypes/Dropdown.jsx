import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useState } from "react";
import Dropdown from "../QuestionTypes/Dropdown";

const DropdownViewOnly = ({ question, surveyTitle, projectTitle,newQuestion, setNewQuestion }) => {
  const [isEditing, setIsEditing] = useState(false);
  const {
    question_id,
    text,
    image,
    meta = {},
    owner_name,
    required,
    meta_data = {},
  } = question;

  const options = meta.options || [];
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
      <Dropdown
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
      {/* Header */}
      <div className="d-flex justify-content-between align-items-start mb-2">
        <span className="badge bg-secondary">Dropdown</span>
        <div className="text-end text-muted small">
          <div><strong>Owner:</strong> {owner_name}</div>
          {surveyTitle && <div><strong>Survey:</strong> {surveyTitle}</div>}
          {projectTitle && <div><strong>Project:</strong> {projectTitle}</div>}
        </div>
      </div>

      {/* Question and Tags */}
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

      {/* Image */}
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

      {/* Dropdown Preview */}
      <div>
        <label className="form-label"><strong>Options</strong></label>
        <select className="form-select" disabled>
          <option value="">Select an option</option>
          {options.map((opt, idx) => (
            <option key={idx} value={opt}>{opt}</option>
          ))}
        </select>
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

export default DropdownViewOnly;
