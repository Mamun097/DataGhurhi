import React, { useState, useEffect } from "react";
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
import NavbarAcholder from "../ProfileManagement/navbarAccountholder";
import apiClient from "../api";
import { use } from "react";

export default function SecuritySettings() {
  const [language, setLanguage] = useState(localStorage.getItem("language") || "en");
  const [openSections, setOpenSections] = useState({ password: false, secret: false });

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
    secret_question: "",
    secret_answer: "",
  });

  const [editingSecret, setEditingSecret] = useState(false);
  const [secretPassword, setSecretPassword] = useState("");
  const [showSecretQA, setShowSecretQA] = useState(false);
  const currentPassword = "userCurrentPassword123"; // Replace with backend value
  const [saveStatus, setSaveStatus] = useState("idle");
  const [passwordError, setPasswordError] = useState("");



  const handleMatchCurrentPassword = async (inputPassword) => {
    try {
        const token = localStorage.getItem("token");
        const response = await apiClient.post("/api/profile/match-password", { password: inputPassword }, {
          headers: { Authorization: `Bearer ${token}` },

        });
        if (response.status==200) {
          setShowSecretQA(true);
          fetchSecretQA();
        }
      } catch (error) {
        console.error("Error fetching secret question and answer:", error);
      }
    };

    // Fetch current secret question and answer from backend
    const fetchSecretQA = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await apiClient.get("/api/profile/get-secret-question", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.status==200) {
          console.log(response.data);
          setSecurityData({
            secret_question: response.data.secret_question,
            secret_answer: response.data.secret_answer,
          });
        }
      } catch (error) {
        console.error("Error fetching secret question and answer:", error);
      }
    };



  
  // Toggle collapsible sections
  const handleToggle = (section) => {
    setOpenSections((prev) => {
      const newState = { ...prev, [section]: !prev[section] };

      // Reset states if section is being collapsed
      if (prev[section] && section === "password") {
        setPasswordData({ current_password: "", new_password: "", confirm_password: "" });
        setShowPassword({ current: false, new: false, confirm: false });
        setPasswordError("");
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

  // Password validation function
  const validatePassword = (password) => {
    const regex = /^(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/;
    return regex.test(password);
  };

  const handleSavePassword = async () => {
    setPasswordError("");

    if (!passwordData.current_password || !passwordData.new_password || !passwordData.confirm_password) {
      setPasswordError("Please fill all password fields.");
      return;
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }

    if (!validatePassword(passwordData.new_password)) {
      setPasswordError("Password must be at least 8 characters long, include a number and a special character.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await apiClient.put(
        "/api/profile/update-password",
        {
          oldPassword: passwordData.current_password,
          newPassword: passwordData.new_password,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert("Password updated successfully!");
        setPasswordData({ current_password: "", new_password: "", confirm_password: "" });
        setShowPassword({ current: false, new: false, confirm: false });
      } else {
        setPasswordError(response.data.message || "Password update failed.");
      }
    } catch (error) {
      console.error("Password change error:", error);
      setPasswordError("An error occurred while changing the password.");
    }
  };

  const handleSaveSecret = async () => {
     const token = localStorage.getItem("token");
     try{
      const response = await apiClient.put(
        "/api/profile/update-secret-question",
        {
          secret_question: securityData.secret_question,
          secret_answer: securityData.secret_answer,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status==200) {
          setEditingSecret(false);
          setSecretPassword("");
          setShowSecretQA(false);
          alert("Secret question updated!");
      }
    } catch (error) {
      console.error("Secret question update error:", error);
      alert("An error occurred while updating the secret question.");
    }
    
  };

  return (
    <div style={{ paddingTop: "80px" }}>
      <NavbarAcholder language={language} setLanguage={setLanguage} />

      <div className="sec-background-container">
        <div className="sec-profile-wrapper">
          <h1 className="sec-page-title">Manage your security settings</h1>

          <div className="security-cards-grid">
            {/* PASSWORD CARD */}
            <div className="sec-card password-card">
              <div className="sec-card-header" onClick={() => handleToggle("password")}>
                <h2><Lock size={20} /> Change Password</h2>
                {openSections.password ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
              </div>

              <AnimatePresence initial={false}>
                {openSections.password && (
                  <motion.div
                    className="security-fields"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {[
                      { label: "Current Password", name: "current_password", key: "current" },
                      { label: "New Password", name: "new_password", key: "new" },
                      { label: "Confirm Password", name: "confirm_password", key: "confirm" },
                    ].map((f) => (
                      <div className="security-field" key={f.name}>
                        <label>{f.label}:</label>
                        <div className="input-with-eye">
                          <input
                            type={showPassword[f.key] ? "text" : "password"}
                            name={f.name}
                            value={passwordData[f.name]}
                            onChange={(e) => handleChange(e, setPasswordData)}
                            placeholder={`Enter ${f.label.toLowerCase()}`}
                          />
                          <span
                            className="toggle-eye-btn"
                            onClick={() =>
                              setShowPassword((prev) => ({ ...prev, [f.key]: !prev[f.key] }))
                            }
                          >
                            {showPassword[f.key] ? <EyeOff size={18} /> : <Eye size={18} />}
                          </span>
                        </div>
                      </div>
                    ))}

                    {passwordError && <p className="error-text">{passwordError}</p>}

                    <div className="save-profile-container">
                      <button className="save-profile-btn" onClick={handleSavePassword}>
                        <Save size={18} /> Update Password
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* SECRET QUESTION CARD */}
            <div className="sec-card secret-card">
              <div className="sec-card-header" onClick={() => handleToggle("secret")}>
                <h2><Shield size={20} /> Secret Question & Answer</h2>
                {openSections.secret ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
              </div>

              <AnimatePresence initial={false}>
                {openSections.secret && (
                  <motion.div
                    className="security-fields"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {!editingSecret ? (
                      <button className="edit-profile-btn" onClick={() => setEditingSecret(true)}>
                        <Pencil size={16} /> Edit Secret Question
                      </button>
                    ) : (
                      <>
                        <div className="security-field">
                          {!showSecretQA &&(
                            <>
                            <label>Enter Current Password:</label>
                          <div className="input-with-eye">
                            <input
                              type={showPassword ? "text" : "password"}
                              value={secretPassword}
                              onChange={(e) => setSecretPassword(e.target.value)}
                              placeholder="Current password"
                            />
                            <span
                              
                              className="toggle-eye-btn"
                              onClick={() => setShowPassword((p) => !p)}
                            >
                              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </span>
                          </div>
                          <button
                            className="verify-password-btn"
                            onClick={() => handleMatchCurrentPassword(secretPassword)}
                          > Verify Password
                          </button>
                          </>)}
                        </div>
                        

                        {showSecretQA && (
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
                              <button onClick={handleSaveSecret} className="sec-confirm-btn">
                                Confirm
                              </button>
                              <button onClick={() => setEditingSecret(false)} className="sec-cancel-btn">
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
    </div>
  );
}
