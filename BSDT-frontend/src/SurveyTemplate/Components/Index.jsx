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
  console.log(
    "Survey ID:",
    survey_id,
    "Project ID:",
    project_id,
    "Survey Details:",
    survey_details
  );

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
  const questionsFromSurveyDetails = survey_details?.template?.questions || [];
  console.log(
    "Questions from survey details:",
    questionsFromSurveyDetails
  );
  console
  useEffect(() => {
    const load = async () => {
      if (useCustom) {
        // ==== 1) Load from survey_details ====
        setTitle(survey_details.title || "Untitled Survey");
        setSections(survey_details.template.sections || []);
        setQuestions(survey_details.template.questions || []);
        // `banner` field on your object holds the URL
        setBackgroundImage(survey_details.banner || null);
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
        {/* Sidebar: only show when using saved templates */}
        {!useCustom && (
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
        )}

        {/* Main Content */}
        <div className={`${useCustom ? "col-12" : "col-9"} mt-5`}>
          <SurveyForm
            title={title}
            setTitle={setTitle}
            sections={sections}
            setSections={setSections}
            questions={questions}
            setQuestions={setQuestions}
            image={backgroundImage}
            setImage={setBackgroundImage} // if you've lifted image state up
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
