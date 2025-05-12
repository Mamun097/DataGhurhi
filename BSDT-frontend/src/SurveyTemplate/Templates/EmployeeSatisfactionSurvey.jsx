import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Radio from "../QuestionTypes/Radio";
import Text from "../QuestionTypes/Text";
import Likert from "../QuestionTypes/LikertScale";
import RatingQuestion from "../QuestionTypes/Rating";
import DateTimeQuestion from "../QuestionTypes/DateTime";
import DropdownQuestion from "../QuestionTypes/Dropdown";
import LinearScaleQuestion from "../QuestionTypes/LinearScale";

const EmployeeSatisfactionSurvey = () => {
  const [title, setTitle] = useState("Employee Satisfaction Survey");
  const [newQuestion, setNewQuestion] = useState(false);
  // const [sections, setSections] = useState([
  //   {
  //     id: 1,
  //     title: "Section 1",
  //     questions: [],
  //   },
  // ]);
  const [questions, setQuestions] = useState([
    {
      id: 1,
      text: "What is your job role?",
      SubText: "",
      type: "radio",
      options: ["Intern", "Developer", "Manager", "CEO"],
      multipleSelection: false,
      required: false,
      image: null,
    },
    {
      id: 2,
      text: "What programming languages do you use?",
      subText: "",
      type: "radio",
      options: ["JavaScript", "Python", "Java", "C++"],
      multipleSelection: false,
      required: false,
      image: null,
    },
    {
      id: 3,
      text: "How many years of experience do you have?",
      subText: "",
      type: "radio",
      options: ["Less than 1 year", "1-3 years", "4-6 years", "7+ years"],
      multipleSelection: false,
      required: false,
      image: null,
    },
    {
      id: 4,
      text: "How strongly do you agree or disagree with the following statements around career opportunities?",
      subText: [
        "There are opportunities for professional growth",
        "My organisation is dedicated to my professional development",
        "My organisation offers job-related training",
      ],
      type: "likert",
      options: [
        "Strongly Disagree",
        "Disagree",
        "Neutral",
        "Agree",
        "Strongly Agree",
      ],
      multipleSelection: false,
      required: false,
    },
    {
      id: 5,
      text: "Any other feedback you want to provide?",
      subText: "",
      type: "text",
      options: [],
      multipleSelection: false,
      required: false,
    },
    {
      id: 6,
      text: "How would you rate the event overall?",
      scale: 5,
      type: "rating",
    },
    {
      id: 7,
      text: "When did the event take place?",
      dateType: "date",
      type: "datetime",
    },
    {
      id: 8,
      text: "Which session did you attend?",
      options: ["Session 1", "Session 2", "Session 3"],
      type: "dropdown",
    },
    {
      id: 9,
      text: "Rate the speaker's performance",
      min: 1,
      max: 5,
      leftLabel: "Poor",
      rightLabel: "Excellent",
      type: "linearScale",
    },
  ]);

  // Function to add a new section
  const addSection = () => {
    const newSection = {
      id: sections.length + 1,
      title: "Section " + (sections.length + 1),
      questions: [],
    };
    setSections([...sections, newSection]);
  };

  // Function to add a new question
  const addQuestionClicked = () => {
    setNewQuestion(true);
  };

  // Function to ask the user for the type of question
  const askNewQuestionType = () => {
    if (newQuestion) {
      return (
        <div className="mt-3">
          <p className="text-center">
            Select the type of question you want to add:)
          </p>
          <div className="d-flex justify-content-around">
            <button
              className="btn btn-secondary"
              onClick={() => addNewQuestion("radio")}
            >
              MCQ
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => addNewQuestion("text")}
            >
              Text
            </button>
            {/* <button
              className="btn btn-secondary"
              onClick={() => addNewQuestion("likert")}
            >
              Likert Scale
            </button> */}
            <button
              className="btn btn-secondary"
              onClick={() => addNewQuestion("rating")}
            >
              Rating
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => addNewQuestion("linearScale")}
            >
              Linear Scale
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => addNewQuestion("datetime")}
            >
              Date/Time
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => addNewQuestion("dropdown")}
            >
              Drop-down
            </button>
          </div>
        </div>
      );
    }
  };

  // Function to add a new question of the selected type
  const addNewQuestion = (type) => {
    const newQuestion = {
      id: questions.length + 1,
      text: "Enter your question here",
      subText: "",
      type: type,
      options: [],
      multipleSelection: false,
      required: false,
      image: null,
      scale: 5,
      dateType: "date",
      min: 1,
      max: 5,
      leftLabel: "Poor",
      rightLabel: "Excellent", 
    };
    setQuestions([...questions, newQuestion]);
    setNewQuestion(false);
  }

  return (
    <div>
      {/* Survey Header */}
      <div className="container mt-5 p-4 border rounded shadow bg-white text-center">
        <div style={{ position: "relative", width: "100%" }}>
          {/* Full-width Background Image */}
          <img
            src="sea.jpg"
            alt="Survey Icon"
            className="img-fluid"
            style={{
              width: "100%",
              height: "400px", // Adjust height as needed
              objectFit: "cover",
              borderRadius: "10px",
            }}
          />

          {/* Survey Title Input */}
          <input
            style={{
              position: "absolute",
              top: "80%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              color: "white",
              fontWeight: "bold",
              background: "rgba(0, 0, 0, 0.5)", // Dark overlay for better contrast
              padding: "10px 20px",
              borderRadius: "5px",
            }}
            type="text"
            className="form-control text-center"
            placeholder="Enter Survey Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
      </div>

      {/* Survey Questions Section */}
      <div className="container mt-5 p-4 border rounded shadow bg-white">
        {questions.map((question) => {
          if (question.type === "radio") {
            return (
              <Radio
                key={question.id}
                question={question}
                questions={questions}
                setQuestions={setQuestions}
              />
            );
          } else if (question.type === "text") {
            return (
              <Text
                key={question.id}
                question={question}
                questions={questions}
                setQuestions={setQuestions}
              />
            );
          } else if (question.type === "likert") {
            return (
              <Likert
                key={question.id}
                question={question}
                questions={questions}
                setQuestions={setQuestions}
              />
            );
          }
          else if (question.type === "rating") {
            return (
              <RatingQuestion
                key={question.id}
                question={question}
                questions={questions}
                setQuestions={setQuestions}
              />
            );
          }
          else if (question.type === "linearScale") {
            return (
              <LinearScaleQuestion
                key={question.id}
                question={question}
                questions={questions}
                setQuestions={setQuestions}
              />
            );
          }
          else if (question.type === "datetime") {
            return (
              <DateTimeQuestion
                key={question.id}
                question={question}
                questions={questions}
                setQuestions={setQuestions}
              />
            );
          }
          else if (question.type === "dropdown") {
            return (
              <DropdownQuestion
                key={question.id}
                question={question}
                questions={questions}
                setQuestions={setQuestions}
              />
            );
          }
             
        })}
        {/* Ask for the type of question to add */}
        {askNewQuestionType()}

        {/* Add Question Button */}
        <button
          className="btn btn-secondary w-100 mt-3"
          onClick={addQuestionClicked}
        >
          ➕ Add Question
        </button>
      </div>
    </div>
  );
};

export default EmployeeSatisfactionSurvey;
