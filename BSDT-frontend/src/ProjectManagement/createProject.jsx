//write code
import React from "react";
import './createProject.css';
import { useState } from 'react';
import { MdPublic } from "react-icons/md";
import { FaLock } from "react-icons/fa";
import NavbarAcholder from "./navbarAccountholder";


const AddProject = () => {
    const [formData, setFormData] = useState({
        projectName: '',
        description: '',
        visibility: 'public'
      });
    
      // Handle input changes
      const handleChange = (e) => {
        setFormData({
          ...formData,
          [e.target.name]: e.target.value
        });
      };
    
      // Handle form submission
      const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Project Submitted:', formData);
        // Add logic for submitting project details
      };
    
      return (
        <>
        <NavbarAcholder />
        <div className="add-project-container">
          <h2>Create a New Project</h2>
          <div className="project-form">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="projectName">Project Name</label>
                <input
                  type="text"
                  id="projectName"
                  name="projectName"
                  value={formData.projectName}
                  onChange={handleChange}
                  placeholder="Enter project name"
                  required
                />
              </div>
    
              <div className="form-group">
                <label htmlFor="description">Description (Optional)</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your project"
                ></textarea>
              </div>
    
              <div className="visibility-section">
                <label>Visibility</label>
                <div className="visibility-options">
                    <div className="visibility-option">
                    <input
                        type="radio"
                        id="private"
                        name="visibility"
                        value="private"
                        checked={formData.visibility === 'private'}
                        onChange={handleChange}
                    />
                    <FaLock className="visibility-icon" />
                    <label htmlFor="private">Private</label>
                    </div>
                    

                    <div className="visibility-option">
                    <input
                        type="radio"
                        id="public"
                        name="visibility"
                        value="public"
                        checked={formData.visibility === 'public'}
                        onChange={handleChange}
                    />
                    <MdPublic className="visibility-icon" />
                    <label htmlFor="public">Public</label>
                    </div>
                </div>
                <div className="visibility-description">
                    Choose whether you want the project to be public or private.
                </div>
                </div>

              <button type="submit" className="submit-btn">
                Create Project
              </button>
            </form>
          </div>
        </div>
        </>
      );
    };

export default AddProject;