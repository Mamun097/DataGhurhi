import React, { useState } from "react";
import axios from "axios";
import { useCallback, useEffect } from "react";
import { supabase } from '../../db';
import NavbarAcholder from "./navbarAccountholder"; // Ensure correct import
import "./Dashboard.css";

const publicProjects = [
  {
    name: "AI Chatbot",
    owner: "Alice Smith",
    description: "An AI-powered chatbot for customer support.",
  },
  {
    name: "E-Commerce Platform",
    owner: "John Doe",
    description: "A full-stack e-commerce solution with payments.",
  },
  {
    name: "Smart Home Automation",
    owner: "Sarah Johnson",
    description: "Control your smart home with AI voice commands.",
  },
];

const trendingTopics = [
  "AI in Healthcare",
  "Web3 & Blockchain",
  "Edge Computing",
  "Quantum Computing",
  "Augmented Reality",
];

const Dashboard = () => {
    const [profilePicUrl, setProfilePicUrl] = useState(null);
    const [values, setValues] = useState({});

  const handleImageUpload = async (event, type) => {
    const file = event.target.files[0];
    if (!file) return;

    
    try {
      const { data, error } = await supabase.storage
      .from('media')  // Use the correct bucket name: 'media'
      .upload(`profile_pics/${file.name}`, file, {
          upsert: true, // Update the file if it already exists
        }
      ); 

    if (error) {
      console.error("Upload failed:", error.message);
      return;
    }
    const urlData =  supabase
    .storage
    .from('media')
    .getPublicUrl(`profile_pics/${file.name}`);

    console.log("publicURL",urlData.data.publicUrl);
 // Update the profile or cover picture URL in the database
    await updateImageInDB(type, urlData.data.publicUrl);

       
    
    console.log(`${type} picture URL:`, urlData.data.publicUrl);
  // After updating the profile, fetch the new profile data
    getProfile();
     
    } catch (error) {
      console.error(`Upload failed for ${type} picture:`, error);
    }
  };


  const updateImageInDB = async (type, imageUrl) => {
    console.log("imageUrl",imageUrl);
    const token = localStorage.getItem("token");
    

    try {
      await axios.put(
        "http://localhost:2000/api/profile/update-profile-image",
          {imageUrl},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log(`${type} image updated in database.`);
    } catch (error) {
      console.error(`Failed to update ${type} image in DB:`, error);
    }
  };

  // const handleCoverPicChange = (event) => {
  //   const file = event.target.files[0];
  //   if (file) {
  //     setCoverPic(URL.createObjectURL(file));
  //   }
  // };

const getProfile = useCallback 
(async () => {
  const token = localStorage.getItem("token");
  console.log(token);
  try {
    const requestOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
  };
  const response =await axios.get('http://localhost:2000/api/profile', requestOptions);

  if (response.status === 200) {
    console.log(response.data);
    setValues(response.data);
    setProfilePicUrl(response.data.user.image);
    // console.log(values);
    
  } else {
    console.log(response.data.error);
  }} 
  catch (error) {
  console.error('Error:', error);
  }
},
[]
);

useEffect(() => {
  getProfile();
}, [getProfile]);

useEffect(() => {
  if (values && Object.keys(values).length > 0) {
    console.log("Updated values:", values);
  }
}, [values]);

  return (
    <>
      {/* Navbar is fixed at the top */}
      <NavbarAcholder />

      {/* Dashboard Layout Below Navbar */}
      <div className="dashboard-container">
        <div className="dashboard-layout">
          {/* Profile Section */}
          <div className="profile-section">
            <div className="profile-pic-wrapper">
              <img
                src={profilePicUrl || "https://via.placeholder.com/150"}
                alt="Profile"
                className="profile-pic"
              />
              <input
                type="file"
                id="profileUpload"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, "profile")}
                style={{ display: "none" }}
              />
               <label htmlFor="profileUpload" className="edit-profile-pic-btn">📷</label>
            </div>
            
            <h2>{values?.user?.name || "Loading..."}</h2>
            {/* <p className="username">@johndoe</p> */}
            <p>Software Engineer </p>
            <button className="edit-profile-btn">Edit Profile</button>
          </div>
       
            {/* <button className="edit-profile-btn">Edit Profile</button> */}
          
          

          {/* Projects Section */}
          <div className="projects-section">
            <h3>Pinned Projects</h3>
            <div className="project-grid">
              {publicProjects.map((project, index) => (
                <div key={index} className="project-card">
                  <h4>{project.name}</h4>
                  <p>
                    <strong>Owner:</strong> {project.owner}
                  </p>
                  <p className="project-description">{project.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Trending Section */}
          <div className="trending-section">
            <h3>Trending Topics</h3>
            <ul className="trending-list">
              {trendingTopics.map((topic, index) => (
                <li key={index}>{topic}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
