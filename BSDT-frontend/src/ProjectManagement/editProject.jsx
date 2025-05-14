import React, { useEffect, useState } from "react";
import axios from "axios";
import "./createProject.css";
import "./editProject.css";
import { MdPublic } from "react-icons/md";
import { FaLock } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import NavbarAcholder from "./navbarproject";
import { useCallback } from "react";

const EditProject = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    field: "",
    description: "",
    privacy_mode: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [collabEmail, setCollabEmail] = useState("");
  const [accessControl, setAccessControl] = useState("view"); // or "edit"
  const [activeTab, setActiveTab] = useState("details");
  const [collaborators, setCollaborators] = useState([]);
  const [surveys, setSurveys] = useState([]);

  // Fetch project details
  const fetchProject = async () => {
    // console.log("Fetching project with ID:", projectId);
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `http://localhost:2000/api/project/${projectId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 200 && response.data?.project) {
        const { title, field, description, privacy_mode } =
          response.data.project;
        setFormData({
          title: title || "",
          field: field || "",
          description: description || "",
          privacy_mode: privacy_mode || "public",
        });
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching project:", error);
      setLoading(false);
    }
  };

  // Fetch surveys of the project
  const fetchSurveys = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `http://localhost:2000/api/project/${projectId}/surveys`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 200) {
        console.log("Surveys:", response.data.surveys);
        setSurveys(response.data.surveys || []);
      }
    } catch (error) {
      console.error("Error fetching surveys:", error);
    }
  };

  const handleAddSurveyClick = async () => {
    const title = prompt("Enter the survey title:");
    if (title) {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.post(
          `http://localhost:2000/api/project/${projectId}/create-survey`,
          { title },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (response.status === 201) {
          alert("Survey created successfully!");
          fetchSurveys(); // Refresh the surveys list
        }
      } catch (error) {
        console.error("Error creating survey:", error);
        alert("Failed to create survey. Please try again.");
      }
    }
  };

  const handleSurveyClick = (survey_id) => {
    navigate(`/view-survey/${survey_id}`); // Redirect to the edit project page with projectId as a URL parameter
  };

  useEffect(() => {
    fetchProject();
    fetchSurveys();
  }, [projectId]);

  // Input handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit updated project
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:2000/api/project/${projectId}/update-project`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      alert("Project updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating project:", error);
      alert("Failed to update project.");
    }
  };

  if (loading) return <p>Loading...</p>;

  //fetch collaborators list
  const fetchCollaborators = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:2000/api/project/${projectId}/collaborators`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCollaborators(response.data.collaborators || []);
    } catch (error) {
      console.error("Error fetching collaborators:", error);
    }
  };

  return (
    <>
      <NavbarAcholder />
      <div className="add-project-container">
        <div className="tab-header-container">
          <div className="tabs">
            <button
              className={activeTab === "details" ? "active-tab" : ""}
              onClick={() => setActiveTab("details")}
            >
              Project Details
            </button>
            <button
              className={activeTab === "collaborators" ? "active-tab" : ""}
              onClick={async () => {
                setActiveTab("collaborators");
                await fetchCollaborators();
              }}
            >
              Collaborators
            </button>
          </div>
        </div>
        {activeTab === "details" ? (
          <div className="project-form">
            <div className="header-with-button">
              <h2>Project Details</h2>
              <button
                className="edit-toggle-btn"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? "Cancel" : "Edit"}
              </button>
            </div>

            <div className="project-form">
              {isEditing ? (
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Project Name</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Field</label>
                    <input
                      type="text"
                      name="field"
                      value={formData.field}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="visibility-section">
                    <label>Visibility</label>
                    <div className="visibility-options">
                      <label className="visibility-option">
                        <input
                          type="radio"
                          name="privacy_mode"
                          value="public"
                          checked={formData.privacy_mode === "public"}
                          onChange={handleChange}
                        />
                        <MdPublic className="visibility-icon" />
                        Public
                      </label>

                      <label className="visibility-option">
                        <input
                          type="radio"
                          name="privacy_mode"
                          value="private"
                          checked={formData.privacy_mode === "private"}
                          onChange={handleChange}
                        />
                        <FaLock className="visibility-icon" />
                        Private
                      </label>
                    </div>
                  </div>

                  <button type="submit" className="submit-btn">
                    Save Changes
                  </button>
                </form>
              ) : (
                <div className="view-project">
                  <p>
                    <strong>Project Name:</strong> {formData.title}
                  </p>
                  <p>
                    <strong>Field:</strong> {formData.field}
                  </p>
                  <p>
                    <strong>Description:</strong>{" "}
                    {formData.description || <i>(none)</i>}
                  </p>
                  <p>
                    <strong>Privacy:</strong> {formData.privacy_mode}
                  </p>
                </div>
              )}
            </div>
            <button
              className="add-collab-btn"
              onClick={() => setShowModal(true)}
            >
              Add Collaborator
            </button>

            {showModal && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <h3>Add Collaborator</h3>

                  <label>Email</label>
                  <input
                    type="email"
                    value={collabEmail}
                    onChange={(e) => setCollabEmail(e.target.value)}
                    required
                  />

                  <label>Access Control</label>
                  <select
                    value={accessControl}
                    onChange={(e) => setAccessControl(e.target.value)}
                  >
                    <option value="view">View Only</option>
                    <option value="edit">Can Edit</option>
                  </select>

                  <div className="modal-buttons">
                    <button onClick={handleAddCollaborator}>Add</button>
                    <button onClick={() => setShowModal(false)}>Cancel</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="collaborator-list">
            <table className="collab-table">
              <thead>
                <tr>
                  <th>Collaborator Name</th>
                  <th>Email</th>
                  <th>Access Role</th>
                  <th>Invitation Status</th>
                </tr>
              </thead>
              <tbody>
                {collaborators.length === 0 ? (
                  <tr>
                    <td colSpan="3">No collaborators added yet.</td>
                  </tr>
                ) : (
                  collaborators.map((collab, index) => (
                    <tr key={index}>
                      <td>{collab.user.name}</td>
                      <td>{collab.user.email}</td>
                      <td>{collab.access_role}</td>
                      <td>{collab.invitation}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        <div className="survey-grid">
          {surveys.length > 0 ? (
            surveys.map((survey) => (
              <div
                key={survey.survey_id} // survey_id as the key
                className="survey-card"
                onClick={() => handleSurveyClick(survey.survey_id)} // Make project card clickable
                style={{ cursor: "pointer" }}
              >
                <h4>{survey.title}</h4>
              </div>
            ))
          ) : (
            <i>"No projects found. Add new projects to get started..."</i>
          )}

          <div
            className="add-survey-card"
            onClick={() => handleAddSurveyClick()}
          >
            <div className="plus-icon">+</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditProject;
