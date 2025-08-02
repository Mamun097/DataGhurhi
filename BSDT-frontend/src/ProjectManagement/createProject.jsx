import { useCallback } from "react";
//write code
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./createProject.css";
import { MdPublic } from "react-icons/md";
import { FaLock } from "react-icons/fa";
import NavbarAcholder from "../ProfileManagement/navbarAccountholder";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import apiClient from "../api";

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

const AddProject = () => {
  const [formData, setFormData] = useState({
    title: "",
    field: "",
    description: "",
    privacy_mode: "public",
  });
const navigate = useNavigate();

  const [language, setLanguage] = useState(
    localStorage.getItem("language") || "English"
  );
  const [translatedLabels, setTranslatedLabels] = useState({});


  const loadTranslations = useCallback(async () => {
    if (language === "English") {
      setTranslatedLabels({});
      return;
    }

    const labels = [
      "Create a New Project",
      "Project Name",
      "Enter project name",
      "Research Field",
      "Enter field of project",
      "Description (Optional)",
      "Describe your project",
      "Visibility",
      "Private",
      "Public",
      "Choose whether you want the project to be public or private.",
      "Create Project",
      "Project created successfully",
      "An error occurred while creating the project",
      "Cancel",
    ];

    const translated = await translateText(labels, "bn");
    const keys = [
      "heading",
      "projectName",
      "projectPlaceholder",
      "field",
      "fieldPlaceholder",
      "description",
      "descriptionPlaceholder",
      "visibility",
      "private",
      "public",
      "visibilityDesc",
      "submit",
      "successToast",
      "errorToast",
      "cancel",
    ];

    const translations = {};
    keys.forEach((key, idx) => {
      translations[key] = translated[idx];
    });

    setTranslatedLabels(translations);
  }, [language]);

  useEffect(() => {
    loadTranslations();
  }, [language, loadTranslations]);

  const getLabel = (eng, key) =>
    language === "English" ? eng : translatedLabels[key] || eng;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.post(
        "/api/project/create-project",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 201) {
        toast.success(
          `✅ ${getLabel("Project created successfully", "successToast")}`
        );
        setTimeout(() => (navigate("/dashboard?tab=projects")), 3000);
      }
    } catch (error) {
      console.error(error);
      toast.error(
        `❌ ${getLabel(
          "An error occurred while creating the project",
          "errorToast"
        )}`
      );
    }
  };

  return (
    <>
      <NavbarAcholder language={language} setLanguage={setLanguage} />
      <div className="add-project-container">
        <h2>{getLabel("Create a New Project", "heading")}</h2>
        <div className="project-form">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">
                {getLabel("Project Name", "projectName")}
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder={getLabel(
                  "Enter project name",
                  "projectPlaceholder"
                )}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="field">{getLabel("Research Field", "field")}</label>
              <input
                type="text"
                id="field"
                name="field"
                value={formData.field}
                onChange={handleChange}
                placeholder={getLabel(
                  "Enter field of project",
                  "fieldPlaceholder"
                )}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">
                {getLabel("Description (Optional)", "description")}
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder={getLabel(
                  "Describe your project",
                  "descriptionPlaceholder"
                )}
              ></textarea>
            </div>

            <div className="visibility-section">
              <label>{getLabel("Visibility", "visibility")}</label>
              <div className="visibility-options">
                <div className="visibility-option">
                  <input
                    type="radio"
                    id="private"
                    name="privacy_mode"
                    value="private"
                    checked={formData.privacy_mode === "private"}
                    onChange={handleChange}
                  />
                  <FaLock className="visibility-icon" />
                  <label htmlFor="private">
                    {getLabel("Private", "private")}
                  </label>
                </div>

                <div className="visibility-option">
                  <input
                    type="radio"
                    id="public"
                    name="privacy_mode"
                    value="public"
                    checked={formData.privacy_mode === "public"}
                    onChange={handleChange}
                  />
                  <MdPublic className="visibility-icon" />
                  <label htmlFor="public">{getLabel("Public", "public")}</label>
                </div>
              </div>
              <div className="visibility-description">
                {getLabel(
                  "Choose whether you want the project to be public or private.",
                  "visibilityDesc"
                )}
              </div>
            </div>

            <button type="submit" className="submit-btn">
              {getLabel("Create Project", "submit")}
            </button>
            <button type="button" className="cancel-btn" onClick={() => navigate("/dashboard?tab=projects")}>
              {getLabel("Cancel", "cancel")}
            </button>
          </form>
        </div>
        <ToastContainer position="top-center" autoClose={4000} />
      </div>
    </>
  );
};

export default AddProject;
