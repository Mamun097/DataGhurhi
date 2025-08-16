
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../db";
import NavbarAcholder from "./navbarAccountholder";
import "./Dashboard.css";
import defaultprofile from "./default_dp.png";
import { Navigate } from "react-router-dom";
import apiClient from "../api";

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
  const [language, setLanguage] = useState(localStorage.getItem("language") || "English");
  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "English" ? "বাংলা" : "English"));
    localStorage.setItem("language", language); // Store the selected language in local storage
  };

  const handleImageUpload = async (event, type) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const { data, error } = await supabase.storage
        .from("media") // Use the correct bucket name: 'media'
        .upload(`profile_pics/${file.name}`, file, {
          upsert: true, // Update the file if it already exists
        });

      if (error) {
        console.error("Upload failed:", error.message);
        return;
      }
      const urlData = supabase.storage
        .from("media")
        .getPublicUrl(`profile_pics/${file.name}`);

      console.log("publicURL", urlData.data.publicUrl);
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
    console.log("imageUrl", imageUrl);
    const token = localStorage.getItem("token");

    try {
      await apiClient.put(
        "/api/profile/update-profile-image",
        { imageUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log(`${type} image updated in database.`);
    } catch (error) {
      console.error(`Failed to update ${type} image in DB:`, error);
    }
  };

  const getProfile = useCallback(async () => {
    const token = localStorage.getItem("token");
    console.log(token);
    try {
      const requestOptions = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      };
      const response = await apiClient.get("/api/profile", requestOptions);

      if (response.status === 200) {
        console.log(response.data);
        setValues(response.data);
        setProfilePicUrl(response.data.user.image);
        setEditedValues(response.data.user);
        // console.log(values);
      } else {
        console.log(response.data.error);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }, []);

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
      const response = await apiClient.put(
        "/api/profile/update-profile",
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
      const response = await apiClient.get("/api/project", {
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
    navigate("/addproject"); // Use the navigate function to redirect
  };

  const handleProjectClick = (projectId) => {
    navigate(`/view-project/${projectId}`); // Redirect to the edit project page with projectId as a URL parameter
  };
  return (
    <>
      <NavbarAcholder language={language} setLanguage={setLanguage} />

      <div className="dashboard-container">
        <div className="dashboard-layout">
          {/* Profile Section */}
          <div className="profile-section">
            <div className="profile-pic-wrapper">
              <img
                src={profilePicUrl || defaultprofile}
                alt="Profile"
                className="profile-pic"
              />
              <input
                type="file"
                id="profileUpload"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, "profile")}
                style={{ display: "none" }}
              />
              <label htmlFor="profileUpload" className="edit-profile-pic-btn">
                📷
              </label>
            </div>

            <h2>{values.user?.name || "Loading..."}</h2>
            {/* <p>Software Engineer</p> */}

            <div className="profile-tabs">
              <ul>
                <li>
                  <button
                    className={activeTab === "editProfile" ? "active" : ""}
                    onClick={() => setActiveTab("editProfile")}
                  >
                    {language === "English"
                      ? "Edit Profile"
                      : "প্রোফাইল এডিট করুন"}
                  </button>
                </li>
                <li>
                  <button
                    className={activeTab === "projects" ? "active" : ""}
                    onClick={() => setActiveTab("projects")}
                  >
                    {language === "English" ? "Projects" : "প্রজেক্টসমূহ"}
                  </button>
                </li>
                <li>
                  <button
                    className={activeTab === "collaborators" ? "active" : ""}
                    onClick={() => setActiveTab("collaboratored project")}
                  >
                    {language === "English"
                      ? "Collaborated Projects"
                      : "যৌথ প্রজেক্টসমূহ"}
                  </button>
                </li>
            
              </ul>
            </div>
          </div>

          {/* Main Section */}
          <div className="projects-section">
            {activeTab === "editProfile" && (
              <div className="edit-profile-content">
                <div className="edit-profile-header">
                  {/* <h3>Profile Details</h3> */}
                  <h3>
                    {language === "English"
                      ? "Profile details"
                      : "বিস্তারিত প্রোফাইল"}
                  </h3>
                  <button onClick={toggleEdit} className="edit-toggle-btn">
                    {isEditing
                      ? language === "English"
                        ? "Cancel"
                        : "বাতিল"
                      : language === "English"
                      ? "Edit"
                      : "সম্পাদনা করুন"}
                  </button>
                </div>
                <div className="profile-fields">
                  {[
                    {
                      label: "Name",
                      label_bn: "নাম",
                      name: "name",
                      required: true,
                    },
                    {
                      label: "Email",
                      label_bn: "ইমেইল",
                      name: "email",
                      required: true,
                    },
                    {
                      label: "Affiliation",
                      label_bn: "প্রতিষ্ঠান",
                      name: "affiliation",
                      required: true,
                    },
                    {
                      label: "Research Field",
                      label_bn: "গবেষণার ক্ষেত্র",
                      name: "research_field",
                      required: true,
                    },
                    {
                      label: "Profession",
                      label_bn: "পেশা",
                      name: "profession",
                      required: true,
                    },
                    {
                      label: "Secret Question",
                      label_bn: "গোপন প্রশ্ন",
                      name: "secret_question",
                      required: true,
                    },
                    {
                      label: "Secret Answer",
                      label_bn: "গোপন উত্তর",
                      name: "secret_answer",
                      required: true,
                    },
                    {
                      label: "Date of Birth",
                      label_bn: "জন্মতারিখ",
                      name: "date_of_birth",
                      type: "date",
                      required: true,
                    },
                    {
                      label: "Education Level",
                      label_bn: "শিক্ষাগত যোগ্যতা",
                      name: "education_level",
                    },
                    { label: "Gender", label_bn: "লিঙ্গ", name: "gender" },
                    { label: "Address", label_bn: "ঠিকানা", name: "address" },
                    {
                      label: "Contact No",
                      label_bn: "যোগাযোগ নম্বর",
                      name: "contact",
                    },
                    {
                      label: "Profile Link",
                      label_bn: "প্রোফাইল লিঙ্ক",
                      name: "profile_link",
                    },
                    { label: "Religion", label_bn: "ধর্ম", name: "religion" },
                    {
                      label: "Working Place",
                      label_bn: "কর্মস্থল",
                      name: "working_place",
                    },
                    {
                      label: "Years of Experience",
                      label_bn: "অভিজ্ঞতার বছর",
                      name: "years_of_experience",
                    },
                  ].map((field, index) => (
                    <div key={index}>
                      <label>
                        {language === "English" ? field.label : field.label_bn}:
                      </label>
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
                    {language === "English" ? "Save Changes" : "সংরক্ষণ করুন"}
                  </button>
                )}
              </div>
            )}

            {activeTab === "projects" && (
              <div>
                {/* <h3>My Research Projects</h3> */}
                <h3>
                  {language === "English"
                    ? "My Research Projects"
                    : "আমার গবেষণা প্রজেক্টসমূহ"}
                </h3>
                <div className="project-grid">
                  {projects.length > 0 ? (
                    projects.map((project) => (
                      <div
                        key={project.project_id} // Use project_id as the key
                        className="project-card"
                        onClick={() => handleProjectClick(project.project_id)} // Make project card clickable
                        style={{ cursor: "pointer" }}
                      >
                        <h4>{project.title}</h4>
                        <p>
                          <strong>
                            {language === "English"
                              ? "Research Field:"
                              : "গবেষণা ক্ষেত্র:"}
                          </strong>{" "}
                          {project.field}
                        </p>
                        <p>
                          <strong>
                            {language === "English" ? "Description:" : "বিবরণ:"}
                          </strong>{" "}
                          {project.description}
                        </p>
                      </div>
                    ))
                  ) : (
                    <i>
                      {language === "English"
                        ? "No projects found. Add new projects to get started..."
                        : "কোনো প্রজেক্ট পাওয়া যায়নি। নতুন প্রজেক্ট যোগ করতে শুরু করুন..."}
                    </i>
                  )}

                  <div
                    className="add-project-card"
                    onClick={() => handleAddProjectClick()}
                  >
                    <div className="plus-icon">+</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "collaboratored project" && (
              <div>
                <h3>
                  {language === "English" ? "Collaborators" : "কলাবোরেটরস"}
                </h3>
                <p>
                  {language === "English"
                    ? "Show list of collaboratored projects here.."
                    : "এখানে যৌথ প্রজেক্টের তালিকা দেখান.."}
                </p>
              </div>
            )}
          </div>

          {/* Trending Topics Section */}
          <div className="trending-section">
            <h3>
              {language === "English"
                ? "Trending Topics"
                : "বর্তমানে বহুল আলোচিত বিষয়সমূহ"}
            </h3>
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
