import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useState } from "react";
import Text from "../QuestionTypes/Text";

const TextView = ({ question, surveyTitle, projectTitle,newQuestion, setNewQuestion }) => {
  const [isEditing, setIsEditing] = useState(false);
  const tags = question.meta_data?.tag || [];
  const questionType = "Text";
  const userId = parseInt(localStorage.getItem("userId"), 10);
  console.log("User ID from localStorage:", userId);
  console.log("Question ID:", question.user_id);
  const isOwner = question.user_id === userId;
  console.log("Is Owner:", isOwner);

  if (isEditing && isOwner ) {
    // Optionally render the editable version directly (careful with infinite loop)
    return (
      <>
      <Text
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
          <div><strong>Owner:</strong> {question.owner_name}</div>
          {projectTitle && <div><strong>Project:</strong> {projectTitle}</div>}
          {surveyTitle && <div><strong>Survey:</strong> {surveyTitle}</div>}
        </div>
      </div>

      {/* Question and Tags */}
      <div className="mb-2 d-flex justify-content-between align-items-start">
        <h5 className="me-3">
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
        

      {/* Placeholder Input Preview
      <input
        type="text"
        className="form-control"
        placeholder="Your answer here"
        readOnly
      /> */}
    </div>
  );
};

export default TextView;
