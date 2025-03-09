import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "./navbarAccountholder.css";
import logo_bcc from "../assets/logos/bcc.png";
import logo_buet from "../assets/logos/buet.png";
import logo_db from "../assets/logos/db.png";
import logo_edge from "../assets/logos/edge.png";
import logo_ict from "../assets/logos/ict.png";
import logo_ric from "../assets/logos/ric.png";
import {
  FaHome,
  FaUser,
  FaSignOutAlt,
  FaInfoCircle,
  FaQuestionCircle,
} from "react-icons/fa";

const NavbarAccountHolder= () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <motion.nav
      className={`navbar ${scrolled ? "scrolled" : ""}`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
    >
      {/* Logo Section */}
      <div className="logo-container">
        <img src={logo_buet} alt="BUET Logo" className="logo" />
        <img src={logo_ric} alt="RIC Logo" className="logo" />
        <img src={logo_db} alt="DB Logo" className="logo" />
        <img src={logo_ict} alt="ICT Logo" className="logo" />
        <img src={logo_edge} alt="EDGE Logo" className="logo" />
        <img src={logo_bcc} alt="BCC Logo" className="logo" />
      </div>

      {/* Navigation Links */}
      <ul className="nav-links">
        <li>
          <a href="home">
            <FaHome className="nav-icon" />
            <span>Home</span>
          </a>
        </li>
        <li>
          <a href="dashboard">
            <FaUser className="nav-icon" />
            <span>Profile</span>
          </a>
        </li>
        <li>
          <a href="logout">
            <FaSignOutAlt className="nav-icon" />
            <span>Log Out</span>
          </a>
        </li>
        <li>
          <a href="about">
            <FaInfoCircle className="nav-icon" />
            <span>About</span>
          </a>
        </li>
        <li>
          <a href="faq">
            <FaQuestionCircle className="nav-icon" />
            <span>FAQ</span>
          </a>
        </li>
      </ul>
    </motion.nav>
  );
};

export default NavbarAccountHolder;
