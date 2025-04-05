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
      <Route path="/" exact element={<Home />} />
      <Route path="/home" exact element={<Home />} />
      <Route path="/signup" exact element={<Register />} />
      <Route path="/login"exact element={<Login />} />
      <Route path="/dashboard" exact element={<Dashboard />} />

    </Routes>
  );
};

export default Navigate;
