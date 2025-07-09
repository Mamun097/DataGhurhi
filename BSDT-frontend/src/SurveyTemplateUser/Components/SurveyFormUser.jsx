import React, { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import SurveySections from "./SurveySectionsUser";

const SurveyForm = ({
  title,
  sections,
  questions,
  setQuestions,
  logo,
  logoAlignment,
  logoText,
  image,
  userResponse,
  setUserResponse,
  template,
  shuffle = false,
  onSubmit, // Add this prop to handle form submission
}) => {
  const [backgroundImage, setBackgroundImage] = useState(image || "");
  const [description, setDescription] = useState(
    template?.template?.description || ""
  );
  const hasShuffled = useRef(false);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

  useEffect(() => {
    if (image) {
      setBackgroundImage(image);
    }
  }, [image]);

  useEffect(() => {
    if (shuffle && !hasShuffled.current) {
      // Group all questions by their section ID
      const questionsBySection = questions.reduce((acc, question) => {
        const sectionId = question.section;
        if (!acc[sectionId]) {
          acc[sectionId] = [];
        }
        acc[sectionId].push(question);
        return acc;
      }, {});

      // Shuffle questions within each section
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

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
    }
  };

  const handleNext = () => {
    if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex((prev) => prev - 1);
    }
  };

  return (
    <div>
      {/* Survey Logo */}
      {logo && (
        <>
          {logoAlignment === "center" ? (
            <div className="py-3 text-center">
              <img
                src={logo}
                alt="Survey Logo"
                className="img-fluid"
                style={{
                  maxHeight: "200px",
                  objectFit: "cover",
                  display: "inline-block",
                }}
              />
              {logoText && (
                <div
                  className="mt-2 px-2"
                  style={{
                    color: "#333",
                    fontWeight: "bold",
                    fontSize: "1rem",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {logoText}
                </div>
              )}
            </div>
          ) : (
            <div
              className={`py-3 px-3 d-flex align-items-start justify-content-between flex-column flex-sm-row ${
                logoAlignment === "left"
                  ? "flex-sm-row"
                  : "flex-sm-row-reverse"
              }`}
            >
              <img
                src={logo}
                alt="Survey Logo"
                className="img-fluid mt-3 mb-sm-0"
                style={{
                  maxHeight: "200px",
                  objectFit: "cover",
                  display: "inline-block",
                }}
              />
              {logoText && (
                <div
                  className="mt-5 ms-sm-3 me-sm-3"
                  style={{
                    color: "#333",
                    fontWeight: "bold",
                    fontSize: "1rem",
                    whiteSpace: "pre-wrap",
                    maxWidth: "100%",
                    textAlign: logoAlignment === "left" ? "right" : "left",
                    alignSelf: "flex-start",
                  }}
                >
                  {logoText}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Divider */}
      <hr className="my-4" />

      {/* Banner + Title */}
      <div style={{ position: "relative", width: "100%" }}>
        {backgroundImage ? (
          <>
            <img
              src={backgroundImage}
              alt="Survey Banner"
              className="img-fluid"
              style={{
                width: "100%",
                maxHeight: "400px",
                objectFit: "cover",
              }}
            />
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
                fontSize: "clamp(1rem, 4vw, 1.5rem)",
              }}
            >
              {title || "Untitled Survey"}
            </div>
          </>
        ) : (
          <h1 className="text-center mt-2" style={{ color: "#333" }}>
            {title || "Untitled Survey"}
          </h1>
        )}
      </div>

      {/* Survey Description */}
      {description && (
        <div className="container rounded">
          <p
            className="mt-3 px-2"
            style={{
              fontSize: "1.1em",
              color: "#555",
              whiteSpace: "pre-wrap",
            }}
          >
            {description}
          </p>
        </div>
      )}

      {/* Required Field Notice */}
      <p
        className="text-danger ms-3 mt-2 mb-4"
        style={{ fontSize: "1.1rem" }}
      >
        * Required fields are marked with an asterisk.
      </p>

      {/* Current Section */}
      <div>
        {sections[currentSectionIndex] && (
          <SurveySections
            key={sections[currentSectionIndex].id}
            section={sections[currentSectionIndex]}
            sections={sections}
            questions={questions}
            setQuestions={setQuestions}
            userResponse={userResponse}
            setUserResponse={setUserResponse}
          />
        )}
      </div>

      {/* Navigation Controls */}
      <div className="container d-flex justify-content-between align-items-center my-5">
        <button
          type="button"
          className="btn btn-secondary"
          disabled={currentSectionIndex === 0}
          onClick={handlePrevious}
        >
          Previous
        </button>

        <span>
          Section {currentSectionIndex + 1} of {sections.length}
        </span>

        {currentSectionIndex < sections.length - 1 ? (
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleNext}
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-success"
            onClick={handleFormSubmit}
          >
            Submit Survey
          </button>
        )}
      </div>
    </div>
  );
};

export default SurveyForm;
