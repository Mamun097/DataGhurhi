import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  Lock,
  Shield,
  ChevronUp,
  ChevronDown,
  Save,
  Pencil,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "./SecuritySettings.css";

export default function SecuritySettings() {
  const [openSections, setOpenSections] = useState({
    password: false,
    secret: false,
  });

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [securityData, setSecurityData] = useState({
    secret_question: "What was your first pet’s name?",
    secret_answer: "Tommy",
  });

  const [editingSecret, setEditingSecret] = useState(false);
  const [secretPassword, setSecretPassword] = useState("");
  const [showSecretPassword, setShowSecretPassword] = useState(false);
  const currentPassword = "userCurrentPassword123"; // Replace with backend value
  const [saveStatus, setSaveStatus] = useState("idle"); // idle, saving, success, error

// Toggle collapsible sections
  const handleToggle = (section) => {
  setOpenSections((prev) => {
    const newState = { ...prev, [section]: !prev[section] };

    // Reset states if section is being collapsed
    if (prev[section] && section === "password") {
      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
      setShowPassword({ current: false, new: false, confirm: false, secretConfirm: false });
    }
    if (prev[section] && section === "secret") {
      setEditingSecret(false);
      setSecretPassword("");
      setSaveStatus("idle");
    }

    return newState;
  });
};


  const handleChange = (e, setter) => {
    const { name, value } = e.target;
    setter((prev) => ({ ...prev, [name]: value }));
  };

  const handleSavePassword = () => {
    if (
      !passwordData.current_password ||
      !passwordData.new_password ||
      !passwordData.confirm_password
    ) {
      alert("Please fill all password fields");
      return;
    }
    if (passwordData.new_password !== passwordData.confirm_password) {
      alert("New password and confirm password do not match");
      return;
    }
    alert("Password updated successfully!");
    setPasswordData({ current_password: "", new_password: "", confirm_password: "" });
    setShowPassword({ current: false, new: false, confirm: false });
  };

  const handleSaveSecret = () => {
    if (secretPassword !== currentPassword) {
      alert("Incorrect current password!");
      return;
    }
    setEditingSecret(false);
    setSecretPassword("");
    alert("Secret question updated!");
  };

  return (
    <div className="background-container">
      <div className="profile-wrapper">
        <h1 className="sec-page-title">Manage your security settings</h1>

        <div className="security-cards-grid">
          {/* Change Password Card */}
          <div className="card password-card">
            <div className="card-header collapsible-header" onClick={() => handleToggle("password")}>
              <h2>
                <Lock size={20} className="icon-inline" /> Change Password
              </h2>
              {openSections.password ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
            </div>

            <AnimatePresence initial={false}>
              {openSections.password && (
                <motion.div
                  className="security-fields"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  
                  {[
                    { label: "Current Password", name: "current_password", stateKey: "current" },
                    { label: "New Password", name: "new_password", stateKey: "new" },
                    { label: "Confirm Password", name: "confirm_password", stateKey: "confirm" },
                  ].map((field) => (
                    <div className="security-field" key={field.name}>
                      <label>{field.label}:</label>
                      <div className="input-with-eye">
                        <input
                          type={showPassword[field.stateKey] ? "text" : "password"}
                          name={field.name}
                          value={passwordData[field.name]}
                          onChange={(e) => handleChange(e, setPasswordData)}
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                        />
                        <button
                          type="button"
                          className="toggle-eye-btn"
                          onClick={() =>
                            setShowPassword((prev) => ({
                              ...prev,
                              [field.stateKey]: !prev[field.stateKey],
                            }))
                          }
                        >
                          {showPassword[field.stateKey] ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="save-profile-container">
                    <button className="save-profile-btn" onClick={handleSavePassword}>
                      <Save size={18} /> Update Password
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Secret Question Card */}
          <div className="card secret-card">
            <div className="card-header collapsible-header" onClick={() => handleToggle("secret")}>
              <h2 className="card-title">
                <Shield size={20} className="icon-inline" /> Secret Question & Answer
              </h2>
              {openSections.secret ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
            </div>

            <AnimatePresence initial={false}>
              {openSections.secret && (
                <motion.div
                  className="security-fields"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  {!editingSecret ? (
                    <button className="edit-profile-btn" onClick={() => setEditingSecret(true)}>
                      <Pencil size={16} /> Edit Secret Question
                    </button>
                  ) : (
                    <>
                      <div className="security-field ">
                        <label>Enter Current Password:</label>
                        <div className="input-with-eye">
                        <input
                          type={showSecretPassword ? "text" : "password"}
                          value={secretPassword}
                          onChange={(e) => setSecretPassword(e.target.value)}
                          placeholder="Current password"
                        />
                        <button
                          type="button"
                          className="toggle-eye-btn"
                          onClick={() => setShowSecretPassword((prev) => !prev)}
                        >
                          {showSecretPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                        </div>
                      </div>

                      {secretPassword === currentPassword && (
                        <>
                          <div className="security-field">
                            <label>Secret Question:</label>
                            <input
                              type="text"
                              value={securityData.secret_question}
                              onChange={(e) =>
                                setSecurityData((prev) => ({
                                  ...prev,
                                  secret_question: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <div className="security-field">
                            <label>Secret Answer:</label>
                            <input
                              type="text"
                              value={securityData.secret_answer}
                              onChange={(e) =>
                                setSecurityData((prev) => ({
                                  ...prev,
                                  secret_answer: e.target.value,
                                }))
                              }
                            />
                          </div>

                          <div className="edit-buttons">
                            <button onClick={handleSaveSecret} className="save-profile-btn">
                              Confirm
                            </button>
                            <button onClick={() => setEditingSecret(false)} className="cancel-btn">
                              Cancel
                            </button>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
