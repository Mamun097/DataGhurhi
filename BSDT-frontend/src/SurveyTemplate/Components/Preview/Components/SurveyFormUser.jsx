import React, { useState, useEffect, useMemo } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import SurveySections from "./SurveySectionsUser";
import Linkify from "react-linkify";

import Checkbox from "../QuestionTypes/CheckboxUser";
import DateTime from "../QuestionTypes/DateTimeUser";
import Dropdown from "../QuestionTypes/DropdownUser";
import LikertScale from "../QuestionTypes/LikertScaleUser";
import LinearScaleQuestion from "../QuestionTypes/LinearScaleUser";
import RadioQuestion from "../QuestionTypes/RadioUser";
import RatingQuestion from "../QuestionTypes/RatingUser";
import Text from "../QuestionTypes/TextUser";
import TickBoxGrid from "../QuestionTypes/TickBoxGridUser";

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
  isSubmitting = false,
}) => {
  const [currentVisibleIndex, setCurrentVisibleIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [backgroundImage, setBackgroundImage] = useState(image || "");
  const [description, setDescription] = useState(
    template?.template?.description || ""
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentVisibleIndex]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const visibleSections = useMemo(() => {
    return sections.filter((section) =>
      isSectionVisible(section, userResponse)
    );
  }, [sections, userResponse]);

  useEffect(() => {
    if (currentVisibleIndex >= visibleSections.length) {
      setCurrentVisibleIndex(Math.max(0, visibleSections.length - 1));
    }
  }, [visibleSections, currentVisibleIndex]);

  const renderPreviewQuestion = (question, index) => {
    const staticProps = {
      question,
      index,
      userResponse: [],
      setUserResponse: () => {},
    };
    switch (question.type) {
      case "checkbox":
        return <Checkbox {...staticProps} />;
      case "datetime":
        return <DateTime {...staticProps} />;
      case "dropdown":
        return <Dropdown {...staticProps} />;
      case "likert":
        return <LikertScale {...staticProps} />;
      case "linearScale":
        return <LinearScaleQuestion {...staticProps} />;
      case "radio":
        return <RadioQuestion {...staticProps} />;
      case "rating":
        return <RatingQuestion {...staticProps} />;
      case "text":
        return <Text {...staticProps} />;
      case "tickboxGrid":
        return <TickBoxGrid {...staticProps} />;
      default:
        return null;
    }
  };

  const validateCurrentSection = () => {
    return true;
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
  const handleFormSubmit = () => {
    alert("This is a preview. Form submission is disabled.");
  };
  const handleGoBack = () => {
    window.history.back();
  };
  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <div className="on-screen-view">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 style={{ margin: 0, color: "#6c757d" }}>Preview Mode</h2>
          <div>
            <button
              onClick={handlePrint}
              style={{
                padding: "8px 20px",
                fontSize: "1rem",
                color: "#fff",
                backgroundColor: "#28a745",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                pointerEvents: "auto",
                marginTop: "10px",
                marginRight: "10px",
              }}
            >
              Print All Questions
            </button>
            <button
              onClick={handleGoBack}
              style={{
                padding: "8px 20px",
                fontSize: "1rem",
                color: "#fff",
                backgroundColor: "#007bff",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                pointerEvents: "auto",
                marginTop: "10px",
              }}
            >
              Go Back
            </button>
          </div>
        </div>

        {logo && (
          <>
            {isMobile || logoAlignment === "center" ? (
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
                <br />
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
                <br />
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
            <Linkify
              componentDecorator={(decoratedHref, decoratedText, key) => (
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={decoratedHref}
                  key={key}
                >
                  {decoratedText}
                </a>
              )}
            >
              <p
                className="mt-3 px-2"
                style={{
                  fontSize: "1.1em",
                  color: "#555",
                  whiteSpace: "pre-wrap",
                  overflowWrap: "break-word",
                }}
              >
                {description}
              </p>
            </Linkify>
          </div>
        )}
        <p
          className="text-danger ms-3 mt-2 mb-4"
          style={{ fontSize: "1.1rem" }}
        >
          * Required fields are marked with an asterisk.
        </p>

        <div>
          {visibleSections.length > 0 &&
            visibleSections[currentVisibleIndex] && (
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
              disabled={isSubmitting}
              onClick={handleNext}
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-success"
              onClick={handleFormSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Survey"}
            </button>
          )}
        </div>
      </div>

      <div className="printable-view">
        {logo && (
          <img
            src={logo}
            alt="Logo"
            style={{ maxHeight: "100px", marginBottom: "20px" }}
          />
        )}
        <h1>{title || "Untitled Survey"}</h1>
        {description && <p style={{ whiteSpace: "pre-wrap" }}>{description}</p>}
        <hr />
        {(sections || []).map((section) => (
          <div key={`print-sec-${section.id}`} className="print-section">
            <h2 style={{ fontSize: "1.4em", color: "#333" }}>
              {section.title || `Section ${section.id}`}
            </h2>
            {(questions || [])
              .filter((q) => q.section === section.id)
              .map((question, index) => (
                <div
                  key={`print-q-${question.id}`}
                  className="question-wrapper-print"
                >
                  {renderPreviewQuestion(question, index + 1)}
                </div>
              ))}
          </div>
        ))}
      </div>

      <style>
        {`
          .printable-view { display: none; }

          @media print {
            .hide-on-print,
            .on-screen-view {
              display: none !important;
            }

            .printable-view {
              display: block !important;
              margin: 0;
            }
            
            .printable-view > :first-child {
                margin-top: 0 !important;
            }

            body {
              margin: 0 !important;
              padding: 1rem !important;
            }

            .question-wrapper-print { 
              page-break-inside: avoid; 
              break-inside: avoid; 
              margin-bottom: 20px; 
              padding: 1.25rem; 
              border: 1px solid #dee2e6; 
              border-radius: 0.375rem; 
            }
            .print-section { 
              margin-top: 25px; 
            }
          }
        `}
      </style>
    </>
  );
};

export default SurveyForm;
