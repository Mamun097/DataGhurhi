import React, { useState, useCallback } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import TagManager from "./QuestionSpecificUtils/Tag";

const Dropdown = ({ question, questions, setQuestions }) => {
  // const [required, setRequired] = useState(question.required || false);
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
    const response= await fetch(`http://localhost:2000/api/question-bank/share/${updatedQuestion.question_id}`, {
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
      fetch(`http://localhost:2000/api/question-bank/delete/${updatedQuestion.question_id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setUpdatedQuestion(null); // Optionally clear the question from state
      
    }
    catch (error) {
      console.error("Error deleting question:", error);
    }
  }, [question.question_id]);



  // Upload image
  const handleImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === question.id ? { ...q, image: reader.result } : q
        )
      );
    };
    reader.readAsDataURL(file);
  }, [question.id, setQuestions]);

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

  // Update option text
  const updateOption = useCallback((idx, newText) => {
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

  // Remove option
  const removeOption = useCallback((idx) => {
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


  // Handle drag end
  const handleDragEnd = useCallback((result) => {
    if (!result.destination) return;

    const src = result.source.index;
    const dest = result.destination.index;

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
                const response = await fetch("http://localhost:2000/api/question-bank/create", {
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
                const response = await fetch(`http://localhost:2000/api/question-bank/update/${updatedQuestion.question_id}`, {
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
            }, [updatedQuestion, setIsEditing, newQuestion, setNewQuestion]);
          
  return (
    <div className="mb-3 dnd-isolate">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <label className="ms-2 mb-2" style={{ fontSize: "1.2rem" }}>
          <em><strong>Dropdown</strong></em>
        </label>

        {/* Use the TagManager component */}
        <TagManager
          questionId={question.id}
          questionText={question.text}
          updatedQuestion={updatedQuestion}
          setUpdatedQuestion={setUpdatedQuestion}
        />
      </div>

      {/* Image Preview */}
      {question.image && (
        <img
          src={question.image}
          alt="Uploaded"
          className="img-fluid mb-2"
          style={{ maxHeight: "400px" }}
        />
      )}

      {/* Question Text */}
      <input
        type="text"
        className="form-control mb-2"
        placeholder="Question"
        value={question.text}
        onChange={(e) => handleQuestionChange(e.target.value)}
      />

      {/* Drag & Drop Options */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId={`dropdown-options-${question.id}`}>
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {question.meta?.options.map((option, idx) => (
                <Draggable
                  key={idx}
                  draggableId={`dropdown-opt-${question.id}-${idx}`}
                  index={idx}
                >
                  {(prov) => (
                    <div
                      ref={prov.innerRef}
                      {...prov.draggableProps}
                      {...prov.dragHandleProps}
                      className="d-flex align-items-center mb-2"
                    >
                      <span className="me-2" style={{ fontSize: "1.5rem", cursor: "grab" }}>☰</span>
                      <input
                        type="text"
                        className="form-control me-2"
                        value={option}
                        onChange={(e) => updateOption(idx, e.target.value)}
                      />
                      <button
                        className="btn btn-outline-secondary"
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

      {/* Add Option */}
      <button className="btn btn-sm btn-outline-primary mt-2" onClick={addOption}>
        ➕ Add Option
      </button>

      {/* Actions */}
      <div className="d-flex align-items-center mt-3">
        
        <button className="btn btn-outline-secondary me-2" onClick={handleDelete}>
          <i className="bi bi-trash"></i>
        </button>
        <label className="btn btn-outline-secondary me-2">
          <i className="bi bi-image"></i>
          <input type="file" hidden onChange={handleImageUpload} />
        </label>
       
      </div>
    </div>
  );
};

export default Dropdown;
