import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../db";
import NavbarAcholder from "./navbarAccountholder";
import PremiumAdBanner from "./PremiumFeatures/PremiumAdBanner";
import PremiumPackagesModal from "./PremiumFeatures/PremiumPackagesModal";
import TokenDisplay from "./PremiumFeatures/TokenDisplay";
import AdminDashboardOverview from "./AdminComponents/AdminDashboardOverview";
import AdminPackageCustomizer from "./AdminComponents/AdminPackageCustomizer";
import "./Dashboard.css";
import "./PremiumFeatures/PremiumAdBanner.css";
import "./PremiumFeatures/PremiumPackagesModal.css";
import "./PremiumFeatures/TokenDisplay.css";
import "./AdminComponents/AdminDashboard.css";
import defaultprofile from "./default_dp.png";
import QB from "../QBmanagement/QuestionBankUser";

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
  const [activeTab, setActiveTab] = useState("dashboard");
  const [privacyFilter, setPrivacyFilter] = useState("all");
  const [sortField, setSortField] = useState("title");
  const [sortOrder, setSortOrder] = useState("asc");
  const [isEditing, setIsEditing] = useState(false);
  const [editedValues, setEditedValues] = useState({});
  const [projects, setProjects] = useState([]);
  const [language, setLanguage] = useState(
    localStorage.getItem("language") || "English"
  );
  const [translatedLabels, setTranslatedLabels] = useState({});

  // Premium feature states
  const [showAdBanner, setShowAdBanner] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [userType, setUserType] = useState('normal');
  const [availableTokens, setAvailableTokens] = useState(0);

  // Admin states
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    activeSurveys: 0,
    totalResponses: 0,
    premiumUsers: 0,
    recentActivities: []
  });

  const loadTranslations = async () => {
    if (language === "English") {
      setTranslatedLabels({});
      return;
    }

    const labelsToTranslate = [
      "Dashboard",
      "Edit Profile",
      "Projects",
      "Collaborated Projects", 
      "Checkout Premium Packages",
      "Customize Packages",
      "Question Bank",
      "Profile details",
      "Cancel",
      "Edit",
      "Save Changes",
      "My Research Projects",
      "Research Field:",
      "Description:",
      "No projects found. Add new projects to get started...",
      "Collaborated Projects",
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
      "Filter by: ",
      "All",
      "Public",
      "Private",
      "Sort by:",
      "Title",
      "Field",
      "Ascending",
      "Descending",
      "Profile Details",
      "Visibility Setting:",
      "Created At:",
      "Created At",
      "Last Updated:",
      "Last Updated",

      // Admin Dashboard Labels
      "System Overview","Welcome to the administrative dashboard. Monitor your platform\'s performance and manage system settings.",
      "Total Users",
      "Active Surveys",
      "Total Responses",
      "Premium Users",
      "User Analytics",
      "Survey Analytics",
      "Revenue Overview",
      "New User at Current Month",
      "Survey Created at Current Month",
      "New User at Previous Month",
      "Survey Created at Previous Month",
      "User Growth Rate",
      "Survey Creation Growth Rate",
      "This Month",
      "Last Month",

      // Admin Package Customizer Labels
      "Package Management",
      "Add Package",
      "Manage and customize premium packages for your users",
      "Total Packages",
      "Discounted",
      "Premium",
      "Tags",
      "Questions",
      "Surveys",
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

  const fetchAdminStats = useCallback(async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get("http://localhost:2000/api/admin/stats");

      if (response.status === 200) {
        setAdminStats(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch admin stats:", error);
      // Set mock data for demonstration
      setAdminStats({
        totalUsers: 1250,
        activeSurveys: 89,
        totalResponses: 15420,
        premiumUsers: 78,
        recentActivities: [
          { id: 1, activity: "New user registration", time: "2 minutes ago" },
          { id: 2, activity: "Survey created", time: "5 minutes ago" },
          { id: 3, activity: "Premium subscription", time: "15 minutes ago" },
          { id: 4, activity: "Survey response submitted", time: "20 minutes ago" },
          { id: 5, activity: "User profile updated", time: "25 minutes ago" }
        ]
      });
    }
  }, []);

  const getProfile = useCallback(async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get("http://localhost:2000/api/profile", {
        headers: { Authorization: "Bearer " + token },
      });
      console.log("Profile response:", response.data);
      if (response.status === 200) {
        setValues(response.data);
        setProfilePicUrl(response.data.user.image);
        setEditedValues(response.data.user);

        // Set user type and available tokens
        const currentUserType = response.data.user.user_type;
        setUserType(currentUserType);
        setAvailableTokens(response.data.user.available_token || 0);

        // Check if user is admin
        if (currentUserType === 'admin') {
          setIsAdmin(true);
          setActiveTab("dashboard"); // Set default tab for admin
          fetchAdminStats(); // Fetch admin statistics
        } else {
          setIsAdmin(false);
          setActiveTab("editprofile"); // Set default tab for normal user
          // Show ad banner for normal users when they visit dashboard
          if (currentUserType === 'normal') {
            setShowAdBanner(true);
          }
        }

        localStorage.setItem("userId", response.data.user.user_id);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }, [fetchAdminStats]);

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
    if (!isAdmin) {
      fetchProjects();
    }
  }, [isAdmin, fetchProjects]);

  const navigate = useNavigate();

  const handleAddProjectClick = () => navigate("/addproject");
  const handleProjectClick = (projectId) =>
    navigate(`/view-project/${projectId}`);

  // Premium feature handlers
  const handleCloseAdBanner = () => {
    setShowAdBanner(false);
  };

  const handleCheckoutClick = () => {
    setShowAdBanner(false);
    setShowPremiumModal(true);
  };

  const handleClosePremiumModal = () => {
    setShowPremiumModal(false);
  };

  // Handle tab click
  const handleTabClick = (tabKey) => {
    if (tabKey === "checkoutpremiumpackages" && !isAdmin) {
      setShowPremiumModal(true);
    } else {
      setActiveTab(tabKey);
    }
  };

  // Get tabs based on user type
  const getTabs = () => {
    if (isAdmin) {
      return [
        { label: "Dashboard", key: "dashboard" },
        { label: "Customize Packages", key: "customizepackages" },
        { label: "Edit Profile", key: "editprofile" }
      ];
    } else {
      return [
        { label: "Edit Profile", key: "editprofile" },
        { label: "Projects", key: "projects" },
        { label: "Collaborated Projects", key: "collaboratedprojects" },
        { label: "Question Bank", key: "questionbank" }
      ];
    }
  };

  return (
    <>
      <NavbarAcholder language={language} setLanguage={setLanguage} />
      <div className={`dashboard-container ${isAdmin ? 'admin-dashboard' : ''}`}>
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

            {/* Admin badge */}
            {isAdmin && (
              <div className="admin-badge">
                <span>👑 Administrator</span>
              </div>
            )}

            {/* Token Display - Only for non-admin users */}
            {!isAdmin && (
              <TokenDisplay
                availableTokens={availableTokens}
                userType={userType}
                getLabel={getLabel}
              />
            )}

            <div className="profile-tabs">
              <ul>
                {getTabs().map((tab) => (
                  <li key={tab.key}>
                    <button
                      className={activeTab === tab.key ? "active" : ""}
                      onClick={() => {
                        if (tab.key === "checkoutpremiumpackages") {
                          setShowPremiumModal(true);
                        } else {
                          setActiveTab(tab.key);
                          const url = new URL(window.location);
                          url.searchParams.set("tab", tab.key);
                          window.history.replaceState({}, "", url);
                        }
                      }}
                    >
                      {getLabel(tab.label)}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="projects-section">
            {/* Admin Dashboard Overview */}
            {isAdmin && activeTab === "dashboard" && (
              <AdminDashboardOverview
                adminStats={adminStats}
                getLabel={getLabel}
              />
            )}

            {/* Admin Package Customizer */}
            {isAdmin && activeTab === "customizepackages" && (
              <AdminPackageCustomizer
                getLabel={getLabel}
              />
            )}

            {/* Edit Profile - Common for both admin and normal users */}
            {activeTab === "editprofile" && (
              <div className="edit-profile-content">
                <div className="edit-profile-header">
                  <h3>{getLabel("Profile Details")}</h3>
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
                        field === "Gender" ? (
                          <select
                            name={field.toLowerCase().replace(/ /g, "_")}
                            value={
                              editedValues[
                                field.toLowerCase().replace(/ /g, "_")
                              ] || ""
                            }
                            onChange={handleInputChange}
                            required
                          >
                            <option value="">
                              {getLabel("Select Gender")}
                            </option>
                            <option value="Male">{getLabel("Male")}</option>
                            <option value="Female">{getLabel("Female")}</option>
                            <option value="Other">{getLabel("Other")}</option>
                            <option value="Prefer not to say">
                              {getLabel("Prefer not to say")}
                            </option>
                          </select>
                        ) : (
                          <input
                            type={field === "Date of Birth" ? "date" : "text"}
                            name={field.toLowerCase().replace(/ /g, "_")}
                            value={
                              editedValues[
                                field.toLowerCase().replace(/ /g, "_")
                              ] || ""
                            }
                            onChange={handleInputChange}
                            required
                          />
                        )
                      ) : (
                        <span>
                          {editedValues[
                            field.toLowerCase().replace(/ /g, "_")
                          ] || "-"}
                        </span>
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

            {/* Normal User Tabs */}
            {!isAdmin && activeTab === "projects" && (
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
                <hr className="section-divider" />
                {/* Existing Projects */}
                <h4>{getLabel("Existing Projects")}</h4>
                <div className="project-filter-bar">
                  {/* Filter by Privacy */}
                  <label htmlFor="privacyFilter">
                    {getLabel("Filter by: ")}
                  </label>
                  <select
                    id="privacyFilter"
                    value={privacyFilter}
                    onChange={(e) => setPrivacyFilter(e.target.value)}
                    className="privacy-filter-dropdown"
                  >
                    <option value="all">{getLabel("All")}</option>
                    <option value="public">{getLabel("Public")}</option>
                    <option value="private">{getLabel("Private")}</option>
                  </select>

                  {/* Sort By Field */}
                  <label htmlFor="sortField">{getLabel("Sort by:")}</label>
                  <select
                    id="sortField"
                    value={sortField}
                    onChange={(e) => setSortField(e.target.value)}
                    className="sort-dropdown"
                  >
                    <option value="title">{getLabel("Title")}</option>
                    <option value="field">{getLabel("Field")}</option>
                    <option value="created_at">{getLabel("Created At")}</option>
                    <option value="last_updated">
                      {getLabel("Last Updated")}
                    </option>
                  </select>

                  {/* Sort Order */}
                  <select
                    id="sortOrder"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="sort-dropdown"
                  >
                    <option value="asc">{getLabel("Ascending")}</option>
                    <option value="desc">{getLabel("Descending")}</option>
                  </select>
                </div>

                {console.log("Projects:", projects)}
                {projects.length > 0 ? (
                  <div className="project-grid">
                    {projects
                      .filter(
                        (project) =>
                          privacyFilter === "all" ||
                          project.privacy_mode === privacyFilter
                      )
                      .sort((a, b) => {
                        const aVal = a[sortField];
                        const bVal = b[sortField];

                        // Check if field is date-like
                        const isDateField =
                          sortField.toLowerCase().includes("created_at") ||
                          sortField.toLowerCase().includes("last_updated");

                        if (isDateField) {
                          const aTime = new Date(aVal).getTime();
                          const bTime = new Date(bVal).getTime();
                          return sortOrder === "asc"
                            ? aTime - bTime
                            : bTime - aTime;
                        } else {
                          const aStr = (aVal || "").toString().toLowerCase();
                          const bStr = (bVal || "").toString().toLowerCase();
                          return sortOrder === "asc"
                            ? aStr.localeCompare(bStr)
                            : bStr.localeCompare(aStr);
                        }
                      })
                      .map((project) => (
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
                            <strong>{getLabel("Visibility Setting:")}</strong>{" "}
                            {project.privacy_mode}
                          </p>

                          <p>
                            <strong>{getLabel("Created At:")}</strong>{" "}
                            {new Date(project.created_at + "Z").toLocaleString(
                              "en-US",
                              {
                                timeZone: "Asia/Dhaka",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                                hour12: true,
                              }
                            )}
                          </p>

                          <p>
                            <strong>{getLabel("Last Updated:")}</strong>{" "}
                            {new Date(
                              project.last_updated + "Z"
                            ).toLocaleString("en-US", {
                              timeZone: "Asia/Dhaka",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                              hour12: true,
                            })}
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

            {!isAdmin && activeTab === "collaboratedprojects" && (
              <div>
                <h3>{getLabel("Collaborated Projects")}</h3>
                <p>{getLabel("Show list of collaboratored projects here..")}</p>
              </div>
            )}

            {!isAdmin && activeTab === "questionbank" && (
              <div className="question-bank-section">
                <h3>{getLabel("Question Bank")}</h3>
                <QB language={language} setLanguage={setLanguage}/>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Premium Ad Banner - Only show for normal users */}
      {!isAdmin && userType === 'normal' && showAdBanner && (
        <PremiumAdBanner
          onClose={handleCloseAdBanner}
          onCheckoutClick={handleCheckoutClick}
          getLabel={getLabel}
        />
      )}

      {/* Premium Packages Modal - Only for normal users */}
      {!isAdmin && (
        <PremiumPackagesModal
          isOpen={showPremiumModal}
          onClose={handleClosePremiumModal}
          getLabel={getLabel}
        />
      )}
    </>
  );
};

export default Dashboard;