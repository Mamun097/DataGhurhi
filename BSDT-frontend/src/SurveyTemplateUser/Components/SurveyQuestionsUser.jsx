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

const SurveyQuestions = ({ section, questions, setQuestions }) => {
  // Filter questions for the current section
  const sectionQuestions = questions.filter((q) => q.section === section.id);

  const renderQuestionComponent = (question) => {
    switch (question.type) {
      case "radio":
        return (
          <Radio
            question={question}
            questions={questions}
            setQuestions={setQuestions}
          />
        );
      case "text":
        return (
          <Text
            question={question}
            questions={questions}
            setQuestions={setQuestions}
          />
        );
      case "likert":
        return (
          <Likert
            question={question}
            questions={questions}
            setQuestions={setQuestions}
          />
        );
      case "rating":
        return (
          <RatingQuestion
            question={question}
            questions={questions}
            setQuestions={setQuestions}
          />
        );
      case "linearScale":
        return (
          <LinearScaleQuestion
            question={question}
            questions={questions}
            setQuestions={setQuestions}
          />
        );
      case "datetime":
        return (
          <DateTimeQuestion
            question={question}
            questions={questions}
            setQuestions={setQuestions}
          />
        );
      case "dropdown":
        return (
          <DropdownQuestion
            question={question}
            questions={questions}
            setQuestions={setQuestions}
          />
        );
      case "tickboxGrid":
        return (
          <TickBoxGrid
            question={question}
            questions={questions}
            setQuestions={setQuestions}
          />
        );
      case "checkbox":
        return (
          <Checkbox
            question={question}
            questions={questions}
            setQuestions={setQuestions}
          />
        );
      default:
        console.warn(`Unsupported question type: ${question.type}`);
        return null; // Or render a fallback UI
    }
  };

  return (
    <div className="mb-3">
      <div className="mt-2">
        {sectionQuestions.map((question) => (
          <div
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
    </div>
  );
};

export default SurveyQuestions;