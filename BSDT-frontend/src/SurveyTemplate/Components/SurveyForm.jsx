import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { handleImageUpload } from "../utils/handleImageUpload";
import SurveySections from "./SurveySections";
import { useNavigate } from "react-router-dom";

// SurveyForm Component to manage the survey title, background, sections, and questions.
const SurveyForm = ({
  title,
  setTitle,
  sections,
  setSections,
  questions,
  setQuestions,
  image,
  project_id,
  survey_id,
  surveyStatus,
  setSurveyStatus,
}) => {
  // Initialize backgroundImage state from prop and update on prop change
  const [backgroundImage, setBackgroundImage] = useState(image || "");
  const [themeColor, setThemeColor] = useState(null);
  // const [viewAs, setViewAs] = useState(false);
  console.log("SurveyForm Sections:", sections);
  console.log("SurveyForm Questions:", questions);
  // Sync backgroundImage with prop
  useEffect(() => {
    if (image) {
      setBackgroundImage(image);
    }
  }, [image]);
  const navigate = useNavigate();

  console.log(project_id);
  // Function to add a new section
  const handleAddSection = () => {
    const newSection = { id: sections.length + 1, title: "Section Title..." };
    setSections([...sections, newSection]);
  };

  // Function to handle the publish action
  const handlePublish = async () => {
    try {
      const response = await fetch("http://localhost:2000/api/surveytemplate", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          survey_id: survey_id,
          project_id: project_id,
          survey_template: { sections, backgroundImage, title, description: null, questions },
          title: title,
          user_id: `${localStorage.getItem("token").id}`,
        }),
      });
      if (response.status === 201) {
        alert("Survey Saved successfully!");
        setSurveyStatus("published");
        navigate(`/view-survey/${response.data.data?.survey_id || response.data.survey_id}`, {
          state: {
            project_id: project_id,
            survey_details: response.data,
          },
        });
      } else {
        console.error("Error publishing survey:", response.statusText);
      }
    } catch (error) {
      console.error("Error publishing survey:", error);
    }
  };
  const handleSave = async () => {
    try {
      const response = await fetch(
        "http://localhost:2000/api/surveytemplate/save",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            survey_id: survey_id,
            project_id: project_id,
            survey_template: { sections, backgroundImage, title, description: null, questions },
            title: title,
            user_id: `${localStorage.getItem("token").id}`,
          }),
        }
      );
      if (response.status === 201) {
        alert("Survey Saved successfully!");
        navigate(`/view-survey/${response.data.data?.survey_id || response.data.survey_id}`, {
          state: {
            project_id: project_id,
            survey_details: response.data,
          },
        });
      } else {
        console.error("Error publishing survey:", response.statusText);
      }
    } catch (error) {
      console.error("Error publishing survey:", error);
    }
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch("http://localhost:2000/api/surveytemplate", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          survey_id: survey_id,
          project_id: project_id,
          survey_template: { sections, backgroundImage, title, description: null, questions },
          title: title,
          user_id: `${localStorage.getItem("token").id}`,
        }),
      });
      if (response.status === 201) {
        // Handle successful response
        alert("Survey published successfully!");
      } else {
        console.error("Error publishing survey:", response.statusText);
      }
    } catch (error) {
      console.error("Error publishing survey:", error);
    }
  };

  // View As
  // const handleViewAs = () => {
  //   setViewAs(!viewAs);
  //   console.log(survey_Status);
  // };

  return (
    <div>
      <div className="mb-3">
        {/* <button
          className="btn btn-outline-primary me-3"
          onClick={() => handleViewAs()}
        >
          <i className="bi bi-eye"></i> View As
        </button> */}
        {surveyStatus === "published" ? (
          <button className="btn btn-outline-primary" onClick={handleUpdate}>
            <i className="bi bi-pencil"></i> Update
          </button>
        ) : (
          <>
            <button
              className="btn btn-outline-secondary me-3"
              onClick={handleSave}
            >
              <i className="bi bi-save"></i> Save
            </button>
            <button className="btn btn-outline-success" onClick={handlePublish}>
              <i className="bi bi-check-circle"></i> Publish
            </button>
          </>
        )}
      </div>

      <div style={{ backgroundColor: themeColor || "white" }}>
        {/* Survey Header */}
        <div style={{ position: "relative", width: "100%" }}>
          {/* Full-width Background Image */}
          <img
            src={backgroundImage}
            alt="Survey Banner"
            className="img-fluid"
            style={{ width: "100%", height: "400px", objectFit: "cover" }}
          />

          {/* Survey Title Input over the Banner */}
          <input
            type="text"
            className="form-control text-center"
            placeholder="Enter Survey Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              position: "absolute",
              top: "80%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              color: "white",
              fontWeight: "bold",
              background: "rgba(0, 0, 0, 0.5)",
            }}
          />
        </div>

        {/* Change Banner Image */}

        <div className="text-center mt-3">
          <label className="btn btn-outline-secondary">
            <i className="bi bi-image"></i> Upload Banner Image
            <input
              type="file"
              hidden
              onChange={(e) =>
                handleImageUpload(e, setBackgroundImage, setThemeColor)
              }
            />
          </label>
        </div>

        {/* Survey Sections and Questions */}
        <div className="mt-4">
          {sections.map((section) => (
            <SurveySections
              key={section.id}
              section={section}
              sections={sections}
              setSections={setSections}
              questions={questions}
              setQuestions={setQuestions}
            />
          ))}

          <button
            className="btn btn-outline-primary mt-3"
            onClick={handleAddSection}
          >
            ➕ Add Section
          </button>
        </div>
      </div>
    </div>
  );
};

export default SurveyForm;
