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
    // Use project_id to consistently select the same image for each project
    const seed = project.project_id || 0;
    const imageIndex = seed % bannerImages.length;
    return bannerImages[imageIndex];
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
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.field.toLowerCase().includes(searchTerm.toLowerCase());
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
          <FolderOpenIcon className="header-icon" />
          <div>
            <h2>{getLabel("My Projects")}</h2>
            <p className="header-subtitle">
              {getLabel("Manage and organize your research projects")}
            </p>
          </div>
        </div>
        <button className="btn-create-project" onClick={handleAddProjectClick}>
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
              <img src={no_personal_project} alt="No Collaborated Projects" />
            </div>
          <h3>{getLabel("No Projects Found")}</h3>
          <p
            className="empty-create-link"
            onClick={searchTerm ? undefined : handleAddProjectClick}
            style={{ cursor: searchTerm ? 'default' : 'pointer' }}
          >
            {searchTerm
              ? getLabel("Try adjusting your search or filters")
              : getLabel("Create your first project to get started")}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProjectTab;