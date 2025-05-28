import React from "react";
import SurveyQuestions from "../Components/SurveyQuestionsUser";
import Option from "../QuestionTypes/QuestionSpecificUtils/OptionClass";

const SurveySections = ({
    section,
    sections,
    questions,
    setQuestions,
  }) => {

  
  return (
    <div className="container-fluid shadow border bg-white rounded p-3 mt-3 mb-3">
      {sections.length !== 1 && (
        <div>
          <h4 className="text-left">
            <i>Section </i>
            {section.id}
          </h4>
        </div>
      )}

      {/* Survey Questions Component */}
      <SurveyQuestions
        section={section}
        questions={questions}
        setQuestions={setQuestions}
      />        
      </div>
  );
};

export default SurveySections;
