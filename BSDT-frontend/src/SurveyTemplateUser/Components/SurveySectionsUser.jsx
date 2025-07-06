import React from "react";
import SurveyQuestions from "../Components/SurveyQuestionsUser";

const SurveySections = ({
  section,
  sections,
  questions,
  setQuestions,
  userResponse,
  setUserResponse,
}) => {
  return (
    <div className="container mb-3">
      {sections.length !== 1 && (
        <div>
          <h4 className="text-left">
            <i>Section </i>
            {section.id}
            <hr />
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
          </h4>
        </div>
      )}

      {/* Survey Questions Component */}
      <SurveyQuestions
        section={section}
        questions={questions}
        setQuestions={setQuestions}
        userResponse={userResponse}
        setUserResponse={setUserResponse}
      />
    </div>
  );
};

export default SurveySections;
