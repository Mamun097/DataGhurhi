import React, { useState, useEffect } from "react";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import PersonIcon from "@mui/icons-material/Person";
import SearchIcon from "@mui/icons-material/Search";
import GridViewIcon from "@mui/icons-material/GridView";
import ViewListIcon from "@mui/icons-material/ViewList";
import GroupIcon from "@mui/icons-material/Group";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import "./Collab.css";

// Import local banner images (same as project component)
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
import no_project from "./banner/no_project.png";

const CollabProjectTab = ({
  getLabel,
  collaboratedProjects,
  showCollabModal,
  collabRequests,
  setShowCollabModal,
  fetchCollaborationRequests,
  handleAccept,
  handleReject,
  navigate,
  fetchCollaboratedProjects,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [sortField, setSortField] = useState("title");
  const [sortOrder, setSortOrder] = useState("asc");

  // Fetch collaboration requests when component mounts
  useEffect(() => {
    fetchCollaborationRequests();
  }, []);

  const bannerImages = [
    banner1, banner2, banner3, banner4, banner5,
    banner6, banner7, banner8, banner9, banner10,
  ];

  const getProjectBanner = (projectId) => {
    const seed = projectId || 0;
    const imageIndex = seed % bannerImages.length;
    return bannerImages[imageIndex];
  };

  const handleProjectClick = (projectId, access_role) => {
    const currentParams = new URLSearchParams(window.location.search);
    const currentProjectId = currentParams.get("projectId");
    const currentTab = currentParams.get("tab");

    // Always add timestamp when navigating to project details to ensure fresh mount
    const timestamp = Date.now();
    navigate(`/dashboard?tab=projectdetails&projectId=${projectId}&source=shared&refresh=${timestamp}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString + "Z").toLocaleString("en-US", {
      timeZone: "Asia/Dhaka",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredAndSortedProjects = collaboratedProjects
    .filter((projectObj) => {
      const { survey_project } = projectObj;
      const { title = "", field = "" } = survey_project || {};
      const matchesSearch =
        title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        field.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      const aProject = a.survey_project || {};
      const bProject = b.survey_project || {};
      
      let aVal, bVal;
      if (sortField === "owner") {
        aVal = aProject.user?.name || "";
        bVal = bProject.user?.name || "";
      } else {
        aVal = aProject[sortField] || "";
        bVal = bProject[sortField] || "";
      }

      const aStr = aVal.toString().toLowerCase();
      const bStr = bVal.toString().toLowerCase();
      return sortOrder === "asc"
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });

  const sortedRequests = [...collabRequests].sort(
    (a, b) => new Date(b.invite_time) - new Date(a.invite_time)
  );

  // Get the count of pending requests
  const pendingRequestsCount = collabRequests.length;

  return (
    <div>
      {/* Toolbar */}
      <div className="collab-toolbar">
        <div className="search-box">
          <input
            type="text"
            placeholder={getLabel("Search collaborated projects...")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <SearchIcon className="search-icon" />
        </div>

        <div className="toolbar-controls">
          <div className="filter-group">
            <label>{getLabel("Sort:")}</label>
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value)}
              className="filter-select"
            >
              <option value="title">{getLabel("Title")}</option>
              <option value="field">{getLabel("Field")}</option>
              <option value="owner">{getLabel("Owner")}</option>
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

          <button
            className="btn-view-requests"
            onClick={() => {
              setShowCollabModal(true);
              fetchCollaborationRequests();
            }}
            title={getLabel("View Collaboration Requests")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            <span>{getLabel("View Requests")}</span>
            {pendingRequestsCount > 0 && (
              <span className="notification-badge">{pendingRequestsCount}</span>
            )}
          </button>
        </div>
      </div>

      {/* Projects Display */}
      {filteredAndSortedProjects.length > 0 ? (
        <div className={`collab-${viewMode}`}>
          {filteredAndSortedProjects.map((projectObj, idx) => {
            const { survey_project, access_role, project_id } = projectObj;
            const { title, description, field, user } = survey_project || {};
            const ownerName = user?.name || "-";
            const ownerEmail = user?.email || "-";

            return viewMode === "grid" ? (
              <div
                key={idx}
                className="collab-card-modern grid"
                onClick={() => handleProjectClick(project_id, access_role)}
              >
                <div
                  className="collab-banner"
                  style={{
                    backgroundImage: `url(${getProjectBanner(project_id)})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <div className="role-badge">
                    <span
                      className={`role-label ${
                        access_role === "editor"
                          ? "editor"
                          : access_role === "viewer"
                          ? "viewer"
                          : "other"
                      }`}
                    >
                      {access_role}
                    </span>
                  </div>
                </div>

                <div className="collab-content">
                  <div className="collab-header-info">
                    <div className="collab-icon">
                      <FolderOpenIcon />
                    </div>
                    <h3 className="collab-title">{title}</h3>
                  </div>

                  <div className="collab-field">
                    <span className="field-badge">{field}</span>
                  </div>

                  {description && (
                    <p className="collab-description">
                      {description.substring(0, 80)}
                      {description.length > 80 ? "..." : ""}
                    </p>
                  )}

                  <div className="collab-owner">
                    <PersonIcon fontSize="small" />
                    <div>
                      <p className="owner-name">{ownerName}</p>
                      <p className="owner-email">{ownerEmail}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div
                key={idx}
                className="collab-card-modern list"
                onClick={() => handleProjectClick(project_id, access_role)}
              >
                <div className="list-left">
                  <div className="list-icon">
                    <FolderOpenIcon />
                  </div>
                  <div className="list-info">
                    <h3 className="list-title">{title}</h3>
                    <p className="list-description">
                      {description || getLabel("No description provided")}
                    </p>
                  </div>
                </div>

                <div className="list-right">
                  <span className="list-field">{field}</span>
                  <span className="list-owner">{ownerName}</span>
                  <span
                    className={`list-role ${
                      access_role === "editor"
                        ? "editor"
                        : access_role === "viewer"
                        ? "viewer"
                        : "other"
                    }`}
                  >
                    {access_role}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-illustration">
            <img src={no_project} alt="No Collaborated Projects" />
          </div>
          <h3>{getLabel("No Collaborated Projects")}</h3>
          <p>
            {searchTerm
              ? getLabel("No projects match your search")
              : getLabel("Projects shared with you will appear here")}
          </p>
        </div>
      )}

      {/* Redesigned Collaboration Requests Modal */}
      {showCollabModal && (
        <div
          className="modal-overlay-modern"
          onClick={() => setShowCollabModal(false)}
        >
          <div className="modal-content-modern" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-modern">
              <h3>
                <GroupIcon style={{ fontSize: "1.5rem", color: "#4bb77d" }} />
                {getLabel("Collaboration Requests")}
              </h3>
              <IconButton
                onClick={() => setShowCollabModal(false)}
                style={{
                  background: "white",
                  border: "2px solid #e2e8f0",
                  padding: "0.5rem",
                }}
              >
                <CloseIcon style={{ fontSize: "1.25rem", color: "#64748b" }} />
              </IconButton>
            </div>

            <div className="modal-body-modern">
              {sortedRequests.length > 0 ? (
                <div className="collaborators-list-modern">
                  {sortedRequests.map((req) => (
                    <div key={req.shared_id} className="collaborator-item-modern request-item">
                      <div className="collab-avatar">{req.owner_name[0]}</div>
                      <div className="collab-details">
                        <div className="collab-name">{req.project_title}</div>
                        <div className="collab-email">
                          {getLabel("From")}: {req.owner_name} ({req.owner_email})
                        </div>
                        <div className="collab-meta">
                          <span className="collab-role-badge">{req.access_role}</span>
                          <span className="collab-time">
                            {formatDate(req.invite_time)}
                          </span>
                        </div>
                      </div>
                      <div className="collab-actions">
                        <button
                          className="btn-collab-action accept"
                          onClick={() => handleAccept(req.project_id)}
                          title={getLabel("Accept")}
                        >
                          <CheckCircleIcon fontSize="small" />
                          <span>{getLabel("Accept")}</span>
                        </button>
                        <button
                          className="btn-collab-action reject"
                          onClick={() => handleReject(req.project_id)}
                          title={getLabel("Reject")}
                        >
                          <CancelIcon fontSize="small" />
                          <span>{getLabel("Reject")}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
                  <div style={{ marginBottom: "1rem", opacity: 0.6 }}>
                    <CheckCircleIcon style={{ fontSize: "4rem", color: "#22c55e" }} />
                  </div>
                  <h4 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#1e293b", margin: "0 0 0.5rem 0" }}>
                    {getLabel("All caught up!")}
                  </h4>
                  <p style={{ fontSize: "0.9375rem", color: "#64748b", margin: 0 }}>
                    {getLabel("You have no pending collaboration requests")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollabProjectTab;