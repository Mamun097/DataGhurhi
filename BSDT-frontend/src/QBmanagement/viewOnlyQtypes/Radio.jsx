import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Radio from "../QuestionTypes/Radio"; // Assuming this is the editable version
import "../CSS/SurveyForm.css";
const RadioQuestionView = ({question, surveyTitle, projectTitle,newQuestion, setNewQuestion}) => {
  const [isEditing, setIsEditing] = useState(false);
  const options = question.meta_data?.options || [];
  const tags = question.meta_data?.tags || [];
  const questionType = "MCQ";
  const userId = parseInt(localStorage.getItem("user_id"), 10);
  console.log("User ID from localStorage:", userId);
  console.log("Question ID:", question.user_id);
  const isOwner = question.user_id === userId;
  console.log("Is Owner:", isOwner);
 

  if (isEditing && isOwner ) {
    // Optionally render the editable version directly (careful with infinite loop)
    return (
      <>
      <Radio
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
          {surveyTitle && <div><strong>Survey:</strong> {surveyTitle}</div>}
          {projectTitle && <div><strong>Project:</strong> {projectTitle}</div>}
        </div>
      </div>



      {/* Editable View */}
    
          {/* Question and Tags */}
          <div className="mb-2 d-flex justify-content-between align-items-start">
            <h5 className="me-3">{question.text}</h5>
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
          {question.image && (
            <div className="mb-3 text-center">
              <img
                src={question.image}
                alt="Question Visual"
                className="img-fluid rounded"
                style={{ maxHeight: "400px" }}
              />
            </div>
          )}

          {/* Static Options */}
          {options.map((option, idx) => (
            <div className="form-check mb-2" key={idx}>
              <input
                className="form-check-input"
                type="radio"
                name={`radio-${question.id}`}
                id={`option-${idx}`}
                value={option.value}
                disabled
              />
              <label className="form-check-label" htmlFor={`option-${idx}`}>
                {option.text || option}
              </label>
            </div>
          ))}
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

export default RadioQuestionView;
