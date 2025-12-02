import ResponseText from "../QuestionTypes/ResponseText";
import ResponseRadio from "../QuestionTypes/ResponseRadio";

const SurveyQuestions = ({ section, questions, userResponse, template }) => {
  // Filter questions for the current section
  const sectionQuestions = questions.filter(
    (q) => String(q.section) === String(section.id)
  );

  const renderQuestionComponent = (question, index) => {
    switch (question.type) {
      case "radio":
        return (
          <ResponseRadio
            index={index}
            question={question}
            userResponse={userResponse}
            template={template}
          />
        );
      case "text":
        return (
          <ResponseText
            index={index}
            question={question}
            userResponse={userResponse}
            template={template}
          />
        );
      default:
        console.warn(`Unsupported question type: ${question.type}`);
        return null;
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
