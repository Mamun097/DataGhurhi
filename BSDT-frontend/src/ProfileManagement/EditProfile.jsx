import React, { useState, useRef, useEffect } from "react";
import {
  Pencil,
  Check,
  X,
  Camera,
  ChevronDown,
  ChevronUp,
  Save,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "./EditProfile.css";
import defaultprofile from "./default_dp.png";
import apiClient from "../api";
export default function EditProfile() {

  const [profileData, setProfileData] = useState({});
  const [profilePicUrl, setProfilePicUrl] = useState(null);
  const [editedValues, setEditedValues] = useState({});
  const [isEditingField, setIsEditingField] = useState(null);
  const [tempValue, setTempValue] = useState("");
  const [saveStatus, setSaveStatus] = useState("idle");
  const [openSections, setOpenSections] = useState({ basic: true, contact: true});
  const fileInputRef = useRef();

  //Fetch profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
    try {
      const response = await apiClient.get("/api/profile", {
        headers: { Authorization: "Bearer " + token },
      });
      console.log("Profile response:", response.data);
      if (response.status === 200) {
        setProfileData(response.data.user);
        setProfilePicUrl(response.data.user.image);
        setEditedValues(response.data.user);

        // Set user type and available tokens
        const currentUserType = response.data.user.user_type;
        localStorage.setItem("userType", currentUserType);
        localStorage.setItem("availableTokens",(response.data.user.available_token || 0));
        localStorage.setItem("userId", response.data.user.user_id);
      }} catch (err) {
        console.error("Error fetching profile:", err);
      }
    };
    fetchProfile();
  }, []);
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
  //  Handle edit click
  const handleEdit = (field) => {
    setIsEditingField(field);
    setTempValue(profileData[field] || "");
  };

  //  Handle cancel
  const handleCancel = () => {
    setIsEditingField(null);
    setTempValue("");
  };

  // Handle save single field 
  const handleSave = async (field) => {
    const updated = { ...profileData, [field]: tempValue };
    setProfileData(updated);
    setIsEditingField(null);

    try {
      await axios.put("/api/user/profile", { [field]: tempValue });
    } catch (err) {
      console.error("Error saving field:", err);
    }
  };

  // Toggle section collapse
  const handleToggle = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Handle profile picture upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("profilePic", file);

    try {
      const { data } = await axios.post("/api/user/profile/upload-pic", formData);
      setProfileData((prev) => ({ ...prev, profilePic: data.url }));
    } catch (err) {
      console.error("Image upload failed:", err);
    }
  };

  // Save full profile
  const handleSaveProfile = async () => {
    setSaveStatus("saving");
    try {
      await axios.put("/api/user/profile", profileData);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (err) {
      console.error("Error saving profile:", err);
      setSaveStatus("idle");
    }
  };

  const groupedFields = {
    basic: ["name", "gender", "date_of_birth", "religion"],
    contact: ["email", "contact_no", "home_address", "profile_link"],
    education: ["highest_education", "profession", "work_affiliation"],
    others: ["research_field"],
  };
  const getLabel = (field) => {
    const labels = {
      name: "Name",
      email: "Email",
      work_affiliation: "Work Affiliation",
      research_field: "Research Field",
      profession: "Profession",
      secret_question: "Secret Question",
      secret_answer: "Secret Answer",
      date_of_birth: "Date of Birth",
      highest_education: "Highest Education",
      gender: "Gender",
      home_address: "Home Address",
      contact_no: "Contact No",
      profile_link: "Profile Link",
      religion: "Religion",
    };
    return labels[field] || field;
  };

  const renderField = (field) => {
    const value = profileData[field] || "";
console.log(value);
    const isEditing = isEditingField === field;

    return (
      <div key={field} className="info-row">
        <span className="info-label">{getLabel(field)}:</span>

        {isEditing ? (
          field === "gender" ? (
            <select
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="edit-input"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          ) : (
            <input
              type={field === "date_of_birth" ? "date" : "text"}
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="edit-input"
              autoFocus
            />
          )
        ) : (
          <span className="info-value">{value || "-"}</span>
        )}

        <div className="edit-buttons">
          {isEditing ? (
            <>
              <button onClick={() => handleSave(field)} className="icon-btn save">
                <Check size={16} />
              </button>
              <button onClick={handleCancel} className="icon-btn cancel">
                <X size={16} />
              </button>
            </>
          ) : (
            <button onClick={() => handleEdit(field)} className="icon-btn edit">
              <Pencil size={16} />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="profile-layout-container">
      <h1 className="edit-page-title">Manage your personal info here</h1>

      <div className="info-cards-grid">
        {Object.entries(groupedFields).map(([section, fields]) => (
          <div className="card info-card" key={section}>
            <div
              className="card-header collapsible-header"
              onClick={() => handleToggle(section)}
            >
              <h2>
                {section === "basic"
                  ? "Basic Info"
                  : section === "contact"
                  ? "Contact"
                  : section === "education"
                  ? "Education & Work"
                  : "Other Details"}
              </h2>
              {openSections[section] ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
            </div>

            <AnimatePresence initial={false}>
              {openSections[section] && (
                <motion.div
                  className="profile-fields"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  {section === "basic" && (
                    <div className="basic-info-layout">
                      <div className="profile-pic-section">
                        <div className="profile-pic-wrapper-large">
                          <img
                            src={profileData.profilePic || defaultprofile}
                            alt="Profile"
                            className="profile-pic-large"
                          />
                          <button
                            className="edit-profile-pic-btn"
                            onClick={() => fileInputRef.current.click()}
                          >
                            <Camera size={20} />
                          </button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            style={{ display: "none" }}
                          />
                        </div>
                      </div>

                      <div className="basic-info-fields">
                        {fields.map((field) => renderField(field))}
                      </div>
                    </div>
                  )}

                  {section !== "basic" && (
                    <div className="info-fields">
                      {fields.map((field) => renderField(field))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <div className="save-profile-container">
        <button
          className={`save-profile-btn ${saveStatus === "saving" ? "saving" : ""}`}
          onClick={handleSaveProfile}
          disabled={saveStatus === "saving"}
        >
          {saveStatus === "saving" ? (
            <>Saving...</>
          ) : saveStatus === "saved" ? (
            <>
              <Check size={18} /> Saved
            </>
          ) : (
            <>
              <Save size={18} /> Save Profile
            </>
          )}
        </button>
      </div>
    </div>
  );
}
