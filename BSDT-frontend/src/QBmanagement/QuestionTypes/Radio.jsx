// src/QuestionTypes/Radio.jsx
import React, { useState, useEffect, useCallback } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
// Import the TagManager component
import TagManager from "./QuestionSpecificUtils/Tag";

const Radio = ({ question, setIsEditing,newQuestion, setNewQuestion}) => {
  const [updatedQuestion, setUpdatedQuestion] = useState(question);
  console.log(question  );

const [showEmailModal, setShowEmailModal] = useState(false);
const [emailToShare, setEmailToShare] = useState("");


const handlePrivacyChange = async (privacyOption) => {
  if (privacyOption === "email") {
    setShowEmailModal(true);
  } else {
    setUpdatedQuestion((prev) => ({ ...prev, privacy: privacyOption }));
    
  }
};

const handleShareWithEmail = async () => {

  if (!emailToShare) return;
  console.log("Sharing question with email:", emailToShare);
  try {
    const token = localStorage.getItem("token");
    const response= await fetch(`http://103.94.135.115:2000/api/question-bank/share/${updatedQuestion.question_id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ shared_mail: emailToShare }),
    });
    if (!response.ok) {
      throw new Error( response.status );
    }
    console.log("Question shared successfully with email:", emailToShare);
    alert("Question shared successfully!");
    setShowEmailModal(false);
    setEmailToShare("");

  } catch (error) {
    // Handle error
    console.error( error);
    if (error.message === "404") {
      alert("User not found with the provided email.");
    } else if (error.message === "400") {
      alert("Question already shared with this user.");
    } else {
    alert("Error sharing question: " + error.message);
    }
};
};


  

  // Update question text
  const handleQuestionChange = useCallback(
    (newText) => {
      setUpdatedQuestion((prev) => ({ ...prev, text: newText }));
    },
    [setUpdatedQuestion]
  );

  // Delete question 
  const handleDelete = useCallback(() => {
    // Logic to delete the question
    console.log("Delete question with ID:", question.question_id);
    const token = localStorage.getItem("token");
    try {
      fetch(`http://103.94.135.115:2000/api/question-bank/delete/${updatedQuestion.question_id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      window.location.reload(); 
      
    }
    catch (error) {
      console.error("Error deleting question:", error);
    }
  }, [question.question_id]);

  // Image upload
  const handleImageUpload = useCallback(
    (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setUpdatedQuestion((prev) => ({ ...prev, image: reader.result }));
        };
        reader.readAsDataURL(file);
      }
    },
    [setUpdatedQuestion]
  );

  // Add new option
    const addOption = useCallback(() => {
      setUpdatedQuestion((prev) => ({
        ...prev,
        meta_data: {
          ...prev.meta_data,
          options: [...prev.meta_data.options, `Option ${prev.meta_data.options.length + 1}`],
        },
      }));
    }, [setUpdatedQuestion]);
      

  // Update an option's text
      const updateOption = useCallback(
      (idx, newText) => {
        setUpdatedQuestion((prev) => ({
          ...prev,
          meta_data: {
            ...prev.meta_data,
            options: prev.meta_data.options.map((opt, i) =>
              i === idx ? newText : opt
            ),
          },
        }));
      },
      [setUpdatedQuestion]
    );

  // Remove an option
    const removeOption = useCallback(
      (idx) => {
        setUpdatedQuestion((prev) => ({
          ...prev,
          meta_data: {
            ...prev.meta_data,
            options: prev.meta_data.options.filter((_, i) => i !== idx),
          },
        }));
      },
      [setUpdatedQuestion]
    );


  // Handle drag end to reorder options
  
      const handleDragEnd = useCallback(
        (result) => {
          if (!result.destination) return;

          const items = Array.from(updatedQuestion.meta_data.options);
          const [reorderedItem] = items.splice(result.source.index, 1);
          items.splice(result.destination.index, 0, reorderedItem);

          setUpdatedQuestion((prev) => ({
            ...prev,
            meta_data: {
              ...prev.meta_data,
              options: items,
            },
          }));
        },
        [updatedQuestion.meta_data.options, setUpdatedQuestion]
      );

      const handlesave =useCallback(async () => {
        // Logic to save the updated question
        console.log("Save updated question", updatedQuestion);
        //update question in database
        const token = localStorage.getItem("token");
        if(newQuestion && updatedQuestion.new===true){
          try {
          // Create a new question
          const response = await fetch("http://103.94.135.115:2000/api/question-bank/create", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(updatedQuestion),
          });
          setNewQuestion(false);
          console.log(response);
    
          if (!response.ok) {
            throw new Error("Failed to create question");
          }
          const data = await response.json();
          console.log("Question created successfully", data);
          console.log("Question created successfully");
          // setUpdatedQuestion(data);
        }
        catch (error) {
          console.error("Error creating question:", error);
        }
        }
        else{
          // Update the existing question
        
        try {
          const response = await fetch(`http://103.94.135.115:2000/api/question-bank/update/${updatedQuestion.question_id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(updatedQuestion),
          });
          if (!response.ok) {
            throw new Error("Failed to update question");
          }
          const data = await response.json();
          console.log("Question updated successfully", data);
         
        } catch (error) {
          console.error("Error updating question:", error);
        }
        }
         setIsEditing(false);
         window.location.reload(); 
      }, [updatedQuestion, setIsEditing, newQuestion, setNewQuestion]);
    


  // Copy question: duplicate with id+1, bump subsequent IDs
  
  return (
    <div className="mb-3 dnd-isolate">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <label style={{ fontSize: "1.2rem" }}>
          <em>
            <strong>MCQ</strong>
          </em>
        </label>

        {/* Use the TagManager component */}
        <TagManager 
          questionId={question.id} 
          questionText={updatedQuestion.text}
          updatedQuestion={updatedQuestion}
          setUpdatedQuestion={setUpdatedQuestion}
        />
      </div>

      {/* Question Text */}
      <input
          type="text"
          className="form-control mb-2"
          value={updatedQuestion.text}
          onChange={(e) => handleQuestionChange(e.target.value)}
          placeholder="Enter question..."
        />

      {/* Image Preview */}
      {updatedQuestion.image && (
        <img
          src={updatedQuestion.image}
          alt="Question"
          className="img-fluid mb-2"
          style={{ maxHeight: 200 }}
        />
      )}

      {/* Drag-and-Drop Options */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId={`options-${updatedQuestion.question_id}`}>
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {(updatedQuestion.meta_data.options || []).map((option, idx) => (
                <Draggable
                  key={idx}
                  draggableId={`opt-${updatedQuestion.question_id}-${idx}`}
                  index={idx}
                >
                  {(prov) => (
                    <div
                      ref={prov.innerRef}
                      {...prov.draggableProps}
                      {...prov.dragHandleProps}
                      className="d-flex align-items-center mb-2"
                    >
                      <span className="me-2" style={{ fontSize: "1.5rem", cursor: "grab" }}>
                        ☰
                      </span>
                      <input
                        type="text"
                        className="form-control me-2"
                        value={option.text || option}
                        onChange={(e) => updateOption(idx, e.target.value)}
                      />
                      <button
                        className="btn btn-outline-secondary me-2"
                        onClick={() => removeOption(idx)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>


      {/* Add option */}
      <button
        className="btn btn-sm btn-outline-primary mt-2"
        onClick={addOption}
      >
        ➕ Add Option
      </button>

      {/* Actions */}
     <div className="d-flex justify-content-between align-items-center mt-3">
          {/* Left-aligned buttons */}
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-secondary"
              onClick={handleDelete}
            >
              <i className="bi bi-trash"></i>
            </button>

            <label className="btn btn-outline-secondary">
              <i className="bi bi-image"></i>
              <input type="file" hidden onChange={handleImageUpload} />
            </label>

        <div className="dropdown me-2">
          <button className="btn btn-outline-primary dropdown-toggle" type="button" data-bs-toggle="dropdown">
            Share
          </button>
          <ul className="dropdown-menu">
            <li><button className="dropdown-item" onClick={() => handlePrivacyChange("public")}>Anyone</button></li>
            <li><button className="dropdown-item" onClick={() => handlePrivacyChange("private")}>Only Me</button></li>
            <li><button className="dropdown-item" onClick={() => handlePrivacyChange("email")}>Specific Email</button></li>
          </ul>
        </div>
        {/* Email Share Modal */}
          {showEmailModal && (
            <div className="modal d-block" tabIndex="-1" role="dialog">
              <div className="modal-dialog" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Share Question by Email</h5>
                    <button type="button" className="close btn" onClick={() => setShowEmailModal(false)}>
                      <span>&times;</span>
                    </button>
                  </div>
                  <div className="modal-body">
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Enter email to share with"
                      value={emailToShare}
                      onChange={(e) => setEmailToShare(e.target.value)}
                    />
                  </div>
                  <div className="modal-footer">
                    <button className="btn btn-primary" onClick={handleShareWithEmail}>Share</button>
                    <button className="btn btn-secondary" onClick={() => setShowEmailModal(false)}>Close</button>
                  </div>
                </div>
              </div>
            </div>
          )}

      </div>

        
        
        {/*save updated question*/}
      {newQuestion && updatedQuestion.new===true ? (
        <button
          className="btn btn-success"
          onClick={handlesave}
        >
          <i className="bi bi-plus-circle"></i> Add Question
        </button>
      ) : (
        <button
          className="btn btn-success"
          onClick={handlesave}
        >
          <i className="bi bi-save"></i> Save Changes
        </button>
      )}
    
      </div>
    </div>
  );
};

export default Radio;