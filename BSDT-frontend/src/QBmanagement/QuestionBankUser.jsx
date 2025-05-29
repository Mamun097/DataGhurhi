// src/Pages/Index.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./CSS/SurveyForm.css";
import SurveyForm from "./Components/SurveyForm";
import { useLocation } from "react-router-dom";
import NavbarAcholder from "../ProfileManagement/navbarAccountholder";

const QB = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("mine"); 
  const [sharedQuestions, setSharedQuestions] = useState([]);





  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    const load = async () => {
   
        try {
          const resp = await axios.get("http://localhost:2000/api/question-bank", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          const data = resp.data;
          console.log("Fetched questions:", data);
          if (data.length > 0) {
            setQuestions(data || []);
          }
        } catch (err) {
          console.error("Failed to load questions:", err);
        }
      }
    

    load();
  }, [ ]);

  // fetch shared questions
  useEffect(() => {
  const fetchSharedQuestions = async () => {
    try {
      const resp = await axios.get("http://localhost:2000/api/question-bank/shared", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = resp.data;
      console.log("Fetched shared questions:", data);
      if (Array.isArray(data)) {
        setSharedQuestions(data);
      }
    } catch (err) {
      console.error("Failed to load shared questions:", err);
    }
  };

  if (activeTab === "shared") {
    fetchSharedQuestions();
  }
}, [activeTab]);

  if ( questions.length === 0) {
    return <p className="text-center mt-5">Loading questions…</p>;
  }

  return (
      <>
    
      
        <div className="bg-white rounded shadow p-4 mb-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="text-success mb-0 text-center w-100">
              <i className="bi bi-journal-text me-2"></i> Question Bank
            </h1>
          </div>
          <div className="d-flex justify-content-end gap-2 mb-3">
            <button
              className={`btn btn-sm ${activeTab === "mine" ? "btn-success" : "btn-outline-success"}`}
              onClick={() => setActiveTab("mine")}
            >
              <i className="bi bi-person me-1"></i> My Questions
            </button>

            <button
              className={`btn btn-sm ${activeTab === "shared" ? "btn-success" : "btn-outline-success"}`}
              onClick={() => setActiveTab("shared")}
            >
              <i className="bi bi-people me-1"></i> Shared with Me
            </button>
          </div>


          {activeTab === "mine" && (
            <SurveyForm
                questions={questions}
                setQuestions={setQuestions}
                activeTab={activeTab}
              />
            )}

            {activeTab === "shared" && (
              <SurveyForm
                questions={sharedQuestions}
                setQuestions={() => {}} // prevent shared questions from being edited
              />
            )}
        </div>
     
      </>
  );
};

export default QB;
