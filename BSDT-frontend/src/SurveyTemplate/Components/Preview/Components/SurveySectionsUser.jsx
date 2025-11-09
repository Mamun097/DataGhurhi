import React from "react";
import SurveyQuestions from "../Components/SurveyQuestionsUser";

const SurveySections = ({
  section,
  sections,
  questions,
  userResponse,
  setUserResponse,
}) => {
  return (
    <div className="container mb-3 survey-section-user-view">
      {sections.length !== 1 && (
        <div>
          <h4 className="text-left">
            <i>Section </i>
            {section.id}
          </h4>
          <hr style={{ borderTop: "1px solid #ccc" }} />
          {section.title && (
            <p
              style={{
                fontSize: "1.1em",
                color: "#555",
                marginTop: "15px",
                whiteSpace: "pre-wrap",
              }}
            >
              {section.title}
            </p>
          )}
        </div>
      )}

      <SurveyQuestions
        section={section}
        questions={questions}
        userResponse={userResponse}
        setUserResponse={setUserResponse}
      />
    </div>
  );
};

export default SurveySections;