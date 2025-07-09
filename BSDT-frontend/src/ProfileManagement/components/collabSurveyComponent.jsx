import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "../Dashboard.css";
const CollabSurveyTab = ({
  getLabel,
  showCollabModal,
  setShowCollabModal,
  navigate,
}) => {
  const [collabRequests, setCollabRequests] = useState([]);
  const [collaboratedSurveys, setCollaboratedSurveys] = useState([]);

  useEffect(() => {
    // Fetch collaborated surveys when the component mounts
    fetchCollaboratedSurveys();
  }, []);

  const fetchCollaboratedSurveys = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        "http://localhost:2000/api/survey-collaborator/all-collaborated-surveys",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 200) {
        setCollaboratedSurveys(response.data.collaborators || []);
        console.log("Collaborated Surveys:", response.data.collaborators);
      }
    } catch (error) {
      console.error("Failed to fetch collaborated surveys:", error);
    }
  };

  const handleSurveyClick = (survey_id, access_role) => {
    console.log("Clicked Survey ID:", survey_id);
    // fetch survey details and navigate to the survey details page
    fetchSurveyDetails(survey_id);
  };

  const fetchSurveyDetails = async (survey_id) => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `http://localhost:2000/api/surveytemplate/${survey_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 200) {
        console.log("Survey Details:", response.data);
        // Navigate to the survey details page with the survey ID
        navigate(`/view-survey/${survey_id}`, {
          state: {
            project_id: response.data.projectId,
            survey_details: response.data,
            input_title: response.data.title || "Untitled Survey",
            response_user_logged_in_status: response.data.response_user_logged_in_status,
          },
        });
      }
    } catch (error) {
      console.error("Failed to fetch survey details:", error);
      // Optionally, you can show an error message to the user
      alert(
        getLabel("Failed to fetch survey details. Please try again later.")
      );
    }
  };

  // Fetch collaboration requests
  const fetchCollaborationRequests = useCallback(async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        "http://localhost:2000/api/survey-collaborator/all-invitations",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 200) {
        setCollabRequests(response.data.invitations || []);
        console.log("Collaboration Requests:", response.data.invitations);
      }
    } catch (error) {
      console.error("Failed to fetch collaboration requests:", error);
    }
  }, []);

  const handleAccept = async (survey_id) => {
    console.log("Accepted request:", survey_id);
    const token = localStorage.getItem("token");
    try {
      const response = await axios.post(
        `http://localhost:2000/api/survey-collaborator/${survey_id}/accept-invitation`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 200) {
        console.log("Invitation accepted successfully");
        fetchCollaborationRequests(); // Refresh requests
        fetchCollaboratedSurveys(); // Refresh collaborated surveys
      }
    } catch (error) {
      console.error("Failed to accept invitation:", error);
    }
  };

  const handleReject = async (survey_id) => {
    console.log("Rejected request:", survey_id);
    const token = localStorage.getItem("token");
    try {
      const response = await axios.post(
        `http://localhost:2000/api/survey-collaborator/${survey_id}/decline-invitation`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 200) {
        console.log("Invitation rejected successfully");
        fetchCollaborationRequests(); // Refresh requests
      }
    } catch (error) {
      console.error("Failed to reject invitation:", error);
    }
  };

  return (
    <div className="p-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3>{getLabel("Collaborated Surveys")}</h3>
          <p className="text-muted">
            {getLabel("Surveys shared with you will appear below.")}
          </p>
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
          <span className="d-none d-sm-inline text-muted ">
            {getLabel("View Request")}
          </span>
        </button>
      </div>
      <div className="collaborated-projects-list">
        {collaboratedSurveys.length === 0 ? (
          <div className="alert alert-warning">
            {getLabel("No collaborated Surveys found.")}
          </div>
        ) : (
          <div className="row g-3">
            {collaboratedSurveys.map((req, idx) => (
              <div
                className="col-12 col-sm-6 col-lg-4"
                key={idx}
                onClick={() =>
                  handleSurveyClick(req.survey_id, req.access_role)
                }
              >
                <div className="card shadow-sm h-100 border-0">
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title">{req.survey.title}</h5>
                    {/* <h6 className="card-subtitle mb-2 text-muted">{field}</h6> */}
                    {/* <p className="card-text flex-grow-1">
                      {description || getLabel("No description provided.")}
                    </p> */}
                    <hr />
                    <p className="mb-1">
                      <strong>{getLabel("Created By")}:</strong>{" "}
                      {req.survey.user.name}
                    </p>
                    {/* <p className="mb-1 text-muted">{ownerEmail}</p> */}
                    <span
                      className={`badge mt-2 align-self-start bg-${
                        req.access_role === "editor"
                          ? "primary"
                          : req.access_role === "viewer"
                          ? "secondary"
                          : "warning"
                      }`}
                    >
                      {getLabel("My Access Role")}: {req.access_role}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Collaborated Projects List */}
      {/* <ul className="list-group mt-3">
        {collaboratedProjects.map((proj) => (
          <li className="list-group-item" key={proj.project_id}>
            {proj.title}
          </li>
        ))}
      </ul> */}

      {/* Custom Modal */}
      {showCollabModal && (
        <div
          className="custom-modal-overlay"
          onClick={() => setShowCollabModal(false)}
        >
          <div className="custom-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header d-flex justify-content-between align-items-center">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={() => setShowCollabModal(false)}
              >
                <i className="bi bi-x-lg me-1"></i> {getLabel("Close")}
              </button>
              <h5 className="modal-title mb-0">
                {getLabel("Collaboration Requests")}
              </h5>
              <span /> {/* Empty span to balance layout */}
            </div>
            <div className="custom-modal-body">
              {collabRequests.length > 0 ? (
                <div className="table-responsive rounded shadow-sm border">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-dark text-white">
                      <tr>
                        <th>{getLabel("Survey Title")}</th>
                        <th>{getLabel("Owner")}</th>
                        {/* <th>{getLabel("Email")}</th> */}
                        <th>{getLabel("Role")}</th>
                        {/* <th>{getLabel("Invited At")}</th> */}
                        <th>{getLabel("Actions")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {collabRequests.map((req, index) => (
                        <React.Fragment key={req.survey_id}>
                          <tr>
                            <td className="fw-semibold">{req.survey.title}</td>
                            <td>{req.survey.user.name}</td>
                            {/* <td className="text-muted">{req.owner_email}</td> */}
                            <td>
                              <span
                                className={`badge rounded-pill bg-${
                                  req.access_role === "editor"
                                    ? "primary"
                                    : req.access_role === "viewer"
                                    ? "secondary"
                                    : "warning"
                                } text-uppercase`}
                              >
                                {req.access_role}
                              </span>
                            </td>
                            {/* <td>
                              <small className="text-muted">
                                {new Date(req.invite_time).toLocaleString()}
                              </small>
                            </td> */}
                            <td>
                              <div className="d-flex gap-2">
                                <button
                                  className="btn btn-sm btn-success"
                                  onClick={() => handleAccept(req.survey_id)}
                                >
                                  <i className="bi bi-check-circle me-1"></i>
                                  {getLabel("Accept")}
                                </button>
                                <button
                                  className="btn btn-sm btn-danger"
                                  onClick={() => {
                                    handleReject(req.survey_id);
                                  }}
                                >
                                  <i className="bi bi-x-circle me-1"></i>
                                  {getLabel("Reject")}
                                </button>
                              </div>
                            </td>
                          </tr>
                          {/* {expandedRows.has(req.shared_id) && (
                            <tr>
                              <td colSpan="6" className="bg-light text-muted">
                                <div className="px-3 py-2">
                                  <strong>{getLabel("Project ID")}:</strong>{" "}
                                  {req.project_id} <br />
                                  <strong>{getLabel("Shared ID")}:</strong>{" "}
                                  {req.shared_id}
                                </div>
                              </td>
                            </tr>
                          )} */}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>

                  {/* Pagination */}
                  {/* <nav>
                    <ul className="pagination justify-content-center my-3">
                      <li
                        className={`page-item ${
                          currentPage === 1 ? "disabled" : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(currentPage - 1)}
                        >
                          <i className="bi bi-chevron-left"></i>
                        </button>
                      </li>
                      {Array.from({ length: totalPages }, (_, i) => (
                        <li
                          key={i + 1}
                          className={`page-item ${
                            currentPage === i + 1 ? "active" : ""
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() => setCurrentPage(i + 1)}
                          >
                            {i + 1}
                          </button>
                        </li>
                      ))}
                      <li
                        className={`page-item ${
                          currentPage === totalPages ? "disabled" : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(currentPage + 1)}
                        >
                          <i className="bi bi-chevron-right"></i>
                        </button>
                      </li>
                    </ul>
                  </nav> */}
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
export default CollabSurveyTab;
