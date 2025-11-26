import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import DescriptionIcon from "@mui/icons-material/Description";
import PersonIcon from "@mui/icons-material/Person";
import SearchIcon from "@mui/icons-material/Search";
import GridViewIcon from "@mui/icons-material/GridView";
import ViewListIcon from "@mui/icons-material/ViewList";
import IconButton from "@mui/material/IconButton";
import apiClient from "../../api";
import "./Collab.css";

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

import no_survey from "./banner/no_survey.png";

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
  getLabel: parentGetLabel,
  showCollabModal,
  setShowCollabModal,
  navigate,
  language = "English",
}) => {
  const [translatedLabels, setTranslatedLabels] = useState({});
  const [collabRequests, setCollabRequests] = useState([]);
  const [collaboratedSurveys, setCollaboratedSurveys] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [sortField, setSortField] = useState("title");
  const [sortOrder, setSortOrder] = useState("asc");
  const [survey_details, setSurveyDetails] = useState({});

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

  const getSurveyBanner = (surveyId) => {
    const seed = surveyId || 0;
    const imageIndex = seed % bannerImages.length;
    return bannerImages[imageIndex];
  };

  const labelsToTranslate = React.useMemo(
    () => [
      "Search collaborated surveys...",
      "Sort:",
      "Title",
      "Owner",
      "↑ Asc",
      "↓ Desc",
      "View Requests",
      "No Collaborated Surveys",
      "No surveys match your search",
      "Surveys shared with you will appear here",
      "Collaboration Requests",
      "Survey Title",
      "Role",
      "Actions",
      "Accept",
      "Reject",
      "No collaboration requests",
      "Failed to fetch survey details. Please try again later.",
      "Created By",
      "My Access Role",
      "No description provided",
    ],
    []
  );

  const getLabel = (text) =>
    language === "English" ? text : translatedLabels[text] || text;

  const loadTranslations = useCallback(async () => {
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
  }, [language, labelsToTranslate]);

  useEffect(() => {
    loadTranslations();
  }, [language, loadTranslations]);

  useEffect(() => {
    fetchCollaboratedSurveys();
  }, []);

  const fetchCollaboratedSurveys = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await apiClient.get(
        "/api/survey-collaborator/all-collaborated-surveys",
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
      const response = await apiClient.get(`/api/surveytemplate/${survey_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        setSurveyDetails(response.data);

        navigate(`/view-survey/${survey_id}`, {
          state: {
            project_id: response.data.project_id,
            input_title: response.data.title || "Untitled Survey",
            survey_status: response.data.survey_status,
          },
        });
      }
    } catch (error) {
      console.error("Failed to fetch survey details:", error);
      alert(
        getLabel("Failed to fetch survey details. Please try again later.")
      );
    }
  };

  const fetchCollaborationRequests = useCallback(async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await apiClient.get(
        "/api/survey-collaborator/all-invitations",
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
      const response = await apiClient.post(
        `/api/survey-collaborator/${survey_id}/accept-invitation`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        fetchCollaborationRequests();
        fetchCollaboratedSurveys();
      }
    } catch (error) {
      console.error("Failed to accept invitation:", error);
    }
  };

  const handleReject = async (survey_id) => {
    const token = localStorage.getItem("token");
    try {
      const response = await apiClient.post(
        `/api/survey-collaborator/${survey_id}/decline-invitation`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 200) fetchCollaborationRequests();
    } catch (error) {
      console.error("Failed to reject invitation:", error);
    }
  };

  const filteredAndSortedSurveys = collaboratedSurveys
    .filter((req) => {
      const { survey } = req;
      const { title = "" } = survey || {};
      const ownerName = survey?.user?.name || "";
      const matchesSearch =
        title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ownerName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      const aSurvey = a.survey || {};
      const bSurvey = b.survey || {};

      let aVal, bVal;
      if (sortField === "owner") {
        aVal = aSurvey.user?.name || "";
        bVal = bSurvey.user?.name || "";
      } else {
        aVal = aSurvey[sortField] || "";
        bVal = bSurvey[sortField] || "";
      }

      const aStr = aVal.toString().toLowerCase();
      const bStr = bVal.toString().toLowerCase();
      return sortOrder === "asc"
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });

  return (
    <div>
      {/* Toolbar */}
      <div className="collab-toolbar">
        <div className="search-box">
          <input
            type="text"
            placeholder={getLabel("Search collaborated surveys...")}
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
            title={getLabel("View Requests")}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            <span>{getLabel("View Requests")}</span>
          </button>
        </div>
      </div>

      {/* Surveys Display */}
      {filteredAndSortedSurveys.length > 0 ? (
        <div className={`collab-${viewMode}`}>
          {filteredAndSortedSurveys.map((req, idx) => {
            const { survey, access_role, survey_id } = req;
            const { title, user } = survey || {};
            const ownerName = user?.name || "-";

            return viewMode === "grid" ? (
              <div
                key={idx}
                className="collab-card-modern grid"
                onClick={() => fetchSurveyDetails(survey_id)}
              >
                <div
                  className="collab-banner"
                  style={{
                    // backgroundImage: `url(${getSurveyBanner(survey_id)})`,
                    backgroundImage: survey_details.banner
                      ? survey_details.banner
                      : survey_details.backgroundImage
                      ? survey_details.backgroundImage
                      : `url(${getSurveyBanner(survey_id)})`,
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
                      <DescriptionIcon />
                    </div>
                    <h3 className="collab-title">{title}</h3>
                  </div>

                  <div className="collab-owner">
                    <PersonIcon fontSize="small" />
                    <div>
                      <p className="owner-name">{ownerName}</p>
                      <p className="owner-email">{getLabel("Created By")}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div
                key={idx}
                className="collab-card-modern list"
                onClick={() => fetchSurveyDetails(survey_id)}
              >
                <div className="list-left">
                  <div className="list-icon">
                    <DescriptionIcon />
                  </div>
                  <div className="list-info">
                    <h3 className="list-title">{title}</h3>
                    <p className="list-description">
                      {getLabel("Created By")}: {ownerName}
                    </p>
                  </div>
                </div>

                <div className="list-right">
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
            <img src={no_survey} alt="No Collaborated Surveys" />
          </div>
          <h3>{getLabel("No Collaborated Surveys")}</h3>
          <p>
            {searchTerm
              ? getLabel("No surveys match your search")
              : getLabel("Surveys shared with you will appear here")}
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
              <h5 className="modal-title">
                {getLabel("Collaboration Requests")}
              </h5>
              <button
                className="btn-modal-close"
                onClick={() => setShowCollabModal(false)}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="custom-modal-body">
              {collabRequests.length > 0 ? (
                <div className="table-responsive">
                  <table className="requests-table">
                    <thead>
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
                            <div className="action-buttons">
                              <button
                                className="btn-accept"
                                onClick={() => handleAccept(req.survey_id)}
                              >
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                                {getLabel("Accept")}
                              </button>
                              <button
                                className="btn-reject"
                                onClick={() => handleReject(req.survey_id)}
                              >
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
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

export default CollabSurveyTab;
