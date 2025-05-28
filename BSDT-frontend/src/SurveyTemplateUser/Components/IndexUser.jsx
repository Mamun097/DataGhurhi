// src/Pages/Index.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "../CSS/SurveyForm.css";
import SurveyForm from "../Components/SurveyFormUser";
import { useParams } from "react-router-dom";
import NavbarAcholder from "../../ProfileManagement/navbarAccountholder";

const Index = () => {
  const {slug} = useParams();
  const [language, setLanguage] = useState(
    localStorage.getItem("language") || "English"
  );

  // Sidebar templates state
  const [templates, setTemplates] = useState([]);

  // Props for SurveyForm
  const [title, setTitle] = useState(null);
  const [sections, setSections] = useState([{ id: 1, title: "Section 1" }]);
  const [questions, setQuestions] = useState([]);
  const [backgroundImage, setBackgroundImage] = useState(null);


  useEffect(() => {
    const load = async () => {
      // fetch templates from the server
      if (slug) {
        try {
          const response = await axios.get(
            `http://localhost:2000/api/fetch-survey-user/${slug}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          console.log("Template data:", response.data);
          setTemplates(response.data.data);
          setTitle(response.data.data.title);
          setSections(response.data.data.template.sections);
          setQuestions(response.data.data.template.questions);
          setBackgroundImage(response.data.data.template.backgroundImage);
        } catch (err) {
          console.error("Failed to load template:", err);
      
        }
      }
    };

    load();
  }, [slug]);

  // Show a loading placeholder until templates arrive (if needed)
  if ( templates.length === 0) {
    return <p className="text-center mt-5">Loading templates…</p>;
  }
  return (
    <>
      <NavbarAcholder language={language} setLanguage={setLanguage} />
      <div className="container-fluid">
        <div className="row">
          <div className="col-2">
            <div className="mt-5">
            </div>
          </div>

          {/* Center column: always 8 cols */}
          <div className="col-8 mt-5">
            <SurveyForm
              title={title}
              sections={sections}
              questions={questions}
              setQuestions={setQuestions}
              image={backgroundImage}
            />
          </div>

          {/* Right gutter: empty */}
          <div className="col-2" />
        </div>
      </div>
    </>
  );
};

export default Index;
