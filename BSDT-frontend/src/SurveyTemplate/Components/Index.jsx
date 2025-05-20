// src/Pages/Index.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "../CSS/SurveyForm.css";
import SurveyForm from "../Components/SurveyForm";
import { useLocation, useParams } from "react-router-dom";

const Index = () => {
  const location = useLocation();
  const { survey_id } = useParams();
  const { project_id, survey_details } = location.state || {};
  console.log("Survey details:", survey_details);
  const [surveyStatus, setSurveyStatus] = useState(null);

  // Sidebar templates state
  const [templates, setTemplates] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Props for SurveyForm
  const [title, setTitle] = useState(null);
  const [sections, setSections] = useState([
    { id: 1, title: "Section 1" },
  ]);
  const [questions, setQuestions] = useState([]);
  const [backgroundImage, setBackgroundImage] = useState(null);

  // Has a custom template been passed in?
  const useCustom = survey_details?.template != null;
  useEffect(() => {
    const load = async () => {
      if (useCustom) {
        // ==== 1) Load from survey_details ====
        console.log("Survey details:", survey_details);
        setTitle(survey_details.title || "Untitled Survey");
        setSections(survey_details.template.sections || []);
        setQuestions(survey_details.template.questions || []);
        // `banner` field on your object holds the URL
        setBackgroundImage(survey_details.template.backgroundImage || null);
        setSurveyStatus(survey_details.survey_status || null);
      } else {
        // ==== 2) Otherwise, fetch saved templates ====
        try {
          const resp = await axios.get(
            "http://localhost:2000/api/get-saved-survey"
          );
          const data = resp.data;
          setTemplates(data);

          if (data.length > 0) {
            const first = data[0];
            setTitle(first.title);
            setQuestions(first.template);
            setBackgroundImage(first.image_url);
          }
        } catch (err) {
          console.error("Failed to load templates:", err);
        }
      }
    };

    load();
    // We only want to run this once, or again if survey_details changes
  }, [useCustom, survey_details]);

  // Handle sidebar taps (only relevant when !useCustom)
  const handleSelect = (idx) => {
    setSelectedIndex(idx);
    const tmpl = templates[idx];
    setTitle(tmpl.title);
    setQuestions(tmpl.template);
    setBackgroundImage(tmpl.image_url);
  };

  // Show a loading placeholder until templates arrive (if needed)
  if (!useCustom && templates.length === 0) {
    return <p className="text-center mt-5">Loading templates…</p>;
  }
return (
  <div className="container-fluid">
    <div className="row">

      {/* Left gutter + sidebar */}
      <div className="col-2">
        <div className="mt-5">
          {/* 1) NOT custom & NOT published → header + cards */}
          {!useCustom && surveyStatus !== "published" && (
            <>
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
            </>
          )}

          {/* 2) NOT custom & IS published → warning */}
          {!useCustom && surveyStatus === "published" && (
            <div className="alert alert-warning text-center">
              This survey has already been published.
            </div>
          )}

          {/* 3) if useCustom === true → nothing at all */}
        </div>
      </div>

      {/* Center column: always 8 cols */}
      <div className="col-8 mt-5">
        <SurveyForm
          title={title}
          setTitle={setTitle}
          sections={sections}
          setSections={setSections}
          questions={questions}
          setQuestions={setQuestions}
          image={backgroundImage}
          setImage={setBackgroundImage}
          project_id={project_id}
          survey_id={survey_id}
          surveyStatus={surveyStatus}
          setSurveyStatus={setSurveyStatus}
        />
      </div>

      {/* Right gutter: empty */}
      <div className="col-2" />
    </div>
  </div>
);
};

export default Index;
