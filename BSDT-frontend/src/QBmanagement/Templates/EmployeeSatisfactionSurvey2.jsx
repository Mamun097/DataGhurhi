import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { savedQuestions } from "../utils/employeeSatisfactionQuestionData";
import SurveyForm from "../Components/SurveyForm";
import { useEffect } from "react";
import seaImage from "../../assets/images/sea.jpg"; // Import the image

const EmployeeSatisfactionSurvey2 = () => {
  const [title, setTitle] = useState("Employee Satisfaction Survey");
  const [questions, setQuestions] = useState(savedQuestions);
  const backgroundImage = seaImage;
  // useEffect to log questions whenever it updates
  useEffect(() => {
    console.log("Updated Questions:");
    console.table(questions); // Logs the array in a structured table format
  }, [questions]);

  return (
    <div>
      <SurveyForm
        title={title}
        setTitle={setTitle}
        questions={questions}
        setQuestions={setQuestions}
        image={backgroundImage}
      />
    </div>
  );
};

export default EmployeeSatisfactionSurvey2;
