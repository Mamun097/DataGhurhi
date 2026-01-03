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
  userResponse,
  setUserResponse,
}) => {
  // Filter questions for the current section
  const sectionQuestions = questions.filter(
    (q) => String(q.section) === String(section.id)
  );

  // Determine if auto-numbering is enabled for the section
  const showNumbering = section.autoNumbering;

  const renderQuestionComponent = (question, index) => {
    switch (question.type) {
      case "radio":
        return (
          <Radio
            index={index}
            question={question}
            userResponse={userResponse}
            setUserResponse={setUserResponse}
            showNumbering={showNumbering}
          />
        );
      case "text":
        return (
          <Text
            index={index}
            question={question}
            userResponse={userResponse}
            setUserResponse={setUserResponse}
            showNumbering={showNumbering}
          />
        );
      case "likert":
        return (
          <Likert
            index={index}
            question={question}
            userResponse={userResponse}
            setUserResponse={setUserResponse}
            showNumbering={showNumbering}
          />
        );
      case "rating":
        return (
          <RatingQuestion
            index={index}
            question={question}
            userResponse={userResponse}
            setUserResponse={setUserResponse}
            showNumbering={showNumbering}
          />
        );
      case "linearScale":
        return (
          <LinearScaleQuestion
            index={index}
            question={question}
            userResponse={userResponse}
            setUserResponse={setUserResponse}
            showNumbering={showNumbering}
          />
        );
      case "datetime":
        return (
          <DateTimeQuestion
            index={index}
            question={question}
            userResponse={userResponse}
            setUserResponse={setUserResponse}
            showNumbering={showNumbering}
          />
        );
      case "dropdown":
        return (
          <DropdownQuestion
            index={index}
            question={question}
            userResponse={userResponse}
            setUserResponse={setUserResponse}
            showNumbering={showNumbering}
          />
        );
      case "tickboxGrid":
        return (
          <TickBoxGrid
            index={index}
            question={question}
            userResponse={userResponse}
            setUserResponse={setUserResponse}
            showNumbering={showNumbering}
          />
        );
      case "checkbox":
        return (
          <Checkbox
            index={index}
            question={question}
            userResponse={userResponse}
            setUserResponse={setUserResponse}
            showNumbering={showNumbering}
          />
        );
      default:
        console.warn(`Unsupported question type: ${question.type}`);
        return null; // Or render a fallback UI
    }
  };

  return (
    <div>
      {sectionQuestions.map((question, index) => (
        <div
          className="mt-4 mb-4 bg-light rounded"
          key={question.id}
          style={{
            padding: 8,
            margin: "0 0 8px 0",
            border: "1px solid #ccc",
          }}
        >
          {renderQuestionComponent(question, index + 1)}
        </div>
      ))}
    </div>
  );
};

export default SurveyQuestions;
