import React from "react";
// import "bootstrap/dist/css/bootstrap.min.css";
import TickBoxGrid from "../QuestionTypes/TickBoxGrid"; // Assuming this is the editable version
import { useState, useCallback } from "react";
import "../CSS/SurveyForm.css";

const TickBoxGridView = ({ question, surveyTitle, projectTitle,newQuestion, setNewQuestion }) => {
  const [isEditing, setIsEditing] = useState(false);
  const rows = question.meta_data?.rows?.length ? question.meta_data.rows : ["Row 1"];
  const columns = question.meta_data?.columns?.length ? question.meta_data.columns : ["Column 1"];
  const tags = question.meta_data?.tag || [];
  const questionType = "Tick Box Grid";
  const userId = parseInt(localStorage.getItem("user_id"), 10);
  console.log("User ID from localStorage:", userId);
  console.log("Question ID:", question.user_id);
  const isOwner = question.user_id === userId;
  console.log("Is Owner:", isOwner);

  if (isEditing && isOwner ) {
    // Optionally render the editable version directly (careful with infinite loop)
    return (
      <>
      <TickBoxGrid
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
      <div className="d-flex justify-content-between align-items-center mb-2">
        <span className="badge bg-secondary">{questionType}</span>
        <div className="text-end text-muted small">
          {question.owner_name && <div><strong>Owner:</strong> {question.owner_name}</div>}
          {surveyTitle && <div><strong>Survey:</strong> {surveyTitle}</div>}
          {projectTitle && <div><strong>Project:</strong> {projectTitle}</div>}
        </div>
      </div>

      {/* Question and Tags */}
      <div className="mb-3 d-flex justify-content-between align-items-start">
        <h5 className="me-3 mb-0">
          
          {question.text}
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
      {question.image && (
        <div className="mb-3 text-center">
          <img
            src={question.image}
            alt="Uploaded"
            className="img-fluid rounded"
            style={{ maxHeight: "400px" }}
          />
        </div>
      )}

      {/* Grid Preview */}
      <div className="mb-3">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th></th>
              {columns.map((col, colIndex) => (
                <th key={colIndex} className="text-center">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                <td><strong>{row}</strong></td>
                {columns.map((_, colIndex) => (
                  <td key={colIndex} className="text-center">
                    <input type="radio" name={`row-${rowIndex}`} disabled />
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

export default TickBoxGridView;
