// src/Pages/Index.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "../CSS/SurveyForm.css";

import EmployeeSatisfactionSurvey from "../Templates/EmployeeSatisfactionSurvey";
import PostEventFeedbackSurvey from "../Templates/PostEventFeedbackSurvey";
import CustomerSatisfactionSurvey from "../Templates/CustomerSatisfactionSurvey";
import EmployeeSatisfactionSurvey2 from "../Templates/EmployeeSatisfactionSurvey2";
import NavbarSurvey from "./navbarSurvey";

import SurveyForm from "../Components/SurveyForm";


const Index = () => {
  const [templates, setTemplates] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // These drive SurveyForm props
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState([]);
  const [backgroundImage, setBackgroundImage] = useState("");

  // 1) Fetch all templates once
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:2000/api/get-saved-survey"
        );
        setTemplates(data);

        if (data.length > 0) {
          // Initialize with first template
          const first = data[0];
          setTitle(first.title);
          setQuestions(first.template);
          setBackgroundImage(first.image_url);
        }
      } catch (err) {
        console.error("Failed to load templates:", err);
      }
    };
    fetchTemplates();
  }, []);

  // 2) When the user clicks a new sidebar card, update title/questions/image
  const handleSelect = (idx) => {
    setSelectedIndex(idx);
    const tmpl = templates[idx];
    setTitle(tmpl.title);
    setQuestions(tmpl.template);
    setBackgroundImage(tmpl.image_url);
  };

  if (templates.length === 0) {
    return <p className="text-center mt-5">Loading templates…</p>;
  }

  return (
    <div>
      {/* <NavbarSurvey /> */}
    <div className="container-fluid mt-5">
      <div className="row">
        {/* Sidebar */}
        <div className="col-2 me-5">
          <div className="mt-5">
            <h2 className="mb-4">Survey Templates</h2>
            <div className="d-flex flex-column gap-3">
              {templates.map((tmpl, idx) => (
                <div
                  key={tmpl.id}
                  className={`card text-center shadow-sm ${
                    idx === selectedIndex ? "border-primary" : ""
                  }`}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleSelect(idx)}
                >
                  <div className="card-body">
                    <h5 className="card-title">{tmpl.title}</h5>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="col-7 mt-5 align-items-center">
          {selectedTemplate === "Employee Satisfaction Survey" && (
            <EmployeeSatisfactionSurvey2 />
          )}
          {selectedTemplate === "Post-Event Feedback Survey" && (
            <PostEventFeedbackSurvey />
          )}
          {selectedTemplate === "Customer Satisfaction Survey" && (
            <CustomerSatisfactionSurvey />
          )}

        {/* Main Content */}
        <div className="col-9 mt-5">
          <SurveyForm
            title={title}
            setTitle={setTitle}
            questions={questions}
            setQuestions={setQuestions}
            image={backgroundImage}
          />

        </div>
      </div>
    </div>
    </div>
  );
};

export default Index;
