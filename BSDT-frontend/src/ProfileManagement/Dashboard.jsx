// FIXED VERSION - Key changes marked with // FIX comments

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
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
import ProjectDetailsTab from "./../ProjectManagement/editProject";
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
  ChevronUp,
  ChevronDown,
  Menu,
  ChartColumn,
  Folder,
  FileText,
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
  const getTabFromURL = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("tab");
  };

  const getProjectIdFromURL = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("projectId");
  };

  const getSurveyIdFromURL = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("surveyId");
  };

  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState(getTabFromURL() || "projects");
  const [sourceTab, setSourceTab] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(
    getProjectIdFromURL()
  );
  const [selectedSurveyId, setSelectedSurveyId] = useState(
    getSurveyIdFromURL()
  );
  const [privacyFilter, setPrivacyFilter] = useState("all");
  const [sortField, setSortField] = useState("title");
  const [sortOrder, setSortOrder] = useState("asc");
  const [isEditing, setIsEditing] = useState(false);
  const [editedValues, setEditedValues] = useState({});
  const [projects, setProjects] = useState([]);
  const [projectSurveys, setProjectSurveys] = useState({});
  const [expandedProjects, setExpandedProjects] = useState(new Set());
  const [expandedMainTabs, setExpandedMainTabs] = useState(
    new Set(["projects"])
  );
  const [language, setLanguage] = useState(
    localStorage.getItem("language") || "English"
  );
  const [translatedLabels, setTranslatedLabels] = useState({});
  const [showCollabModal, setShowCollabModal] = useState(false);

  // FIX 1: Initialize userType from localStorage immediately - using "user_type" key
  const userId = localStorage.getItem("userId");
  const [userType, setUserType] = useState(
    localStorage.getItem("user_type") || "normal"
  );

  // FIX 2: Add isAdmin state and initialize it properly
  const [isAdmin, setIsAdmin] = useState(false);

  // FIX 3: Admin states
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    activeSurveys: 0,
    totalResponses: 0,
    premiumUsers: 0,
    recentActivities: [],
  });

  // FIX 4: Update userType whenever it changes in localStorage - using "user_type" key
  useEffect(() => {
    const storedUserType = localStorage.getItem("user_type");
    console.log("Checking user_type from localStorage:", storedUserType); // Debug log
    if (storedUserType) {
      setUserType(storedUserType);
    }
  }, [userId]);

  // FIX 5: Set isAdmin based on userType changes
  useEffect(() => {
    console.log("Current userType:", userType); // Debug log
    const adminStatus = userType === "admin";
    setIsAdmin(adminStatus);

    // Set initial tab based on user type
    if (!getTabFromURL()) {
      setActiveTab(adminStatus ? "dashboard" : "projects");
    }

    // Fetch admin stats if user is admin
    if (adminStatus) {
      fetchAdminStats();
    }
  }, [userType]);

  // Sync state with URL parameters whenever location changes
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tab = urlParams.get("tab");
    const projectId = urlParams.get("projectId");
    const surveyId = urlParams.get("surveyId");
    const source = urlParams.get("source");

    if (tab) {
      setActiveTab(tab);
    }
    if (source) {
      setSourceTab(source);
    } else if (tab !== "projectdetails" && tab !== "surveydetails") {
      setSourceTab(null);
    }
    if (projectId) {
      setSelectedProjectId(projectId);
    } else {
      setSelectedProjectId(null);
    }
    if (surveyId) {
      setSelectedSurveyId(surveyId);
    } else {
      setSelectedSurveyId(null);
    }
  }, [location.search]);

  const handleAccept = async (projectId) => {
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
        fetchCollaborationRequests();
        fetchCollaboratedProjects();
      }
    } catch (error) {
      console.error("Failed to accept invitation:", error);
    }
  };

  const handleReject = async (projectId) => {
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
        fetchCollaborationRequests();
      }
    } catch (error) {
      console.error("Failed to reject invitation:", error);
    }
  };

  // Premium feature states
  const [showAdBanner, setShowAdBanner] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

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

  const fetchAdminStats = useCallback(async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await apiClient.get("/api/admin/stats");
      if (response.status === 200) {
        setAdminStats(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch admin stats:", error);
    }
  }, []);

  const toggleMainTabExpansion = (tabKey, e) => {
    e.stopPropagation();
    setExpandedMainTabs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(tabKey)) {
        newSet.delete(tabKey);
      } else {
        newSet.add(tabKey);
      }
      return newSet;
    });
  };

  // FIX 6: Remove the problematic getuserType function - it's no longer needed
  // The logic is now handled by the useEffect hooks above

  const handleTabClick = (tabKey) => {
    setActiveTab(tabKey);
    const url = new URL(window.location);
    url.searchParams.set("tab", tabKey);
    url.searchParams.delete("projectId");
    url.searchParams.delete("surveyId");
    url.searchParams.delete("source");
    window.history.replaceState({}, "", url);
  };

  const handleProjectClick = (projectId) => {
    setSelectedProjectId(projectId);
    setSelectedSurveyId(null);
    setActiveTab("projectdetails");
    setSourceTab("projects");

    setExpandedMainTabs((prev) => {
      const newSet = new Set(prev);
      newSet.add("projects");
      return newSet;
    });

    const url = new URL(window.location);
    url.searchParams.set("tab", "projectdetails");
    url.searchParams.set("projectId", projectId);
    url.searchParams.delete("surveyId");
    url.searchParams.set("source", "projects");
    window.history.replaceState({}, "", url);
  };

  const handleSurveyClick = (projectId, surveyId, survey, surveyTitle) => {
    setSelectedProjectId(projectId);
    setSelectedSurveyId(surveyId);

    setExpandedMainTabs((prev) => {
      const newSet = new Set(prev);
      newSet.add("projects");
      return newSet;
    });

    setExpandedProjects((prev) => {
      const newSet = new Set(prev);
      newSet.add(projectId);
      return newSet;
    });

    navigate(`/view-survey/${surveyId}`, {
      state: {
        project_id: projectId,
        survey_details: survey,
        input_title: surveyTitle || "Untitled Survey",
      },
    });
  };

  const refreshProjectSurveys = useCallback((projectId) => {
    fetchProjectSurveys(projectId);
  }, []);

  const toggleProjectExpansion = (projectId, e) => {
    e.stopPropagation();
    setExpandedProjects((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  const fetchProjectSurveys = async (projectId) => {
    const token = localStorage.getItem("token");
    try {
      const response = await apiClient.get(
        `/api/project/${projectId}/surveys`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      if (response.status === 200) {
        setProjectSurveys((prev) => ({
          ...prev,
          [projectId]: response.data.surveys || [],
        }));
      }
    } catch (error) {
      console.error("Error fetching surveys for project:", error);
    }
  };

  const toggleEdit = () => setIsEditing(!isEditing);

  const handleInputChange = (e) => {
    setEditedValues({ ...editedValues, [e.target.name]: e.target.value });
  };

  const handleSaveChanges = async () => {
    const token = localStorage.getItem("token");
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

  useEffect(() => {
    if (!isAdmin && projects.length > 0) {
      projects.forEach((project) => {
        fetchProjectSurveys(project.project_id);
      });
    }
  }, [projects, isAdmin]);

  const handleAddProjectClick = () => navigate("/addproject");

  const handleBackToProjects = () => {
    setSelectedProjectId(null);
    setSelectedSurveyId(null);
    const targetTab = sourceTab || "projects";
    setActiveTab(targetTab);
    setSourceTab(null);
    const url = new URL(window.location);
    url.searchParams.delete("projectId");
    url.searchParams.delete("surveyId");
    url.searchParams.delete("source");
    url.searchParams.set("tab", targetTab);
    window.history.replaceState({}, "", url);
  };

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
      }
    } catch (error) {
      console.error("Failed to fetch collaboration requests:", error);
    }
  }, []);

  useEffect(() => {
    fetchCollaborationRequests();
  }, []);

  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getTabs = () => {
    if (isAdmin) {
      return [
        {
          label: "Dashboard",
          key: "dashboard",
          icon: <LayoutDashboard size={18} />,
        },
        {
          label: "Customize Packages",
          key: "customizepackages",
          icon: <Package size={18} />,
        },
        {
          label: "Manage Coupons",
          key: "managecoupons",
          icon: <TicketPercent size={18} />,
        },
        { label: "My Profile", key: "editprofile", icon: <User size={18} /> },
      ];
    } else {
      const sortedProjects = [...projects].sort((a, b) =>
        a.title.localeCompare(b.title, undefined, { sensitivity: "base" })
      );

      return [
        {
          label: "Projects",
          key: "projects",
          icon: <FolderKanban size={18} />,
          hasDropdown: sortedProjects.length > 0,
          children: sortedProjects.map((project) => {
            const projectSurveysList = projectSurveys[project.project_id] || [];

            const sortedSurveys = [...projectSurveysList].sort((a, b) =>
              a.title.localeCompare(b.title, undefined, { sensitivity: "base" })
            );

            return {
              label: project.title,
              key: `project-${project.project_id}`,
              projectId: project.project_id,
              icon: <Folder size={16} />,
              hasDropdown: sortedSurveys.length > 0,
              children: sortedSurveys.map((survey) => ({
                label: survey.title,
                key: `survey-${survey.survey_id}`,
                surveyId: survey.survey_id,
                projectId: project.project_id,
                icon: <FileText size={14} />,
              })),
            };
          }),
        },
        {
          label: "Shared with Me",
          key: "shared",
          icon: <Users size={18} />,
          badge: collabRequests.length,
        },
        {
          label: "Question Bank",
          key: "questionbank",
          icon: <Package size={18} />,
        },
        {
          label: "Analysis",
          key: "analysis",
          icon: <ChartColumn size={18} />,
        },
        {
          label: "Saved Files",
          key: "saved-files",
          icon: <Folder size={18} />,
        },
        {
          label: "Premium Packages",
          key: "premiumpackages",
          icon: <Crown size={18} />,
        },
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

  const renderMenuItem = (item, level = 0) => {
    const isProjectExpanded = expandedProjects.has(item.projectId);
    const isMainTabExpanded = expandedMainTabs.has(item.key);

    let isActive = false;

    if (item.surveyId) {
      isActive = selectedSurveyId === item.surveyId;
    } else if (item.projectId) {
      isActive =
        selectedProjectId === item.projectId &&
        activeTab === "projectdetails" &&
        !selectedSurveyId;
    } else {
      if (item.key === "projects") {
        isActive = activeTab === "projects";
      } else {
        isActive = item.key === activeTab;
      }
    }

    const isMainTabWithChildren =
      level === 0 && item.hasDropdown && item.children;
    const hasChildren = item.children && item.children.length > 0;

    return (
      <li
        key={item.key}
        style={{ marginLeft: level === 0 ? "0" : `${level * 12}px` }}
      >
        <div className="tooltip-container">
          <button
            className={`sidebar-btn nested-level-${level} ${
              isActive ? "active" : ""
            } ${collapsed ? "collapsed" : ""}`}
            onClick={() => {
              if (item.key === "premiumpackages") {
                setShowPremiumModal(true);
              } else if (item.key === "saved-files") {
                navigate("/saved-files");
              } else if (item.projectId && !item.surveyId) {
                handleProjectClick(item.projectId);
              } else if (item.surveyId) {
                const project = projects.find(
                  (p) => p.project_id === item.projectId
                );
                const survey = projectSurveys[item.projectId]?.find(
                  (s) => s.survey_id === item.surveyId
                );
                handleSurveyClick(
                  item.projectId,
                  item.surveyId,
                  survey,
                  item.label
                );
              } else {
                handleTabClick(item.key);
              }
            }}
          >
            <span className="icon">{item.icon}</span>
            {!collapsed && !isMobile && (
              <>
                <span className="label">{item.label}</span>
                {isMainTabWithChildren && (
                  <span
                    className="dropdown-toggle"
                    onClick={(e) => toggleMainTabExpansion(item.key, e)}
                  >
                    {isMainTabExpanded ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </span>
                )}
                {hasChildren && !isMainTabWithChildren && (
                  <span
                    className="dropdown-toggle"
                    onClick={(e) => toggleProjectExpansion(item.projectId, e)}
                  >
                    {isProjectExpanded ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </span>
                )}
              </>
            )}
            {item.badge > 0 && (
              <span className="notification-badge">{item.badge}</span>
            )}
          </button>

          {(window.innerWidth <= 768 || (collapsed && !isMobile)) && (
            <span className="tooltip-text">{item.label}</span>
          )}
        </div>

        {!collapsed && isMainTabExpanded && isMainTabWithChildren && (
          <ul className="nested-menu">
            {item.children.map((child) => renderMenuItem(child, level + 1))}
          </ul>
        )}

        {!collapsed &&
          isProjectExpanded &&
          hasChildren &&
          !isMainTabWithChildren && (
            <ul className="nested-menu">
              {item.children.map((child) => renderMenuItem(child, level + 1))}
            </ul>
          )}
      </li>
    );
  };

  // FIX 7: Add console log to help debug
  console.log(
    "Dashboard render - isAdmin:",
    isAdmin,
    "userType:",
    userType,
    "activeTab:",
    activeTab
  );

  return (
    <div style={{ paddingTop: "80px" }}>
      <NavbarAcholder
        language={language}
        setLanguage={setLanguage}
        isAdmin={isAdmin}
        userType={userType}
      />

      <div
        className={`dashboard-container ${isAdmin ? "admin-dashboard" : ""}`}
      >
        <div className="dashboard-layout">
          <div
            className={`sidebar-menu ${isMobile ? "mobile-horizontal" : ""} ${
              collapsed ? "collapsed" : ""
            }`}
          >
            {!isMobile && (
              <div className="sidebar-header">
                <button
                  className={`menu-toggle-btn ${!collapsed ? "active" : ""}`}
                  onClick={() => setCollapsed(!collapsed)}
                  aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                  <span></span>
                  <span></span>
                  <span></span>
                </button>
              </div>
            )}

            {!collapsed && isAdmin && !isMobile && (
              <div className="admin-badge">
                <span>👑 Administrator</span>
              </div>
            )}

            <ul className={`sidebar-list ${isMobile ? "horizontal" : ""}`}>
              {getTabs().map((tab) => renderMenuItem(tab))}
            </ul>
          </div>

          <div
            className={`projects-section ${
              collapsed ? "sidebar-collapsed" : ""
            }`}
          >
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

            {/* Projects Tab */}
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
                fetchProjects={fetchProjects}
              />
            )}

            {/* Project Details Tab */}
            {!isAdmin &&
              activeTab === "projectdetails" &&
              selectedProjectId && (
                <ProjectDetailsTab
                  key={`${selectedProjectId}-${sourceTab}-${location.search}`}
                  projectId={selectedProjectId}
                  getLabel={getLabel}
                  language={language}
                  onBack={handleBackToProjects}
                  handleReject={handleReject}
                  onSurveyDeleted={() =>
                    refreshProjectSurveys(selectedProjectId)
                  }
                />
              )}

            {/* Shared with Me Tab */}
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
                fetchCollaboratedProjects={fetchCollaboratedProjects}
              />
            )}

            {/* Question Bank Tab */}
            {!isAdmin && activeTab === "questionbank" && (
              <QB language={language} setLanguage={setLanguage} />
            )}

            {/* Analysis Tab */}
            {!isAdmin && activeTab === "analysis" && (
              <div>
                <StatisticalAnalysisTool />
              </div>
            )}
          </div>
        </div>
      </div>

      {!isAdmin && userType === "normal" && showAdBanner && (
        <PremiumAdBanner
          onClose={handleCloseAdBanner}
          onCheckoutClick={handleCheckoutClick}
          getLabel={getLabel}
        />
      )}

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
