import React, { useState, useEffect, useRef } from "react"; // Import useRef
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import SurveySections from "./SurveySectionsUser";

const SurveyForm = ({
  title,
  sections,
  questions,
  setQuestions,
  image,
  userResponse,
  setUserResponse,
  template,
  shuffle = false,
}) => {
  const [backgroundImage, setBackgroundImage] = useState(image || "");
  const [description, setDescription] = useState(
    template?.template?.description || ""
  );
  const hasShuffled = useRef(false);

  useEffect(() => {
    if (image) {
      setBackgroundImage(image);
    }
  }, [image]);

  useEffect(() => {
    if (shuffle && !hasShuffled.current) {
      // 1. Group all questions by their section ID.
      const questionsBySection = questions.reduce((acc, question) => {
        const sectionId = question.section;
        if (!acc[sectionId]) {
          acc[sectionId] = [];
        }
        acc[sectionId].push(question);
        return acc;
      }, {});

      for (const sectionId in questionsBySection) {
        const questionArray = questionsBySection[sectionId];
        for (let i = questionArray.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [questionArray[i], questionArray[j]] = [
            questionArray[j],
            questionArray[i],
          ];
        }
      }

      const finalShuffledQuestions = Object.values(questionsBySection).flat();

      setQuestions(finalShuffledQuestions);

      hasShuffled.current = true;
    }
  }, [shuffle, questions, setQuestions]);

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
            <p
              style={{
                fontSize: "1.1em",
                color: "#555",
                marginTop: "15px",
                whiteSpace: "pre-wrap",
              }}
            >
              {description}
            </p>
          </div>
        )}

        <p
          className="text-danger ms-3 mt-2 mb-4"
          style={{ fontSize: "1.2rem" }}
        >
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