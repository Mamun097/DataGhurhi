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
import UserSubscriptions from './PremiumFeatures/UserSubscription';


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
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("tab");
  };

  const [activeTab, setActiveTab] = useState(getTabFromURL() || "editprofile");
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
  // collab
  const [showCollabModal, setShowCollabModal] = useState(false);


  const handleAccept = async (projectId) => {

    console.log("Accepted request:", projectId);
    const token = localStorage.getItem("token");
    try {
      const response = await axios.post(
        `http://localhost:2000/api/collaborator/${projectId}/accept-invitation`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 200) {
        console.log("Invitation accepted successfully");
        fetchCollaborationRequests(); // Refresh requests
      }
    } catch (error) {
      console.error("Failed to accept invitation:", error);
    }
  };

  const handleReject = async (projectId) => {
    console.log("Rejected request:", projectId);
    const token = localStorage.getItem("token");
    try {
      const response = await axios.post(
        `http://localhost:2000/api/collaborator/${projectId}/decline-invitation`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 200) {
        console.log("Invitation rejected successfully");
        fetchCollaborationRequests(); // Refresh requests
      }
    } catch (error) {
      console.error("Failed to reject invitation:", error);
    }
  };

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
      "Profile",
      "Projects",
      "Collaborated Projects",
      "Premium Packages",
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
      "System Overview", "Welcome to the administrative dashboard. Monitor your platform\'s performance and manage system settings.",
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

      // Premium Features Labels
      "Choose Your Premium Package",
      "Unlock Powerful AI Features",
      "AI Survey Generation",
      "Create professional surveys in seconds with AI assistance",
      "Smart Question Creation",
      "Generate relevant questions based on your research goals",
      "Automatic Tagging",
      "Organize questions with intelligent tagging system",
      "Loading packages...",
      "Failed to load packages. Please try again.",
      "Most Popular",
      "No packages available at the moment.",
      "Loading customization options...",
      "Build Your Custom Package",
      "Select the items you need and choose validity period",
      "Question Tags",
      "unit",
      "Questions",
      "Surveys",
      "Choose Validity Period",
      "Standard",
      "Validity",
      "Total",
      "Fixed Packages",
      "Custom Package",
      "Automatic Question Tag Generation",
      "Automatic Question Generation",
      "Automatic Survey Template Generation",
      "Basic Survey Templates",
      "Advanced Survey Templates",
      "Premium Survey Templates",
      "Package Summary",

      "Unlock Premium Features",
      "Take your surveys to the next level with AI-powered tools",
      "AI Survey Template Generation",
      "Smart Question Generation",
      "Automatic Question Tagging",
      "Continue as Free User",
      "Checkout Premium Packages",
      "Add New Package",
      "Original Price",
      "Discount Price",
      "Edit Package",
      "Total validity",
      "Delete Package",
      "Are you sure you want to delete the",
      "package? This action cannot be undone.",
      "Delete",

      // User Subscription Labels
      // "Active",
      // "Expired",
      // "Expiring Soon",
      // "Loading subscription packages...","Retry","My Subscription Packages","Manage and view your premium subscription packages","Active Packages",
      // "Auto Tag Generation",
      // "Auto Question Generation",
      // "Auto Survey Generation",
      // "Days Remaining",
      // "Started",
      // "Expires",
      // "Package Cost",
      // "No Active Packages",
      // "You don\'t have any active subscription packages at the moment.",
      // "Hide Package History",
      // "View Package History",
      // "Package History",

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
          setActiveTab(getTabFromURL() || "dashboard"); // Set default tab for admin
          fetchAdminStats(); // Fetch admin statistics
        } else {
          setIsAdmin(false);
          setActiveTab(getTabFromURL() || "editprofile"); // Set default tab for normal user

          // Show ad banner for normal users only once per session
          if (currentUserType === 'normal') {
            // Check if the banner has already been shown in this session
            const bannerShownKey = `adBannerShown_${response.data.user.user_id}`;
            const bannerAlreadyShown = sessionStorage.getItem(bannerShownKey);

            if (!bannerAlreadyShown) {
              setShowAdBanner(true);
              // Mark banner as shown in this session
              sessionStorage.setItem(bannerShownKey, 'true');
            }
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
  //collaborated projects
  const [collaboratedProjects, setCollaboratedProjects] = useState([]);
  const [collabRequests, setCollabRequests] = useState([]);

  const fetchCollaboratedProjects = useCallback(async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get("http://localhost:2000/api/collaborator/all-projects", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        setCollaboratedProjects(response.data.projects || []);
        console.log("Collaborated Projects:", response.data.projects);

      }
    } catch (error) {
      console.error("Failed to fetch collaborated projects:", error);
    }
  }, []);
  useEffect(() => {
    if (!isAdmin) {
      fetchCollaboratedProjects();
    }
  }, [isAdmin, fetchCollaboratedProjects]);

  // Fetch collaboration requests
  const fetchCollaborationRequests = useCallback(async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get("http://localhost:2000/api/collaborator/all-invitations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        setCollabRequests(response.data.invitations || []);
        console.log("Collaboration Requests:", response.data.invitations);
      }
    } catch (error) {
      console.error("Failed to fetch collaboration requests:", error);
    }
  }, []);

  const [expandedRows, setExpandedRows] = useState(new Set());

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;
  const sortedRequests = [...collabRequests].sort(
    (a, b) => new Date(b.invite_time) - new Date(a.invite_time)
  );

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = sortedRequests.slice(indexOfFirstRow, indexOfLastRow);

  const totalPages = Math.ceil(sortedRequests.length / rowsPerPage);





  // Get tabs based on user type
  const getTabs = () => {
    if (isAdmin) {
      return [
        { label: "Dashboard", key: "dashboard" },
        { label: "Customize Packages", key: "customizepackages" },
        { label: "Profile", key: "editprofile" }
      ];
    } else {
      return [
        { label: "Profile", key: "editprofile" },
        { label: "Projects", key: "projects" },
        { label: "Collaborated Projects", key: "collaboratedprojects" },
        { label: "Question Bank", key: "questionbank" },
        { label: "Premium Packages", key: "premiumpackages" },
      ];
    }
  };

  return (
    <>
      <NavbarAcholder language={language} setLanguage={setLanguage} isAdmin={isAdmin} userType={userType} />
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
            {/* {!isAdmin && (
              <TokenDisplay
                availableTokens={availableTokens}
                userType={userType}
                getLabel={getLabel}
              />
            )} */}

            <div className="profile-tabs">
              <ul>
                {getTabs().map((tab) => (
                  <li key={tab.key}>
                    <button
                      className={activeTab === tab.key ? "active" : ""}
                      onClick={() => {
                        if (tab.key === "premiumpackages") {
                          setShowPremiumModal(true);
                        } else {

                          const url = new URL(window.location);
                          url.searchParams.set("tab", tab.key);
                          window.history.replaceState({}, "", url);
                          setActiveTab(tab.key);
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

            {/* Profile - Common for both admin and normal users */}
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

            {activeTab === "editprofile" && !isAdmin && (
              <UserSubscriptions
                getLabel={getLabel}
                userType={userType}
              />
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
              <div className="p-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h3>{getLabel("Collaborated Projects")}</h3>
                    <p className="text-muted">{getLabel("Projects shared with you will appear below.")}</p>
                  </div>
                  <button
                    className="btn view-requests-btn btn-sm btn-outline-primary"
                    onClick={() => {
                      setShowCollabModal(true);
                      fetchCollaborationRequests();
                    }}
                    title={getLabel("View Collaboration Requests")}
                  >
                    <i className="bi bi-eye me-1"></i>
                    <span className="d-none d-sm-inline text-muted " >{getLabel("View Request")}</span>
                  </button>
                </div>
                <div className="collaborated-projects-list">

                  {collaboratedProjects.length === 0 ? (
                    <div className="alert alert-warning">
                      {getLabel("No collaborated projects found.")}
                    </div>
                  ) : (
                    <div className="row g-3">
                      {collaboratedProjects.map((projectObj, idx) => {
                        const { survey_project, access_role } = projectObj;
                        const { title, description, field, user } = survey_project || {};
                        const ownerName = user?.name || "-";
                        const ownerEmail = user?.email || "-";

                        return (
                          <div className="col-12 col-sm-6 col-lg-4" key={idx}>
                            <div className="card shadow-sm h-100 border-0">
                              <div className="card-body d-flex flex-column">
                                <h5 className="card-title">{title}</h5>
                                <h6 className="card-subtitle mb-2 text-muted">{field}</h6>
                                <p className="card-text flex-grow-1">
                                  {description || getLabel("No description provided.")}
                                </p>
                                <hr />
                                <p className="mb-1">
                                  <strong>{getLabel("Owner")}:</strong> {ownerName}
                                </p>
                                <p className="mb-1 text-muted">{ownerEmail}</p>
                                <span
                                  className={`badge mt-2 align-self-start bg-${access_role === "editor"
                                    ? "primary"
                                    : access_role === "viewer"
                                      ? "secondary"
                                      : "warning"
                                    }`}
                                >
                                  {getLabel("Role")}: {access_role}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Collaborated Projects List */}
                <ul className="list-group mt-3">
                  {collaboratedProjects.map((proj) => (
                    <li className="list-group-item" key={proj.project_id}>
                      {proj.title}
                    </li>
                  ))}
                </ul>

                {/* Custom Modal */}
                {showCollabModal && (
                  <div className="custom-modal-overlay" onClick={() => setShowCollabModal(false)}>
                    <div className="custom-modal" onClick={(e) => e.stopPropagation()}>
                      <div className="modal-header d-flex justify-content-between align-items-center">
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => setShowCollabModal(false)}
                        >
                          <i className="bi bi-x-lg me-1"></i> {getLabel("Close")}
                        </button>

                        <h5 className="modal-title mb-0">{getLabel("Collaboration Requests")}</h5>

                        <span /> {/* Empty span to balance layout */}
                      </div>
                      <div className="custom-modal-body">
                        {collabRequests.length > 0 ? (
                          <div className="table-responsive rounded shadow-sm border">
                            <table className="table table-hover align-middle mb-0">
                              <thead className="table-dark text-white">
                                <tr>
                                  <th>{getLabel("Project Title")}</th>
                                  <th>{getLabel("Owner")}</th>
                                  <th>{getLabel("Email")}</th>
                                  <th>{getLabel("Role")}</th>
                                  <th>{getLabel("Invited At")}</th>
                                  <th>{getLabel("Actions")}</th>
                                </tr>
                              </thead>
                              <tbody>
                                {currentRows.map((req) => (
                                  <React.Fragment key={req.shared_id}>
                                    <tr>
                                      <td className="fw-semibold">{req.project_title}</td>
                                      <td>{req.owner_name}</td>
                                      <td className="text-muted">{req.owner_email}</td>
                                      <td>
                                        <span className={`badge rounded-pill bg-${req.access_role === "editor" ? "primary" : req.access_role === "viewer" ? "secondary" : "warning"} text-uppercase`}>
                                          {req.access_role}
                                        </span>
                                      </td>
                                      <td>
                                        <small className="text-muted">
                                          {new Date(req.invite_time).toLocaleString()}
                                        </small>
                                      </td>
                                      <td>
                                        <div className="d-flex gap-2">
                                          <button
                                            className="btn btn-sm btn-success"
                                            onClick={() => handleAccept(req.project_id)}
                                          >
                                            <i className="bi bi-check-circle me-1"></i>{getLabel("Accept")}
                                          </button>
                                          <button
                                            className="btn btn-sm btn-danger"
                                            onClick={() => {
                                              handleReject(req.pr)
                                            }}
                                          >
                                            <i className="bi bi-x-circle me-1"></i>{getLabel("Reject")}
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                    {expandedRows.has(req.shared_id) && (
                                      <tr>
                                        <td colSpan="6" className="bg-light text-muted">
                                          <div className="px-3 py-2">
                                            <strong>{getLabel("Project ID")}:</strong> {req.project_id} <br />
                                            <strong>{getLabel("Shared ID")}:</strong> {req.shared_id}
                                          </div>
                                        </td>
                                      </tr>
                                    )}
                                  </React.Fragment>
                                ))}
                              </tbody>
                            </table>

                            {/* Pagination */}
                            <nav>
                              <ul className="pagination justify-content-center my-3">
                                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                                  <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>
                                    <i className="bi bi-chevron-left"></i>
                                  </button>
                                </li>
                                {Array.from({ length: totalPages }, (_, i) => (
                                  <li key={i + 1} className={`page-item ${currentPage === i + 1 ? "active" : ""}`}>
                                    <button className="page-link" onClick={() => setCurrentPage(i + 1)}>
                                      {i + 1}
                                    </button>
                                  </li>
                                ))}
                                <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                                  <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>
                                    <i className="bi bi-chevron-right"></i>
                                  </button>
                                </li>
                              </ul>
                            </nav>
                          </div>
                        ) : (
                          <p>{getLabel("No collaboration requests")}</p>
                        )}


                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}




            {activeTab === "questionbank" && (
              <div className="question-bank-section">


                <QB language={language} setLanguage={setLanguage} />



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