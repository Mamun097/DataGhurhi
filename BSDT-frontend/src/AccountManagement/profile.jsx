import React from "react";
import "./Profile.css"; // Import CSS for styling

const Profile = () => {
  return (
    <div className="profile-container">
      {/* Cover Photo */}
      <div className="cover-photo">
        <img src="https://source.unsplash.com/1000x300/?nature,water" alt="Cover" />
      </div>

      {/* Profile Picture */}
      <div className="profile-picture">
        <img src="https://source.unsplash.com/100x100/?person" alt="Profile" />
      </div>

      {/* Profile Info */}
      <div className="profile-info">
        <h2>John Doe</h2>
        <p className="username">@johndoe</p>
        <p className="bio">Frontend Developer at XYZ Company</p>
      </div>

      {/* Stats */}
      <div className="profile-stats">
        <div>
          <p className="stat-number">1.2k</p>
          <p>Friends</p>
        </div>
        <div>
          <p className="stat-number">500</p>
          <p>Followers</p>
        </div>
        <div>
          <p className="stat-number">200</p>
          <p>Following</p>
        </div>
      </div>

      {/* Buttons */}
      <div className="profile-buttons">
        <button className="btn-primary">Add Friend</button>
        <button className="btn-secondary">Message</button>
      </div>

      {/* Posts Section */}
      <div className="profile-posts">
        <h3>Posts</h3>
        <div className="post">
          <p>Just had an amazing trip to the mountains! 🏔️</p>
          <img src="https://source.unsplash.com/600x400/?mountains" alt="Post" />
          <div className="post-footer">
            <span>👍 120 Likes</span>
            <span>💬 30 Comments</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
