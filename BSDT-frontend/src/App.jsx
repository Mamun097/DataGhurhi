import React from "react";
import { BrowserRouter as Router, Routes } from "react-router-dom";
import { Route } from "react-router-dom";
import Dashboard from "./ProfileManagement/Dashboard";


import Navigate from "./navigate"; // Import the route declarations

function App() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  console.log(token, role);
  return (
    <>
    <Router>
      {
         token && role === "user" ? (
      <Routes>
        <Route path="/dashboard" exact element={<Dashboard />} />   
      </Routes>
         ) : (
      
        <Navigate />
      
          )
        }
    </Router>
  </>
  );
}

export default App;
