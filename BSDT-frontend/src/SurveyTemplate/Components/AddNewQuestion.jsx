import React from "react";
import AutoGeneration from "./LLL-Generated-Question/AutoGeneration";

const AddQuestion = ({ newQuestion, setNewQuestion, addNewQuestion, addGeneratedQuestion, questionInfo }) => {
  return (
    <div>
      {newQuestion && (
        <div className="mt-3">
          <p className="text-center" style={{ fontSize: '20px' }}>
            <b>Select the type of question you want to add</b>
          </p>
          <div className="row justify-content-around">
            <button
              className="col-md-3 btn btn-outline-secondary me-2 mb-2"
              onClick={() => addNewQuestion("radio")}
            >
              MCQ
            </button>
            <button
              className="col-md-3 btn btn-outline-secondary me-2 mb-2"
              onClick={() => addNewQuestion("text")}
            >
              Text
            </button>
            <button
              className="col-md-3 btn btn-outline-secondary me-2 mb-2"
              onClick={() => addNewQuestion("rating")}
            >
              Rating
            </button>
            <button
              className="col-md-3 btn btn-outline-secondary me-2 mb-2"
              onClick={() => addNewQuestion("linearScale")}
            >
              Linear Scale
            </button>
            <button
              className="col-md-3 btn btn-outline-secondary me-2 mb-2"
              onClick={() => addNewQuestion("checkbox")}
            >
              Checkbox
            </button>
            <button
              className="col-md-3 btn btn-outline-secondary me-2 mb-2"
              onClick={() => addNewQuestion("dropdown")}
            >
              Dropdown
            </button>
            <button
              className="col-md-3 btn btn-outline-secondary me-2 mb-2"
              onClick={() => addNewQuestion("datetime")}
            >
              Date/Time
            </button>
            <button
              className="col-md-3 btn btn-outline-secondary me-2 mb-2"
              onClick={() => addNewQuestion("likert")}
            >
              Likert Scale
            </button>
            <button
              className="col-md-3 btn btn-outline-secondary me-2 mb-2"
              onClick={() => addNewQuestion("tickboxGrid")}
            >
              Multiple Choice Grid
            </button>
          </div>
        </div>
      )}

      <div className="d-flex mt-2 ms-4">
        <button
          className="btn btn-outline-primary btn-lg mt-4 ms-4"
          onClick={() => setNewQuestion(true)}
        >
          ➕ Add Question
        </button>

        <AutoGeneration
          addGeneratedQuestion={addGeneratedQuestion}
          questionInfo={questionInfo}
        />
      </div>
    </div>
  );
};

export default AddQuestion;