import React, { useState } from "react";
import { motion } from "framer-motion";
import NavbarAccountHolder from "./navbarAccountholder";
import "./Dashboard.css";

const publicProjects = [
  { name: "AI Chatbot", owner: "Alice Smith", description: "An AI-powered chatbot for customer support." },
  { name: "E-Commerce Platform", owner: "John Doe", description: "A full-stack e-commerce solution with payments." },
  { name: "Smart Home Automation", owner: "Sarah Johnson", description: "Control your smart home with AI voice commands." },
];

const Dashboard = () => {
  const [profilePic, setProfilePic] = useState(null);
  const [coverPic, setCoverPic] = useState(null);
  const [activeTab, setActiveTab] = useState("edit-profile");

  const handleProfilePicChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfilePic(URL.createObjectURL(file));
    }
  };

  const handleCoverPicChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setCoverPic(URL.createObjectURL(file));
    }
  };

  return (
    <div className="dashboard-container">
      <NavbarAccountHolder />
      <div className="profile-content">
        {/* Profile Cover */}
        <div className="profile-cover">
          <div className={`default-cover ${coverPic ? "hidden" : ""}`}></div>
          {coverPic && <img src={coverPic} alt="Cover" />}
          <label htmlFor="coverUpload" className="edit-cover-btn">
            Edit Cover Photo
          </label>
          <input type="file" id="coverUpload" accept="image/*" onChange={handleCoverPicChange} />
        </div>

        {/* Profile Info */}
        <div className="profile-info">
          <div className="profile-pic-wrapper">
            <div className={`default-profile-pic ${profilePic ? "hidden" : ""}`}></div>
            {profilePic && <img src={profilePic} alt="Profile" className="profile-pic" />}
            <input type="file" id="profileUpload" accept="image/*" onChange={handleProfilePicChange} style={{ display: "none" }} />
            <label htmlFor="profileUpload" className="edit-profile-btn">📷</label>
          </div>
          <h2>John Doe</h2>
          <p>Software Engineer | Tech Enthusiast | Gamer</p>
          <p>120 Friends</p>
        </div>

        {/* Tabs Navigation */}
        <div className="profile-tabs">
          <button className={activeTab === "about" ? "active" : ""} onClick={() => setActiveTab("about")}>
            About
          </button>
          <button className={activeTab === "settings" ? "active" : ""} onClick={() => setActiveTab("settings")}>
           Settings
          </button>
          <button className={activeTab === "projects" ? "active" : ""} onClick={() => setActiveTab("projects")}>
            Projects
          </button>
          <button className={activeTab === "collaborators" ? "active" : ""} onClick={() => setActiveTab("collaborators")}>
            Collaborators
          </button>

          <button className={activeTab === "reminders" ? "active" : ""} onClick={() => setActiveTab("reminders")}>
            Reminders
          </button>
        </div>

        {/* Profile Content - Switch between Tabs */}
        <div className="profile-tab-content">
          {activeTab === "about" && <p>Edit your personal information, profile details, and preferences here.</p>}
          {activeTab === "settings" && <p>Manage your password, email settings, and security options.</p>}

          {/* Public Projects moved under "Collaborators" tab */}
          {activeTab === "projects" && (
            <motion.div className="projects-container">
              <h3>Public Projects</h3>
              {publicProjects.map((project, index) => (
                <div key={index} className="project-card">
                  <h4>{project.name}</h4>
                  <p><strong>Owner:</strong> {project.owner}</p>
                  <p className="project-description">{project.description}</p>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === "reminders" && <p>Set and manage reminders for important tasks and events.</p>}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
