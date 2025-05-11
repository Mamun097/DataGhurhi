import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./ProfileManagement/Dashboard";
import Home from "./Homepage/landingpage";
import Register from "./AccountManagement/register";
import Login from "./AccountManagement/login";
import AddProject from "./ProjectManagement/createProject";
import EditProject from "./ProjectManagement/editProject";
import Index from "./SurveyTemplate/Components/Index";

function App() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  console.log("Token:", token, "Role:", role);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/signup" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/surveytemplate" element={<Index />} />

        {/* Protected Routes */}
        {token && role== "user"? (
          <>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/addproject" element={<AddProject />} />
            <Route path="view-project/:projectId" element={<EditProject />} />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/login" />} />
        )}

        {/* Catch-All Route (404 Page) */}
        <Route path="*" element={<h2>404 - Page Not Found</h2>} />

      </Routes>
    </Router>
  );
}

export default App;
