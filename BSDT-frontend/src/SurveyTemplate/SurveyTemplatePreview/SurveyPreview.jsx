import React from "react";
import "./SurveyPreview.css";

import Checkbox from "../../SurveyTemplateUser/QuestionTypes/CheckboxUser";
import DateTime from "../../SurveyTemplateUser/QuestionTypes/DateTimeUser";
import Dropdown from "../../SurveyTemplateUser/QuestionTypes/DropdownUser";
import LikertScale from "../../SurveyTemplateUser/QuestionTypes/LikertScaleUser";
import LinearScaleQuestion from "../../SurveyTemplateUser/QuestionTypes/LinearScaleUser";
import RadioQuestion from "../../SurveyTemplateUser/QuestionTypes/RadioUser";
import RatingQuestion from "../../SurveyTemplateUser/QuestionTypes/RatingUser";
import Text from "../../SurveyTemplateUser/QuestionTypes/TextUser";
import TickBoxGrid from "../../SurveyTemplateUser/QuestionTypes/TickBoxGridUser";

const SurveyPreview = ({
  title,
  sections,
  questions,
  logo,
  logoAlignment,
  logoText,
  image,
  description,
  language,
  getLabel,
}) => {
  const renderPreviewQuestion = (question) => {
    const interactiveProps = {
      question,
      language,
      getLabel,
      userResponse: [],
      setUserResponse: () => {},
    };

    switch (question.type) {
      case "checkbox":
        return <Checkbox {...interactiveProps} />;
      case "datetime":
        return <DateTime {...interactiveProps} />;
      case "dropdown":
        return <Dropdown {...interactiveProps} />;
      case "likert":
        return <LikertScale {...interactiveProps} />;
      case "linearScale":
        return <LinearScaleQuestion {...interactiveProps} />;
      case "radio":
        return <RadioQuestion {...interactiveProps} />;
      case "rating":
        return <RatingQuestion {...interactiveProps} />;
      case "text":
        return <Text {...interactiveProps} />;
      case "tickboxGrid":
        return <TickBoxGrid {...interactiveProps} />;
      default:
        return null;
    }
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div
      className="survey-preview-container"
      style={{
        pointerEvents: "none",
        fontFamily: "Arial, sans-serif",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        backgroundColor: "#f9f9f9",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingBottom: "15px",
          marginBottom: "15px",
          borderBottom: "2px solid #eee",
        }}
      >
        <h2 style={{ margin: 0, color: "#6c757d" }}>Preview Mode</h2>
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
          }}
        >
          Go Back
        </button>
      </div>

      {/* Logo section */}
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

      {image && (
        <img
          src={image}
          alt="Survey Banner"
          style={{
            width: "100%",
            height: "auto",
            marginBottom: "20px",
            borderRadius: "8px",
          }}
        />
      )}

      <h1>
        {title || (getLabel ? getLabel("Untitled Survey") : "Untitled Survey")}
      </h1>

      {description && (
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
      )}

      {(sections || []).map((section) => (
        <div key={section.id} style={{ marginTop: "25px" }}>
          <h2 style={{ fontSize: "1.4em", color: "#333" }}>
            {section.title ||
              (getLabel
                ? `${getLabel("Section")} ${section.id}`
                : `Section ${section.id}`)}
          </h2>

          <div style={{ marginTop: "15px" }}>
            {(questions || [])
              .filter((q) => q.section === section.id)
              .sort((a, b) => a.id - b.id)
              .map((question) => (
                <div
                  key={question.id}
                  style={{
                    marginBottom: "20px",
                    padding: "1.25rem",
                    border: "1px solid #dee2e6",
                    borderRadius: "0.375rem",
                    backgroundColor: "#fff",
                  }}
                >
                  {renderPreviewQuestion(question)}
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SurveyPreview;
