// src/Layout.js
import React from "react";
import Footer from "./footer";
import "./Layout.css"; // Ensure you have a CSS file for layout styles


const Layout = ({ children }) => {
  return (
    <div className="page-layout">
      <div className="main-content">{children}</div>
      <Footer />
    </div>
  );
};

export default Layout;
