import React from "react";
import AutoGeneration from "./LLL-Generated-Question/AutoGeneration";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import ImportFromQb from "./importFromQB/importFromQb";

const AddQuestion = ({ newQuestion, setNewQuestion, addNewQuestion, addGeneratedQuestion, questionInfo, getLabel }) => {
  return (
    <div>
      {newQuestion && (
        <div className="mt-3">
          <p className="text-center" style={{ fontSize: '20px' }}>
            <b>{getLabel("Select the type of question you want to add")}</b>
          </p>
          <div className="row justify-content-around">
            <button
              className="col-md-3 btn btn-outline-secondary me-2 mb-2"
              onClick={() => addNewQuestion("radio")}
            >
              {getLabel("Multiple Choice Question")}
            </button>
            <button
              className="col-md-3 btn btn-outline-secondary me-2 mb-2"
              onClick={() => addNewQuestion("text")}
            >
              {getLabel("Text")}
            </button>
            <button
              className="col-md-3 btn btn-outline-secondary me-2 mb-2"
              onClick={() => addNewQuestion("rating")}
            >
              {getLabel("Rating")}
            </button>
            <button
              className="col-md-3 btn btn-outline-secondary me-2 mb-2"
              onClick={() => addNewQuestion("linearScale")}
            >
              {getLabel("Linear Scale")}
            </button>
            <button
              className="col-md-3 btn btn-outline-secondary me-2 mb-2"
              onClick={() => addNewQuestion("checkbox")}
            >
              {getLabel("Checkbox")}
            </button>
            <button
              className="col-md-3 btn btn-outline-secondary me-2 mb-2"
              onClick={() => addNewQuestion("dropdown")}
            >
              {getLabel("Dropdown")}
            </button>
            <button
              className="col-md-3 btn btn-outline-secondary me-2 mb-2"
              onClick={() => addNewQuestion("datetime")}
            >
              {getLabel("Date/Time")}
            </button>
            <button
              className="col-md-3 btn btn-outline-secondary me-2 mb-2"
              onClick={() => addNewQuestion("likert")}
            >
              {getLabel("Likert Scale")}
            </button>
            <button
              className="col-md-3 btn btn-outline-secondary me-2 mb-2"
              onClick={() => addNewQuestion("tickboxGrid")}
            >
              {getLabel("Multiple Choice Grid")}
            </button>
          </div>
        </div>
      )}

      <div className="d-flex mt-2 ms-4">
        <button
          className="btn btn-outline-primary btn-lg mt-4 ms-4"
          onClick={() => setNewQuestion(true)}
        >
          ➕ {getLabel("Add Question")}
        </button>

        <AutoGeneration
          addGeneratedQuestion={addGeneratedQuestion}
          questionInfo={questionInfo}
          getLabel={getLabel}
        />
        {/* <ImportFromQb
          addImportedQuestion={addImportedQuestion}
          questionInfo={questionInfo}
        /> */}
      </div>
    </div>
  );
};

export default AddQuestion;