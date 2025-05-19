import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "./createProject.css";
import "./editProject.css";
import { MdPublic } from "react-icons/md";
import { FaLock } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import NavbarAcholder from "../ProfileManagement/navbarAccountholder";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2"; // for prompt box

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY;

const translateText = async (textArray, targetLang) => {
  try {
    const response = await axios.post(
      `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_API_KEY}`,
      {
        q: textArray,
        target: targetLang,
        format: "text",
      }
    );
    return response.data.data.translations.map((t) => t.translatedText);
  } catch (error) {
    console.error("Translation error:", error);
    return textArray;
  }
};

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
  const [accessControl, setAccessControl] = useState("view");
  const [activeTab, setActiveTab] = useState("details");
  const [collaborators, setCollaborators] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [language, setLanguage] = useState(
    localStorage.getItem("language") || "English"
  );
  const [translatedLabels, setTranslatedLabels] = useState({});

  const labelsToTranslate = [
    "Project Details",
    "Collaborators",
    "Cancel",
    "Edit",
    "Project Name",
    "Field",
    "Description",
    "Visibility",
    "Private",
    "Public",
    "Save Changes",
    "Add Collaborator",
    "Email",
    "Access Control",
    "View Only",
    "Can Edit",
    "Add",
    "No collaborators added yet.",
    "Collaborator Name",
    "Access Role",
    "Invitation Status",
    "No projects found. Click on the plus button to get started...",
  ];

  const loadTranslations = async () => {
    if (language === "English") {
      setTranslatedLabels({});
      return;
    }
    const translations = await translateText(labelsToTranslate, "bn");
    const translated = {};
    labelsToTranslate.forEach((key, idx) => {
      translated[key] = translations[idx];
    });
    setTranslatedLabels(translated);
  };

  useEffect(() => {
    loadTranslations();
  }, [language]);

  const getLabel = (text) =>
    language === "English" ? text : translatedLabels[text] || text;

  const fetchProject = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `http://localhost:2000/api/project/${projectId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 200 && response.data?.project) {
        const { title, field, description, privacy_mode } =
          response.data.project;
        setFormData({ title, field, description, privacy_mode });
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching project:", error);
      setLoading(false);
    }
  };

  const fetchSurveys = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `http://localhost:2000/api/project/${projectId}/surveys`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 200) setSurveys(response.data.surveys || []);
    } catch (error) {
      console.error("Error fetching surveys:", error);
    }
  };

  const fetchCollaborators = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:2000/api/project/${projectId}/collaborators`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCollaborators(response.data.collaborators || []);
    } catch (error) {
      console.error("Error fetching collaborators:", error);
    }
  };

  useEffect(() => {
    fetchProject();
    fetchSurveys();
  }, [projectId]);

  
const handleAddSurveyClick = async () => {
  const language = localStorage.getItem("language") || "English";
  let t = {};

  if (language === "বাংলা") {
    const labels = [
      "Enter Survey Title",
      "Survey Title",
      "Create",
      "Cancel",
      "Title is required!",
      "✅ Survey created successfully!",
      "❌ Failed to create survey.",
    ];
    const translated = await translateText(labels, "bn");
    [
      t.title,
      t.placeholder,
      t.confirmText,
      t.cancelText,
      t.validation,
      t.successMsg,
      t.errorMsg,
    ] = translated;
  }

  const result = await Swal.fire({
    title: language === "English" ? "Enter Survey Title" : t.title,
    input: "text",
    inputPlaceholder: language === "English" ? "Survey Title" : t.placeholder,
    showCancelButton: true,
    confirmButtonText: language === "English" ? "Create" : t.confirmText,
    cancelButtonText: language === "English" ? "Cancel" : t.cancelText,
    inputValidator: (value) => {
      if (!value) {
        return language === "English"
          ? "Title is required!"
          : t.validation;
      }
    },
  });

  if (result.isConfirmed && result.value) {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.post(
        `http://localhost:2000/api/project/${projectId}/create-survey`,
        { title: result.value },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 201) {
        toast.success(
          language === "English"
            ? "✅ Survey created successfully!"
            : t.successMsg
        );
        fetchSurveys();
        useNavigate(`/view-survey/${response.data.survey_id}`, {
          state: {
            project_id: projectId,
            survey_details: response.data,
          },
        });
      }
    } catch (error) {
      console.error("Error creating survey:", error);
      toast.error(
        language === "English"
          ? "❌ Failed to create survey."
          : t.errorMsg
      );
    }
  }
};
  const handleSurveyClick = (survey_id, survey) => {
    navigate(`/view-survey/${survey_id}`, {
      state: {
        project_id: projectId,
        survey_details: survey,
      },
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:2000/api/project/${projectId}/update-project`,
        formData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
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

  return (
    <>
      <NavbarAcholder language={language} setLanguage={setLanguage} />
      <div className="add-project-container">
        <div className="tab-header-container">
          <div className="tabs">
            <button
              className={activeTab === "details" ? "active-tab" : ""}
              onClick={() => setActiveTab("details")}
            >
              {getLabel("Project Details")}
            </button>
            <button
              className={activeTab === "collaborators" ? "active-tab" : ""}
              onClick={async () => {
                setActiveTab("collaborators");
                await fetchCollaborators();
              }}
            >
              {getLabel("Collaborators")}
            </button>
          </div>
        </div>

        {activeTab === "details" ? (
          <div className="project-form">
            <div className="header-with-button">
              <h2>{getLabel("Project Details")}</h2>
              <button
                className="edit-toggle-btn"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? getLabel("Cancel") : getLabel("Edit")}
              </button>
            </div>
            <div className="project-form">
              {isEditing ? (
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>{getLabel("Project Name")}</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>{getLabel("Field")}</label>
                    <input
                      type="text"
                      name="field"
                      value={formData.field}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>{getLabel("Description")}</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="visibility-section">
                    <label>{getLabel("Visibility")}</label>
                    <div className="visibility-options">
                      <label className="visibility-option">
                        <input
                          type="radio"
                          name="privacy_mode"
                          value="public"
                          checked={formData.privacy_mode === "public"}
                          onChange={handleChange}
                        />
                        <MdPublic className="visibility-icon" />{" "}
                        {getLabel("Public")}
                      </label>
                      <label className="visibility-option">
                        <input
                          type="radio"
                          name="privacy_mode"
                          value="private"
                          checked={formData.privacy_mode === "private"}
                          onChange={handleChange}
                        />
                        <FaLock className="visibility-icon" />{" "}
                        {getLabel("Private")}
                      </label>
                    </div>
                  </div>
                  <button type="submit" className="submit-btn">
                    {getLabel("Save Changes")}
                  </button>
                </form>
              ) : (
                <div className="view-project">
                  <p>
                    <strong>{getLabel("Project Name")}:</strong>{" "}
                    {formData.title}
                  </p>
                  <p>
                    <strong>{getLabel("Field")}:</strong> {formData.field}
                  </p>
                  <p>
                    <strong>{getLabel("Description")}:</strong>{" "}
                    {formData.description || <i>(none)</i>}
                  </p>
                  <p>
                    <strong>{getLabel("Visibility")}:</strong>{" "}
                    {formData.privacy_mode}
                  </p>
                </div>
              )}
            </div>
            <button
              className="add-collab-btn"
              onClick={() => setShowModal(true)}
            >
              {getLabel("Add Collaborator")}
            </button>
            {showModal && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <h3>{getLabel("Add Collaborator")}</h3>
                  <label>{getLabel("Email")}</label>
                  <input
                    type="email"
                    value={collabEmail}
                    onChange={(e) => setCollabEmail(e.target.value)}
                    required
                  />
                  <label>{getLabel("Access Control")}</label>
                  <select
                    value={accessControl}
                    onChange={(e) => setAccessControl(e.target.value)}
                  >
                    <option value="view">{getLabel("View Only")}</option>
                    <option value="edit">{getLabel("Can Edit")}</option>
                  </select>
                  <div className="modal-buttons">
                    <button onClick={handleAddCollaborator}>
                      {getLabel("Add")}
                    </button>
                    <button onClick={() => setShowModal(false)}>
                      {getLabel("Cancel")}
                    </button>
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
                  <th>{getLabel("Collaborator Name")}</th>
                  <th>{getLabel("Email")}</th>
                  <th>{getLabel("Access Role")}</th>
                  <th>{getLabel("Invitation Status")}</th>
                </tr>
              </thead>
              <tbody>
                {collaborators.length === 0 ? (
                  <tr>
                    <td colSpan="4">
                      {getLabel("No collaborators added yet.")}
                    </td>
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
                key={survey.survey_id}
                className="survey-card"
                onClick={() => handleSurveyClick(survey.survey_id, survey)}
                style={{ cursor: "pointer" }}
              >
                <h4>{survey.title}</h4>
              </div>
            ))
          ) : (
            <i>
              {getLabel(
                "No projects found. Click on the plus button to get started..."
              )}
            </i>
          )}
          <div className="add-survey-card" onClick={handleAddSurveyClick}>
            <div className="plus-icon">+</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditProject;
