import React, { useState, useEffect, useCallback, use } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../db";
import NavbarAcholder from "./navbarAccountholder";
import PremiumAdBanner from "./PremiumFeatures/PremiumAdBanner";
import PremiumPackagesModal from "./PremiumFeatures/PremiumPackagesModal";
import AdminDashboardOverview from "./AdminComponents/AdminDashboardOverview";
import AdminPackageCustomizer from "./AdminComponents/AdminPackageCustomizer";
import "./Dashboard.css";
import "./PremiumFeatures/PremiumAdBanner.css";
import "./PremiumFeatures/PremiumPackagesModal.css";
import "./AdminComponents/AdminDashboard.css";
import "./AdminComponents/CouponManagement.css";
import defaultprofile from "./default_dp.png";
import QB from "../QBmanagement/QuestionBankUser";
import UserSubscriptions from "./PremiumFeatures/UserSubscription";
import ProjectTab from "./components/projectComponent";
import StatisticalAnalysisTool from "../StatisticalTool/StatisticalAnalysisTool";
import CollabProjectTab from "./components/collabProjectComponent";
import CollabSurveyTab from "./components/collabSurveyComponent";
import Collab from "./components/collaboration";
import apiClient from "../api";
import {
  LayoutDashboard,
  Package,
  TicketPercent,
  User,
  FolderKanban,
  Users,
  FileSpreadsheet,
  Crown,
  ChevronLeft,
  ChevronRight,
  Menu,
  ChartColumn
} from "lucide-react";
import CouponManagement from "./AdminComponents/CouponManagement";

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

  const [activeTab, setActiveTab] = useState(getTabFromURL() || "projects");
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
  //  console.log(localStorage.getItem("user_id"));
  const handleAccept = async (projectId) => {
    console.log("Accepted request:", projectId);
    const token = localStorage.getItem("token");
    try {
      const response = await apiClient.post(
        `/api/collaborator/${projectId}/accept-invitation`,
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
      const response = await apiClient.post(
        `/api/collaborator/${projectId}/decline-invitation`,
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
  const [userType, setUserType] = useState("normal");
  const [availableTokens, setAvailableTokens] = useState(0);

  // Admin states
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    activeSurveys: 0,
    totalResponses: 0,
    premiumUsers: 0,
    recentActivities: [],
  });

  const loadTranslations = async () => {
    if (language === "English") {
      setTranslatedLabels({});
      return;
    }

    const labelsToTranslate = [
      "Dashboard",
      "My Profile",
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

      "System Overview",
      "Welcome to the administrative dashboard. Monitor your platform's performance and manage system settings.",
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
      "Fixed Package Management",
      "Add Package",
      "Manage and customize premium packages for your users",
      "Total Packages",
      "Discounted",
      "Premium",
      "Tags",
      "Questions",
      "Surveys",
      "Choose Your Premium Package",
      "Unlock Powerful AI Features",
      "AI Survey Generation",
      "Create professional surveys in seconds with AI assistance",
      "Smart Question Creation",
      "Generate relevant questions based on your research goals",
      "Automatic Tagging",
      "Organize questions with intelligent tagging system",

      "Most Popular",

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

      "Survey",
      "Question",
      "Tag",
      "Custom Package Management",
      "Configure unit prices and validity periods for custom packages",
      "Unit Prices",
      "Set base price per unit for each package item",
      "per unit",
      "Edit Price",
      "Validity Periods",
      "Configure validity periods and their price multipliers",
      "Add Validity",
      "Delete Validity",
      "Edit Validity",
      "Price Multiplier",
      "Edit Unit Price",
      "Base Price Per Unit",

      "Collaborated Surveys",
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
      await apiClient.put(
        "/api/profile/update-profile-image",
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
      const response = await apiClient.get("/api/admin/stats");

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
          {
            id: 4,
            activity: "Survey response submitted",
            time: "20 minutes ago",
          },
          { id: 5, activity: "User profile updated", time: "25 minutes ago" },
        ],
      });
    }
  }, []);

  const getProfile = useCallback(async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await apiClient.get("/api/profile", {
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
        localStorage.setItem("userType", currentUserType);
        setAvailableTokens(response.data.user.available_token || 0);

        // Check if user is admin
        if (currentUserType === "admin") {
          setIsAdmin(true);
          setActiveTab(getTabFromURL() || "dashboard"); // Set default tab for admin
          fetchAdminStats(); // Fetch admin statistics
        } else {
          setIsAdmin(false);
          setActiveTab(getTabFromURL() || "projects"); // Set default tab for normal user

          // Show ad banner for normal users only once per session
          if (currentUserType === "normal") {
            // Check if the banner has already been shown in this session
            const bannerShownKey = `adBannerShown_${response.data.user.user_id}`;
            const bannerAlreadyShown = sessionStorage.getItem(bannerShownKey);

            if (!bannerAlreadyShown) {
              setShowAdBanner(true);
              // Mark banner as shown in this session
              sessionStorage.setItem(bannerShownKey, "true");
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
    console.log(editedValues);
    try {
      const response = await apiClient.put(
        "/api/profile/update-profile",
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
      const response = await apiClient.get("/api/project", {
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
  const handleProjectClick = (projectId, role) => {
    console.log("Project clicked:", projectId, "Role:", role);
    navigate(`/view-project/${projectId}`, {
      state: { role: role },
    });
  };
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
      const response = await apiClient.get("/api/collaborator/all-projects", {
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
      const response = await apiClient.get(
        "/api/collaborator/all-invitations",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 200) {
        setCollabRequests(response.data.invitations || []);
        console.log("Collaboration Requests:", response.data.invitations);
      }
    } catch (error) {
      console.error("Failed to fetch collaboration requests:", error);
    }
  }, []);
const [collapsed, setCollapsed] = useState(false);
const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Get tabs based on user type
 const getTabs = () => {
    if (isAdmin) {
      return [
        { label: "Dashboard", key: "dashboard", icon: <LayoutDashboard size={18} /> },
        { label: "Customize Packages", key: "customizepackages", icon: <Package size={18} /> },
        { label: "Manage Coupons", key: "managecoupons", icon: <TicketPercent size={18} /> },
        { label: "My Profile", key: "editprofile", icon: <User size={18} /> },
      ];
    } else {
      return [
        // { label: "My Profile", key: "editprofile", icon: <User size={18} /> },
        { label: "Projects", key: "projects", icon: <FolderKanban size={18} /> },
        { label: "Shared with You", key: "shared", icon: <Users size={18} /> },
        // { label: "Collaborated Surveys", key: "collaboratedsurveys", icon: <FileSpreadsheet size={18} /> },
        { label: "Question Bank", key: "questionbank", icon: <Package size={18} /> },
        {label: "Analysis", key: "analysis", icon: <ChartColumn size={18} />},
        { label: "Premium Packages", key: "premiumpackages", icon: <Crown size={18} /> },
      ];
    }
  };

useEffect(() => {
  setCollapsed(isMobile);
}, [isMobile]);

  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [passwordValues, setPasswordValues] = useState({
    old_password: "",
    new_password: "",
  });
  const handlePasswordChange = (e) => {
    setPasswordValues({ ...passwordValues, [e.target.name]: e.target.value });
  };

  const togglePasswordFields = () => {
    setShowPasswordFields((prev) => !prev);
  };
  const handleSavePassword = async () => {
    const { old_password, new_password } = passwordValues;

    if (!old_password || !new_password) {
      alert("Please fill out both the old and new password fields.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      // Example POST request to backend API

      const response = await apiClient.put(
        "/api/profile/update-password",
        {
          oldPassword: old_password,
          newPassword: new_password,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      if (response.data.success) {
        alert("Password updated successfully.");
        setShowPasswordFields(false);
        setPasswordValues({ old_password: "", new_password: "" });
      } else {
        alert(response.data.message || "Password update failed.");
      }
    } catch (error) {
      console.error("Password change error:", error);
      alert("An error occurred while changing the password.");
    }
  };

  return (
   <div style={{ paddingTop: "80px" }}>
      <NavbarAcholder
        language={language}
        setLanguage={setLanguage}
        isAdmin={isAdmin}
        userType={userType}
      />

      <div className={`dashboard-container ${isAdmin ? "admin-dashboard" : ""}`}>
        <div className="dashboard-layout">
      <div
        className={`sidebar-menu ${isMobile ? "mobile-horizontal" : ""} ${
          collapsed ? "collapsed" : ""
        }`}
      >
        {!isMobile && (
          <div className="sidebar-header">
            {collapsed ? (
            
                <button
                  className="collapse-btn"
                  onClick={() => setCollapsed(!collapsed)} 
                  aria-label="Toggle sidebar"
                >
                  <Menu size={20} />
                </button>
              ) : (
            
                <>
                  <h2 className="sidebar-header">Dashboard</h2>
                  <button
                    className="collapse-btn"
                    onClick={() => setCollapsed(!collapsed)} 
                    aria-label="Collapse sidebar"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  </>
                )}
          
          </div>
        )}

        {/* Admin Badge */}
        {!collapsed && isAdmin && !isMobile && (
          <div className="admin-badge">
            <span>👑 Administrator</span>
          </div>
        )}

            <ul className={`sidebar-list ${isMobile ? "horizontal" : ""}`}>
                {getTabs().map((tab) => (
                  <li key={tab.key}>
                    <div className="tooltip-container">
                      <button
                        className={`sidebar-btn ${activeTab === tab.key ? "active" : ""}`}
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
                        <span className="icon">{tab.icon}</span>
                        {!collapsed && !isMobile && <span className="label">{tab.label}</span>}
                      </button>

                      {((window.innerWidth <= 768) || (collapsed && !isMobile)) && (
                        <span className="tooltip-text">{tab.label}</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>

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
              <AdminPackageCustomizer getLabel={getLabel} />
            )}

            {/* Admin Coupon Management */}
            {isAdmin && activeTab === "managecoupons" && (
              <CouponManagement getLabel={getLabel} />
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

                <div className="change-password-section">
                  <button
                    className="change-password-toggle-btn"
                    onClick={togglePasswordFields}
                  >
                    {showPasswordFields
                      ? getLabel("Cancel Password Change")
                      : getLabel("Change Password")}
                  </button>

                  {showPasswordFields && (
                    <div className="password-fields">
                      <div>
                        <input
                          type="password"
                          name="old_password"
                          placeholder={getLabel("Enter old password")}
                          value={passwordValues.old_password}
                          onChange={handlePasswordChange}
                          required
                        />
                      </div>
                      <div>
                        <input
                          type="password"
                          name="new_password"
                          placeholder={getLabel("Enter new password")}
                          value={passwordValues.new_password}
                          onChange={handlePasswordChange}
                          required
                        />
                      </div>
                      <button
                        className="save-password-btn"
                        onClick={handleSavePassword}
                      >
                        {getLabel("Save Password")}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "editprofile" && !isAdmin && (
              <UserSubscriptions userType={userType} language={language} />
            )}

            {/* Normal User Tabs */}
            {!isAdmin && activeTab === "projects" && (
              <ProjectTab
                getLabel={getLabel}
                handleAddProjectClick={handleAddProjectClick}
                privacyFilter={privacyFilter}
                sortField={sortField}
                sortOrder={sortOrder}
                projects={projects}
                setSortOrder={setSortOrder}
                setSortField={setSortField}
                setPrivacyFilter={setPrivacyFilter}
                handleProjectClick={handleProjectClick}
                setProjects={setProjects}
              />
            )}
            {/* {!isAdmin && activeTab === "collaboratedprojects" && (
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
            {!isAdmin && activeTab === "collaboratedsurveys" && (
              <CollabSurveyTab
                language={language}
                //collaboratedProjects={collaboratedProjects}
                showCollabModal={showCollabModal}
                // collabRequests={collabRequests}
                setShowCollabModal={setShowCollabModal}
                // fetchCollaborationRequests={fetchCollaborationRequests}
                //handleAccept={handleAccept}
                //handleReject={handleReject}
                navigate={navigate}
              />
            )} */}
            {!isAdmin && activeTab === "shared" && (
              <Collab
                getLabel={getLabel}
                collaboratedProjects={collaboratedProjects}
                showCollabModal={showCollabModal}
                collabRequests={collabRequests}
                setShowCollabModal={setShowCollabModal}
                fetchCollaborationRequests={fetchCollaborationRequests}
                handleAccept={handleAccept}
                handleReject={handleReject}
                navigate={navigate}
               language={language}
              />
              )}
            {!isAdmin && activeTab === "questionbank" && (
              <div className="question-bank-section">
                <QB language={language} setLanguage={setLanguage} />
              </div>
            )}
               {!isAdmin && activeTab === "analysis" && (
              <div>
                <StatisticalAnalysisTool />
              </div>
            )}
            
          </div>
        </div>
      </div>

      {/* Premium Ad Banner - Only show for normal users */}
      {!isAdmin && userType === "normal" && showAdBanner && (
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
    </div>
  );
};

export default Dashboard;