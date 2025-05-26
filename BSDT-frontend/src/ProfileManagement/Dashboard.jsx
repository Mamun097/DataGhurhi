import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../db";
import NavbarAcholder from "./navbarAccountholder";
import "./Dashboard.css";
import defaultprofile from "./default_dp.png";

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

const Dashboard = () => {
  const [profilePicUrl, setProfilePicUrl] = useState(null);
  const [values, setValues] = useState({});
  const getTabFromURL = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get("tab") || "editprofile";
  };

  const [activeTab, setActiveTab] = useState(getTabFromURL());

  const [isEditing, setIsEditing] = useState(false);
  const [editedValues, setEditedValues] = useState({});
  const [projects, setProjects] = useState([]);
  const [language, setLanguage] = useState(
    localStorage.getItem("language") || "English"
  );
  const [translatedLabels, setTranslatedLabels] = useState({});

  const loadTranslations = async () => {
    if (language === "English") {
      setTranslatedLabels({});
      return;
    }

    const labelsToTranslate = [
      "Edit Profile",
      "Projects",
      "Collaborated Projects",
      "Profile details",
      "Cancel",
      "Edit",
      "Save Changes",
      "My Research Projects",
      "Research Field:",
      "Description:",
      "No projects found. Add new projects to get started...",
      "Collaborators",
      "Show list of collaboratored projects here..",
      "Trending Topics",
      "Name",
      "Email",
      "Work Affiliation",
      "Research Field",
      "Profession",
      "Secret Question",
      "Secret Answer",
      "Date of Birth",
      "Highest Education",
      "Gender",
      "Home Address",
      "Contact No",
      "Profile Link",
      "Religion",
      "Working Place",
      "Years of Experience",
      "Create a New Project",
      "Existing Projects",
    ];

    const translations = await translateText(labelsToTranslate, "bn");

    const translated = {};
    labelsToTranslate.forEach((key, idx) => {
      translated[key] = translations[idx];
    });

    setTranslatedLabels(translated);
  };

  useEffect(() => {
    loadTranslations();
  }, [language]);

  const getLabel = (text) =>
    language === "English" ? text : translatedLabels[text] || text;

  const handleImageUpload = async (event, type) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const { data, error } = await supabase.storage
        .from("media")
        .upload(`profile_pics/${file.name}`, file, { upsert: true });

      if (error) {
        console.error("Upload failed:", error.message);
        return;
      }

      const urlData = supabase.storage
        .from("media")
        .getPublicUrl(`profile_pics/${file.name}`);
      await updateImageInDB(type, urlData.data.publicUrl);
      getProfile();
    } catch (error) {
      console.error(`Upload failed for ${type} picture:`, error);
    }
  };

  const updateImageInDB = async (type, imageUrl) => {
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        "http://localhost:2000/api/profile/update-profile-image",
        { imageUrl },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (error) {
      console.error("Failed to update ${type} image in DB:", error);
    }
  };

  const getProfile = useCallback(async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get("http://localhost:2000/api/profile", {
        headers: { Authorization: "Bearer " + token },
      });
      if (response.status === 200) {
        setValues(response.data);
        setProfilePicUrl(response.data.user.image);
        setEditedValues(response.data.user);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }, []);

  useEffect(() => {
    getProfile();
  }, [getProfile]);

  const toggleEdit = () => setIsEditing(!isEditing);

  const handleInputChange = (e) => {
    setEditedValues({ ...editedValues, [e.target.name]: e.target.value });
  };

  const handleSaveChanges = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.put(
        "http://localhost:2000/api/profile/update-profile",
        editedValues,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 200) {
        setIsEditing(false);
        getProfile();
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  const fetchProjects = useCallback(async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get("http://localhost:2000/api/project", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) setProjects(response.data.projects);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, []);

  const navigate = useNavigate();

  const handleAddProjectClick = () => navigate("/addproject");
  const handleProjectClick = (projectId) =>
    navigate(`/view-project/${projectId}`);

  return (
    <>
      <NavbarAcholder language={language} setLanguage={setLanguage} />
      <div className="dashboard-container">
        <div className="dashboard-layout">
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
            <div className="profile-tabs">
              <ul>
                {["Edit Profile", "Projects", "Collaborated Projects"].map(
                  (label, idx) => (
                    <li key={idx}>
                      <button
                        className={
                          activeTab === label.toLowerCase().replace(/ /g, "")
                            ? "active"
                            : ""
                        }
                        onClick={() => {
                          const tabKey = label.toLowerCase().replace(/ /g, "");
                          setActiveTab(tabKey);
                          const url = new URL(window.location);
                          url.searchParams.set("tab", tabKey);
                          window.history.replaceState({}, "", url);
                        }}
                      >
                        {getLabel(label)}
                      </button>
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>

          <div className="projects-section">
            {activeTab === "editprofile" && (
              <div className="edit-profile-content">
                <div className="edit-profile-header">
                  <h3>{getLabel("Profile details")}</h3>
                  <button onClick={toggleEdit} className="edit-toggle-btn">
                    {isEditing ? getLabel("Cancel") : getLabel("Edit")}
                  </button>
                </div>
                <div className="profile-fields">
                  {[
                    "Name",
                    "Email",
                    "Work Affiliation",
                    "Research Field",
                    "Profession",
                    "Secret Question",
                    "Secret Answer",
                    "Date of Birth",
                    "Highest Education",
                    "Gender",
                    "Home Address",
                    "Contact No",
                    "Profile Link",
                    "Religion",
                    "Working Place",
                    "Years of Experience",
                  ].map((field, index) => (
                    <div key={index}>
                      <label>{getLabel(field)}:</label>
                      {isEditing ? (
                        <input
                          type={field === "Date of Birth" ? "date" : "text"}
                          name={field.toLowerCase().replace(/ /g, "_")}
                          value={
                            editedValues[
                              field.toLowerCase().replace(/ /g, "_")
                            ] || ""
                          }
                          onChange={handleInputChange}
                          required={true}
                        />
                      ) : (
                        <i>
                          {
                            values.user?.[
                              field.toLowerCase().replace(/ /g, "_")
                            ]
                          }
                        </i>
                      )}
                    </div>
                  ))}
                </div>
                {isEditing && (
                  <button className="save-btn" onClick={handleSaveChanges}>
                    {getLabel("Save Changes")}
                  </button>
                )}
              </div>
            )}

            {activeTab === "projects" && (
              <div>
                <h3>{getLabel("My Research Projects")}</h3>
                {/* New Project Section */}
                <div className="new-project-section">
                  <h4>{getLabel("Create a New Project")}</h4>
                  <div
                    className="add-project-card"
                    onClick={handleAddProjectClick}
                  >
                    <div className="plus-icon">+</div>
                  </div>
                </div>
                {/* Existing Projects */}
                <h4>{getLabel("Existing Projects")}</h4>
                {projects.length > 0 ? (
                  <div className="project-grid">
                    {projects.map((project) => (
                      <div
                        key={project.project_id}
                        className="project-card"
                        onClick={() => handleProjectClick(project.project_id)}
                        style={{ cursor: "pointer" }}
                      >
                        <h4>{project.title}</h4>
                        <p>
                          <strong>{getLabel("Research Field:")}</strong>{" "}
                          {project.field}
                        </p>
                        <p>
                          <strong>{getLabel("Description:")}</strong>{" "}
                          {project.description}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <i>
                    {getLabel(
                      "No projects found. Add new projects to get started..."
                    )}
                  </i>
                )}
              </div>
            )}

            {activeTab === "collaboratedprojects" && (
              <div>
                <h3>{getLabel("Collaborators")}</h3>
                <p>{getLabel("Show list of collaboratored projects here..")}</p>
              </div>
            )}
          </div>

          <div className="trending-section">
            <h3>{getLabel("Trending Topics")}</h3>
            <ul className="trending-list">
              {[
                "AI in Healthcare",
                "Web3 & Blockchain",
                "Edge Computing",
                "Quantum Computing",
                "Augmented Reality",
              ].map((topic, index) => (
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
