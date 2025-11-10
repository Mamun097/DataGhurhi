import React, { useState } from "react";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import PersonIcon from "@mui/icons-material/Person";
import SearchIcon from "@mui/icons-material/Search";
import GridViewIcon from "@mui/icons-material/GridView";
import ViewListIcon from "@mui/icons-material/ViewList";
import UpdateIcon from "@mui/icons-material/Update";
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
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [sortField, setSortField] = useState("title");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

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
    navigate(`/view-project/${projectId}`, {
      state: { role: access_role },
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString + "Z").toLocaleString("en-US", {
      timeZone: "Asia/Dhaka",
      year: "numeric",
      month: "short",
      day: "numeric",
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

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = sortedRequests.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(sortedRequests.length / rowsPerPage);

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

      {/* Collaboration Requests Modal */}
      {showCollabModal && (
        <div
          className="custom-modal-overlay"
          onClick={() => setShowCollabModal(false)}
        >
          <div className="custom-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h5 className="modal-title">{getLabel("Collaboration Requests")}</h5>
              <button
                className="btn-modal-close"
                onClick={() => setShowCollabModal(false)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="custom-modal-body">
              {collabRequests.length > 0 ? (
                <>
                  <div className="table-responsive">
                    <table className="requests-table">
                      <thead>
                        <tr>
                          <th>{getLabel("Project Title")}</th>
                          <th>{getLabel("Owner")}</th>
                          <th>{getLabel("Email")}</th>
                          <th>{getLabel("Role")}</th>
                          <th>{getLabel("Invited At")}</th>
                          <th>{getLabel("Actions")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentRows.map((req) => (
                          <tr key={req.shared_id}>
                            <td className="fw-semibold">{req.project_title}</td>
                            <td>{req.owner_name}</td>
                            <td className="text-muted">{req.owner_email}</td>
                            <td>
                              <span
                                className={`table-role-badge ${
                                  req.access_role === "editor"
                                    ? "editor"
                                    : req.access_role === "viewer"
                                    ? "viewer"
                                    : "other"
                                }`}
                              >
                                {req.access_role}
                              </span>
                            </td>
                            <td>
                              <small className="text-muted">
                                {new Date(req.invite_time).toLocaleString()}
                              </small>
                            </td>
                            <td>
                              <div className="action-buttons">
                                <button
                                  className="btn-accept"
                                  onClick={() => handleAccept(req.project_id)}
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                  </svg>
                                  {getLabel("Accept")}
                                </button>
                                <button
                                  className="btn-reject"
                                  onClick={() => handleReject(req.project_id)}
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                  </svg>
                                  {getLabel("Reject")}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="pagination">
                      <button
                        className="pagination-btn"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => (
                        <button
                          key={i + 1}
                          className={`pagination-btn ${
                            currentPage === i + 1 ? "active" : ""
                          }`}
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </button>
                      ))}

                      <button
                        className="pagination-btn"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="empty-requests">
                  <p>{getLabel("No collaboration requests")}</p>
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