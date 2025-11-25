// src/QuestionTypesView/LinearScaleQuestionView.jsx
import React from "react";
import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import LinearScaleQuestion from "../QuestionTypes/LinearScale";
import "../CSS/SurveyForm.css";
const LinearScaleQuestionView = ({ question, surveyTitle, projectTitle,newQuestion, setNewQuestion }) => {
   const [isEditing, setIsEditing] = useState(false);
  const {
    text,
    image,
    required,
    meta_data = {},
    owner_name,
  } = question;

  const tags = meta_data.tag || [];
  const min = meta_data.min ?? 1;
  const max = meta_data.max ?? 5;
  const leftLabel = meta_data.leftLabel || "";
  const rightLabel = meta_data.rightLabel || "";

  const userId = parseInt(localStorage.getItem("user_id"), 10);
  console.log("User ID from localStorage:", userId);
  console.log("Question ID:", question.user_id);
  const isOwner = question.user_id === userId;
  console.log("Is Owner:", isOwner);
 
  if (isEditing && isOwner ) {
    // Optionally render the editable version directly (careful with infinite loop)
    return (
      <>
      <LinearScaleQuestion
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
      <div className="d-flex justify-content-between align-items-center mb-2">
        <span className="badge bg-secondary">Linear Scale</span>
        <div className="text-end text-muted small">
          {owner_name && <div><strong>Owner:</strong> {owner_name}</div>}
          {surveyTitle && <div><strong>Survey:</strong> {surveyTitle}</div>}
          {projectTitle && <div><strong>Project:</strong> {projectTitle}</div>}
        </div>
      </div>

      {/* Question Text & Tags */}
      <div className="mb-2 d-flex justify-content-between align-items-start">
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

      {/* Linear Scale Preview */}
      <div className="mb-2 d-flex justify-content-between align-items-center px-2">
        {leftLabel && <small className="text-muted">{leftLabel}</small>}
        <div className="flex-grow-1 d-flex justify-content-center gap-3">
          {[...Array(max - min + 1)].map((_, i) => (
            <div key={i} className="text-center">
              <input type="radio" disabled />
              <div className="small text-muted">{min + i}</div>
            </div>
          ))}
        </div>
        {rightLabel && <small className="text-muted">{rightLabel}</small>}
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

export default LinearScaleQuestionView;
