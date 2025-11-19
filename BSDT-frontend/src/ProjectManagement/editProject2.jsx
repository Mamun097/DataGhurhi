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

// Import your API client
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

      <style>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .edit-project-modern-container {
          width: 100%;
          min-height: 100vh;
          background: #f8fafb;
          padding: 2rem;
        }

        .loading-state {
          text-align: center;
          padding: 3rem;
          font-size: 1.125rem;
          color: #64748b;
        }

        /* Project Header Section */
        .project-header-modern {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border: 1px solid #e2e8f0;
        }

        .project-header-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 2rem;
          flex-wrap: wrap;
        }

        .project-header-left {
          display: flex;
          gap: 1.5rem;
          flex: 1;
          min-width: 0;
        }

        .project-icon-large {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #e8f5ee 0%, #d1ebe0 100%);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .project-icon-large svg {
          font-size: 2.5rem;
          color: #4bb77d;
        }

        .project-header-info {
          flex: 1;
          min-width: 0;
        }

        .project-title-large {
          font-size: 2rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 1rem 0;
          line-height: 1.2;
        }

        .project-meta-chips {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }

        .field-chip {
          display: inline-flex;
          align-items: center;
          padding: 0.5rem 1rem;
          background: #f0fdf4;
          color: #16a34a;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          border: 1px solid #bbf7d0;
        }

        .privacy-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.5rem 1rem;
          background: #f1f5f9;
          color: #475569;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          border: 1px solid #cbd5e1;
        }

        .privacy-chip svg {
          font-size: 1rem;
        }

        .project-description-large {
          font-size: 1rem;
          color: #64748b;
          line-height: 1.6;
          margin: 0;
        }

        /* Edit Form */
        .project-edit-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          width: 100%;
        }

        .edit-input-title,
        .edit-input-field {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
          transition: all 0.2s ease;
        }

        .edit-input-title {
          font-size: 1.5rem;
        }

        .edit-input-title:focus,
        .edit-input-field:focus,
        .edit-textarea-desc:focus {
          outline: none;
          border-color: #4bb77d;
          box-shadow: 0 0 0 3px rgba(75, 183, 125, 0.1);
        }

        .edit-textarea-desc {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.9375rem;
          color: #475569;
          resize: vertical;
          font-family: inherit;
          transition: all 0.2s ease;
        }

        .edit-privacy-options {
          display: flex;
          gap: 1rem;
        }

        .privacy-radio-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 600;
          color: #475569;
        }

        .privacy-radio-label:hover {
          border-color: #4bb77d;
          background: #f0fdf4;
        }

        .privacy-radio-label input[type="radio"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .privacy-radio-label input[type="radio"]:checked + svg {
          color: #4bb77d;
        }

        .privacy-radio-label svg {
          font-size: 1.25rem;
        }

        /* Header Actions */
        .project-header-actions {
          display: flex;
          gap: 0.75rem;
          flex-shrink: 0;
        }

        .btn-action-modern,
        .btn-edit-modern,
        .btn-cancel-modern,
        .btn-save-modern {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          border-radius: 8px;
          font-size: 0.9375rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          white-space: nowrap;
        }

        .btn-action-modern {
          background: #f1f5f9;
          color: #475569;
          border: 1px solid #cbd5e1;
        }

        .btn-action-modern:hover:not(.disabled) {
          background: #e2e8f0;
          border-color: #94a3b8;
        }

        .btn-edit-modern {
          background: white;
          color: #4bb77d;
          border: 2px solid #4bb77d;
        }

        .btn-edit-modern:hover:not(.disabled) {
          background: #f0fdf4;
          transform: translateY(-1px);
        }

        .btn-cancel-modern {
          background: #f1f5f9;
          color: #64748b;
          border: 1px solid #cbd5e1;
        }

        .btn-cancel-modern:hover {
          background: #e2e8f0;
        }

        .btn-save-modern {
          background: #4bb77d;
          color: white;
          border: none;
        }

        .btn-save-modern:hover {
          background: #3a9563;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(75, 183, 125, 0.3);
        }

        .disabled {
          opacity: 0.5;
          cursor: not-allowed !important;
          pointer-events: none;
        }

        /* Surveys Section */
        .surveys-section-modern {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border: 1px solid #e2e8f0;
        }

        .surveys-header-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .surveys-section-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0;
        }

        .surveys-create-buttons {
          display: flex;
          gap: 0.75rem;
        }

        .btn-create-survey,
        .btn-generate-survey {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          border-radius: 8px;
          font-size: 0.9375rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }

        .btn-create-survey {
          background: #4bb77d;
          color: white;
        }

        .btn-create-survey:hover:not(.disabled) {
          background: #3a9563;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(75, 183, 125, 0.3);
        }

        .btn-generate-survey {
          background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
          color: white;
        }

        .btn-generate-survey:hover:not(.disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
        }

        /* Toolbar */
        .surveys-toolbar-modern {
          background: #f8fafb;
          padding: 1.25rem;
          border-radius: 12px;
          margin-bottom: 2rem;
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          align-items: center;
          border: 1px solid #e2e8f0;
        }

        .search-box-modern {
          position: relative;
          display: flex;
          align-items: center;
          max-width: 400px;
          flex: 1;
        }

        .search-icon-modern {
          position: absolute;
          right: 12px;
          color: #94a3b8;
          pointer-events: none;
        }

        .search-input-modern {
          width: 100%;
          padding: 0.625rem 2.5rem 0.625rem 1rem;
          border: 1.5px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.875rem;
          background: white;
          transition: all 0.2s ease;
        }

        .search-input-modern:focus {
          outline: none;
          border-color: #4bb77d;
          box-shadow: 0 0 0 3px rgba(75, 183, 125, 0.1);
        }

        .toolbar-controls-modern {
          display: flex;
          gap: 1rem;
          align-items: center;
          flex-wrap: wrap;
        }

        .filter-group-modern {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .filter-group-modern label {
          font-size: 0.875rem;
          font-weight: 600;
          color: #475569;
          white-space: nowrap;
        }

        .filter-select-modern {
          padding: 0.5rem 0.75rem;
          border: 1.5px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.875rem;
          color: #334155;
          background: white;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 500;
        }

        .filter-select-modern:focus {
          outline: none;
          border-color: #4bb77d;
          box-shadow: 0 0 0 3px rgba(75, 183, 125, 0.1);
        }

        .view-toggle-modern {
          display: flex;
          gap: 0.25rem;
          background: #e2e8f0;
          padding: 0.25rem;
          border-radius: 8px;
        }

        .view-toggle-modern .MuiIconButton-root {
          color: #64748b;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .view-toggle-modern .MuiIconButton-root.active {
          background: white;
          color: #4bb77d;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        /* Surveys Grid */
        .surveys-grid-modern {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        @media (min-width: 1400px) {
          .surveys-grid-modern {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .survey-card-modern.grid {
          background: white;
          border-radius: 12px;
          border: 2px solid #e2e8f0;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .survey-card-modern.grid:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
          border-color: #4bb77d;
        }

        .survey-banner-modern {
          width: 100%;
          height: 140px;
          background-size: cover;
          background-position: center;
          background-color: #e2e8f0;
          position: relative;
          cursor: pointer;
        }

        .survey-status-badge {
          position: absolute;
          top: 0.75rem;
          right: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.375rem 0.75rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(8px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .survey-status-badge svg {
          font-size: 0.875rem;
        }

        .survey-content-modern {
          padding: 1.25rem;
          cursor: pointer;
        }

        .survey-title-modern {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 0.5rem 0;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .survey-date-modern {
          font-size: 0.8125rem;
          color: #64748b;
          margin: 0 0 1rem 0;
        }

        .survey-actions-modern {
          display: flex;
          gap: 0.5rem;
          padding-top: 1rem;
          border-top: 1px solid #f1f5f9;
        }

        .action-icon-modern {
          transition: all 0.2s ease;
        }

        .action-icon-modern.view {
          color: #4bb77d;
        }

        .action-icon-modern.view:hover {
          background: #f0fdf4 !important;
        }

        .action-icon-modern.edit {
          color: #3b82f6;
        }

        .action-icon-modern.edit:hover:not(:disabled) {
          background: #eff6ff !important;
        }

        .action-icon-modern.delete {
          color: #dc2626;
        }

        .action-icon-modern.delete:hover:not(:disabled) {
          background: #fee2e2 !important;
        }

        /* Surveys List */
        .surveys-list-modern {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .survey-card-modern.list {
          background: white;
          border-radius: 10px;
          border: 1.5px solid #e2e8f0;
          padding: 1.25rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1.5rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .survey-card-modern.list:hover {
          border-color: #4bb77d;
          box-shadow: 0 4px 12px rgba(75, 183, 125, 0.15);
        }

        .survey-list-left {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex: 1;
          min-width: 0;
          cursor: pointer;
        }

        .survey-list-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #e8f5ee 0%, #d1ebe0 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .survey-list-icon svg {
          font-size: 1.5rem;
          color: #4bb77d;
        }

        .survey-list-info {
          flex: 1;
          min-width: 0;
        }

        .survey-list-title {
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 0.25rem 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .survey-list-date {
          font-size: 0.8125rem;
          color: #64748b;
          margin: 0;
        }

        .survey-list-right {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-shrink: 0;
        }

        .survey-list-status {
          padding: 0.375rem 0.75rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          white-space: nowrap;
        }

        .survey-list-status.published {
          background: #f0fdf4;
          color: #16a34a;
          border: 1px solid #bbf7d0;
        }

        .survey-list-status.saved {
          background: #fef3c7;
          color: #d97706;
          border: 1px solid #fde68a;
        }

        .survey-list-actions {
          display: flex;
          gap: 0.25rem;
        }

        .list-action-icon {
          transition: all 0.2s ease;
        }

        .list-action-icon.delete:hover:not(:disabled) {
          color: #dc2626 !important;
          background: #fee2e2 !important;
        }

        /* Empty State */
        .empty-state-modern {
          text-align: center;
          padding: 4rem 2rem;
          background: #f8fafb;
          border-radius: 12px;
          border: 2px dashed #cbd5e1;
        }

        .empty-icon-modern {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .empty-state-modern h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #334155;
          margin: 0 0 0.5rem 0;
        }

        .empty-state-modern p {
          font-size: 0.9375rem;
          color: #64748b;
          margin: 0;
        }

        /* Modal */
        .modal-overlay-modern {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .modal-content-modern {
          background: white;
          border-radius: 16px;
          width: 100%;
          max-width: 700px;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }

        .modal-header-modern {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .modal-header-modern h3 {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.25rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0;
        }

        .modal-header-modern svg {
          color: #4bb77d;
        }

        .modal-body-modern {
          padding: 1.5rem;
          overflow-y: auto;
        }

        .add-collaborator-section {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
          padding: 1.25rem;
          background: #f8fafb;
          border-radius: 12px;
          border: 1.5px solid #e2e8f0;
        }

        .collab-input-modern {
          flex: 1;
          padding: 0.75rem;
          border: 1.5px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.9375rem;
          transition: all 0.2s ease;
        }

        .collab-input-modern:focus {
          outline: none;
          border-color: #4bb77d;
          box-shadow: 0 0 0 3px rgba(75, 183, 125, 0.1);
        }

        .collab-role-select {
          padding: 0.75rem;
          border: 1.5px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.9375rem;
          background: white;
          cursor: pointer;
          font-weight: 500;
        }

        .btn-add-collab {
          padding: 0.75rem 1.5rem;
          background: #4bb77d;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 0.9375rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-add-collab:hover {
          background: #3a9563;
          transform: translateY(-1px);
        }

        .collaborators-list-modern {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .collaborator-item-modern {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: white;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          transition: all 0.2s ease;
        }

        .collaborator-item-modern:hover {
          border-color: #cbd5e1;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .collab-avatar {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #e8f5ee 0%, #d1ebe0 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          font-weight: 700;
          color: #4bb77d;
          flex-shrink: 0;
        }

        .collab-details {
          flex: 1;
          min-width: 0;
        }

        .collab-name {
          font-size: 0.9375rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 0.25rem;
        }

        .collab-email {
          font-size: 0.8125rem;
          color: #64748b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .collab-role-badge {
          padding: 0.375rem 0.75rem;
          background: #f1f5f9;
          color: #475569;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: capitalize;
          border: 1px solid #cbd5e1;
        }

        .collab-status-badge {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.375rem 0.75rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          white-space: nowrap;
        }

        .collab-status-badge.accepted {
          background: #f0fdf4;
          color: #16a34a;
          border: 1px solid #bbf7d0;
        }

        .collab-status-badge.pending {
          background: #fef3c7;
          color: #d97706;
          border: 1px solid #fde68a;
        }

        .collab-status-badge svg {
          font-size: 0.875rem;
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .surveys-grid-modern {
            grid-template-columns: repeat(2, 1fr);
          }

          .project-header-content {
            flex-direction: column;
          }

          .project-header-actions {
            width: 100%;
            justify-content: flex-start;
          }
        }

        @media (max-width: 768px) {
          .edit-project-modern-container {
            padding: 1rem;
          }

          .project-header-modern,
          .surveys-section-modern {
            padding: 1.5rem;
          }

          .project-header-left {
            flex-direction: column;
          }

          .project-icon-large {
            width: 64px;
            height: 64px;
          }

          .project-icon-large svg {
            font-size: 2rem;
          }

          .project-title-large {
            font-size: 1.5rem;
          }

          .surveys-header-actions {
            flex-direction: column;
            align-items: stretch;
          }

          .surveys-create-buttons {
            width: 100%;
            flex-direction: column;
          }

          .btn-create-survey,
          .btn-generate-survey {
            width: 100%;
            justify-content: center;
          }

          .surveys-toolbar-modern {
            flex-direction: column;
            align-items: stretch;
          }

          .search-box-modern {
            max-width: 100%;
          }

          .toolbar-controls-modern {
            width: 100%;
            justify-content: space-between;
          }

          .surveys-grid-modern {
            grid-template-columns: 1fr;
          }

          .survey-card-modern.list {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }

          .survey-list-left {
            width: 100%;
          }

          .survey-list-right {
            width: 100%;
            justify-content: space-between;
            padding-top: 0.75rem;
            border-top: 1px solid #f1f5f9;
          }

          .add-collaborator-section {
            flex-direction: column;
          }

          .privacy-radio-label {
            flex: 1;
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .project-meta-chips {
            flex-direction: column;
            align-items: flex-start;
          }

          .project-header-actions {
            flex-direction: column;
          }

          .btn-action-modern,
          .btn-edit-modern,
          .btn-cancel-modern,
          .btn-save-modern {
            width: 100%;
            justify-content: center;
          }

          .filter-group-modern {
            width: 100%;
          }

          .filter-select-modern {
            flex: 1;
          }

          .view-toggle-modern {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default EditProject;