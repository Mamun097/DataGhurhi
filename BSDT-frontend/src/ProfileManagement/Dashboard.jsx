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

  const handleImageUpload = async (event, type) => {
    const file = event.target.files[0];
    if (!file) return;

    
    try {
      const { data, error } = await supabase.storage
      .from('media')  // Use the correct bucket name: 'media'
      .upload(`profile_pics/${file.name}`, file, {
          upsert: true, // Update the file if it already exists
        }
      ); 

    if (error) {
      console.error("Upload failed:", error.message);
      return;
    }
    const urlData =  supabase
    .storage
    .from('media')
    .getPublicUrl(`profile_pics/${file.name}`);

    console.log("publicURL",urlData.data.publicUrl);
 // Update the profile or cover picture URL in the database
    await updateImageInDB(type, urlData.data.publicUrl);

       
    
    console.log(`${type} picture URL:`, urlData.data.publicUrl);
  // After updating the profile, fetch the new profile data
    getProfile();
     
    } catch (error) {
      console.error(`Upload failed for ${type} picture:`, error);
    }
  };


  const updateImageInDB = async (type, imageUrl) => {
    console.log("imageUrl",imageUrl);
    const token = localStorage.getItem("token");
    

    try {
      await axios.put(
        "http://localhost:2000/api/profile/update-profile-image",
          {imageUrl},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log(`${type} image updated in database.`);
    } catch (error) {
      console.error(`Failed to update ${type} image in DB:`, error);
    }
  };

  const getProfile = useCallback 
(async () => {
  const token = localStorage.getItem("token");
  console.log(token);
  try {
    const requestOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
  };
  const response =await axios.get('http://localhost:2000/api/profile', requestOptions);

  if (response.status === 200) {
    console.log(response.data);
    setValues(response.data);
    setProfilePicUrl(response.data.user.image);
    setEditedValues(response.data.user);
    // console.log(values);
    
  } else {
    console.log(response.data.error);
  }} 
  catch (error) {
  console.error('Error:', error);
  }
},
[]
);

useEffect(() => {
  getProfile();
}, [getProfile]);

useEffect(() => {
  if (values && Object.keys(values).length > 0) {
    console.log("Updated values:", values);
  }
}, [values]);
 

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
    console.log("Edited values:", editedValues);
    const token = localStorage.getItem("token");

    try {
      const response = await axios.put(
        "http://localhost:2000/api/profile/update-profile",
        editedValues,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        console.log("Profile updated successfully:", response.data);
        setIsEditing(false);
        getProfile();
      } else {
        console.log(response.data.error);
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };
  // fetch project data
  const fetchProjects = useCallback(async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get("http://localhost:2000/api/project", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        console.log("Projects:", response.data.projects);
        setProjects(response.data.projects);
        
      } else {
        console.log(response.data.error);
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    }
    console.log(projects);
  }, []);

  useEffect(() => {
    fetchProjects();
  }, []);


    const navigate = useNavigate(); // Initialize the navigate function
  
    const handleAddProjectClick = () => {
      navigate('/addproject'); // Use the navigate function to redirect
    };

    const handleProjectClick = (projectId) => {
      navigate(`/view-project/${projectId}`); // Redirect to the edit project page with projectId as a URL parameter
    };
  return (
    <>
      <NavbarAcholder />

      <div className="dashboard-container">
        <div className="dashboard-layout">
          
          {/* Profile Section */}
          <div className="profile-section">
            <div className="profile-pic-wrapper">
              <img src={profilePicUrl || defaultprofile } alt="Profile" className="profile-pic" />
              <input type="file" id="profileUpload" accept="image/*" onChange={(e) => handleImageUpload(e, "profile")} style={{ display: "none" }} />
              <label htmlFor="profileUpload" className="edit-profile-pic-btn">📷</label>
            </div>

            <h2>{values.user?.name || "Loading..."}</h2>
            <p>Software Engineer</p>

            <div className="profile-tabs">
              <button className={activeTab === "editProfile" ? "active" : ""} onClick={() => setActiveTab("editProfile")}>
                Edit Profile
              </button>
              <button className={activeTab === "projects" ? "active" : ""} onClick={() => setActiveTab("projects")}>
                Projects
              </button>
              <button className={activeTab === "collaborators" ? "active" : ""} onClick={() => setActiveTab("collaboratored project")}>
                Collaboratored Project
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
                    { label: "Email", name: "email", required: true },
                    { label: "Affiliation", name: "affiliation", required: true },
                    { label: "Research Field", name: "research_field", required: true },
                    { label: "Profession", name: "profession", required: true },
                    { label: "Secret Question", name: "secret_question", required: true },
                    { label: "Secret Answer", name: "secret_answer", required: true },
                    { label: "Date of Birth", name: "date_of_birth", type: "date", required: true },
                    { label: "Education Level", name: "education_level" },
                    { label: "Gender", name: "gender" },
                    { label: "Address", name: "address" },
                    { label: "Contact No", name: "contact" },
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
                        <i>{values.user?.[field.name]}</i>
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
                    projects.map((project) => (
                      <div 
                        key={project.project_id} // Use project_id as the key
                        className="project-card"
                        onClick={() => handleProjectClick(project.project_id)} // Make project card clickable
                        style={{ cursor: 'pointer' }}
                      >
                        <h4>{project.title}</h4>
                        <p><strong>Research Field:</strong> {project.field}</p>
                        <p><strong>Description:</strong> {project.description}</p>
                      </div>
                    ))
                  ) : (
                    <i>No projects found...</i>
                  )}
                  
                  <div className="add-project-card" onClick={() => handleAddProjectClick()}>
                    <div className="plus-icon">+</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "collaboratored project" && (
              <div>
                <h3>Collaborators</h3>
                <p>Show list of collaboratored projects here...</p>
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