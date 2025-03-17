import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { supabase } from '../../db';
import NavbarAcholder from "./navbarAccountholder"; 
import "./Dashboard.css";
import defaultProfile from "./default_dp.png";

const trendingTopics = [
  "AI in Healthcare",
  "Web3 & Blockchain",
  "Edge Computing",
  "Quantum Computing",
  "Augmented Reality",
];

const Dashboard = () => {
  const [profilePicUrl, setProfilePicUrl] = useState(null);
  const [values, setValues] = useState({});
  const [activeTab, setActiveTab] = useState("editProfile");
  const [isEditing, setIsEditing] = useState(false);
  const [editedValues, setEditedValues] = useState({});

  // Fetch Profile Data
  const getProfile = useCallback(async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get('http://localhost:2000/api/profile', {
        headers: { 'Authorization': 'Bearer ' + token }
      });

      if (response.status === 200) {
        setValues(response.data.user);
        setProfilePicUrl(response.data.user.image || defaultProfile);
        setEditedValues(response.data.user);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }, []);

  useEffect(() => {
    getProfile();
  }, [getProfile]);

  // Handle Edit Toggle
  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  // Handle Input Change
  const handleInputChange = (e) => {
    setEditedValues({ ...editedValues, [e.target.name]: e.target.value });
  };

  // Handle Save Changes
  const handleSaveChanges = async () => {
    const token = localStorage.getItem("token");

    try {
      await axios.put(
        "http://localhost:2000/api/profile/update",
        editedValues,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setValues(editedValues);
      setIsEditing(false);
      console.log("Profile updated successfully.");
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <>
      <NavbarAcholder />

      <div className="dashboard-container">
        <div className="dashboard-layout">
          
          {/* Profile Section */}
          <div className="profile-section">
            <div className="profile-pic-wrapper">
              <img src={profilePicUrl || defaultProfile} alt="Profile" className="profile-pic" />
            </div>

            <h2>{values?.name || "Loading..."}</h2>
            <p>Software Engineer</p>

            <div className="profile-tabs">
              <button className={activeTab === "editProfile" ? "active" : ""} onClick={() => setActiveTab("editProfile")}>
                Edit Profile
              </button>
              <button className={activeTab === "projects" ? "active" : ""} onClick={() => setActiveTab("projects")}>
                Projects
              </button>
              <button className={activeTab === "collaborators" ? "active" : ""} onClick={() => setActiveTab("collaborators")}>
                Collaborators
              </button>
            </div>
          </div>

          {/* Main Section */}
          <div className="projects-section">
            {activeTab === "editProfile" && (
              <div className="edit-profile-content">
                <div className="edit-profile-header">
                  <h3>Profile Details</h3>
                  <button onClick={toggleEdit} className="edit-toggle-btn">
                    {isEditing ? "Cancel" : "Edit"}
                  </button>
                </div>

                <div className="profile-fields">
                  <label>Name*:</label>
                  {isEditing ? (
                    <input type="text" name="name" value={editedValues.name || ""} onChange={handleInputChange} required />
                  ) : (
                    <p>{values.name}</p>
                  )}

                  <label>Affiliation*:</label>
                  {isEditing ? (
                    <input type="text" name="affiliation" value={editedValues.affiliation || ""} onChange={handleInputChange} required />
                  ) : (
                    <p>{values.affiliation}</p>
                  )}

                  <label>Research Field*:</label>
                  {isEditing ? (
                    <input type="text" name="research_field" value={editedValues.research_field || ""} onChange={handleInputChange} required />
                  ) : (
                    <p>{values.research_field}</p>
                  )}

                  <label>Profession*:</label>
                  {isEditing ? (
                    <input type="text" name="profession" value={editedValues.profession || ""} onChange={handleInputChange} required />
                  ) : (
                    <p>{values.profession}</p>
                  )}

                  <label>Secret Question*:</label>
                  {isEditing ? (
                    <input type="text" name="secret_question" value={editedValues.secret_question || ""} onChange={handleInputChange} required />
                  ) : (
                    <p>{values.secret_question}</p>
                  )}

                  <label>Email*:</label>
                  <p>{values.email}</p>

                  <label>Password*:</label>
                  {isEditing ? (
                    <input type="password" name="password" value={editedValues.password || ""} onChange={handleInputChange} required />
                  ) : (
                    <p>********</p>
                  )}

                  <label>Education Level:</label>
                  {isEditing ? (
                    <select name="education_level" value={editedValues.education_level || ""} onChange={handleInputChange}>
                      <option value="">Select</option>
                      <option value="Bachelor">Bachelor</option>
                      <option value="Master">Master</option>
                      <option value="PhD">PhD</option>
                    </select>
                  ) : (
                    <p>{values.education_level}</p>
                  )}
                </div>

                {isEditing && (
                  <button className="save-btn" onClick={handleSaveChanges}>
                    Save Changes
                  </button>
                )}
              </div>
            )}

            {activeTab === "projects" && (
              <div>
                <h3>Pinned Projects</h3>
                <div className="project-grid">
                  <p>Display user projects here...</p>
                </div>
              </div>
            )}

            {activeTab === "collaborators" && (
              <div>
                <h3>Collaborators</h3>
                <p>Show list of collaborators here...</p>
              </div>
            )}
          </div>

          {/* Trending Topics Section */}
          <div className="trending-section">
            <h3>Trending Topics</h3>
            <ul className="trending-list">
              {trendingTopics.map((topic, index) => (
                <li key={index}>{topic}</li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </>
  );
};

export default Dashboard;
