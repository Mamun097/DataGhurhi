import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";

import "../Dashboard.css";
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
      fetch(`http://localhost:2000/api/project/${projectId}/delete-project`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(
              getLabel("Failed to delete project. Please try again.")
            );
          }
          return response.json();
        })
        .then((data) => {
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

  return (
    <div>
      <h3>{getLabel("My Research Projects")}</h3>
      {/* New Project Section */}
      <div className="new-project-section">
        <h4>{getLabel("Create a New Project")}</h4>
        <div className="add-project-card" onClick={handleAddProjectClick}>
          <div className="plus-icon">+</div>
        </div>
      </div>
      <hr className="section-divider" />
      {/* Existing Projects */}
      <h4>{getLabel("Existing Projects")}</h4>
      <div className="project-filter-bar">
        {/* Filter by Privacy */}
        <label htmlFor="privacyFilter">{getLabel("Filter by: ")}</label>
        <select
          id="privacyFilter"
          value={privacyFilter}
          onChange={(e) => setPrivacyFilter(e.target.value)}
          className="privacy-filter-dropdown"
        >
          <option value="all">{getLabel("All")}</option>
          <option value="public">{getLabel("Public")}</option>
          <option value="private">{getLabel("Private")}</option>
        </select>

        {/* Sort By Field */}
        <label htmlFor="sortField">{getLabel("Sort by:")}</label>
        <select
          id="sortField"
          value={sortField}
          onChange={(e) => setSortField(e.target.value)}
          className="sort-dropdown"
        >
          <option value="title">{getLabel("Title")}</option>
          <option value="field">{getLabel("Field")}</option>
          <option value="created_at">{getLabel("Created At")}</option>
          <option value="last_updated">{getLabel("Last Updated")}</option>
        </select>

        {/* Sort Order */}
        <select
          id="sortOrder"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="sort-dropdown"
        >
          <option value="asc">{getLabel("Ascending")}</option>
          <option value="desc">{getLabel("Descending")}</option>
        </select>
      </div>

      {console.log("Projects:", projects)}
      {projects.length > 0 ? (
        <div className="project-grid">
          {projects
            .filter(
              (project) =>
                privacyFilter === "all" ||
                project.privacy_mode === privacyFilter
            )
            .sort((a, b) => {
              const aVal = a[sortField];
              const bVal = b[sortField];

              // Check if field is date-like
              const isDateField =
                sortField.toLowerCase().includes("created_at") ||
                sortField.toLowerCase().includes("last_updated");

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
            .map((project) => (
              <div
                key={project.project_id}
                className="project-card"
                style={{ cursor: "pointer", position: "relative" }}
              >
                <div
                  onClick={() =>
                    handleProjectClick(project.project_id, "owner")
                  }
                >
                  <h4>{project.title}</h4>
                  <p>
                    <strong>{getLabel("Research Field:")}</strong>{" "}
                    {project.field}
                  </p>

                  <p>
                    <strong>{getLabel("Visibility Setting:")}</strong>{" "}
                    {project.privacy_mode}
                  </p>

                  <p>
                    <strong>{getLabel("Created At:")}</strong>{" "}
                    {new Date(project.created_at + "Z").toLocaleString(
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

                  <p>
                    <strong>{getLabel("Last Updated:")}</strong>{" "}
                    {new Date(project.last_updated + "Z").toLocaleString(
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
                </div>

                {/* Delete Button */}
                <IconButton
                  aria-label="delete"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering project click
                    handleDeleteProject(project.project_id);
                  }}
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    color: "red",
                    backgroundColor: "#fff",
                    "&:hover": {
                      backgroundColor: "#ffe6e6",
                    },
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </div>
            ))}
        </div>
      ) : (
        <i>
          {getLabel("No projects found. Add new projects to get started...")}
        </i>
      )}
    </div>
  );
};
export default ProjectTab;
