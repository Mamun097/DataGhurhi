import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SendIcon from "@mui/icons-material/Send";
import IconButton from "@mui/material/IconButton";
import GroupIcon from "@mui/icons-material/Group";
import LockIcon from "@mui/icons-material/Lock";
import PublicIcon from "@mui/icons-material/Public";
import SearchIcon from "@mui/icons-material/Search";
import GridViewIcon from "@mui/icons-material/GridView";
import ViewListIcon from "@mui/icons-material/ViewList";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import axios from "axios";
import NavbarAcholder from "../ProfileManagement/navbarAccountholder";
import AutoSurveyGeneration from "./AutoSurveyGeneration";
import "./EditProject.css";

// Import your API client - adjust the path based on your project structure
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
});

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
  const location = useLocation();
  
  const [isEditing, setIsEditing] = useState(false);
  const [activeCollabModal, setActiveCollabModal] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortField, setSortField] = useState("title");
  const [sortOrder, setSortOrder] = useState("asc");
  const [loading, setLoading] = useState(true);
  const [collabEmail, setCollabEmail] = useState("");
  const [accessControl, setAccessControl] = useState("viewer");

  const userRroleProject = location.state?.role || " ";
  const privacyMode = useParams().privacy || "public";
  const canEdit = userRroleProject === "owner" || userRroleProject === "editor";

  const [language, setLanguage] = useState(
    localStorage.getItem("language") || "English"
  );
  const [translatedLabels, setTranslatedLabels] = useState({});

  const [formData, setFormData] = useState({
    title: "",
    field: "",
    description: "",
    privacy_mode: "",
  });

  const [collaborators, setCollaborators] = useState([]);
  const [surveys, setSurveys] = useState([]);

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
    "Generate Survey with LLM",
    "Edit Project",
    "Project Surveys",
    "Create Survey",
    "Generate with AI",
    "Search surveys...",
    "Status:",
    "Sort:",
    "Updated",
    "Created",
    "No Surveys Found",
    "Create your first survey to get started",
    "Project Collaborators",
    "Enter email address",
    "Viewer",
    "Editor",
    "Accepted",
    "Pending",
    "Draft",
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

  // Fetch project details
  const fetchProject = async () => {
    const token = localStorage.getItem("token");
    let response;
    try {
      if (!token && privacyMode === "public") {
        response = await apiClient.get(`/api/project/${projectId}`);
      } else {
        response = await apiClient.get(`/api/project/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
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

  // Fetch surveys
  const fetchSurveys = async () => {
    const token = localStorage.getItem("token");
    let response;
    try {
      if (token) {
        response = await apiClient.get(`/api/project/${projectId}/surveys`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        response = await apiClient.get(
          `/api/project/${projectId}/public/surveys`
        );
      }
      if (response.status === 200) setSurveys(response.data.surveys || []);
    } catch (error) {
      console.error("Error fetching surveys:", error);
    }
  };

  // Fetch collaborators
  const fetchCollaborators = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await apiClient.get(
        `/api/project/${projectId}/collaborators`,
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.put(
        `/api/project/${projectId}/update-project`,
        formData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      toast.success(getLabel("Project updated successfully!"));
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating project:", error);
      toast.error(getLabel("Failed to update project."));
    }
  };

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
        const response = await apiClient.post(
          `/api/project/${projectId}/create-survey`,
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
                state: {
                  project_id: projectId,
                  survey_details: response.data,
                  input_title: result.value,
                },
              }
            );
          }, 3000);
        }
      } catch (error) {
        console.error("Error creating survey:", error);
        toast.error(getLabel("Failed to create survey."));
      }
    }
  };

  const handleDeleteSurvey = async (surveyId) => {
    const token = localStorage.getItem("token");
    try {
      const response = await apiClient.delete(
        `/api/surveytemplate/${surveyId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 200) {
        toast.success(getLabel("Survey deleted successfully!"));
        fetchSurveys();
      } else {
        console.error("Error deleting survey:", response.statusText);
        toast.error(getLabel("Failed to delete survey."));
      }
    } catch (error) {
      console.error("Error deleting survey:", error);
      toast.error(getLabel("Failed to delete survey."));
    }
  };

  const handleSurveyClick = (
    survey_id,
    survey,
    survey_title,
    response_user_logged_in_status
  ) => {
    navigate(`/view-survey/${survey_id}`, {
      state: {
        project_id: projectId,
        survey_details: survey,
        input_title: survey_title || "Untitled Survey",
        response_user_logged_in_status: response_user_logged_in_status,
      },
    });
  };

  const handleAddCollaborator = async () => {
    if (!collabEmail) {
      toast.error(getLabel("Email is required!"));
      return;
    }
    const token = localStorage.getItem("token");
    try {
      const response = await apiClient.post(
        `/api/project/${projectId}/invite-collaborator`,
        {
          email: collabEmail,
          access_role: accessControl,
          invitation: "pending",
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
        setAccessControl("viewer");
        await fetchCollaborators();
      }
    } catch (error) {
      if (error.response && error.response.data) {
        const errorMessage =
          error.response.data.error || getLabel("Failed to add collaborator.");
        toast.error(errorMessage);
      } else {
        console.error("Error adding collaborator:", error);
        toast.error(getLabel("Failed to add collaborator."));
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString + "Z").toLocaleString("en-US", {
      timeZone: "Asia/Dhaka",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredAndSortedSurveys = surveys
    .filter((survey) => {
      const matchesStatus = filterStatus === "all" || survey.survey_status === filterStatus;
      const matchesSearch = survey.title.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      const isDateField = sortField.includes("updated") || sortField.includes("created");
      
      if (isDateField) {
        const aTime = new Date(aVal).getTime();
        const bTime = new Date(bVal).getTime();
        return sortOrder === "asc" ? aTime - bTime : bTime - aTime;
      } else {
        const aStr = (aVal || "").toString().toLowerCase();
        const bStr = (bVal || "").toString().toLowerCase();
        return sortOrder === "asc" ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
      }
    });

  if (loading) {
    return (
      <div className="edit-project-modern-container">
        <div className="loading-state">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <NavbarAcholder language={language} setLanguage={setLanguage} />
      <div className="edit-project-modern-container">
        {/* Project Header Section */}
        <div className="project-header-modern">
          <div className="project-header-content">
            <div className="project-header-left">
              <div className="project-icon-large">
                {formData.privacy_mode === "private" ? <LockIcon /> : <PublicIcon />}
              </div>
              <div className="project-header-info">
                {!isEditing ? (
                  <>
                    <h1 className="project-title-large">{formData.title}</h1>
                    <div className="project-meta-chips">
                      <span className="field-chip">{formData.field}</span>
                      <span className="privacy-chip">
                        {formData.privacy_mode === "private" ? (
                          <><LockIcon fontSize="small" /> {getLabel("Private")}</>
                        ) : (
                          <><PublicIcon fontSize="small" /> {getLabel("Public")}</>
                        )}
                      </span>
                    </div>
                    {formData.description && (
                      <p className="project-description-large">{formData.description}</p>
                    )}
                  </>
                ) : (
                  <form onSubmit={handleSubmit} className="project-edit-form">
                    <input
                      type="text"
                      className="edit-input-title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder={getLabel("Project Name")}
                      required
                    />
                    <input
                      type="text"
                      className="edit-input-field"
                      value={formData.field}
                      onChange={(e) => setFormData({...formData, field: e.target.value})}
                      placeholder={getLabel("Research Field")}
                      required
                    />
                    <textarea
                      className="edit-textarea-desc"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder={getLabel("Description")}
                      rows="3"
                    />
                    <div className="edit-privacy-options">
                      <label className="privacy-radio-label">
                        <input
                          type="radio"
                          name="privacy_mode"
                          value="public"
                          checked={formData.privacy_mode === "public"}
                          onChange={(e) => setFormData({...formData, privacy_mode: e.target.value})}
                        />
                        <PublicIcon fontSize="small" />
                        <span>{getLabel("Public")}</span>
                      </label>
                      <label className="privacy-radio-label">
                        <input
                          type="radio"
                          name="privacy_mode"
                          value="private"
                          checked={formData.privacy_mode === "private"}
                          onChange={(e) => setFormData({...formData, privacy_mode: e.target.value})}
                        />
                        <LockIcon fontSize="small" />
                        <span>{getLabel("Private")}</span>
                      </label>
                    </div>
                  </form>
                )}
              </div>
            </div>
            
            <div className="project-header-actions">
              {!isEditing ? (
                <>
                  <button 
                    className={`btn-action-modern ${!canEdit ? 'disabled' : ''}`}
                    onClick={() => {
                      if (canEdit) {
                        fetchCollaborators();
                        setActiveCollabModal(true);
                      }
                    }}
                    disabled={!canEdit}
                  >
                    <GroupIcon fontSize="small" />
                    <span>{getLabel("Collaborators")} ({collaborators.length})</span>
                  </button>
                  <button 
                    className={`btn-edit-modern ${!canEdit ? 'disabled' : ''}`}
                    onClick={() => canEdit && setIsEditing(true)}
                    disabled={!canEdit}
                  >
                    <EditIcon fontSize="small" />
                    <span>{getLabel("Edit Project")}</span>
                  </button>
                </>
              ) : (
                <>
                  <button type="button" className="btn-cancel-modern" onClick={() => setIsEditing(false)}>
                    <CloseIcon fontSize="small" />
                    <span>{getLabel("Cancel")}</span>
                  </button>
                  <button type="submit" className="btn-save-modern" onClick={handleSubmit}>
                    <SaveIcon fontSize="small" />
                    <span>{getLabel("Save Changes")}</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Surveys Section */}
        <div className="surveys-section-modern">
          <div className="surveys-header-actions">
            <h2 className="surveys-section-title">{getLabel("Project Surveys")}</h2>
            <div className="surveys-create-buttons">
              <button 
                className={`btn-create-survey ${!canEdit ? 'disabled' : ''}`}
                onClick={canEdit ? handleAddSurveyClick : null}
                disabled={!canEdit}
              >
                <AddIcon fontSize="small" />
                <span>{getLabel("Create Survey")}</span>
              </button>
              <button 
                className={`btn-generate-survey ${!canEdit ? 'disabled' : ''}`}
                disabled={!canEdit}
              >
                <AutoAwesomeIcon fontSize="small" />
                <span>{getLabel("Generate with AI")}</span>
              </button>
            </div>
          </div>

          {canEdit && (
            <div style={{ marginBottom: '1.5rem' }}>
              <AutoSurveyGeneration
                onGenerateSurvey={(surveyMeta) => {
                  console.log('Generate survey with:', surveyMeta);
                }}
                getLabel={getLabel}
              />
            </div>
          )}

          {/* Toolbar */}
          <div className="surveys-toolbar-modern">
            <div className="search-box-modern">
              <input
                type="text"
                placeholder={getLabel("Search surveys...")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input-modern"
              />
              <SearchIcon className="search-icon-modern" />
            </div>

            <div className="toolbar-controls-modern">
              <div className="filter-group-modern">
                <label>{getLabel("Status:")}</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="filter-select-modern"
                >
                  <option value="all">{getLabel("All")}</option>
                  <option value="published">{getLabel("Published")}</option>
                  <option value="saved">{getLabel("Unpublished")}</option>
                </select>
              </div>

              <div className="filter-group-modern">
                <label>{getLabel("Sort:")}</label>
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value)}
                  className="filter-select-modern"
                >
                  <option value="title">{getLabel("Title")}</option>
                  <option value="last_updated">{getLabel("Updated")}</option>
                  <option value="created_at">{getLabel("Created")}</option>
                </select>
              </div>

              <div className="filter-group-modern">
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="filter-select-modern"
                >
                  <option value="asc">↑ {getLabel("Ascending")}</option>
                  <option value="desc">↓ {getLabel("Descending")}</option>
                </select>
              </div>

              <div className="view-toggle-modern">
                <IconButton
                  onClick={() => setViewMode("grid")}
                  className={viewMode === "grid" ? "active" : ""}
                  size="small"
                >
                  <GridViewIcon />
                </IconButton>
                <IconButton
                  onClick={() => setViewMode("list")}
                  className={viewMode === "list" ? "active" : ""}
                  size="small"
                >
                  <ViewListIcon />
                </IconButton>
              </div>
            </div>
          </div>

          {/* Surveys Grid/List */}
          {filteredAndSortedSurveys.length > 0 ? (
            <div className={`surveys-${viewMode}-modern`}>
              {filteredAndSortedSurveys.map((survey) => (
                viewMode === "grid" ? (
                  <div key={survey.survey_id} className="survey-card-modern grid">
                    <div 
                      className="survey-banner-modern"
                      style={{ 
                        backgroundImage: `url(${survey.template?.backgroundImage || '/assets/images/survey_slide.png'})` 
                      }}
                      onClick={() => handleSurveyClick(survey.survey_id, survey, survey.title, survey.response_user_logged_in_status)}
                    >
                      <div className="survey-status-badge">
                        {survey.survey_status === "published" ? (
                          <><CheckCircleIcon fontSize="small" /> {getLabel("Published")}</>
                        ) : (
                          <><PendingIcon fontSize="small" /> {getLabel("Draft")}</>
                        )}
                      </div>
                    </div>
                    
                    <div className="survey-content-modern" onClick={() => handleSurveyClick(survey.survey_id, survey, survey.title, survey.response_user_logged_in_status)}>
                      <h3 className="survey-title-modern">{survey.title}</h3>
                      <p className="survey-date-modern">
                        {getLabel("Updated")}: {formatDate(survey.last_updated)}
                      </p>
                      
                      <div className="survey-actions-modern" onClick={(e) => e.stopPropagation()}>
                        <IconButton 
                          size="small" 
                          className="action-icon-modern view"
                          onClick={() => handleSurveyClick(survey.survey_id, survey, survey.title, survey.response_user_logged_in_status)}
                        >
                          <SendIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          className="action-icon-modern edit"
                          disabled={!canEdit}
                          onClick={canEdit ? () => handleSurveyClick(survey.survey_id, survey, survey.title, survey.response_user_logged_in_status) : undefined}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          className="action-icon-modern delete"
                          disabled={!canEdit}
                          onClick={canEdit ? () => {
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
                          } : undefined}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div key={survey.survey_id} className="survey-card-modern list">
                    <div className="survey-list-left" onClick={() => handleSurveyClick(survey.survey_id, survey, survey.title, survey.response_user_logged_in_status)}>
                      <div className="survey-list-icon">
                        <SendIcon />
                      </div>
                      <div className="survey-list-info">
                        <h3 className="survey-list-title">{survey.title}</h3>
                        <p className="survey-list-date">{getLabel("Updated")}: {formatDate(survey.last_updated)}</p>
                      </div>
                    </div>
                    
                    <div className="survey-list-right">
                      <span className={`survey-list-status ${survey.survey_status}`}>
                        {survey.survey_status === "published" ? getLabel("Published") : getLabel("Draft")}
                      </span>
                      <div className="survey-list-actions">
                        <IconButton 
                          size="small" 
                          className="list-action-icon"
                          onClick={() => handleSurveyClick(survey.survey_id, survey, survey.title, survey.response_user_logged_in_status)}
                        >
                          <SendIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          className="list-action-icon" 
                          disabled={!canEdit}
                          onClick={canEdit ? () => handleSurveyClick(survey.survey_id, survey, survey.title, survey.response_user_logged_in_status) : undefined}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          className="list-action-icon delete" 
                          disabled={!canEdit}
                          onClick={canEdit ? () => {
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
                          } : undefined}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </div>
                    </div>
                  </div>
                )
              ))}
            </div>
          ) : (
            <div className="empty-state-modern">
              <div className="empty-icon-modern">📋</div>
              <h3>{getLabel("No Surveys Found")}</h3>
              <p>{getLabel("Create your first survey to get started")}</p>
            </div>
          )}
        </div>

        {/* Collaborators Modal */}
        {activeCollabModal && (
          <div className="modal-overlay-modern" onClick={() => setActiveCollabModal(false)}>
            <div className="modal-content-modern" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-modern">
                <h3>
                  <GroupIcon /> {getLabel("Project Collaborators")}
                </h3>
                <IconButton size="small" onClick={() => setActiveCollabModal(false)}>
                  <CloseIcon />
                </IconButton>
              </div>
              
              <div className="modal-body-modern">
                {canEdit && (
                  <div className="add-collaborator-section">
                    <input 
                      type="email" 
                      placeholder={getLabel("Enter email address")}
                      className="collab-input-modern"
                      value={collabEmail}
                      onChange={(e) => setCollabEmail(e.target.value)}
                    />
                    <select 
                      className="collab-role-select"
                      value={accessControl}
                      onChange={(e) => setAccessControl(e.target.value)}
                    >
                      <option value="viewer">{getLabel("Viewer")}</option>
                      <option value="editor">{getLabel("Editor")}</option>
                    </select>
                    <button className="btn-add-collab" onClick={handleAddCollaborator}>
                      {getLabel("Add")}
                    </button>
                  </div>
                )}
                
                <div className="collaborators-list-modern">
                  {collaborators.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>
                      {getLabel("No collaborators added yet.")}
                    </p>
                  ) : (
                    collaborators.map((collab, idx) => (
                      <div key={idx} className="collaborator-item-modern">
                        <div className="collab-avatar">{collab.user.name[0]}</div>
                        <div className="collab-details">
                          <div className="collab-name">{collab.user.name}</div>
                          <div className="collab-email">{collab.user.email}</div>
                        </div>
                        <div className="collab-role-badge">{collab.access_role}</div>
                        <div className={`collab-status-badge ${collab.invitation}`}>
                          {collab.invitation === "accepted" ? (
                            <><CheckCircleIcon fontSize="small" /> {getLabel("Accepted")}</>
                          ) : (
                            <><PendingIcon fontSize="small" /> {getLabel("Pending")}</>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <ToastContainer position="top-center" autoClose={3000} />
      </div>
    </>
  );
};

export default EditProject;