import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import LockIcon from "@mui/icons-material/Lock";
import PublicIcon from "@mui/icons-material/Public";
import SearchIcon from "@mui/icons-material/Search";
import GridViewIcon from "@mui/icons-material/GridView";
import ViewListIcon from "@mui/icons-material/ViewList";
import AddIcon from "@mui/icons-material/Add";
import UpdateIcon from "@mui/icons-material/Update";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import GroupIcon from "@mui/icons-material/Group";
import SendIcon from "@mui/icons-material/Send";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DescriptionIcon from "@mui/icons-material/DescriptionTwoTone";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import apiClient from "../api";
import AutoSurveyGeneration from "../ProjectManagement/AutoSurveyGeneration";
import "./editProject.css";

// Import banner images
import banner1 from "./banner/banner1.jpg";
import banner2 from "./banner/banner2.jpg";
import banner3 from "./banner/banner3.jpg";
import banner4 from "./banner/banner4.jpg";
import banner5 from "./banner/banner5.jpg";
import banner6 from "./banner/banner6.jpg";
import banner7 from "./banner/banner7.jpg";
import banner8 from "./banner/banner8.jpg";
import banner9 from "./banner/banner9.jpg";
import banner10 from "./banner/banner10.jpg";

const ProjectDetailsTab = ({ projectId, getLabel, language, onBack, handleReject}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortField, setSortField] = useState("title");
  const [sortOrder, setSortOrder] = useState("asc");
  const [showCollabModal, setShowCollabModal] = useState(false);
  const [collabEmail, setCollabEmail] = useState("");
  const [accessControl, setAccessControl] = useState("viewer");

  // Store original project data
  const [originalData, setOriginalData] = useState({
    title: "",
    field: "",
    description: "",
    privacy_mode: "",
  });

  const [formData, setFormData] = useState({
    title: "",
    field: "",
    description: "",
    privacy_mode: "",
  });

  const [surveys, setSurveys] = useState([]);
  const [collaborators, setCollaborators] = useState([]);
  const [acceptedCollaborators, setAcceptedCollaborators] = useState([]);
  const [userRole, setUserRole] = useState("");

  const canEdit = userRole === "owner" || userRole === "editor";

  const bannerImages = [
    banner1, banner2, banner3, banner4, banner5,
    banner6, banner7, banner8, banner9, banner10,
  ];

  const getSurveyBanner = (survey) => {
    const seed = survey.survey_id || 0;
    const imageIndex = seed % bannerImages.length;
    return bannerImages[imageIndex];
  };

  // Fetch user access level for this project
  const fetchUserAccess = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await apiClient.get(`/api/project/${projectId}/fetchaccess`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200 && response.data?.access_role) {
        setUserRole(response.data.access_role);
      }
    } catch (error) {
      console.error("Error fetching user access:", error);
      // Default to viewer if there's an error
      setUserRole("viewer");
    }
  };

  // Fetch project details
  const fetchProject = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await apiClient.get(`/api/project/${projectId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (response.status === 200 && response.data?.project) {
        const { title, field, description, privacy_mode } = response.data.project;
        const projectData = { title, field, description, privacy_mode };
        
        setOriginalData(projectData);
        setFormData(projectData);
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
    try {
      const response = await apiClient.get(`/api/project/${projectId}/surveys`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (response.status === 200) setSurveys(response.data.surveys || []);
    } catch (error) {
      console.error("Error fetching surveys:", error);
    }
  };

  // Fetch collaborators
  const fetchCollaborators = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await apiClient.get(`/api/project/${projectId}/collaborators`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCollaborators(response.data.collaborators || []);
      setAcceptedCollaborators(response.data.acceptedCollaborators || []);
    } catch (error) {
      console.error("Error fetching collaborators:", error);
    }
  };

  useEffect(() => {
    fetchUserAccess();
    fetchProject();
    fetchSurveys();
    fetchCollaborators();
  }, [projectId]);

  const handleGenerateSurvey = async (surveyMeta) => {
    const token = localStorage.getItem("token");

    try {
      // 1. creating a new survey
      const resSurvey = await apiClient.post(
        `/api/project/${projectId}/create-survey`,
        { title: surveyMeta.topic || "Untitled Survey" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const survey_id =
        resSurvey.data?.survey_id || resSurvey.data?.data?.survey_id;
      if (!survey_id) throw new Error("Survey not created");

      // 2. calling LLM to generate questions
      const resLLM = await apiClient.post(
        `/api/generate-multiple-questions-with-llm`,
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

      // 3. parsing questions from rawResponse
      let questions = resLLM.data;
      if (questions.rawResponse) {
        try {
          const cleanedRaw = questions.rawResponse.replace(
            /undefined/g,
            "null"
          );
          const parsed = JSON.parse(cleanedRaw);
          questions = Array.isArray(parsed) ? parsed : [parsed];
        } catch (err) {
          console.error("Failed to parse cleaned LLM response:", err.message);
          throw new Error("Invalid LLM response format");
        }
      } else {
        questions = Array.isArray(questions) ? questions : [questions];
      }

      console.log("LLM Questions:", questions);

      // 4. preparing survey_template object
      const surveyTemplatePayload = {
        survey_id: survey_id,
        project_id: Number(projectId),
        title: surveyMeta.topic,
        user_id: null,
        survey_template: {
          title: surveyMeta.topic,
          description: null,
          backgroundImage:
            "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.pixelstalk.net%2Fwp-content%2Fuploads%2F2016%2F10%2FBlank-Wallpaper-HD.jpg&f=1&nofb=1",
          sections: [{ id: 1, title: "Section 1" }],
          questions: questions.map((q, i) => ({
            id: i + 1,
            text: q.question || q.text || "Untitled Question",
            type:
              (q.type || "text").toLowerCase() === "mixed"
                ? "text"
                : (q.type || "text").toLowerCase(),
            required: q.required ?? false,
            section: 1,
            meta: {
              options: q.options || q.meta?.options || [],
            },
          })),
        },
      };

      // 5. saving the generated survey template
      const resSave = await apiClient.put(
        `/api/surveytemplate/save`,
        surveyTemplatePayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (resSave.status !== 201)
        throw new Error("Failed to save survey template");

      toast.success(getLabel("Survey created successfully!"));
      await fetchSurveys();

      // 6. redirecting to the survey
      setTimeout(() => {
        navigate(`/view-survey/${survey_id}`, {
          state: {
            project_id: projectId,
            input_title: surveyMeta.topic,
            survey_details: resSave.data.data,
          },
        });
      }, 3000);

      // reducing survey count
      apiClient
        .get("/api/reduce-survey-count", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          if (response.status === 200 && response.data.success) {
            console.log("Survey count reduced successfully:", response.data);
          } else {
            console.error("Failed to reduce survey count:", response.data?.message);
          }
        })
        .catch((error) => {
          console.error("Error calling API:", error);
        });
    } catch (error) {
      console.error("Survey creation error:", error);
      toast.error(getLabel("Failed to generate survey."));
    }
  };

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
      
      setOriginalData(formData);
      setIsEditing(false);
      fetchProject();
    } catch (error) {
      console.error("Error updating project:", error);
      toast.error(getLabel("Failed to update project."));
    }
  };

  const handleCancel = () => {
    setFormData(originalData);
    setIsEditing(false);
  };

  const handleAddSurveyClick = async () => {
    const result = await Swal.fire({
      title: '<span style="color: #1e293b; font-weight: 600; font-size: 1.5rem;">'+getLabel("Create New Survey")+'</span>',
      html: `
        <div style="text-align: left; margin-top: 1rem;">
          <label style="display: block; color: #64748b; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem;">
            ${getLabel("Survey Title")}
          </label>
          <input 
            id="survey-title-input" 
            class="swal2-input" 
            placeholder="${getLabel("Enter survey title...")}" 
            style="width: 100%; padding: 0.75rem; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 0.9375rem; margin: 0;"
          >
        </div>
      `,
      showCancelButton: true,
      cancelButtonText: getLabel("Cancel"),
      confirmButtonText: '<span style="display: flex; align-items: center; gap: 0.5rem;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>'+getLabel("Create")+'</span>',
      customClass: {
        popup: 'survey-modal-popup',
        title: 'survey-modal-title',
        htmlContainer: 'survey-modal-content',
        confirmButton: 'survey-modal-confirm',
        cancelButton: 'survey-modal-cancel',
        actions: 'survey-modal-actions'
      },
      buttonsStyling: false,
      focusConfirm: false,
      didOpen: () => {
        const input = document.getElementById('survey-title-input');
        input.focus();
        input.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            Swal.clickConfirm();
          }
        });
      },
      preConfirm: () => {
        const title = document.getElementById('survey-title-input').value;
        if (!title) {
          Swal.showValidationMessage(getLabel("Title is required!"));
          return false;
        }
        return title;
      }
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
              `/view-survey/${response.data.data?.survey_id || response.data.survey_id}`,
              {
                state: {
                  project_id: projectId,
                  survey_details: response.data,
                  input_title: result.value,
                },
              }
            );
          }, 1500);
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
      const response = await apiClient.delete(`/api/surveytemplate/${surveyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        toast.success(getLabel("Survey deleted successfully!"));
        fetchSurveys();
      }
    } catch (error) {
      console.error("Error deleting survey:", error);
      toast.error(getLabel("Failed to delete survey."));
    }
  };

  const handleSurveyClick = (survey_id, survey, survey_title) => {
    navigate(`/view-survey/${survey_id}`, {
      state: {
        project_id: projectId,
        survey_details: survey,
        input_title: survey_title || "Untitled Survey",
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
      const errorMessage = error.response?.data?.error || getLabel("Failed to add collaborator.");
      toast.error(errorMessage);
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

  const getToolTip = () => {
    if (loading) return "Loading project details...";
    if (!canEdit) return "Editor or Owner access required";
    return "";
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
      <div className="modern-projects-container">
        <div className="loading-state">Loading...</div>
      </div>
    );
  }

  return (
    <div className="modern-projects-container">
      {/* Project Header Section */}
      <div className="project-details-header-section">
        <div className="project-details-main">
          <div className="project-title-row">
            <FolderOpenIcon className="project-header-icon" />
            <div className="project-title-content">
              {!isEditing ? (
                <>
                  <h2 className="project-main-title">{formData.title}</h2>
                  <p className="project-main-subtitle">{formData.description || getLabel("No description provided")}</p>
                </>
              ) : (
                <form onSubmit={handleSubmit} className="project-edit-form-inline">
                  <input
                    type="text"
                    className="edit-input-title-inline"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder={getLabel("Project Name")}
                    required
                  />
                  <textarea
                    className="edit-textarea-desc-inline"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder={getLabel("Description")}
                    rows="2"
                  />
                </form>
              )}
            </div>
          </div>

          <div className="project-meta-row">
            {!isEditing ? (
              <>
                <span className="project-field-badge">{formData.field}</span>
                <span className="project-privacy-badge">
                  {formData.privacy_mode === "private" ? (
                    <>
                      <LockIcon fontSize="small" />
                      <span>{getLabel("Private")}</span>
                    </>
                  ) : (
                    <>
                      <PublicIcon fontSize="small" />
                      <span>{getLabel("Public")}</span>
                    </>
                  )}
                </span>
                <div 
                  className={`btn-collaborators-wrapper ${!canEdit ? "disabled" : ""}`}
                  onClick={() => {
                    if (canEdit) {
                      fetchCollaborators();
                      setShowCollabModal(true);
                    }
                  }}
                  title={getLabel("Collaborators")}
                >
                  <IconButton
                    className="btn-collaborators-icon-inner"
                    disabled={!canEdit}
                    size="small"
                  >
                    <GroupIcon fontSize="small" />
                  </IconButton>
                  <span className="collaborators-count-badge">{acceptedCollaborators.length}</span>
                </div>
              </>
            ) : (
              <div className="project-edit-meta">
                <input
                  type="text"
                  className="edit-input-field-inline"
                  value={formData.field}
                  onChange={(e) => setFormData({ ...formData, field: e.target.value })}
                  placeholder={getLabel("Research Field")}
                  required
                />
                <div className="edit-privacy-options-inline">
                  <label className="privacy-radio-label-inline">
                    <input
                      type="radio"
                      name="privacy_mode"
                      value="public"
                      checked={formData.privacy_mode === "public"}
                      onChange={(e) => setFormData({ ...formData, privacy_mode: e.target.value })}
                    />
                    <PublicIcon fontSize="small" />
                    <span>{getLabel("Public")}</span>
                  </label>
                  <label className="privacy-radio-label-inline">
                    <input
                      type="radio"
                      name="privacy_mode"
                      value="private"
                      checked={formData.privacy_mode === "private"}
                      onChange={(e) => setFormData({ ...formData, privacy_mode: e.target.value })}
                    />
                    <LockIcon fontSize="small" />
                    <span>{getLabel("Private")}</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
        {accessControl!="viewer" &&
        (<div className="project-details-actions">
          {!isEditing ? (
            <IconButton
              className={`btn-edit-icon ${!canEdit ? "disabled" : ""}`}
              onClick={() => canEdit && setIsEditing(true)}
              disabled={!canEdit}
              size="small"
              title={getLabel("Edit Project Details")}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          ) : (
            <div className="edit-action-buttons">
              <button type="button" className="btn-action-header btn-cancel-header" onClick={handleCancel}>
                <CloseIcon fontSize="small" />
                <span>{getLabel("Cancel")}</span>
              </button>
              <button type="submit" className="btn-action-header btn-save-header" onClick={handleSubmit}>
                <SaveIcon fontSize="small" />
                <span>{getLabel("Save")}</span>
              </button>
            </div>
          )}
        </div>)}
      </div>

      {/* Surveys Section Header */}
      <div className="surveys-control-bar">
        <div className="surveys-title-section">
          <DescriptionIcon className="surveys-icon" />
          <div>
            <span className="surveys-title">{getLabel("My Surveys")}</span>
            <p className="surveys-subtitle">{getLabel("Create and manage surveys within this project")}</p>
          </div>
        </div>
        <div className="surveys-action-buttons">
          <button
            className={`btn-survey-action btn-new-survey ${!canEdit ? "disabled" : ""}`}
            onClick={canEdit ? handleAddSurveyClick : null}
            disabled={!canEdit}
            title={getToolTip}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="12" y1="18" x2="12" y2="12"></line>
              <line x1="9" y1="15" x2="15" y2="15"></line>
            </svg>
            <span>{getLabel("New Survey")}</span>
          </button>
          <AutoSurveyGeneration
            onGenerateSurvey={handleGenerateSurvey}
            getLabel={getLabel}
            canEdit={canEdit}
          />
        </div>
      </div>

      {/* Toolbar */}
      <div className="projects-toolbar">
        <div className="search-box">
          <input
            type="text"
            placeholder={getLabel("Search surveys...")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <SearchIcon className="search-icon" />
        </div>

        <div className="toolbar-controls">
          <div className="filter-group">
            <label>{getLabel("Status:")}</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">{getLabel("All")}</option>
              <option value="published">{getLabel("Published")}</option>
              <option value="saved">{getLabel("Draft")}</option>
            </select>
          </div>

          <div className="filter-group">
            <label>{getLabel("Sort:")}</label>
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value)}
              className="filter-select"
            >
              <option value="title">{getLabel("Title")}</option>
              <option value="last_updated">{getLabel("Updated")}</option>
              <option value="created_at">{getLabel("Created")}</option>
            </select>
          </div>

          <div className="filter-group">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="filter-select"
            >
              <option value="asc">↑ {getLabel("Ascending")}</option>
              <option value="desc">↓ {getLabel("Descending")}</option>
            </select>
          </div>

          <div className="view-toggle">
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
        <div className={`projects-${viewMode}`}>
          {filteredAndSortedSurveys.map((survey) =>
            viewMode === "grid" ? (
              <div
                key={survey.survey_id}
                className="project-card-modern grid"
                onClick={() => handleSurveyClick(survey.survey_id, survey, survey.title)}
              >
                <div
                  className="project-banner"
                  style={{
                    backgroundImage: `url(${getSurveyBanner(survey)})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                  }}
                >
                  <div className="privacy-badge">
                    {survey.survey_status === "published" ? (
                      <>
                        <CheckCircleIcon fontSize="small" />
                        <span>{getLabel("Published")}</span>
                      </>
                    ) : (
                      <>
                        <PendingIcon fontSize="small" />
                        <span>{getLabel("Draft")}</span>
                      </>
                    )}
                  </div>

                  {canEdit && (
                    <IconButton
                      className="delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
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
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </div>

                <div className="project-content">
                  <div className="project-header-info">
                    <div className="project-icon">
                      <DescriptionIcon></DescriptionIcon>
                    </div>
                    <h3 className="project-title">{survey.title}</h3>
                  </div>

                  <div className="project-meta">
                    <div className="meta-item">
                      <UpdateIcon fontSize="small" />
                      <span>{formatDate(survey.last_updated)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div
                key={survey.survey_id}
                className="project-card-modern list"
                onClick={() => handleSurveyClick(survey.survey_id, survey, survey.title)}
              >
                <div className="list-left">
                  <div className="list-icon">
                    <DescriptionIcon/>
                  </div>
                  <div className="list-info">
                    <h3 className="list-title">{survey.title}</h3>
                    <p className="list-description">
                      {getLabel("Updated")}: {formatDate(survey.last_updated)}
                    </p>
                  </div>
                </div>

                <div className="list-right">
                  <span className="list-field">
                    {survey.survey_status === "published"
                      ? getLabel("Published")
                      : getLabel("Draft")}
                  </span>
                  
                  {accessControl!="viewer" &&
                  (<IconButton
                    className="list-delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (canEdit) {
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
                      }
                    }}
                    size="small"
                    disabled={!canEdit}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>)}
                </div>
              </div>
            )
          )}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>{getLabel("No Surveys Found")}</h3>
          <p
            className="empty-create-link"
            onClick={searchTerm ? undefined : handleAddSurveyClick}
            style={{ cursor: searchTerm || !canEdit ? "default" : "pointer" }}
          >
            {searchTerm
              ? getLabel("Try adjusting your search or filters")
              : getLabel("Create your first survey to get started")}
          </p>
        </div>
      )}

      {/* Collaborators Modal */}
      {showCollabModal && (
        <div className="modal-overlay-modern" onClick={() => setShowCollabModal(false)}>
          <div className="modal-content-modern" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-modern">
              <h3>
                <GroupIcon /> {getLabel("Project Collaborators")}
              </h3>
              <IconButton size="small" onClick={() => setShowCollabModal(false)}>
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
                    <AddIcon fontSize="small" />
                    <span>{getLabel("Add")}</span>
                  </button>
                </div>
              )}

              <div className="collaborators-list-modern">
                {collaborators.length === 0 ? (
                  <p style={{ textAlign: "center", color: "#64748b", padding: "2rem" }}>
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
                          <>
                            <CheckCircleIcon fontSize="small" /> {getLabel("Accepted")}
                          </>
                        ) : (
                          <>
                            <PendingIcon fontSize="small" /> {getLabel("Pending")}
                          </>
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
  );
};

export default ProjectDetailsTab;