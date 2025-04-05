//write code
import React from "react";
import axios from "axios";
import './createProject.css';
import { useState, useEffect } from 'react';
import { MdPublic } from "react-icons/md";
import { FaLock } from "react-icons/fa";
import NavbarAcholder from "./navbarAccountholder";


 
const AddProject = () => {
    const [formData, setFormData] = useState({
        title: '',
        field: '',
        description: '',
        privacy_mode: 'public'
      });
    
      // Handle input changes
      const handleChange = (e) => {
        setFormData({
          ...formData,
          [e.target.name]: e.target.value
        });
      };
    
  // Handle form submission
 const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Project Submitted:', formData);
        // Add logic for submitting project details

        try {
            const response = await axios.post('http://localhost:2000/api/project/create-project', formData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            console.log(response.data);
            alert('Project created successfully');
            window.location.href = '/dashboard';
        }
        catch (error) {
            console.error(error);
            alert('An error occurred while creating the project');
        }

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
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter project name"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="field">Field</label>
                <input
                  type="text"
                  id="field"
                  name="field"
                  value={formData.field}
                  onChange={handleChange}
                  placeholder="Enter field of project"
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
                        name="privacy_mode"
                        value="private"
                        checked={formData.privacy_mode=== 'private'}
                        onChange={handleChange}
                    />
                    <FaLock className="visibility-icon" />
                    <label htmlFor="private">Private</label>
                    </div>
                    

                    <div className="visibility-option">
                    <input
                        type="radio"
                        id="public"
                        name="privacy_mode"
                        value="public"
                        checked={formData.privacy_mode === 'public'}
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