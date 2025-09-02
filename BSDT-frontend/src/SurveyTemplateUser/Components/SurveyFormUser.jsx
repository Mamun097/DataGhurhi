import React, { useState, useEffect, useRef, useMemo } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import SurveySections from "./SurveySectionsUser";
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
  isSubmitting = false,
}) => {
  const [currentVisibleIndex, setCurrentVisibleIndex] = useState(0);
  console.log(questions);
  console.log("User response");
  console.log(userResponse);
  // Scroll to top when section changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentVisibleIndex]);

  // State and Effect for detecting mobile view ---
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // Using Bootstrap's 'md' breakpoint
    };

    window.addEventListener("resize", handleResize);
    // Cleanup the event listener on component unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [backgroundImage, setBackgroundImage] = useState(image || "");
  const [description, setDescription] = useState(
    template?.template?.description || ""
  );
  const hasShuffled = useRef(false);
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

  const validateCurrentSection = () => {
    const currentSection = visibleSections[currentVisibleIndex];
    if (!currentSection) return true;

    const questionsInSection = questionsBySection[currentSection.id] || [];
    const responseMap = new Map(
      userResponse.map((r) => [r.questionText, r.userResponse])
    );

    for (const question of questionsInSection) {
      if (question.required || question.meta?.requireEachRowResponse) {
        const answer = responseMap.get(question.text);

        let isAnswered = false;
        if (answer !== null && answer !== undefined) {
          if (Array.isArray(answer)) {
            isAnswered = answer.length > 0;
          } else if (typeof answer === "string") {
            isAnswered = answer.trim() !== "";
          } else {
            isAnswered = true;
          }
        }
        if (question.required && !isAnswered) {
          alert(
            `Please answer the required question: "${
              question.text || "Untitled Question"
            }"`
          );
          return false;
        }
        if (
          isAnswered &&
          (question.type === "likert" || question.type === "tickboxGrid") &&
          question.meta?.requireEachRowResponse
        ) {
          const totalRows = question.meta.rows.length;
          const answeredRows = answer.length;
          if (answeredRows < totalRows) {
            alert(
              `Please provide a response for every row in the question: "${
                question.text || "Untitled Question"
              }"`
            );
            return false;
          }
          if (question.type === "tickboxGrid") {
            const hasEmptyRowSelection = answer.some(
              (rowResponse) =>
                !rowResponse.response || rowResponse.response.length === 0
            );
            if (hasEmptyRowSelection) {
              alert(
                `Please select at least one option for every row in the question: "${question.text}"`
              );
              return false;
            }
          }
        }
      }
    }

    return true;
  };
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (validateCurrentSection()) {
      if (onSubmit) {
        onSubmit(e);
      }
    }
  };

  const handleNext = () => {
    if (validateCurrentSection()) {
      if (currentVisibleIndex < visibleSections.length - 1) {
        setCurrentVisibleIndex((prev) => prev + 1);
      }
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
      <p className="text-danger ms-3 mt-2 mb-4" style={{ fontSize: "1.1rem" }}>
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
            disabled={isSubmitting} // Also disable during submission
            onClick={handleNext}
          >
            Next
          </button>
        ) : (
          // 2 & 3. UPDATE THE SUBMIT BUTTON
          <button
            type="button"
            className="btn btn-success"
            onClick={handleFormSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Submitting...
              </>
            ) : (
              "Submit Survey"
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default SurveyForm;
