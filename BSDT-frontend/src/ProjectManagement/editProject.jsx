import React, { useEffect, useState } from "react";
import axios from "axios";
import './createProject.css';
import { MdPublic } from "react-icons/md";
import { FaLock } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import NavbarAcholder from "./navbarproject";

const EditProject = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    field: "",
    description: "",
    privacy_mode: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch project details
  useEffect(() => {
    const fetchProject = async () => {
      // console.log("Fetching project with ID:", projectId);
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get(`http://localhost:2000/api/project/${projectId}`, {
                      headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.status === 200 && response.data?.project) {
          const { title, field, description, privacy_mode } = response.data.project;
          setFormData({
            title: title || "",
            field: field || "",
            description: description || "",
            privacy_mode: privacy_mode || "public",
          });
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching project:", error);
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  // Input handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit updated project
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:2000/api/project/${projectId}/update-project`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      alert("Project updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating project:", error);
      alert("Failed to update project.");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <NavbarAcholder />
      <div className="add-project-container">
        <div className="header-with-button">
          <h2>Project Details</h2>
          <button className="edit-toggle-btn" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? "Cancel" : "Edit"}
          </button>
        </div>

        <div className="project-form">
          {isEditing ? (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Project Name</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Field</label>
                <input
                  type="text"
                  name="field"
                  value={formData.field}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              <div className="visibility-section">
                <label>Visibility</label>
                <div className="visibility-options">
                  <label className="visibility-option">
                    <input
                      type="radio"
                      name="privacy_mode"
                      value="public"
                      checked={formData.privacy_mode === "public"}
                      onChange={handleChange}
                    />
                    <MdPublic className="visibility-icon" />
                    Public
                  </label>

                  <label className="visibility-option">
                    <input
                      type="radio"
                      name="privacy_mode"
                      value="private"
                      checked={formData.privacy_mode === "private"}
                      onChange={handleChange}
                    />
                    <FaLock className="visibility-icon" />
                    Private
                  </label>
                </div>
              </div>

              <button type="submit" className="submit-btn">
                Save Changes
              </button>
            </form>
          ) : (
            <div className="view-project">
              <p><strong>Project Name:</strong> {formData.title}</p>
              <p><strong>Field:</strong> {formData.field}</p>
              <p><strong>Description:</strong> {formData.description || <i>(none)</i>}</p>
              <p><strong>Privacy:</strong> {formData.privacy_mode}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default EditProject;
