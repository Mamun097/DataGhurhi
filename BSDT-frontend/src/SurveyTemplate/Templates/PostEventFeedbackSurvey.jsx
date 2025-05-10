import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { postEventSatisfactionQuestionData } from "../utils/postEventSatisfactionQuestionData";
import SurveyForm from "../Components/SurveyForm";
import saturnJPG from "../../../public/assets/images/saturn.jpg"; // Import the image

const PostSatisfactionSurvey = () => {
    const [title, setTitle] = useState("Post Event Satisfaction Survey");
    const [questions, setQuestions] = useState(postEventSatisfactionQuestionData);
    const backgroundImage = saturnJPG; // Set the background image

    // useEffect to log questions whenever it updates
    useEffect(() => {
        console.log("Updated Questions:");
        console.table(questions); // Logs the array in a structured table format
    }, [questions]);

    return (
        <div>
            {/* Pass initial title and questions to SurveyForm */}
            <SurveyForm
                title={title}
                setTitle={setTitle} // Pass setter function for title
                questions={questions}
                setQuestions={setQuestions} // Pass setter function for questions
                image={backgroundImage}
            />
        </div>
    );
};

export default PostSatisfactionSurvey;
