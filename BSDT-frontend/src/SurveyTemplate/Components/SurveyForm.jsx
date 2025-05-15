import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { handleImageUpload } from "../utils/handleImageUpload";
import SurveySections from "./SurveySections";

// SurveyForm Component to manage the survey title, background, sections, and questions.
const SurveyForm = ({ title, setTitle, questions, setQuestions, image }) => {
  // Initialize backgroundImage state from prop and update on prop change
  const [backgroundImage, setBackgroundImage] = useState(image || "");
  const [themeColor, setThemeColor] = useState(null);
  const [sections, setSections] = useState([
    { id: 1, title: "Section Title..." },
  ]);

  // Sync backgroundImage with prop updates
  useEffect(() => {
    if (image) {
      setBackgroundImage(image);
    }
  }, [image]);

  // Function to add a new section
  const handleAddSection = () => {
    const newSection = { id: sections.length + 1, title: "Section Title..." };
    setSections([...sections, newSection]);
  };

  // Function to handle the publish action
  const handlePublish = async () => {
    try {
      const response = await fetch("http://localhost:2000/api/surveytemplate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: 21,

          survey_template: {
            title: title,
            description: "",
            sections: sections,
            questions: questions,
          },

          survey_template: { title, description: "", questions },
        }),
      });
      if (response.ok) {
        const data = await response.json();
        console.log("Survey published successfully:", data);
      } else {
        console.error("Error publishing survey:", response.statusText);
      }
    } catch (error) {
      console.error("Error publishing survey:", error);
    }
  };

  return (
    <div>
      <div className="mb-3">
        <button
          className="btn btn-outline-secondary me-3"
          onClick={() => console.log("Saved")}
        >
          <i className="bi bi-save"></i> Save
        </button>
        <button className="btn btn-outline-success" onClick={handlePublish}>
          <i className="bi bi-check-circle"></i> Publish
        </button>
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
            <i className="bi bi-image"></i> Change Banner Image
            <input
              type="file"
              hidden
              onChange={(e) => handleImageUpload(e, setBackgroundImage, setThemeColor)}
            />

          </div>

          <div className="mt-3">
            {/* Banner Image Upload Button */}
            <div className="mt-3 text-center">
              <label className="btn btn-outline-secondary bg-white">
                <i className="bi bi-image"></i> Change Banner Image
                <input
                  type="file"
                  hidden
                  onChange={(e) =>
                    handleImageUpload(e, setBackgroundImage, setThemeColor)
                  }
                />
              </label>
            </div>
            {/* <div className="btn btn-outline-secondary mt-3">
            <i className="bi bi-card-text"></i> Add Description
          </div> */}
          </div>

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
            className="btn btn-outline-primary ms-5 mb-3 mt-2 bg-white"
            onClick={() => handleAddSection()}
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
