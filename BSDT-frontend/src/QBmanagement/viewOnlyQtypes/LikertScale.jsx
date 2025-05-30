import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useState } from "react";
import LikertScale from "../QuestionTypes/LikertScale"; // Assuming this is the editable version
import "../CSS/SurveyForm.css";
const LikertScaleView = ({ question, surveyTitle, projectTitle,newQuestion, setNewQuestion }) => {
  const [isEditing, setIsEditing] = useState(false);
  const {
    text,
    image,
    owner_name,
    required,
    meta_data = {},
  } = question;

  const rows = meta_data.rows?.length ? meta_data.rows : ["Row 1"];
  const columns = meta_data.columns?.length ? meta_data.columns : ["Column 1"];
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
      <LikertScale
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
        <span className="badge bg-secondary">Likert Scale</span>
        <div className="text-end text-muted small">
          <div><strong>Owner:</strong> {owner_name}</div>
          {surveyTitle && <div><strong>Survey:</strong> {surveyTitle}</div>}
          {projectTitle && <div><strong>Project:</strong> {projectTitle}</div>}
        </div>
      </div>

      {/* Question Text and Tags */}
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

      {/* Grid */}
      <div className="table-responsive">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th></th>
              {columns.map((col, index) => (
                <th key={index} className="text-center">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                <td><strong>{row}</strong></td>
                {columns.map((_, colIndex) => (
                  <td key={colIndex} className="text-center">
                    <input
                      type="radio"
                      disabled
                      name={`row-${rowIndex}`}
                      style={{ pointerEvents: "none" }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
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

export default LikertScaleView;
