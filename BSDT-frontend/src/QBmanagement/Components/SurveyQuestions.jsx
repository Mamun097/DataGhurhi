import React from "react";

// Import your question type components:
import RadioQuestionView from "../viewOnlyQtypes/Radio";
import Radio from "../QuestionTypes/Radio";
import TextView from "../viewOnlyQtypes/Text";
import LikertScaleView from "../viewOnlyQtypes/LikertScale";
import RatingQuestionView from "../viewOnlyQtypes/Rating";
import DateTimeViewOnly from "../viewOnlyQtypes/DateTime";
import DropdownViewOnly from "../viewOnlyQtypes/Dropdown";
import CheckboxViewOnly from "../viewOnlyQtypes/Checkbox";
import TickBoxGridView from "../viewOnlyQtypes/TickboxGrid";
import LinearScaleQuestionView from "../viewOnlyQtypes/LinearScale";

const SurveyQuestions = ({ questions, setQuestions,newQuestion, setNewQuestion }) => {
 



  const renderQuestionComponent = (question) => {
   
  // console.log("Is Owner:", isOwner);
    switch (question.type) {
       case "radio":
  
       return(
        <RadioQuestionView
          question={question}
          surveyTitle={question.survey_name}
          projectTitle={question.project_name}
          newQuestion={newQuestion}
          setNewQuestion={setNewQuestion}
          
        
        />
      );
      case "text":
        return (
          <TextView
            question={question}
            surveyTitle={question.survey_name}
            projectTitle={question.project_name}
            newQuestion={newQuestion}
            setNewQuestion={setNewQuestion}
            />
        );
      case "likert":
        return (
          <LikertScaleView
            question={question}
            surveyTitle={question.survey_name}
            projectTitle={question.project_name}  
            newQuestion={newQuestion}
            setNewQuestion={setNewQuestion}

          />
        );
      case "rating":
        return (
          <RatingQuestionView
            question={question}
            surveyTitle={question.survey_name}
            projectTitle={question.project_name}
            newQuestion={newQuestion}
            setNewQuestion={setNewQuestion}
          />
        );
      case "linearScale":
        return (
          <LinearScaleQuestionView
            question={question}
            surveyTitle={question.survey_name}
            projectTitle={question.project_name}
            newQuestion={newQuestion}
            setNewQuestion={setNewQuestion}
          />
        );
      case "datetime":
        return (
          <DateTimeViewOnly
            question={question}
            surveyTitle={question.survey_name}
            projectTitle={question.project_name}
            newQuestion={newQuestion}
            setNewQuestion={setNewQuestion}
          />
        );
      case "dropdown":
        return (
          <DropdownViewOnly
            question={question}
            surveyTitle={question.survey_name}
            projectTitle={question.project_name}
            newQuestion={newQuestion}
            setNewQuestion={setNewQuestion}
          />
        );
      case "tickboxGrid":
        return (
          <TickBoxGridView
            question={question}
            surveyTitle={question.survey_name}
            projectTitle={question.project_name}
            newQuestion={newQuestion}
            setNewQuestion={setNewQuestion}
            />
        );
      case "checkbox":
        return (
          <CheckboxViewOnly
            question={question}
            surveyTitle={question.survey_name}
            projectTitle={question.project_name}
            newQuestion={newQuestion}
            setNewQuestion={setNewQuestion}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="mb-3">
      {questions.map((question) => (
        <div key={question.question_id} className="mb-4">
          {renderQuestionComponent(question)}
        </div>
      ))}
    </div>
  );
};

export default SurveyQuestions;
