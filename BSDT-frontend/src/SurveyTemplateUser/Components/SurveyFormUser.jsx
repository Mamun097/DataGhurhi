import React, { useState, useEffect, useRef, useMemo } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import SurveySections from "./SurveySectionsUser";

const isSectionVisible = (section, userResponse) => {
  const triggerQuestion = section.triggerQuestionText;
  const requiredOption = section.triggerOption;

  if (!triggerQuestion) {
    return true;
  }
  const responseForTriggerQuestion = userResponse.find(
    (res) => res.questionText === triggerQuestion
  );
  if (!responseForTriggerQuestion) {
    return false;
  }

  const userAnswer = responseForTriggerQuestion.userResponse;
  if (Array.isArray(userAnswer)) {
    return userAnswer.includes(requiredOption);
  } else {
    return userAnswer === requiredOption;
  }
};


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
  onSubmit,
}) => {
  const [backgroundImage, setBackgroundImage] = useState(image || "");
  const [description, setDescription] = useState(
    template?.template?.description || ""
  );
  const hasShuffled = useRef(false);

  const visibleSections = useMemo(() => {
    return sections.filter(section => isSectionVisible(section, userResponse));
  }, [sections, userResponse]);

  const [currentVisibleIndex, setCurrentVisibleIndex] = useState(0);

  useEffect(() => {
    if (currentVisibleIndex >= visibleSections.length) {
      setCurrentVisibleIndex(Math.max(0, visibleSections.length - 1));
    }
  }, [visibleSections, currentVisibleIndex]);

  useEffect(() => {
    if (image) {
      setBackgroundImage(image);
    }
  }, [image]);

  useEffect(() => {
    if (shuffle && !hasShuffled.current) {
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

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
    }
  };

  const handleNext = () => {
    if (currentVisibleIndex < visibleSections.length - 1) {
      setCurrentVisibleIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentVisibleIndex > 0) {
      setCurrentVisibleIndex((prev) => prev - 1);
    }
  };

  return (
    <div>
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
      <hr className="my-4" />
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
      <p
        className="text-danger ms-3 mt-2 mb-4"
        style={{ fontSize: "1.1rem" }}
      >
        * Required fields are marked with an asterisk.
      </p>

      <div>
        {visibleSections[currentVisibleIndex] && (
          <SurveySections
            key={visibleSections[currentVisibleIndex].id}
            section={visibleSections[currentVisibleIndex]}
            sections={visibleSections} 
            questions={questions}
            setQuestions={setQuestions}
            userResponse={userResponse}
            setUserResponse={setUserResponse}
          />
        )}
      </div>

      <div className="container d-flex justify-content-between align-items-center my-5">
        <button
          type="button"
          className="btn btn-secondary"
          disabled={currentVisibleIndex === 0}
          onClick={handlePrevious}
        >
          Previous
        </button>

        <span>
          Page {currentVisibleIndex + 1} of {visibleSections.length}
        </span>

        {currentVisibleIndex < visibleSections.length - 1 ? (
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