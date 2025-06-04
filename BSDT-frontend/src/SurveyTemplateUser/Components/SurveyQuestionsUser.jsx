import React from "react";
import Radio from "../QuestionTypes/RadioUser";
import Text from "../QuestionTypes/TextUser";
import Likert from "../QuestionTypes/LikertScaleUser";
import RatingQuestion from "../QuestionTypes/RatingUser";
import DateTimeQuestion from "../QuestionTypes/DateTimeUser";
import DropdownQuestion from "../QuestionTypes/DropdownUser";
import LinearScaleQuestion from "../QuestionTypes/LinearScaleUser";
import Checkbox from "../QuestionTypes/CheckboxUser";
import TickBoxGrid from "../QuestionTypes/TickBoxGridUser";

const SurveyQuestions = ({
  section,
  questions,
  setQuestions,
  userResponse,
  setUserResponse,
}) => {
  // Filter questions for the current section
  const sectionQuestions = questions.filter((q) => q.section === section.id);

  const renderQuestionComponent = (question) => {
    switch (question.type) {
      case "radio":
        return (
          <Radio
            question={question}
            userResponse={userResponse}
            setUserResponse={setUserResponse}
          />
        );
      case "text":
        return (
          <Text
            question={question}
            userResponse={userResponse}
            setUserResponse={setUserResponse}
          />
        );
      case "likert":
        return (
          <Likert
            question={question}
            userResponse={userResponse}
            setUserResponse={setUserResponse}
          />
        );
      case "rating":
        return (
          <RatingQuestion
            question={question}
            userResponse={userResponse}
            setUserResponse={setUserResponse}
          />
        );
      case "linearScale":
        return (
          <LinearScaleQuestion
            question={question}
            userResponse={userResponse}
            setUserResponse={setUserResponse}
          />
        );
      case "datetime":
        return (
          <DateTimeQuestion
            question={question}
            userResponse={userResponse}
            setUserResponse={setUserResponse}
          />
        );
      case "dropdown":
        return (
          <DropdownQuestion
            question={question}
            userResponse={userResponse}
            setUserResponse={setUserResponse}
          />
        );
      case "tickboxGrid":
        return (
          <TickBoxGrid
            question={question}
            userResponse={userResponse}
            setUserResponse={setUserResponse}
          />
        );
      case "checkbox":
        return (
          <Checkbox
            question={question}
            userResponse={userResponse}
            setUserResponse={setUserResponse}
          />
        );
      default:
        console.warn(`Unsupported question type: ${question.type}`);
        return null; // Or render a fallback UI
    }
  };

  return (
    <div >
      {sectionQuestions.map((question) => (
        <div
          className="mt-4 mb-4 bg-light rounded"
          key={question.id}
          style={{
            padding: 8,
            margin: "0 0 8px 0",
            border: "1px solid #ccc",
          }}
        >
          {renderQuestionComponent(question)}
        </div>
      ))}
    </div>
  );
};

export default SurveyQuestions;
