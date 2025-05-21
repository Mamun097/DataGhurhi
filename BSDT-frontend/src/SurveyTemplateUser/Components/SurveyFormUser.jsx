import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import SurveySections from "./SurveySectionsUser";

// SurveyForm Component to manage the survey title, background, sections, and questions.
const SurveyForm = ({
  title,
  sections,
  questions,
  setQuestions,
  image,
}) => {
  // Initialize backgroundImage state from prop and update on prop change
  const [backgroundImage, setBackgroundImage] = useState(image || "");

  console.log("SurveyForm Sections:", sections);
  console.log("SurveyForm Questions:", questions);

  // Sync backgroundImage with prop
  useEffect(() => {
    if (image) {
      setBackgroundImage(image);
    }
  }, [image]);


  return (
    <div>
      <div className="mb-3"></div>

      <div style={{ backgroundColor: "white" }}>
        {/* Survey Header */}
        <div style={{ position: "relative", width: "100%" }}>
          <img
            src={backgroundImage || "https://via.placeholder.com/1200x400"} // Fallback image
            alt="Survey Banner"
            className="img-fluid"
            style={{ width: "100%", height: "400px", objectFit: "cover" }}
          />

          {/* Survey Title as Static Text */}
          <div
            className="text-center"
            style={{
              position: "absolute",
              top: "80%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              color: "white",
              fontWeight: "bold",
              background: "rgba(0, 0, 0, 0.5)",
              padding: "10px 20px",
              borderRadius: "4px",
              width: "100%",
            }}
          >
            {title || "Untitled Survey"}
          </div>
        </div>
        <div className="text-center mt-3"></div>

        {/* Survey Sections and Questions */}
        <div className="mt-4">
          {sections.map((section) => (
            <SurveySections
              key={section.id}
              section={section}
              sections={sections}
              questions={questions}
              setQuestions={setQuestions}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SurveyForm;