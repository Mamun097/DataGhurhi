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
  userResponse,
  setUserResponse,
  template,
}) => {
  // Initialize backgroundImage state from prop and update on prop change
  const [backgroundImage, setBackgroundImage] = useState(image || "");
  const [description, setDescription] = useState(
    template?.template?.description || ""
  );
  console.log("Description:", description);
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
      <div style={{ backgroundColor: "white" }}>
        {/* Survey Header */}
        <div style={{ position: "relative", width: "100%" }}>
          {/* Background Image */}
          {backgroundImage && (
            <img
              src={backgroundImage || "https://via.placeholder.com/1200x400"} // Fallback image
              alt="Survey Banner"
              className="img-fluid"
              style={{ width: "100%", maxHeight: "400px", objectFit: "cover" }}
            />
          )}

          {/* Survey Title as Static Text */}
          {backgroundImage && (
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
                width: "80%",
              }}
            >
              {title || "Untitled Survey"}
            </div>
          )}
          {/* Fallback Title if no background image */}
          {!backgroundImage && (
            <h1 className="text-center mt-2" style={{ color: "#333" }}>
              {title || "Untitled Survey"}
            </h1>
          )}
        </div>
        {/* Survey Description */}
        {description && (
          <div className="container rounded">
            <p className="text-muted" style={{ fontSize: "1.2rem" }}>
              {description}
            </p>
          </div>
        )}

        <p className="text-danger ms-3 mt-2 mb-4" style={{ fontSize: "1.2rem" }}>
          * Required fields are marked with an asterisk.
        </p>
      </div>
      {/* Survey Sections and Questions */}
      <div>
        {sections.map((section) => (
          <SurveySections
            key={section.id}
            section={section}
            sections={sections}
            questions={questions}
            setQuestions={setQuestions}
            userResponse={userResponse}
            setUserResponse={setUserResponse}
          />
        ))}
      </div>
    </div>
  );
};

export default SurveyForm;
