import React, { useState, useEffect, useCallback } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import TagManager from "./QuestionSpecificUtils/Tag";

const LinearScaleQuestion = ({ question, setIsEditing,newQuestion, setNewQuestion}) => {
  // const [required, setRequired] = useState(question.required || false);  
  const [updatedQuestion, setUpdatedQuestion] = useState(question);
  //   console.log(question  );
  // console.log("Updated Question:", updatedQuestion.meta_data.leftLabel);
  const [image, setImage] = useState(question.image || null);
  const [minValue, setMinValue] = useState(updatedQuestion.meta_data.min || 1);
  const [maxValue, setMaxValue] = useState(updatedQuestion.meta_data.max || 5);
  const [leftLabel, setLeftLabel] = useState(updatedQuestion?.meta_data.leftLabel || "");
   console.log("Left Label:", leftLabel);
  const [rightLabel, setRightLabel] = useState(updatedQuestion.meta_data.rightLabel || "");
  console.log("Right Label:", rightLabel);
  const [showLabels, setShowLabels] = useState(!!leftLabel || !!rightLabel);


  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailToShare, setEmailToShare] = useState("");
  
  

  useEffect(() => {
    setMinValue(updatedQuestion.meta_data.min|| 1);
    setMaxValue(updatedQuestion.meta_data.max || 5);
    setLeftLabel(updatedQuestion?.meta_data.leftLabel  || "");
    setRightLabel(updatedQuestion.meta_data.rightLabel  || "");
  }, [updatedQuestion]);

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

  const updateQuestion = (updates) => { 
    setUpdatedQuestion((prev) => ({
      ...prev,
      ...updates,
      meta_data: {
        ...prev.meta_data,
        ...updates,
      },
    }));
    console.log("Updated Question:", updatedQuestion);
  };



  const handleQuestionChange = (newText) => {
    updateQuestion({ text: newText });
  };

  const handleMinChange = (e) => {
    const newMin = Number(e.target.value);
    setMinValue(newMin);
    updateQuestion({ min: newMin });
  };

  const handleMaxChange = (e) => {
    const newMax = Number(e.target.value);
    setMaxValue(newMax);
    updateQuestion({ max: newMax });
  };

  const handleLeftLabelChange = (e) => {
    const newLabel = e.target.value;
    setLeftLabel(newLabel);
    updateQuestion({ leftLabel: newLabel });
  };

  const handleRightLabelChange = (e) => {
    const newLabel = e.target.value;
    setRightLabel(newLabel);
    updateQuestion({ rightLabel: newLabel });
  };

  const toggleLabels = () => {
    const newShowLabels = !showLabels;
    setShowLabels(newShowLabels);

    if (!newShowLabels) {
      setLeftLabel("");
      setRightLabel("");
      updateQuestion({ leftLabel: "", rightLabel: "" });
    }
  };

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
      window.location.reload(); // Reload the page to reflect changes
      console.log("Question deleted successfully");
      
    }
    catch (error) {
      console.error("Error deleting question:", error);
    }
  }, [question.question_id]);


  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target.result);
        updateQuestion({ image: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

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
          window.location.reload();
          
       }, [updatedQuestion, setIsEditing, newQuestion, setNewQuestion]);
     

  return (
    <div className="mb-3">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <label className="ms-2 mb-2" style={{ fontSize: "1.2rem" }}>
          <em>
            <strong>Linear Scale</strong>
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

      {image && (
        <img
          src={image}
          alt="Uploaded"
          className="img-fluid mb-2"
          style={{ maxHeight: "400px" }}
        />
      )}

      <div className="d-flex align-items-center mb-2">
        <input
          type="text"
          className="form-control me-2"
          placeholder="Question"
          value={updatedQuestion.text}
          onChange={(e) => handleQuestionChange(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <div className="d-flex ms-2 mb-2">
          <div className="d-flex align-items-center">
            <label className="me-2">
              <i>Min Value</i>
            </label>
            <input
              type="number"
              className="form-control me-2"
              style={{ width: "80px" }}
              value={minValue}
              onChange={handleMinChange}
            />
          </div>
          <div className="d-flex align-items-center">
            <label className="me-2">
              <i>Max Value</i>
            </label>
            <input
              type="number"
              className="form-control me-2"
              style={{ width: "80px" }}
              value={maxValue}
              onChange={handleMaxChange}
            />
          </div>
        </div>

        <div className="form-check form-switch ms-2 mb-2">
          <input
            className="form-check-input"
            type="checkbox"
            checked={showLabels}
            onChange={toggleLabels}
          />
          <label className="form-check-label">Show Labels</label>
        </div>

        {showLabels && (
          <div className="d-flex ms-2 mb-2">
            <div className="d-flex align-items-center">
              <label className="me-2">
                <i>Left Label</i>
              </label>
              <input
                type="text"
                className="form-control me-2"
                value={leftLabel}
                onChange={handleLeftLabelChange}
              />
            </div>
            <div className="d-flex align-items-center">
              <label className="me-2">
                <i>Right Label</i>
              </label>
              <input
                type="text"
                className="form-control me-2"
                value={rightLabel}
                onChange={handleRightLabelChange}
              />
            </div>
          </div>
        )}
      </div>

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

export default LinearScaleQuestion;
