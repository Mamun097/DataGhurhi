import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { supabase } from '../../db';
import NavbarAcholder from "./navbarAccountholder"; 
import "./Dashboard.css";
import defaultprofile from "./default_dp.png";
import { Navigate, } from "react-router-dom";



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
  const [projects, setProjects] = useState([]);

  // Fetch Profile Data
  const getProfile = useCallback(async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get('http://localhost:2000/api/profile', {
        headers: { 'Authorization': 'Bearer ' + token }
      });

      if (response.status === 200) {
        setValues(response.data.user);
        setProfilePicUrl(response.data.user.image );
        setEditedValues(response.data.user);
        setProjects(response.data.user.projects || []);
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
      const response = await axios.put(
        "http://localhost:2000/api/profile/update",
        editedValues,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        console.log("Profile updated successfully.");
        setValues(editedValues); // Update UI after successful save
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

    const navigate = useNavigate(); // Initialize the navigate function
  
    const handleAddProjectClick = () => {
      navigate('/addproject'); // Use the navigate function to redirect
    };
  return (
    <>
      <NavbarAcholder />

      <div className="dashboard-container">
        <div className="dashboard-layout">
          
          {/* Profile Section */}
          <div className="profile-section">
            <div className="profile-pic-wrapper">
              <img src={profilePicUrl } alt="Profile" className="profile-pic" />
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
                  {[
                    { label: "Name", name: "name", required: true },
                    { label: "Affiliation", name: "affiliation", required: true },
                    { label: "Research Field", name: "research_field", required: true },
                    { label: "Profession", name: "profession", required: true },
                    { label: "Secret Question", name: "secret_question", required: true },
                    { label: "Email", name: "email", required: true },
                    { label: "Password", name: "password", type: "password", required: true },
                    { label: "Age/DOB", name: "dob", type: "date", required: true },
                    { label: "Education Level", name: "education_level" },
                    { label: "Gender", name: "gender" },
                    { label: "Address", name: "address" },
                    { label: "Contact No", name: "contact_no" },
                    { label: "Designation", name: "designation" },
                    { label: "Secondary Email", name: "secondary_email" },
                    { label: "Profile Link", name: "profile_link" },
                    { label: "Religion", name: "religion" },
                    { label: "Working Place", name: "working_place" },
                    { label: "Years of Experience", name: "years_of_experience" },
                  ].map((field, index) => (
                    <div key={index}>
                      <label>{field.label}:</label>
                      {isEditing ? (
                        <input
                          type={field.type || "text"}
                          name={field.name}
                          value={editedValues[field.name] || ""}
                          onChange={handleInputChange}
                          required={field.required}
                        />
                      ) : (
                        <p>{values[field.name]}</p>
                      )}
                    </div>
                  ))}
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
                        <h3>My Research Projects</h3>
                        <div className="project-grid">
                          {projects.length > 0 ? (
                            projects.map((project, index) => (
                              <div key={index} className="project-card">
                                <h4>{project.name}</h4>
                                <p><strong>Research Field:</strong> {project.research_field}</p>
                                <p><strong>Description:</strong> {project.description}</p>
                              </div>
                            ))
                          ) : (
                            <i>No projects found...</i>
                            
                            
                          )}
                          </div>
                             <div className="add-project-card" onClick={() => handleAddProjectClick()}>
                              <div className="plus-icon">+</div>
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