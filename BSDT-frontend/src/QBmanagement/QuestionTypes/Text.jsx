import { useState,useCallback } from "react";
import TagManager from "./QuestionSpecificUtils/Tag";
import apiClient from "../../api";

const Text = ({ question, setIsEditing,newQuestion, setNewQuestion }) => {
 
  const [inputValidation, setInputValidation] = useState(false);
  const [validationType, setValidationType] = useState("Number");
  const [condition, setCondition] = useState("Greater Than");
  const [errorText, setErrorText] = useState("");
  const [validationText, setValidationText] = useState("");

   const [updatedQuestion, setUpdatedQuestion] = useState(question);
    console.log(question  );
  
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailToShare, setEmailToShare] = useState("");

  const conditions = {
    Number: [
      "Greater Than",
      "Greater Than or Equal To",
      "Less Than",
      "Less Than or Equal To",
      "Equal To",
      "Not Equal To",
      "Between",
      "Not Between",
      "Is Number",
      "Is Not Number",
    ],
    Text: ["Contains", "Does Not Contain", "Email", "URL"],
    Length: ["Maximum character Count", "Minimum character Count"],
    RegularExpression: [
      "Contains",
      "Doesn't Contain",
      "Matches",
      "Doesn't Match",
    ],
  };


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
    const response= await apiClient.post(`/api/question-bank/share/${updatedQuestion.question_id}`, {
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


  // Validate the input
  const handleSettings = () => {
    if (inputValidation) {
      setInputValidation(false);
    }
    else {
      setInputValidation(true);
      setUpdatedQuestion({
        ...question,
        meta_data: {
          ...question.meta_data,
          validationType: validationType,
          condition: condition,
          validationText: validationText,
          errorText: errorText,
        },
      });
    }
  };



  // Update the question text
  const handleQuestionChange = useCallback(
    (newText) => {
      setUpdatedQuestion((prev) => ({ ...prev, text: newText }));
    },
    [setUpdatedQuestion]
  );
  

  // Delete the current question and reassign sequential IDs
const handleDelete = useCallback(async () => {
    // Logic to delete the question
    console.log("Delete question with ID:", question.question_id);
    const token = localStorage.getItem("token");
    try {
      await apiClient.delete(`/api/question-bank/delete/${question.question_id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      window.location.reload();
      console.log("Question deleted successfully");
      
    }
    catch (error) {
      console.error("Error deleting question:", error);
    }
  }, [question.question_id]);

  // Upload an image for the question
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setQuestions((prevQuestions) =>
          prevQuestions.map((q) =>
            q.id === question.id ? { ...q, image: e.target.result } : q
          )
        );
      };
      reader.readAsDataURL(file);
    }
  };

  // Copy the current question: insert duplicate immediately below,
  // assign copied question an id equal to original id + 1,
  // and increment IDs for all subsequent questions.


  // handle updating the validation type
  const handleValidationTypeChange = (event) => {
    const selectedType = event.target.value;
    setValidationType(selectedType);
    setCondition(conditions[selectedType][0]); // Set default condition for the selected type
    setUpdatedQuestion((prev) => ({
      ...prev,
      meta_data: {
        ...prev.meta_data,
        validationType: selectedType,
        condition: conditions[selectedType][0], // Set default condition
      },
    }));
  }
  // handle updating the condition
  const handleConditionChange = (event) => {
    const selectedCondition = event.target.value;
    setCondition(selectedCondition);
    setUpdatedQuestion((prev) => ({
      ...prev,
      meta_data: {
        ...prev.meta_data,
        condition: selectedCondition,
      },
    }));
  };
  // handle updating the validation text
  const handleValidationTextChange = (event) => {
    const newValidationText = event.target.value;
    setValidationText(newValidationText);
    setUpdatedQuestion((prev) => ({
      ...prev,
      meta_data: {
        ...prev.meta_data,
        validationText: newValidationText,
      },
    }));
     
  };

  // handle updating the error text
  const handleErrorTextChange = (event) => {
    const newErrorText = event.target.value;
    setErrorText(newErrorText);
    setUpdatedQuestion((prev) => ({
      ...prev,
      meta_data: {
        ...prev.meta_data,
        errorText: newErrorText,
      },
    })
    );
  };

  const handlesave =useCallback(async () => {
          // Logic to save the updated question
          console.log("Save updated question", updatedQuestion);
          //update question in database
          const token = localStorage.getItem("token");
          if(newQuestion && updatedQuestion.new===true){
            try {
            // Create a new question
            const response = await apiClient.post("/api/question-bank/create", {
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
            const response = await apiClient.put(`/api/question-bank/update/${updatedQuestion.question_id}`, {
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
        <label className="ms-2" style={{ fontSize: "1.2rem" }}>
          <em>
            <strong>Text</strong>
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


      {/* Question Input */}
      <div className="d-flex align-items-center mt-2 mb-2">
        <input
          type="text"
          className="form-control"
          value={updatedQuestion.text}
          onChange={(e) => handleQuestionChange(e.target.value)}
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
      {/* <input
        type="text"
        className="form-control"
        placeholder="Enter your answer here"
        readOnly
        disabled
        // value={updatedQuestion.text} // Display the question text as a placeholder
      /> */}
      {inputValidation && (
        <div>
          <div className="d-flex align-items-center mt-2">
            <select
              className="form-select me-2"
              onChange={(e) => {
                handleValidationTypeChange(e);
              }}
              value={validationType}
            >
              {Object.keys(conditions).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <select
              className="form-select"
              onChange={(e) => {
                handleConditionChange(e);
              }}
              value={condition}
            >
              {conditions[validationType].map((condition) => (
                <option key={condition} value={condition}>
                  {condition}
                </option>
              ))}
            </select>
          </div>
          {(condition === "Between" || condition === "Not Between") && (
            <div className="d-flex align-items-center mt-2">
              <input
                type="text"
                className="form-control me-2"
                placeholder="Type here"
              />
              <label> & </label>
              <input
                type="text"
                className="form-control ms-2"
                placeholder="Type here"
              />
            </div>
          )}
          {(condition !== "Between" || condition !== "Not Between") && (
            <div className="d-flex align-items-center mt-2">
              <input
                type="text"
                className="form-control me-2"
                placeholder="Type here"
                value={validationText}
                onChange={(e) => handleValidationTextChange(e)}
              />
            </div>
          )}
          <div>
            <input
              type="text"
              className="form-control me-2 mt-2"
              placeholder="Custom Error Message (Optional)"
              value={errorText}
              onChange={(e) => handleErrorTextChange(e)}
            />
          </div>
        </div>
      )}
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

            <button
                className="btn btn-outline-secondary me-2"
                onClick={handleSettings}
              >
                <i className="bi bi-gear"></i>
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

export default Text;
