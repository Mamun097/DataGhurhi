// src/Footer.js
import React from "react";
import "./footer.css"; // Make sure this file exists and has the styles
import logo_buet from "./assets/logos/cse_buet.png";
import logo_ric from "/assets/logos/ric.png";
import logo_ict from "/assets/logos/ict.png";
import logo_edge from "/assets/logos/edge.png";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-logo-container">
        <img src={logo_buet} alt="BUET Logo" className="footer-logo1" />
        <img src={logo_ric} alt="RIC Logo" className="footer-logo2" />
        <img src={logo_ict} alt="ICT Logo" className="footer-logo3" />
        <img src={logo_edge} alt="EDGE Logo" className="footer-logo4" />
      </div>
    </footer>
  );
};

export default Footer;
