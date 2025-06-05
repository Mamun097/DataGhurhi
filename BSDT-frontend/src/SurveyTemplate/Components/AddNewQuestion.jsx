import React from "react";
import AutoGeneration from "./LLL-Generated-Question/AutoGeneration";
import 'bootstrap-icons/font/bootstrap-icons.css';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import ImportFromQb from "./importFromQB/importFromQb";

const AddQuestion = ({ newQuestion, setNewQuestion, addNewQuestion, addGeneratedQuestion, questionInfo, getLabel }) => {
  return (
    <div>
      {newQuestion && (
        <div className="mt-3 p-3 border rounded shadow-sm bg-light position-relative">
          <button
            type="button"
            className="btn-close"
            style={{
              position: 'absolute',
              top: '0.75rem',
              right: '0.75rem',
              zIndex: 2, 
            }}
            aria-label="Close"
            onClick={() => setNewQuestion(false)}
          ></button>
          <p className="text-center h6 mt-2 mb-3 mx-3"> 
            <b>{getLabel("Select the type of question you want to add")}</b>
          </p>
          {/* Responsive grid for question type buttons */}
          <div className="row justify-content-start g-2"> 
            <div className="col-6 col-md-4 col-lg-3">
              <button
                className="btn btn-outline-secondary w-100" 
                onClick={() => addNewQuestion("radio")}
              >
                {getLabel("Multiple Choice")}
              </button>
            </div>
            <div className="col-6 col-md-4 col-lg-3">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => addNewQuestion("text")}
              >
                {getLabel("Text")}
              </button>
            </div>
            <div className="col-6 col-md-4 col-lg-3">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => addNewQuestion("rating")}
              >
                {getLabel("Rating")}
              </button>
            </div>
            <div className="col-6 col-md-4 col-lg-3">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => addNewQuestion("linearScale")}
              >
                {getLabel("Linear Scale")}
              </button>
            </div>
            <div className="col-6 col-md-4 col-lg-3">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => addNewQuestion("checkbox")}
              >
                {getLabel("Checkbox")}
              </button>
            </div>
            <div className="col-6 col-md-4 col-lg-3">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => addNewQuestion("dropdown")}
              >
                {getLabel("Dropdown")}
              </button>
            </div>
            <div className="col-6 col-md-4 col-lg-3">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => addNewQuestion("datetime")}
              >
                {getLabel("Date/Time")}
              </button>
            </div>
            <div className="col-6 col-md-4 col-lg-3">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => addNewQuestion("likert")}
              >
                {getLabel("Likert Scale")}
              </button>
            </div>
            <div className="col-6 col-md-4 col-lg-3">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => addNewQuestion("tickboxGrid")}
              >
                {getLabel("Tick Box Grid")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Container for bottom action buttons, responsive flex layout */}
      <div className="d-flex flex-column flex-md-row align-items-center justify-content-center mt-3 text-center">
        <button
          className="btn btn-outline-primary mb-2 mb-md-0 me-md-3" 
          onClick={() => setNewQuestion(true)}
        >
          <i className="bi bi-plus-lg"></i> {getLabel("Add Question")} 
        </button>

        <div className="mb-2 mb-md-0 me-md-3"> 
            <AutoGeneration
              addGeneratedQuestion={addGeneratedQuestion}
              questionInfo={questionInfo}
              getLabel={getLabel}
            />
        </div>
        {/* <div className="mb-2 mb-md-0"> 
            <ImportFromQb
              addImportedQuestion={addImportedQuestion}
              questionInfo={questionInfo}
            />
        </div>
        */}
      </div>
    </div>
  );
};

export default AddQuestion;