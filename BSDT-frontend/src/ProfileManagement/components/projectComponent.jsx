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
import MultipleFolders from "@mui/icons-material/FolderCopyTwoTone";
import CloseIcon from "@mui/icons-material/Close";
import { MdPublic } from "react-icons/md";
import { FaLock } from "react-icons/fa";
import apiClient from "../../api";
import "../Dashboard.css";
import "./projectComponent.css";

// Import local banner images
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
import no_personal_project from "./banner/no_personal_project.png";

const ProjectTab = ({
  getLabel,
  handleAddProjectClick,
  privacyFilter,
  sortField,
  setProjects,
  sortOrder,
  projects,
  setSortOrder,
  setSortField,
  setPrivacyFilter,
  handleProjectClick,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    field: "",
    description: "",
    privacy_mode: "public",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Array of imported local banner images
  const bannerImages = [
    banner1,
    banner2,
    banner3,
    banner4,
    banner5,
    banner6,
    banner7,
    banner8,
    banner9,
    banner10,
  ];

  // Function to get banner image for each project
  const getProjectBanner = (project) => {
    const seed = project.project_id || 0;
    const imageIndex = seed % bannerImages.length;
    return bannerImages[imageIndex];
  };

  // Handle modal open
  const handleOpenModal = () => {
    setIsModalOpen(true);
    setFormData({
      title: "",
      field: "",
      description: "",
      privacy_mode: "public",
    });
  };

  // Handle modal close
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      title: "",
      field: "",
      description: "",
      privacy_mode: "public",
    });
  };

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const response = await apiClient.post(
        "/api/project/create-project",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
        // Close modal and show success message
        handleCloseModal();
        alert(getLabel("Project created successfully"));
        
        // Refetch the complete projects list after successful creation
        setTimeout(async () => {
          try {
            const projectsResponse = await apiClient.get("/api/project/my-projects", {
              headers: { Authorization: `Bearer ${token}` },
            });
            
            // Handle different possible response structures
            if (projectsResponse.data?.projects) {
              setProjects(projectsResponse.data.projects);
            } else if (Array.isArray(projectsResponse.data)) {
              setProjects(projectsResponse.data);
            }
          } catch (fetchError) {
            console.error("Error fetching updated projects:", fetchError);
            // Fallback: reload the page to get fresh data
            window.location.reload();
          }
        }, 500);
      }
    } catch (error) {
      console.error("Error creating project:", error);
      alert(getLabel("An error occurred while creating the project"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = (projectId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert(getLabel("You must be logged in to delete a project."));
      return;
    }
    if (
      window.confirm(
        getLabel(
          "Are you sure you want to delete this project? This action cannot be undone."
        )
      )
    ) {
      apiClient
        .delete(`/api/project/${projectId}/delete-project`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          setProjects((prevProjects) =>
            prevProjects.filter((project) => project.project_id !== projectId)
          );
          alert(getLabel("Project deleted successfully."));
        })
        .catch((error) => {
          console.error("Error deleting project:", error);
          alert(error.message);
        });
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

  const filteredAndSortedProjects = projects
    .filter((project) => {
      const matchesPrivacy =
        privacyFilter === "all" || project.privacy_mode === privacyFilter;
      const matchesSearch =
        (project.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.field || "").toLowerCase().includes(searchTerm.toLowerCase());
      return matchesPrivacy && matchesSearch;
    })
    .sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      const isDateField =
        sortField.includes("created_at") || sortField.includes("last_updated");

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
    });

  return (
    <div className="modern-projects-container">
      {/* Header Section */}
      <div className="projects-header-section">
        <div className="header-title">
          <MultipleFolders className="header-icon" />
          <div>
            <h2>{getLabel("My Projects")}</h2>
            <p className="header-subtitle">
              {getLabel("Manage and organize your research projects")}
            </p>
          </div>
        </div>
        <button className="btn-create-project" onClick={handleOpenModal}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
            <polyline points="2 17 12 22 22 17"></polyline>
            <polyline points="2 12 12 17 22 12"></polyline>
          </svg>
          <span>{getLabel("New Project")}</span>
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="projects-toolbar">
        <div className="search-box">
          <input
            type="text"
            placeholder={getLabel("Search projects...")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <SearchIcon className="search-icon" />
        </div>

        <div className="toolbar-controls">
          <div className="filter-group">
            <label>{getLabel("Privacy:")}</label>
            <select
              value={privacyFilter}
              onChange={(e) => setPrivacyFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">{getLabel("All")}</option>
              <option value="public">{getLabel("Public")}</option>
              <option value="private">{getLabel("Private")}</option>
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
              <option value="field">{getLabel("Field")}</option>
              <option value="created_at">{getLabel("Created")}</option>
              <option value="last_updated">{getLabel("Updated")}</option>
            </select>
          </div>

          <div className="filter-group">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="filter-select"
            >
              <option value="asc">{getLabel("↑ Asc")}</option>
              <option value="desc">{getLabel("↓ Desc")}</option>
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

      {/* Projects Grid/List */}
      {filteredAndSortedProjects.length > 0 ? (
        <div className={`projects-${viewMode}`}>
          {filteredAndSortedProjects.map((project) => (
            viewMode === "grid" ? (
              // GRID VIEW
              <div
                key={project.project_id}
                className="project-card-modern grid"
                onClick={() => handleProjectClick(project.project_id, "owner")}
              >
                {/* Project Banner */}
                <div
                  className="project-banner"
                  style={{
                    backgroundImage: `url(${getProjectBanner(project)})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                  }}
                >
                  <div className="privacy-badge">
                    {project.privacy_mode === "private" ? (
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
                  </div>

                  {/* Delete Button */}
                  <IconButton
                    className="delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProject(project.project_id);
                    }}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </div>

                {/* Project Content */}
                <div className="project-content">
                  <div className="project-header-info">
                    <div className="project-icon">
                      <FolderOpenIcon />
                    </div>
                    <h3 className="project-title">{project.title}</h3>
                  </div>

                  <div className="project-field">
                    <span className="field-badge">{project.field}</span>
                  </div>

                  {project.description && (
                    <p className="project-description">
                      {project.description.substring(0, 80)}
                      {project.description.length > 80 ? "..." : ""}
                    </p>
                  )}

                  <div className="project-meta">
                    <div className="meta-item">
                      <UpdateIcon fontSize="small" />
                      <span>{formatDate(project.last_updated)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // COMPACT LIST VIEW
              <div
                key={project.project_id}
                className="project-card-modern list"
                onClick={() => handleProjectClick(project.project_id, "owner")}
              >
                <div className="list-left">
                  <div className="list-icon">
                    <FolderOpenIcon />
                  </div>
                  <div className="list-info">
                    <h3 className="list-title">{project.title}</h3>
                    <p className="list-description">
                      {project.description || getLabel("No description provided")}
                    </p>
                  </div>
                </div>

                <div className="list-right">
                  <span className="list-field">{project.field}</span>
                  <div className="list-privacy">
                    {project.privacy_mode === "private" ? (
                      <LockIcon fontSize="small" />
                    ) : (
                      <PublicIcon fontSize="small" />
                    )}
                  </div>
                  <span className="list-date">{formatDate(project.last_updated)}</span>
                  <IconButton
                    className="list-delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProject(project.project_id);
                    }}
                    size="small"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </div>
              </div>
            )
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-illustration">
            <img src={no_personal_project} alt="No Projects" />
          </div>
          <h3>{getLabel("No Projects Found")}</h3>
          <p
            className="empty-create-link"
            onClick={searchTerm ? undefined : handleOpenModal}
            style={{ cursor: searchTerm ? 'default' : 'pointer' }}
          >
            {searchTerm
              ? getLabel("Try adjusting your search or filters")
              : getLabel("Create your first project to get started")}
          </p>
        </div>
      )}

      {/* Create Project Modal - Professional Design */}
      {isModalOpen && (
        <div className="modal-overlay-modern" onClick={handleCloseModal}>
          <div className="modal-content-modern create-project-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-modern">
              <h3>
                <FolderOpenIcon /> {getLabel("Create New Project")}
              </h3>
              <IconButton size="small" onClick={handleCloseModal}>
                <CloseIcon />
              </IconButton>
            </div>

            <div className="modal-body-modern">
              <form onSubmit={handleSubmit} className="project-form-modern">
                {/* Project Name */}
                <div className="form-field-modern">
                  <label htmlFor="title" className="form-label-modern">
                    {getLabel("Project Name")}
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder={getLabel("Enter project name")}
                    className="form-input-modern"
                    required
                  />
                </div>

                {/* Research Field */}
                <div className="form-field-modern">
                  <label htmlFor="field" className="form-label-modern">
                    {getLabel("Research Field")}
                  </label>
                  <input
                    type="text"
                    id="field"
                    name="field"
                    value={formData.field}
                    onChange={handleChange}
                    placeholder={getLabel("Enter field of project")}
                    className="form-input-modern"
                    required
                  />
                </div>

                {/* Description */}
                <div className="form-field-modern">
                  <label htmlFor="description" className="form-label-modern">
                    {getLabel("Description")} <span className="optional-text">({getLabel("Optional")})</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder={getLabel("Describe your project")}
                    className="form-textarea-modern"
                    rows="4"
                  ></textarea>
                </div>

                {/* Privacy Selection */}
                <div className="form-field-modern">
                  <label className="form-label-modern">
                    {getLabel("Visibility")}
                  </label>
                  <div className="privacy-options-modern">
                    <div 
                      className={`privacy-card-modern ${formData.privacy_mode === "public" ? "selected" : ""}`}
                      onClick={() => setFormData({...formData, privacy_mode: "public"})}
                    >
                      <input
                        type="radio"
                        id="public"
                        name="privacy_mode"
                        value="public"
                        checked={formData.privacy_mode === "public"}
                        onChange={handleChange}
                        className="privacy-radio-modern"
                      />
                      <div className="privacy-icon-wrapper-modern public">
                        <MdPublic className="privacy-icon-modern" />
                      </div>
                      <div className="privacy-text-modern">
                        <span className="privacy-label-modern">{getLabel("Public")}</span>
                        <p className="privacy-description-modern">
                          {getLabel("Anyone can view this project")}
                        </p>
                      </div>
                    </div>

                    <div 
                      className={`privacy-card-modern ${formData.privacy_mode === "private" ? "selected" : ""}`}
                      onClick={() => setFormData({...formData, privacy_mode: "private"})}
                    >
                      <input
                        type="radio"
                        id="private"
                        name="privacy_mode"
                        value="private"
                        checked={formData.privacy_mode === "private"}
                        onChange={handleChange}
                        className="privacy-radio-modern"
                      />
                      <div className="privacy-icon-wrapper-modern private">
                        <FaLock className="privacy-icon-modern" />
                      </div>
                      <div className="privacy-text-modern">
                        <span className="privacy-label-modern">{getLabel("Private")}</span>
                        <p className="privacy-description-modern">
                          {getLabel("Only you and collaborators can view")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="modal-actions-modern">
                  <button 
                    type="button" 
                    className="btn-modal-modern btn-cancel-modern" 
                    onClick={handleCloseModal}
                    disabled={isSubmitting}
                  >
                    {getLabel("Cancel")}
                  </button>
                  <button 
                    type="submit" 
                    className="btn-modal-modern btn-submit-modern"
                    disabled={isSubmitting}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                      <polyline points="2 17 12 22 22 17"></polyline>
                      <polyline points="2 12 12 17 22 12"></polyline>
                    </svg>
                    <span>{isSubmitting ? getLabel("Creating...") : getLabel("Create Project")}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectTab;