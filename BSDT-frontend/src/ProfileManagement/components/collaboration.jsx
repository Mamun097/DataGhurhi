import React, { useState } from "react";
import CollabProjectTab from "./collabProjectComponent";
import CollabSurveyTab from "./collabSurveyComponent";
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
};

export default Collab;