import { useState, useEffect, useRef, useMemo } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import SurveySections from "./ResponseSurveySections";
import Linkify from "react-linkify";

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

const ResponseSurveyForm = ({ template, userResponse, calculatedMarks }) => {
  // Destructure template
  const [title] = useState(template.title || "");
  const [description] = useState(template.template.description || "");
  const [sections] = useState(template.template.sections || []);
  const [questions] = useState(template.template.questions || []);
  const [logo] = useState(template.template.logo || null);
  const [logoAlignment] = useState(template.template.logoAlignment || "center");
  const [logoText] = useState(template.template.logoText || "");
  const [backgroundImage] = useState(template.template.backgroundImage || null);
  const [isQuiz] = useState(template.template.isQuiz || false);
  const [currentVisibleIndex, setCurrentVisibleIndex] = useState(0);

  // State and Effect for detecting mobile view ---
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Scroll to top when section changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentVisibleIndex]);

  const questionsBySection = useMemo(() => {
    return questions.reduce((acc, question) => {
      const sectionId = question.section;
      if (!acc[sectionId]) {
        acc[sectionId] = [];
      }
      acc[sectionId].push(question);
      return acc;
    }, {});
  }, [questions]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // Using Bootstrap's 'md' breakpoint
    };

    window.addEventListener("resize", handleResize);
    // Cleanup the event listener on component unmount
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
          {isMobile || logoAlignment === "center" ? (
            // This block is used for CENTER alignment OR any alignment on MOBILE
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
            // This block is ONLY used for LEFT/RIGHT alignment on DESKTOP
            <div
              className={`py-3 px-3 d-flex align-items-start justify-content-between flex-column flex-sm-row ${
                logoAlignment === "left" ? "flex-sm-row" : "flex-sm-row-reverse"
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

      {backgroundImage && <hr className="my-4" />}

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
        className="text-danger text-center my-3"
        style={{ fontSize: "1.1rem" }}
      >
        * Required fields are marked.
      </p>

      <div>
        {visibleSections[currentVisibleIndex] && (
          <SurveySections
            key={visibleSections[currentVisibleIndex].id}
            section={visibleSections[currentVisibleIndex]}
            sections={visibleSections}
            questions={questions}
            userResponse={userResponse}
            template={template}
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
        ) : null}
      </div>
    </div>
  );
};

export default ResponseSurveyForm;
