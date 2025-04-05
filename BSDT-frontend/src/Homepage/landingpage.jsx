import React, { useState } from "react";
import { motion } from "framer-motion";
import NavbarHome from "./navbarhome"; // Import the Navbar component
import "./landingpage.css";

const LandingPage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    alert(`Searching for: ${searchQuery}`);
  };

  return (
    <div className="landing-container">
      {/* Navbar at the top */}
      <NavbarHome />

      {/* Animated Header */}
      <motion.h1
        className="title"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 1 }}
      >
        Welcome to Jorip.AI
      </motion.h1>

      {/* Search Bar
      <motion.div
        className="search-bar"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.8 }}
      >
        <input
          type="text"
          placeholder="Search for projects, surveys, accounts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <motion.button
          className="search-button"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleSearch}
        >
          🔍
        </motion.button>
      </motion.div> */}

      {/* Background Animation */}
      <motion.div
        className="animated-circle"
        animate={{ scale: [1, 1.5, 1] }}
        transition={{ repeat: Infinity, duration: 3 }}
      ></motion.div>
    </div>
  );
};

export default LandingPage;
