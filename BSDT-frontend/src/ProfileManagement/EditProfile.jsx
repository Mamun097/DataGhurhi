import React, { useState, useRef } from "react";
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

export default function EditProfile() {
  const fileInputRef = useRef(null);
  const [profilePic, setProfilePic] = useState(defaultprofile);

  const [info, setInfo] = useState({
    name: "Swarnali Saha",
    email: "swarnalisaha311220@gmail.com",
    work_affiliation: "DataGhurhi Research Lab",
    research_field: "Human–Computer Interaction",
    profession: "Research Assistant",
    date_of_birth: "2000-12-31",
    highest_education: "B.Sc in Computer Science and Engineering",
    gender: "Female",
    home_address: "Dhaka, Bangladesh",
    contact_no: "01601-819956",
    profile_link: "https://dataghurhi.com/swarnali",
    religion: "Hinduism",
  });

  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState("");
  const [openSections, setOpenSections] = useState({
    basic: true,
    contact: true,
    education: false,
    others: false,
  });

  const [saveStatus, setSaveStatus] = useState("idle");

  const handleToggle = (section) =>
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setProfilePic(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = (field) => {
    setEditingField(field);
    setTempValue(info[field]);
  };

  const handleSave = (field) => {
    setInfo((prev) => ({ ...prev, [field]: tempValue }));
    setEditingField(null);
  };

  const handleCancel = () => setEditingField(null);

  const handleSaveProfile = () => {
    setSaveStatus("saving");
    setTimeout(() => {
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 1500);
    }, 1000);
  };

  const groupedFields = {
    basic: ["name", "gender", "date_of_birth", "religion"],
    contact: ["email", "contact_no", "home_address", "profile_link"],
    education: ["highest_education", "profession", "work_affiliation"],
    others: ["research_field"],
  };

  const getLabel = (field) =>
    field
      ? field.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
      : "";

  const renderField = (field) => {
    const value = info[field] || "-";
    const isEditing = editingField === field;

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
          <span className="info-value">{value}</span>
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
              {openSections[section] ? (
                <ChevronUp size={22} />
              ) : (
                <ChevronDown size={22} />
              )}
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
                            src={profilePic}
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
