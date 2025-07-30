import React from "react";
import AutoGeneration from "./LLL-Generated-Question/AutoGeneration";
import "bootstrap-icons/font/bootstrap-icons.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ImportFromQb from "./importFromQB/importFromQb";

const AddQuestion = ({
  newQuestion,
  setNewQuestion,
  addNewQuestion,
  addGeneratedQuestion,
  questionInfo,
  getLabel,
  addImportedQuestion,
}) => {
  const index = questionInfo ? questionInfo.index : 0; // This is used to determine the index of the new question being added
  return (
    <div>
      <style>
        {`
          .btn-outline-secondary {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          @media (max-width: 576px) {
            .btn-outline-secondary {
              font-size: 0.85rem;
              padding: 0.5rem 0.25rem;
            }
          }
        `}
      </style>
      {newQuestion && (
        <div className="mt-3 p-3 border rounded shadow-sm bg-light position-relative">
          <button
            type="button"
            className="btn-close"
            style={{
              position: "absolute",
              top: "0.75rem",
              right: "0.75rem",
              zIndex: 2,
            }}
            aria-label="Close"
            onClick={() => setNewQuestion(false)}
          ></button>
          <p className="text-center h6 mt-2 mb-3 mx-3">
            <b>{getLabel("Select the type of question you want to add")}</b>
          </p>
          <div className="row justify-content-start g-2">
            <div className="col-12 col-sm-6 col-md-4 col-lg-3">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => addNewQuestion("radio", index)}
              >
                {getLabel("Multiple Choice")}
              </button>
            </div>
            <div className="col-12 col-sm-6 col-md-4 col-lg-3">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => addNewQuestion("text", index)}
              >
                {getLabel("Text")}
              </button>
            </div>
            <div className="col-12 col-sm-6 col-md-4 col-lg-3">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => addNewQuestion("rating", index)}
              >
                {getLabel("Rating")}
              </button>
            </div>
            <div className="col-12 col-sm-6 col-md-4 col-lg-3">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => addNewQuestion("linearScale", index)}
              >
                {getLabel("Linear Scale")}
              </button>
            </div>
            <div className="col-12 col-sm-6 col-md-4 col-lg-3">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => addNewQuestion("checkbox", index)}
              >
                {getLabel("Checkbox")}
              </button>
            </div>
            <div className="col-12 col-sm-6 col-md-4 col-lg-3">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => addNewQuestion("dropdown", index)}
              >
                {getLabel("Dropdown")}
              </button>
            </div>
            <div className="col-12 col-sm-6 col-md-4 col-lg-3">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => addNewQuestion("datetime", index)}
              >
                {getLabel("Date/Time")}
              </button>
            </div>
            <div className="col-12 col-sm-6 col-md-4 col-lg-3">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => addNewQuestion("likert", index)}
              >
                {getLabel("Likert Scale")}
              </button>
            </div>
            <div className="col-12 col-sm-6 col-md-4 col-lg-3">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => addNewQuestion("tickboxGrid", index)}
              >
                {getLabel("Tick Box Grid")}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="d-flex flex-column flex-md-row align-items-center justify-content-center mt-3 text-center">
        <button
          className="btn btn-outline-primary mb-2 mb-md-0 me-md-3"
          onClick={() => setNewQuestion(true)}
        >
          <i className="bi bi-plus-lg"></i> {getLabel("Add Question")}
        </button>
        <ImportFromQb
          addImportedQuestion={addImportedQuestion}
          questionInfo={questionInfo}
        />
        <AutoGeneration
          addGeneratedQuestion={addGeneratedQuestion}
          questionInfo={questionInfo}
          getLabel={getLabel}
        />
      </div>
    </div>
  );
};

export default AddQuestion;
