import React, { useState, useCallback } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import TagManager from "./QuestionSpecificUtils/Tag";
import apiClient from "../../api";

const RatingQuestion = ({
  question,
  setIsEditing,
  newQuestion,
  setNewQuestion,
}) => {
  const [updatedQuestion, setUpdatedQuestion] = useState(question);
  console.log(question);
  const [image, setImage] = useState(question.image || null);

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
      const response = await apiClient.post(
        `/api/question-bank/share/${updatedQuestion.question_id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ shared_mail: emailToShare }),
        }
      );
      if (!response.ok) {
        throw new Error(response.status);
      }
      console.log("Question shared successfully with email:", emailToShare);
      alert("Question shared successfully!");
      setShowEmailModal(false);
      setEmailToShare("");
    } catch (error) {
      // Handle error
      console.error(error);
      if (error.message === "404") {
        alert("User not found with the provided email.");
      } else if (error.message === "400") {
        alert("Question already shared with this user.");
      } else {
        alert("Error sharing question: " + error.message);
      }
    }
  };

  // Update question text
  const handleQuestionChange = useCallback(
    (newText) => {
      setUpdatedQuestion((prev) => ({ ...prev, text: newText }));
    },
    [setUpdatedQuestion]
  );

  // Update scale
  const handleScaleChange = useCallback(
    (newScale) => {
      console.log("New scale selected:", newScale);
      setUpdatedQuestion((prev) => ({
        ...prev,
        meta_data: { ...prev.meta_data, scale: newScale },
      }));
    },
    [setUpdatedQuestion]
  );

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        setUpdatedQuestion((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = useCallback(async () => {
    // Logic to delete the question
    console.log("Delete question with ID:", question.question_id);
    const token = localStorage.getItem("token");
    try {
      await apiClient.delete(
        `/api/question-bank/delete/${question.question_id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      window.location.reload();
      console.log("Question deleted successfully");
    } catch (error) {
      console.error("Error deleting question:", error);
    }
  }, [question.question_id]);

  const handlesave = useCallback(async () => {
    // Logic to save the updated question
    console.log("Save updated question", updatedQuestion);
    //update question in database
    const token = localStorage.getItem("token");
    if (newQuestion && updatedQuestion.new === true) {
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
      } catch (error) {
        console.error("Error creating question:", error);
      }
    } else {
      // Update the existing question

      try {
        const response = await apiClient.put(
          `/api/question-bank/update/${updatedQuestion.question_id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(updatedQuestion),
          }
        );
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
        <label className="ms-2 mb-2" style={{ fontSize: "1.2em" }}>
          <em>
            <strong>Rating</strong>
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

      {question.image && (
        <img
          src={updatedQuestion.image}
          alt="Uploaded"
          className="img-fluid mb-2"
          style={{ maxHeight: "400px" }}
        />
      )}

      <div className="d-flex align-items-center mt-2 mb-2">
        <input
          type="text"
          className="form-control"
          placeholder="Question"
          value={updatedQuestion.text}
          onChange={(e) => handleQuestionChange(e.target.value)}
        />
      </div>

      <div>
        <select
          className="form-select form-select-sm w-auto"
          onChange={(e) => handleScaleChange(Number(e.target.value))}
          value={updatedQuestion.meta_data.scale || 5}
        >
          {[5, 10].map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>
      </div>

      <div className="d-flex justify-content-center">
        {[...Array(updatedQuestion.meta_data.scale || 5)].map((_, i) => (
          <div key={i} className="text-center mx-2">
            <i className="bi bi-star" style={{ fontSize: "24px" }}></i>
            <div>{i + 1}</div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="d-flex justify-content-between align-items-center mt-3">
        {/* Left-aligned buttons */}
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary" onClick={handleDelete}>
            <i className="bi bi-trash"></i>
          </button>

          <label className="btn btn-outline-secondary">
            <i className="bi bi-image"></i>
            <input type="file" hidden onChange={handleImageUpload} />
          </label>

          <div className="dropdown me-2">
            <button
              className="btn btn-outline-primary dropdown-toggle"
              type="button"
              data-bs-toggle="dropdown"
            >
              Share
            </button>
            <ul className="dropdown-menu">
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => handlePrivacyChange("public")}
                >
                  Anyone
                </button>
              </li>
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => handlePrivacyChange("private")}
                >
                  Only Me
                </button>
              </li>
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => handlePrivacyChange("email")}
                >
                  Specific Email
                </button>
              </li>
            </ul>
          </div>
          {/* Email Share Modal */}
          {showEmailModal && (
            <div className="modal d-block" tabIndex="-1" role="dialog">
              <div className="modal-dialog" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Share Question by Email</h5>
                    <button
                      type="button"
                      className="close btn"
                      onClick={() => setShowEmailModal(false)}
                    >
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
                    <button
                      className="btn btn-primary"
                      onClick={handleShareWithEmail}
                    >
                      Share
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setShowEmailModal(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/*save updated question*/}
        {newQuestion && updatedQuestion.new === true ? (
          <button className="btn btn-success" onClick={handlesave}>
            <i className="bi bi-plus-circle"></i> Add Question
          </button>
        ) : (
          <button className="btn btn-success" onClick={handlesave}>
            <i className="bi bi-save"></i> Save Changes
          </button>
        )}
      </div>
    </div>
  );
};

export default RatingQuestion;
