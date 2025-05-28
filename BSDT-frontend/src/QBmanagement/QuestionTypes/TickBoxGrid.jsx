import React, { useState, useCallback } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import TagManager from "./QuestionSpecificUtils/Tag";

const TickBoxGrid = ({ question, setIsEditing,newQuestion, setNewQuestion }) => {
  // const [required, setRequired] = useState(question.required || false);
  const [image, setImage] = useState(question.image || null);
   const [updatedQuestion, setUpdatedQuestion] = useState(question);
    console.log(question  );
  
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailToShare, setEmailToShare] = useState("");

  const rows = updatedQuestion.meta_data.rows.length ? updatedQuestion.meta_data.rows : ["Row 1"];
  const columns = updatedQuestion.meta_data.columns.length ?updatedQuestion.meta_data.columns : ["Column 1"];

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


const updateMeta = (newMeta) => {
  setUpdatedQuestion((prev) => ({
    ...prev,
    meta_data: {
      ...(prev.meta_data || {}),
      ...newMeta,
    },
  }));
};


  // const handleRequired = (id) => {
  //   setQuestions((prev) =>
  //     prev.map((q) =>
  //       q.id === id ? { ...q, required: !q.required } : q
  //     )
  //   );
  //   setRequired(!required);
  // };

  const handleQuestionChange = (newText) => {
      (newText) => {
      setUpdatedQuestion((prev) => ({ ...prev, text: newText }));
    },
    [setUpdatedQuestion]
  };

  const handleRowChange = (index, newValue) => {
    const updated = [...rows];
    updated[index] = newValue;
    updateMeta({ rows: updated });
  };
  const handleColumnChange = (index, newValue) => {
    const updated = [...columns];
    updated[index] = newValue;
    updateMeta({ columns: updated });
  };

  const handleAddRow = () => {
    console.log("Adding row");
    updateMeta({ rows: [...rows, `Row ${rows.length + 1}`] });
  };

  const handleAddColumn = () => {
    console.log("Adding column");
    updateMeta({ columns: [...columns, `Column ${columns.length + 1}`] });
  };

  const handleDeleteRow = (index) => {
    const updated = rows.filter((_, i) => i !== index);
    updateMeta({ rows: updated.length ? updated : ["Row 1"] });
  };

  const handleDeleteColumn = (index) => {
    const updated = columns.filter((_, i) => i !== index);
    updateMeta({ columns: updated.length ? updated : ["Column 1"] });
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target.result);
        setUpdatedQuestion((prev) => ({ ...prev, image: e.target.result }));
      };
      reader.readAsDataURL(file);

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
       setUpdatedQuestion(null); // Optionally clear the question from state
       
     }
     catch (error) {
       console.error("Error deleting question:", error);
     }
   }, [question.question_id]);

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
        <label className="ms-2 mb-2" style={{ fontSize: "1.2rem" }}>
          <em>
            <strong>Tick Box Grid</strong>
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
        <div className="mb-2">
          <img
            src={image}
            alt="Uploaded"
            className="img-fluid mb-2"
            style={{ maxHeight: "400px" }}
          />
        </div>
      )}

      <div className="d-flex align-items-center mt-2 mb-2">
        <input
          type="text"
          className="form-control"
          placeholder="Question"
          value={question.text}
          onChange={(e) => handleQuestionChange(e.target.value)}
        />
      </div>

      {/* Rows */}
      <div className="mb-3">
        <h6><b>Rows</b></h6>
        {rows.map((row, index) => (
          <div key={index} className="d-flex justify-content-between">
            <input
              type="text"
              className="form-control mb-1"
              value={row}
              onChange={(e) => handleRowChange(index, e.target.value)}
              placeholder={`Row ${index + 1}`}
            />
            <button
              className="btn btn-outline-secondary me-2"
              onClick={() => handleDeleteRow(index)}
            >
              <i className="bi bi-trash"></i>
            </button>
          </div>
        ))}
        <button className="btn btn-sm btn-outline-primary mt-2" onClick={handleAddRow}>
          Add Row
        </button>
      </div>

      {/* Columns */}
      <div className="mb-3">
        <h6><b>Columns</b></h6>
        {columns.map((col, index) => (
          <div key={index} className="d-flex justify-content-between">
            <input
              type="text"
              className="form-control mb-1"
              value={col}
              onChange={(e) => handleColumnChange(index, e.target.value)}
              placeholder={`Column ${index + 1}`}
            />
            <button
              className="btn btn-outline-secondary me-2"
              onClick={() => handleDeleteColumn(index)}
            >
              <i className="bi bi-trash"></i>
            </button>
          </div>
        ))}
        <button className="btn btn-sm btn-outline-primary mt-2" onClick={handleAddColumn}>
          Add Column
        </button>
      </div>

      {/* Grid Preview */}
      <div className="mb-3">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th></th>
              {columns.map((col, colIndex) => (
                <th key={colIndex} className="text-center">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                <td>{row}</td>
                {columns.map((_, colIndex) => (
                  <td key={colIndex} className="text-center">
                    <input type="radio" name={`row-${rowIndex}`} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>


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

export default TickBoxGrid;
