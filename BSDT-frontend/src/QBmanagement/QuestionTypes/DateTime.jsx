import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import TagManager from "./QuestionSpecificUtils/Tag";
import { useState, useCallback } from "react";

const DateTimeQuestion = ({ question, setIsEditing,newQuestion, setNewQuestion }) => {
  // const [required, setRequired] = React.useState(false);
  const [updatedQuestion, setUpdatedQuestion] = useState(question);
    console.log(question  );
  
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailToShare, setEmailToShare] = useState("");

  // Function to toggle the required status of a question
  // const handleRequired = () => {
  //   setQuestions((prev) =>
  //     prev.map((q) =>
  //       q.id === question.id ? { ...q, required: !q.required } : q
  //     )
  //   );
  //   setRequired(!required);
  // };

  // Function to update the question text

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
  const handleQuestionChange = (newText) => {
    (newText) => {
      setUpdatedQuestion((prev) => ({ ...prev, text: newText }));
    },
    [setUpdatedQuestion]
  };

  // Function to change the input type (date/time)
  const handleTypeChange = (newType) => {
    setUpdatedQuestion((prev) => ({ ...prev, dateType: newType }));
  };

  // Function to delete a question
  const handleDelete = useCallback(() => {
    // Logic to delete the question
    console.log("Delete question with ID:", question.question_id);
    const token = localStorage.getItem("token");
    try {
      fetch(`http://localhost:2000/api/question-bank/delete/${question.question_id}`, {
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



  // Function to upload an image for the question
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


  // Updated copy functionality: Insert copied question right below the original
  // const handleCopy = () => {
  //   const index = questions.findIndex((q) => q.id === question.id);
  //   const newId = question.id + 1;

  //   const copiedQuestion = {
  //     ...question,
  //     id: newId,
  //     text: question.text,
  //     meta: { ...question.meta },
  //     image: question.image,
  //   };

  //   // Increment IDs of all questions after or equal to newId
  //   const updatedQuestions = questions.map((q) =>
  //     q.id >= newId ? { ...q, id: q.id + 1 } : q
  //   );

  //   // Insert the copied question after the original one
  //   updatedQuestions.splice(index + 1, 0, copiedQuestion);

  //   // Sort to maintain sequential order
  //   updatedQuestions.sort((a, b) => a.id - b.id);

  //   setQuestions(updatedQuestions);
  // };

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
    <div className="mb-3">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <label className="ms-2 mb-2" style={{ fontSize: "1.2em" }}>
          <em>
            <strong>Date/Time</strong>
          </em>
        </label>

        {/* Use the TagManager component */}
        <TagManager
          questionId={question.id}
          questionText={question.text}
          updatedQuestion={updatedQuestion}
          setUpdatedQuestion={setUpdatedQuestion}
        />
      </div>
      <div className="mb-2">
        {/* Image Preview */}
        {question.image && (
          <img
            src={question.image}
            alt="Uploaded"
            className="img-fluid mb-2"
            style={{ maxHeight: "400px" }}
          />
        )}
      </div>
      {/* Question Text & Type Selector */}
      <div className="d-flex align-items-center mb-2">
        <input
          type="text"
          className="form-control me-2"
          placeholder="Question"
          value={updatedQuestion.text}
          onChange={(e) => handleQuestionChange(e.target.value)}
        />
      </div>
      {/* Date/Time Input */}
      <div className="d-flex align-items-center gap-2 ms-1 mb-3">
        <input
          type={updatedQuestion.dateType === "time" ? "time" : "date"}
          className="form-control form-control-sm w-auto"
        />
        <select
          className="form-select form-select-sm w-auto"
          onChange={(e) => handleTypeChange(e.target.value)}
          value={updatedQuestion.dateType || "date"}
        >
          <option value="date">Date</option>
          <option value="time">Time</option>
        </select>
      </div>

      {/* Action Buttons */}
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

export default DateTimeQuestion;
