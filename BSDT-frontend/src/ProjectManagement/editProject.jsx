import React, { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import "./createProject.css";
import "./editProject.css";
import { MdPublic } from "react-icons/md";
import { FaLock } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import NavbarAcholder from "../ProfileManagement/navbarAccountholder";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import { ToastContainer, toast } from "react-toastify";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import SendIcon from "@mui/icons-material/Send";

// new code start
import AISurveyChatbot from "../SurveyTemplate/Components/LLL-Generated-Question/AISurveyChatbot";
// new code end

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
  const [filterStatus, setFilterStatus] = useState("all");

  // new code start
  const [showSurveyChatbot, setShowSurveyChatbot] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState("initial");
  // new code end

  const [sortOrder, setSortOrder] = useState("asc");
  const [sortField, setSortField] = useState("title");
  const [language, setLanguage] = useState(
    localStorage.getItem("language") || "English"
  );
  const location = useLocation();
  const userRroleProject=location.state?.role || " ";
  console.log("User Role in Project:", userRroleProject);
  const canEdit = userRroleProject === "owner" || userRroleProject=== "editor";
  const [translatedLabels, setTranslatedLabels] = useState({});

  const labelsToTranslate = [
    "Project Details",
    "Collaborators",
    "Cancel",
    "Edit",
    "Project Name",
    "Field",
    "Research Field",
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
    "Create a New Survey",
    "Existing Surveys",
    "Enter Survey Title",
    "Create",
    "Survey Title",
    "Title is required!",
    "Survey created successfully!",
    "Failed to create survey.",
    "Add Survey",
    "All",
    "Published",
    "Unpublished",
    "Filter by: ",
    "Sort by:",
    "Ascending",
    "Descending",
    "Title",
    "Project updated successfully!",
    "Failed to update project.",
    "Project deleted successfully!",
    "Failed to delete project.",
    "Are you sure?",
    "This action cannot be undone.",
    "Yes, delete it!",
    "No, cancel!",
    "Survey deleted successfully!",
    "Failed to delete survey.",
    "Last Updated:",
    "Created At:",
    "Ended At:",
    "Published At:",
    "Last Updated",
    "Created At",
    "Ended At",
    "Published At",
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
        {
          headers: { Authorization: `Bearer ${token}` },
        }
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
  // const handleDeleteSurvey = async (surveyId) => {
  //   const token = localStorage.getItem("token");
  //   try {
  //     const response = await axios.delete(
  //       `http://localhost:2000/api/surveytemplate/${surveyId}`,
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );
  //     if (response.status === 200) {
  //       toast.success(getLabel("Survey deleted successfully!"));
  //       fetchSurveys();
  //       // reload
  //       setTimeout(() => window.location.reload(), 2000);
  //     } else {
  //       console.error("Error deleting survey:", response.statusText);
  //       toast.error(getLabel("Failed to delete survey."));
  //     }
  //   } catch (error) {
  //     console.error("Error deleting survey:", error);
  //     toast.error(getLabel("Failed to delete survey."));
  //   }
  // };
  const fetchSurveys = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `http://localhost:2000/api/project/${projectId}/surveys`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 200) setSurveys(response.data.surveys || []);
    } catch (error) {
      console.error("Error fetching surveys:", error);
    }
  };

  const fetchCollaborators = async () => {
    const token = localStorage.getItem("token");
    try {
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

  useEffect(() => {
    fetchProject();
    fetchSurveys();
  }, [projectId]);


  // new code start
  const handleGenerateSurvey = async (surveyMeta) => {
    setShowSurveyChatbot(false);
    setIsLoading(true);
    setLoadingPhase("initial");

    const token = localStorage.getItem("token");

    try {
      // create blank survey
      const resSurvey = await axios.post(
        `http://localhost:2000/api/project/${projectId}/create-survey`,
        { title: surveyMeta.topic || "Untitled Survey" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const survey_id = resSurvey.data?.survey_id || resSurvey.data?.data?.survey_id;
      if (!survey_id) throw new Error("Survey not created");

      // call LLM to generate questions
      const resLLM = await axios.post(
        `http://localhost:2000/api/generate-question-with-llm`,
        {
          questionData: {
            type: surveyMeta.questionTypes,
            metadata: {
              numQuestions: surveyMeta.numQuestions,
              audience: surveyMeta.audience,
            },
            additionalInfo: surveyMeta.topic,
          },
          questionInfo: { survey_id },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("🔍 LLM Generated Questions:", resLLM.data);

      toast.success(getLabel("Survey created successfully!"));
      await fetchSurveys();

      setTimeout(() => {
        navigate(`/view-survey/${survey_id}`, {
          state: {
            project_id: projectId,
            input_title: surveyMeta.topic,
            survey_details: {
              survey_id,
              questions: resLLM.data,
            },
          },
        });
      }, 3000);
    } catch (error) {
      console.error("Survey creation error:", error);
      toast.error(getLabel("Failed to generate survey."));
    } finally {
      setIsLoading(false);
    }
  };
  // new code end

  const handleAddSurveyClick = async () => {
    const result = await Swal.fire({
      title: getLabel("Enter Survey Title"),
      input: "text",
      inputPlaceholder: getLabel("Survey Title"),
      showCancelButton: true,
      confirmButtonText: getLabel("Create"),
      cancelButtonText: getLabel("Cancel"),
      inputValidator: (value) =>
        !value ? getLabel("Title is required!") : undefined,
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
          toast.success(getLabel("Survey created successfully!"));
          fetchSurveys();

          setTimeout(() => {
            navigate(
              `/view-survey/${
                response.data.data?.survey_id || response.data.survey_id
              }`,
              {
                state: { project_id: projectId, survey_details: response.data, input_title: result.value},
                
          }
            );
          }, 3000); // 3 seconds delay
        }
      } catch (error) {
        console.error("Error creating survey:", error);
      toast.error(getLabel("❌ Failed to create survey."));
    }
  }
};

const handleDeleteSurvey = async (surveyId) => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.delete(
      `http://localhost:2000/api/surveytemplate/${surveyId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (response.status === 200) {
      toast.success(getLabel("Survey deleted successfully!"));
      fetchSurveys();
      // reload
      // setTimeout(() => window.location.reload(), 4000);
    } else {
      console.error("Error deleting survey:", response.statusText);
      toast.error(getLabel("Failed to delete survey."));
    }
  } catch (error) {
    console.error("Error deleting survey:", error);
    toast.error(getLabel("Failed to delete survey."));
  }
};
  const handleSurveyClick = (survey_id, survey, survey_title, response_user_logged_in_status) => {
    navigate(`/view-survey/${survey_id}`, {
      state: {
        project_id: projectId,
        survey_details: survey,
        input_title: survey_title || "Untitled Survey",
        response_user_logged_in_status: response_user_logged_in_status
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

      toast.success(getLabel("✅ Project updated successfully!"));
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating project:", error);
      toast.error(getLabel("❌ Failed to update project."));
    }
  };
  const handleAddCollaborator = async () => {
    if (!collabEmail) {
      toast.error(getLabel("Email is required!"));
      return;
    }
    const token = localStorage.getItem("token");
    try {
      const response = await axios.post(
        `http://localhost:2000/api/project/${projectId}/invite-collaborator`,
        {
          email: collabEmail,
          access_role: accessControl,
          invitation: "pending", // Assuming you want to set the initial invitation status
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 200) {
        toast.success(getLabel("Collaborator added successfully!"));
        setCollabEmail("");
        setAccessControl("view");
        setShowModal(false);
        await fetchCollaborators();
      } else {
        console.error("Error adding collaborator:", error);
        toast.error(getLabel("Failed to add collaborator."));
      }
    } catch (error) {
      if (error.response && error.response.data) {
        // Handle specific error messages from the server
        const errorMessage = error.response.data.error || getLabel("Failed to add collaborator.");
        toast.error(errorMessage);
      }
      else{
      console.error("Error adding collaborator:", error);
      toast.error(getLabel("Failed to add collaborator."));
    }
  }
  };


  // if (loading) return <p>Loading...</p>;

  return (
    <>
      <NavbarAcholder language={language} setLanguage={setLanguage} />
      <div className="edit-project-grid">
        <div className="edit-left">
          {/* Project Details / Collaborator Tabs and Forms */}

          <div className="tab-header-container">
            <h2>{formData.title}</h2>
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
                {/* <h2>{getLabel("Project Details")}</h2> */}
              
                <button
                  className={`edit-toggle-btn ${!canEdit ? "disabled-btn" : ""}`}
                  onClick={() => setIsEditing(!isEditing)}
                  disabled={!canEdit}
                >
                  {isEditing ? getLabel("Cancel") : getLabel("Edit")}
                </button>

              </div>
              <div className="project-form-2">
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
                      <strong>{getLabel("Research Field")}:</strong> {formData.field}
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
            </div>
          ) : (
            <div className="collaborator-list">
              <button
                className={`add-collab-btn ${!canEdit ? "disabled-btn" : ""}`}
                onClick={() => canEdit && setShowModal(true)}
                disabled={!canEdit}
              >
                {getLabel("Add Collaborator")}
              </button>
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
              {showModal && canEdit &&(
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
                      <option value="viewer">{getLabel("View Only")}</option>
                      <option value="editor">{getLabel("Can Edit")}</option>
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
          )}

          {/* Reuse form / details section */}
        </div>
        <div className="edit-right">
          <h3 className="survey-section-heading">
            {getLabel("Create a New Survey")}
          </h3>
            <div className="survey-grid-center">
              <div
                className={`add-survey-card ${!canEdit ? "disabled-btn" : ""}`}
                onClick={canEdit ? handleAddSurveyClick : null}
                style={{ pointerEvents: canEdit ? "auto" : "none" }}
              >
                <div className="plus-icon">+</div>
              </div>
            </div>


            {/*new code start */}
            {canEdit && (
              <div style={{ display: "flex", justifyContent: "center", marginTop: "10px" }}>
                <button
                  className="btn btn-outline-success"
                  onClick={() => setShowSurveyChatbot(true)}
                >
                  <i className="bi bi-robot me-2" /> {getLabel("Generate Survey with LLM")}
                </button>
              </div>
            )}
            {/* new code end */}

          <hr className="section-divider" />
          <h3 className="survey-section-heading">
            {getLabel("Existing Surveys")}
          </h3>
          <div className="survey-controls">
            <div className="survey-filter">
              <label htmlFor="statusFilter">{getLabel("Filter by: ")}</label>
              <select
                id="statusFilter"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">{getLabel("All")}</option>
                <option value="published">{getLabel("Published")}</option>
                <option value="saved">{getLabel("Unpublished")}</option>
              </select>
            </div>
            <div className="survey-sort">
              <label htmlFor="sortKey">{getLabel("Sort by:")}</label>
              <select
                id="sortKey"
                value={sortField}
                onChange={(e) => setSortField(e.target.value)}
              >
                <option value="title">{getLabel("Title")}</option>
                <option value="last_updated">{getLabel("Last Updated")}</option>
                <option value="created_at">{getLabel("Created At")}</option>
                <option value="ending_date">{getLabel("Ended At")}</option>
                {filterStatus === "published" && (
                  <option value="published_date">
                    {getLabel("Published At")}
                  </option>
                )}
              </select>

              <select
                className="sort-order-dropdown"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="asc">{getLabel("Ascending")}</option>
                <option value="desc">{getLabel("Descending")}</option>
              </select>
            </div>
          </div>
          <div className="survey-grid">
            {surveys
              .filter((survey) =>
                filterStatus === "all"
                  ? true
                  : survey.survey_status === filterStatus
              )
              .sort((a, b) => {
                const aVal = a[sortField];
                const bVal = b[sortField];

                // Check if field is date-like
                const isDateField =
                  sortField.toLowerCase().includes("created_at") ||
                  sortField
                    .toLowerCase()
                    .includes(
                      "last_updated" ||
                        sortField.toLowerCase().includes("published_date") ||
                        sortField.toLowerCase().includes("ending_date")
                    );

                if (isDateField) {
                  const aTime = new Date(aVal).getTime();
                  const bTime = new Date(bVal).getTime();
                  return sortOrder === "asc" ? aTime - bTime : bTime - aTime;
                } else {
                  const aStr = (aVal || "").toString().toLowerCase();
                  const bStr = (bVal || "").toString().toLowerCase();
                  return sortOrder === "asc"
                    ? aStr.localeCompare(bStr)
                    : bStr.localeCompare(aStr);
                }
              })
              .map((survey) => (
                <div
                  key={survey.survey_id}
                  className="survey-card"
                  style={{ cursor: "pointer" }}
                  onClick={() =>
                    handleSurveyClick(survey.survey_id, survey, survey.title, survey.response_user_logged_in_status)
                  }
                >
                  <img
                    src={
                      survey.template?.backgroundImage ||
                      "/assets/images/banner.jpg"
                    }
                    className="survey-banner"
                    alt="Survey"
                  />
                  <h4>{survey.title}</h4>
                  <p>
                    <strong>{getLabel("Last Updated:")}</strong>{" "}
                    {new Date(survey.last_updated + "Z").toLocaleString("en-US", {
                      timeZone: "Asia/Dhaka",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </p>

                  <p>
                    <strong>{getLabel("Created At:")}</strong>{" "}
                    {new Date(survey.created_at + "Z").toLocaleString("en-US", {
                      timeZone: "Asia/Dhaka",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </p>

                  {survey.ending_date && (
                    <p>
                      <strong>{getLabel("Ended At:")}</strong>{" "}
                      {new Date(survey.ending_date + "Z").toLocaleString(
                        "en-US",
                        {
                          timeZone: "Asia/Dhaka",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        }
                      )}
                    </p>
                  )}

                  {survey.survey_status === "published" && (
                    <p>
                      <strong>{getLabel("Published At:")}</strong>{" "}
                      {new Date(survey.published_date + "Z").toLocaleString(
                        "en-US",
                        {
                          timeZone: "Asia/Dhaka",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        }
                      )}{" "}
                  
                    </p>
                  )}

                  <IconButton
                    aria-label="edit"
                    size="large"
                    sx={{
                      "&:hover": {
                        color: "blue",
                        backgroundColor: "#e6f0ff",
                      },
                    }}
                  >
                    <SendIcon fontSize="inherit" />
                  </IconButton>
                    <IconButton
                      aria-label="edit"
                      size="large"
                      disabled={!canEdit}
                      sx={{
                        "&:hover": {
                          color: canEdit ? "blue" : "inherit",
                          backgroundColor: canEdit ? "#e6f0ff" : "transparent",
                        },
                        color: !canEdit ? "#ccc" : "inherit",
                      }}
                    >
                      <EditIcon
                        fontSize="inherit"
                        onClick={
                          canEdit
                            ? () => handleSurveyClick(survey.survey_id, survey, survey.title, survey.response_user_logged_in_status)
                            : undefined
                        }
                        style={{ cursor: canEdit ? "pointer" : "not-allowed" }}
                      />
                    </IconButton>

                  <IconButton
                    aria-label="delete"
                    size="large"
                    sx={{
                      "&:hover": {
                        color: "red",
                        backgroundColor: "#ffe6e6",
                      },
                    }}
                  >
                    <DeleteIcon
                      fontSize="inherit"
                      onClick={() => {
                        Swal.fire({
                          title: getLabel("Are you sure?"),
                          text: getLabel("This action cannot be undone."),
                          icon: "warning",
                          showCancelButton: true,
                          confirmButtonText: getLabel("Yes, delete it!"),
                          cancelButtonText: getLabel("No, cancel!"),
                        }).then((result) => {
                          if (result.isConfirmed) {
                            handleDeleteSurvey(survey.survey_id);
                          }
                        });
                      }}
                    />
                  </IconButton>
                </div>
              ))}
          </div>
        </div>
        <ToastContainer position="top-center" autoClose={3000} />
      </div>

      {/* new code starts */}
      {showSurveyChatbot && (
        <AISurveyChatbot
          onClose={() => setShowSurveyChatbot(false)}
          onGenerateSurvey={handleGenerateSurvey}
        />
      )}
      {/* new code ends */}
    </>
  );
};

export default EditProject;