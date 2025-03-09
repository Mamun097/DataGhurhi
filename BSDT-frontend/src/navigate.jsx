import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./Homepage/landingpage";
import Register from "./AccountManagement/register";
import Login from "./AccountManagement/login";
import Dashboard from "./ProfileManagement/Dashboard";
// import SignUp from "../pages/SignUp";
// import Login from "../pages/Login";
// import About from "../pages/About";
// import FAQ from "../pages/FAQ";

const Navigate = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />
      <Route path="/signup" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />

    </Routes>
  );
};

export default Navigate;
