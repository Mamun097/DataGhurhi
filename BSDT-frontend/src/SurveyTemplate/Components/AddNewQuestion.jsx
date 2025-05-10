import React from "react";

const AddQuestion = ({ newQuestion, setNewQuestion, addNewQuestion }) => {
  return (
    <div className="container mt-3">
      {newQuestion && (
        <div className="mt-3 ">
          <p className="text-center">
            Select the type of question you want to add
          </p>
          <div className="row justify-content-around">
            <button
              className="col-md-3 btn btn-secondary btn-s me-2 mb-2"
              onClick={() => addNewQuestion("radio")}
            >
              Radio (MCQ)
            </button>
            <button
              className="col-md-3 btn btn-secondary btn-s me-2 mb-2"
              onClick={() => addNewQuestion("text")}
            >
              Text
            </button>
            <button
              className="col-md-3 btn btn-secondary btn-s me-2 mb-2"
              onClick={() => addNewQuestion("rating")}
            >
              Rating
            </button>
            <button
              className="col-md-3 btn btn-secondary btn-s me-2 mb-2"
              onClick={() => addNewQuestion("linearScale")}
            >
              Linear Scale
            </button>
            <button
              className="col-md-3 btn btn-secondary btn-s me-2 mb-2"
              onClick={() => addNewQuestion("checkbox")}
            >
              Checkbox
            </button>
            <button
              className="col-md-3 btn btn-secondary btn-s me-2 mb-2"
              onClick={() => addNewQuestion("dropdown")}
            >
              Dropdown
            </button>
            <button
              className="col-md-3 btn btn-secondary btn-s me-2 mb-2"
              onClick={() => addNewQuestion("datetime")}
            >
              Date & Time
            </button>
            <button
              className="col-md-3 btn btn-secondary btn-s me-2 mb-2"
              onClick={() => addNewQuestion("likert")}
            >
              Likert Scale
            </button>
            <button
              className="col-md-3 btn btn-secondary btn-s me-2 mb-2"
              onClick={() => addNewQuestion("tickboxGrid")}
            >
              Tick Box Grid
            </button>
          </div>
        </div>
      )}

      <button
        className="btn btn-sm btn-outline-primary mt-2"
        onClick={() => setNewQuestion(true)}
      >Add Question
      </button>
    </div>
  );
};

export default AddQuestion;
