// src/Pages/Index.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "../CSS/SurveyForm.css";
import SurveyForm from "../Components/SurveyFormUser";
import { useParams } from "react-router-dom";
import NavbarAcholder from "../../ProfileManagement/navbarAccountholder";
import { handleMarking } from "../Utils/handleMarking";

const Index = () => {
  const { slug } = useParams();
  const [language, setLanguage] = useState(
    localStorage.getItem("language") || "English"
  );

  // Sidebar templates state
  const [template, setTemplate] = useState();

  // Props for SurveyForm
  const [title, setTitle] = useState(null);
  const [sections, setSections] = useState([{ id: 1, title: "Section 1" }]);
  const [questions, setQuestions] = useState([]);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [shuffle, setShuffle] = useState(false);

  // User Response state
  const [userResponse, setUserResponse] = useState([]);
  console.log("User Response:", userResponse);

  // User has submitted or not
  const [submitted, setSubmitted] = useState(false);

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
          setTemplate(response.data.data);
          setTitle(response.data.data.title);
          setSections(response.data.data.template.sections);
          setQuestions(response.data.data.template.questions);
          setBackgroundImage(response.data.data.template.backgroundImage);
          setShuffle(response.data.data.shuffle_questions);
        } catch (err) {
          console.error("Failed to load template:", err);
        }
      }
    };

    load();
  }, [slug]);

  //handle submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const calculatedMarks = handleMarking(userResponse, questions);
    // console.log("Marks: ", calculatedMarks);
    try {
      const response = await axios.post(
        `http://localhost:2000/api/submit-survey/${slug}`,
        {
          userResponse: userResponse,
          calculatedMarks: calculatedMarks,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log("Submission response:", response.data);

      // Handle success
      // First Clear all data
      setTemplate(null);
      setTitle(null);
      setSections(null);
      setQuestions(null);
      setBackgroundImage(null);

      // set submitted to true
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting survey:", error);
      // Handle error (e.g., show an error message)
    }
  };

  // Show a loading placeholder until templates arrive (if needed)
  if (template === undefined || template === null) {
    return <p className="text-center mt-5">Loading templates…</p>;
  }
  return (
    <>
      <NavbarAcholder language={language} setLanguage={setLanguage} />
      <div className="container-fluid">
        <div className="row">
          <div className="col-2"></div>

          {/* Center column: always 8 cols */}
          {!submitted && (
            <div className="col-8">
              <SurveyForm
                title={title}
                sections={sections}
                questions={questions}
                setQuestions={setQuestions}
                image={backgroundImage}
                userResponse={userResponse}
                setUserResponse={setUserResponse}
                template={template}
                shuffle={shuffle}
              />
              <div style={{ minHeight: "100vh" }}>
                <button
                  className="btn btn-outline-success"
                  style={{
                    bottom: "20px",
                    right: "20px",
                    alignContent: "center",
                    elvation: "5",
                    position: "right",
                  }}
                  onClick={handleSubmit}
                >
                  Submit
                </button>
              </div>
            </div>
          )}
          {submitted && <div className="col-8"></div>}

          {/* Right gutter: empty */}
          <div className="col-2" />
        </div>
      </div>
    </>
  );
};

export default Index;
