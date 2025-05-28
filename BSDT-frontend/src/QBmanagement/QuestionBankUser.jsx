// src/Pages/Index.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./CSS/SurveyForm.css";
import SurveyForm from "./Components/SurveyForm";
import { useLocation } from "react-router-dom";

const QB = () => {
  const location = useLocation();



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

  if ( questions.length === 0) {
    return <p className="text-center mt-5">Loading questions…</p>;
  }

  return (
  <div className="container-fluid mt-5 px-5">
    <div className="bg-white rounded shadow p-4 mb-4">
      <h2 className="mb-4 border-bottom pb-2 text-primary">
        <i className="bi bi-journal-text me-2"></i> Question Bank
      </h2>
      
      <SurveyForm questions={questions} setQuestions={setQuestions} />
    </div>
  </div>

  );
};

export default QB;
