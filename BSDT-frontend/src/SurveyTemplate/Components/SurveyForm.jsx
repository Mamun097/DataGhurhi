import { useState } from "react";
// import SurveyQuestions from "../Components/SurveyQuestions";
import { handleImageUpload } from "../utils/handleImageUpload";

import SurveySections from "./SurveySections";

// SurveyForm Component to manage the survey title, background, and questions.
const SurveyForm = ({ title, setTitle, questions, setQuestions, image }) => {
  // const [newQuestion, setNewQuestion] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState(image);
  const [themeColor, setThemeColor] = useState(null);
  const [sections, setSections] = useState([
    {
      id: 1,
      title: "Section Title...",
    },
  ]);

  // Function to add a new section
  const handleAddSection = () => {
    const newSection = {
      id: sections.length + 1,
      title: "",
    };
    setSections([...sections, newSection]);
  };

  // Function to handle the publish action
  const handlePublish = async () => {
    try {
      const response = await fetch("http://localhost:2000/api/surveytemplate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          project_id: 23,
          survey_template: {
            title: title,
            description: "",
            questions: questions,
          },
        }),
      });
      if (response.ok) {
        const data = await response.json();
        console.log("Survey published successfully:", data);
        // Optionally, redirect or show a success message
      } else {
        console.error("Error publishing survey:", response.statusText);
      }
    } catch (error) {
      console.error("Error publishing survey:", error);
    }
  };

  return (
    <div>
      <div>
        <button
          className="btn btn-outline-secondary mb-3 me-3"
          onClick={() => {
            // handleSave();
          }}
        >
          <i className="bi bi-save"></i> Save
        </button>
        <button
          className="btn btn-outline-success mb-3"
          onClick={handlePublish}
        >
          <i className="bi bi-check-circle"></i> Publish
        </button>
      </div>
      <div style={{ backgroundColor: themeColor ? themeColor : "white" }}>
        {/* Survey Header */}
        <div>
          <div style={{ position: "relative", width: "100%" }}>
            {/* Full-width Background Image */}
            <img
              src={backgroundImage}
              alt="Survey Icon"
              className="img-fluid"
              style={{
                width: "100%",
                height: "400px", // Adjust height as needed
                objectFit: "cover",
                //borderRadius: "10px",
              }}
            />

            {/* Survey Title Input over the Banner */}
            <input
              style={{
                position: "absolute",
                top: "80%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                color: "white",
                fontWeight: "bold",
                background: "rgba(0, 0, 0, 0.5)", // Dark overlay for better contrast
                //padding: "10px 20px",
                //borderRadius: "5px",
              }}
              type="text"
              className="form-control text-center"
              placeholder="Enter Survey Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)} // Update title state
            />
          </div>

          <div className="mt-3">
            {/* Banner Image Upload Button */}
            <div className="mt-3 text-center">
              <label className="btn btn-outline-secondary">
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
        </div>

        {/* Survey Questions Section */}
        {/* <SurveyQuestions questions={questions} setQuestions={setQuestions} /> */}
        <div className="align-items-center mt-3">
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
            className="btn btn-outline-primary ms-5 mb-3 mt-2"
            onClick={() => handleAddSection()}
          >
            ➕ Add Section
          </button>
        </div>
      </div>
    </div>
  );
};

export default SurveyForm;
