import React, { useState } from "react";
import CollabProjectTab from "./collabProjectComponent";
import CollabSurveyTab from "./collabSurveyComponent";
<<<<<<< Updated upstream
import FolderSharedIcon from "@mui/icons-material/FolderShared";
import "./Collab.css";

const Collab = ({
  getLabel,
  navigate,
  language,
  showCollabModal,
  setShowCollabModal,
  collabRequests,
  setCollabRequests,
  fetchCollaborationRequests,
  handleAccept,
  handleReject,
  collaboratedProjects,
}) => {
  const [activeTab, setActiveTab] = useState("survey");

  return (
    <div className="modern-collab-container">
      {/* Header Section */}
      <div className="collab-header-section">
        <div className="header-title">
          <FolderSharedIcon className="header-icon" />
          <div>
            <h2>{getLabel("Collaborations")}</h2>
            <p className="header-subtitle">
              {getLabel("Projects and surveys shared with you")}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="collab-tabs-nav">
    
        <button
          className={`collab-tab-btn ${activeTab === "project" ? "active" : ""}`}
          onClick={() => setActiveTab("project")}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
            <polyline points="2 17 12 22 22 17"></polyline>
            <polyline points="2 12 12 17 22 12"></polyline>
          </svg>
          <span>{getLabel("Collaborated Projects")}</span>
        </button>

        <button
          className={`collab-tab-btn ${activeTab === "survey" ? "active" : ""}`}
          onClick={() => setActiveTab("survey")}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          <span>{getLabel("Collaborated Surveys")}</span>
        </button>
        
      </div>

      {/* Tabs Content */}
      <div className="collab-tab-content">
        {activeTab === "survey" && (
          <CollabSurveyTab
            getLabel={getLabel}
            showCollabModal={showCollabModal}
            setShowCollabModal={setShowCollabModal}
            navigate={navigate}
            language={language}
          />
        )}

        {activeTab === "project" && (
          <CollabProjectTab
            getLabel={getLabel}
            collaboratedProjects={collaboratedProjects}
            showCollabModal={showCollabModal}
            collabRequests={collabRequests}
            setShowCollabModal={setShowCollabModal}
            fetchCollaborationRequests={fetchCollaborationRequests}
            handleAccept={handleAccept}
            handleReject={handleReject}
            navigate={navigate}
          />
        )}
      </div>
    </div>
  );
=======
import "./Collab.css"; 

const Collab = ({
getLabel,
navigate,
language,
showCollabModal,
setShowCollabModal,
collabRequests,
setCollabRequests,
fetchCollaborationRequests,
handleAccept,
handleReject,
collaboratedProjects,
}) => {
const [activeTab, setActiveTab] = useState("survey");

return (
<div >
        {/* Tabs Header */}
        <ul className="nav nav-tabs mb-3">
          <li className="nav-item">
                <button
                    className={`nav-link ${activeTab === "survey" ? "active" : ""}`}
                    onClick={() => setActiveTab("survey")}
                 >
                <i className="bi bi-clipboard2-data me-2"></i>
                {getLabel ? getLabel("Collaborated Surveys") : "Collaborated Surveys"}
                </button>
            </li>
            <li className="nav-item">
                <button
                className={`nav-link ${activeTab === "project" ? "active" : ""}`}
                onClick={() => setActiveTab("project")}
                >
                <i className="bi bi-diagram-3 me-2"></i>
                {getLabel ? getLabel("Collaborated Projects") : "Collaborated Projects"}
                </button>
            </li>
        </ul>
        {/* Tabs Content */}
        <div className="tab-content">
            {activeTab === "survey" && (
            <div className="tab-pane fade show active">
                <CollabSurveyTab
                showCollabModal={showCollabModal}
                setShowCollabModal={setShowCollabModal}
                navigate={navigate}
                language={language}
                />
            </div>
            )}

            {activeTab === "project" && (
            <div className="tab-pane fade show active">
                <CollabProjectTab
                getLabel={getLabel}
                collaboratedProjects={collaboratedProjects}
                showCollabModal={showCollabModal}
                collabRequests={collabRequests}
                setShowCollabModal={setShowCollabModal}
                fetchCollaborationRequests={fetchCollaborationRequests}
                handleAccept={handleAccept}
                handleReject={handleReject}
                navigate={navigate}
                />
            </div>
        )}
    </div>
    </div>
);
>>>>>>> Stashed changes
};

export default Collab;