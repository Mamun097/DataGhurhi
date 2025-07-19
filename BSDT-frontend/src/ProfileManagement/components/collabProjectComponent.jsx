import React, { useState, useEffect } from "react";
import "../Dashboard.css";
const CollabProjectTab= ({ getLabel,collaboratedProjects,showCollabModal,collabRequests,
                setShowCollabModal,fetchCollaborationRequests,handleAccept, handleReject,
                navigate
}) => {

    const [expandedRows, setExpandedRows] = useState(new Set());
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 5;
    const sortedRequests = [...collabRequests].sort(
      (a, b) => new Date(b.invite_time) - new Date(a.invite_time)
    );
  
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = sortedRequests.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.ceil(sortedRequests.length / rowsPerPage);
    const handleProjectClick = (projectId,access_role) => {
        console.log("Project ID:", projectId);
        console.log("Access Role:", access_role);
        // Navigate to the project details page with the project ID
       navigate(`/view-project/${projectId}`, {
                    state: { role: access_role },
                    });


    };
    return (
        <div className="p-3">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <h3>{getLabel("Collaborated Projects")}</h3>
                      <p className="text-muted">{getLabel("Projects shared with you will appear below.")}</p>
                    </div>
                                        <button
                      className="btn view-requests-btn btn-sm btn-outline-primary"
                      onClick={() => {
                        setShowCollabModal(true);
                        fetchCollaborationRequests();
                      }}
                      title={getLabel("View Collaboration Requests")}
                    >
                      <i className="bi bi-eye me-1"></i>
                      <span className="d-none d-sm-inline text-muted " >{getLabel("View Request")}</span>
                    </button>
                  </div>
                  <div className="collaborated-projects-list">

                  {collaboratedProjects.length === 0 ? (
                    <div className="alert alert-warning">
                      {getLabel("No collaborated projects found.")}
                    </div>
                  ) : (
                    <div className="row g-3">
                      {collaboratedProjects.map((projectObj, idx) => {
                        const { survey_project, access_role,project_id } = projectObj;
                        const { title, description, field, user } = survey_project || {};
                        const ownerName = user?.name || "-";
                        const ownerEmail = user?.email || "-";

                        return (
                          <div className="col-12 col-sm-6 col-lg-4" key={idx}
                            onClick={() => handleProjectClick(project_id, access_role)}
                          >
                            <div className="card shadow-sm h-100 border-0">
                              <div className="card-body d-flex flex-column">
                                <h5 className="card-title">{title}</h5>
                                <h6 className="card-subtitle mb-2 text-muted">{field}</h6>
                                <p className="card-text flex-grow-1">
                                  {description || getLabel("No description provided.")}
                                </p>
                                <hr />
                                <p className="mb-1">
                                  <strong>{getLabel("Owner")}:</strong> {ownerName}
                                </p>
                                <p className="mb-1 text-muted">{ownerEmail}</p>
                                <span
                                  className={`badge mt-2 align-self-start bg-${
                                    access_role === "editor"
                                      ? "primary"
                                      : access_role === "viewer"
                                      ? "secondary"
                                      : "warning"
                                  }`}
                                >
                                  {getLabel("Role")}: {access_role}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}




                  </div>

                  {/* Collaborated Projects List */}
                  <ul className="list-group mt-3">
                    {collaboratedProjects.map((proj) => (
                      <li className="list-group-item" key={proj.project_id}>
                        {proj.title}
                      </li>
                    ))}
                  </ul>

                  {/* Custom Modal */}
                  {showCollabModal && (
                    <div className="custom-modal-overlay" onClick={() => setShowCollabModal(false)}>
                      <div className="custom-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header d-flex justify-content-between align-items-center">
                          <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => setShowCollabModal(false)}
                          >
                            <i className="bi bi-x-lg me-1"></i> {getLabel("Close")}
                          </button>

                          <h5 className="modal-title mb-0">{getLabel("Collaboration Requests")}</h5>

                          <span /> {/* Empty span to balance layout */}
                        </div>
                        <div className="custom-modal-body">
                          {collabRequests.length > 0 ? (
                           <div className="table-responsive rounded shadow-sm border">
                            <table className="table table-hover align-middle mb-0">
                              <thead className="table-dark text-white">
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
                                  <React.Fragment key={req.shared_id}>
                                    <tr>
                                      <td className="fw-semibold">{req.project_title}</td>
                                      <td>{req.owner_name}</td>
                                      <td className="text-muted">{req.owner_email}</td>
                                      <td>
                                        <span className={`badge rounded-pill bg-${req.access_role === "editor" ? "primary" : req.access_role === "viewer" ? "secondary" : "warning"} text-uppercase`}>
                                          {req.access_role}
                                        </span>
                                      </td>
                                      <td>
                                        <small className="text-muted">
                                          {new Date(req.invite_time).toLocaleString()}
                                        </small>
                                      </td>
                                      <td>
                                        <div className="d-flex gap-2">
                                          <button
                                            className="btn btn-sm btn-success"
                                            onClick={() => handleAccept(req.project_id)}
                                          >
                                            <i className="bi bi-check-circle me-1"></i>{getLabel("Accept")}
                                          </button>
                                          <button
                                            className="btn btn-sm btn-danger"
                                            onClick={() => {handleReject(req.project_id)
                                            }}
                                          >
                                            <i className="bi bi-x-circle me-1"></i>{getLabel("Reject")}
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                    {expandedRows.has(req.shared_id) && (
                                      <tr>
                                        <td colSpan="6" className="bg-light text-muted">
                                          <div className="px-3 py-2">
                                            <strong>{getLabel("Project ID")}:</strong> {req.project_id} <br />
                                            <strong>{getLabel("Shared ID")}:</strong> {req.shared_id}
                                          </div>
                                        </td>
                                      </tr>
                                    )}
                                  </React.Fragment>
                                ))}
                              </tbody>
                            </table>

                            {/* Pagination */}
                            <nav>
                              <ul className="pagination justify-content-center my-3">
                                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                                  <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>
                                    <i className="bi bi-chevron-left"></i>
                                  </button>
                                </li>
                                {Array.from({ length: totalPages }, (_, i) => (
                                  <li key={i + 1} className={`page-item ${currentPage === i + 1 ? "active" : ""}`}>
                                    <button className="page-link" onClick={() => setCurrentPage(i + 1)}>
                                      {i + 1}
                                    </button>
                                  </li>
                                ))}
                                <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                                  <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>
                                    <i className="bi bi-chevron-right"></i>
                                  </button>
                                </li>
                              </ul>
                            </nav>
                          </div>
                          ) : (
                            <p>{getLabel("No collaboration requests")}</p>
                          )}


                        </div>
                      </div>
                    </div>
                  )}
                </div>
    );
};
export default CollabProjectTab;