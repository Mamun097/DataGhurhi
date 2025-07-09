import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "../Dashboard.css";

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

const CollabSurveyTab = ({
  showCollabModal,
  setShowCollabModal,
  navigate,
  language = "English",
}) => {
  const [translatedLabels, setTranslatedLabels] = useState({});
  const [collabRequests, setCollabRequests] = useState([]);
  const [collaboratedSurveys, setCollaboratedSurveys] = useState([]);

  const labelsToTranslate = [
    "Collaborated Surveys",
    "Surveys shared with you will appear below.",
    "View Collaboration Requests",
    "View Request",
    "No collaborated Surveys found.",
    "Created By",
    "My Access Role",
    "Close",
    "Collaboration Requests",
    "Survey Title",
    "Owner",
    "Role",
    "Actions",
    "Accept",
    "Reject",
    "No collaboration requests",
    "Failed to fetch survey details. Please try again later.",
  ];

  const getLabel = (text) =>
    language === "English" ? text : translatedLabels[text] || text;

  const loadTranslations = async () => {
    if (language === "English") {
      setTranslatedLabels({});
      return;
    }
    const translations = await translateText(labelsToTranslate, "bn");
    const mapped = {};
    labelsToTranslate.forEach((label, idx) => {
      mapped[label] = translations[idx];
    });
    setTranslatedLabels(mapped);
  };

  useEffect(() => {
    loadTranslations();
  }, [language]);

  useEffect(() => {
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
      }
    } catch (error) {
      console.error("Failed to fetch collaborated surveys:", error);
    }
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
        navigate(`/view-survey/${survey_id}`, {
          state: {
            project_id: response.data.projectId,
            survey_details: response.data,
            input_title: response.data.title || "Untitled Survey",
            response_user_logged_in_status:
              response.data.response_user_logged_in_status,
          },
        });
      }
    } catch (error) {
      console.error("Failed to fetch survey details:", error);
      alert(getLabel("Failed to fetch survey details. Please try again later."));
    }
  };

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
      }
    } catch (error) {
      console.error("Failed to fetch collaboration requests:", error);
    }
  }, []);

  const handleAccept = async (survey_id) => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.post(
        `http://localhost:2000/api/survey-collaborator/${survey_id}/accept-invitation`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
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
    const token = localStorage.getItem("token");
    try {
      const response = await axios.post(
        `http://localhost:2000/api/survey-collaborator/${survey_id}/decline-invitation`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 200) fetchCollaborationRequests();
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
          className="btn btn-sm btn-outline-primary"
          onClick={() => {
            setShowCollabModal(true);
            fetchCollaborationRequests();
          }}
          title={getLabel("View Collaboration Requests")}
        >
          <i className="bi bi-eye me-1"></i>
          <span className="d-none d-sm-inline text-muted">
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
                key={idx}
                className="col-12 col-sm-6 col-lg-4"
                onClick={() => fetchSurveyDetails(req.survey_id)}
              >
                <div className="card shadow-sm h-100 border-0">
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title">{req.survey.title}</h5>
                    <hr />
                    <p className="mb-1">
                      <strong>{getLabel("Created By")}:</strong>{" "}
                      {req.survey.user.name}
                    </p>
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

      {showCollabModal && (
        <div
          className="custom-modal-overlay"
          onClick={() => setShowCollabModal(false)}
        >
          <div className="custom-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header d-flex justify-content-between">
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => setShowCollabModal(false)}
              >
                <i className="bi bi-x-lg me-1"></i> {getLabel("Close")}
              </button>
              <h5 className="modal-title mb-0">
                {getLabel("Collaboration Requests")}
              </h5>
              <span />
            </div>
            <div className="custom-modal-body">
              {collabRequests.length > 0 ? (
                <div className="table-responsive border rounded shadow-sm">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-dark text-white">
                      <tr>
                        <th>{getLabel("Survey Title")}</th>
                        <th>{getLabel("Owner")}</th>
                        <th>{getLabel("Role")}</th>
                        <th>{getLabel("Actions")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {collabRequests.map((req) => (
                        <tr key={req.survey_id}>
                          <td>{req.survey.title}</td>
                          <td>{req.survey.user.name}</td>
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
                                onClick={() => handleReject(req.survey_id)}
                              >
                                <i className="bi bi-x-circle me-1"></i>
                                {getLabel("Reject")}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
