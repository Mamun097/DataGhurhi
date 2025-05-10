import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { savedQuestions } from "../utils/customerSatisfactionQuestionData";
import SurveyForm from "../Components/SurveyForm"; // Import SurveyForm component
import { useEffect } from "react";
import foregtJPG from "../../assets/images/forest.jpg"; // Import the image

const CustomerSatisfactionSurvey = () => {
  const [title, setTitle] = useState("Customer Satisfaction Survey");
  const [questions, setQuestions] = useState(savedQuestions);
  const backgroundImage = foregtJPG; // Set the background image
        useEffect(() => {
          console.log("Updated Questions:");
          console.table(questions); // Logs the array in a structured table format
      }, [questions]);
  return (
    <div>
      {/* Pass title, setTitle, questions, and setQuestions to SurveyForm */}
      <SurveyForm
        title={title}
        setTitle={setTitle} // Pass setter function for title
        questions={questions}
        setQuestions={setQuestions} 
        image = {backgroundImage}// Pass setter function for questions
      />
    </div>
  );
};

export default CustomerSatisfactionSurvey;
