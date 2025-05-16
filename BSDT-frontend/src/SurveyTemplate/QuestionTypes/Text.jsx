import { useState } from "react";
import TagManager from "./QuestionSpecificUtils/Tag";

const Text = ({ question, questions, setQuestions }) => {
  const [required, setRequired] = useState(question.required || false);
  const [inputValidation, setInputValidation] = useState(false);
  const [validationType, setValidationType] = useState("Number");
  const [condition, setCondition] = useState("Greater Than");
  const [errorText, setErrorText] = useState("");
  const [validationText, setValidationText] = useState("");

  const conditions = {
    Number: [
      "Greater Than",
      "Greater Than or Equal To",
      "Less Than",
      "Less Than or Equal To",
      "Equal To",
      "Not Equal To",
      "Between",
      "Not Between",
      "Is Number",
      "Is Not Number",
    ],
    Text: ["Contains", "Does Not Contain", "Email", "URL"],
    Length: ["Maximum character Count", "Minimum character Count"],
    RegularExpression: [
      "Contains",
      "Doesn't Contain",
      "Matches",
      "Doesn't Match",
    ],
  };

  // Validate the input
  const handleSettings = () => {
    if (inputValidation) {
      setInputValidation(false);
    }
    else {
      setInputValidation(true);
      setQuestions((prevQuestions) =>
        prevQuestions.map((q) =>
          q.id === question.id
            ? {
              ...q,
              meta: {
                ...q.meta,
                validationType: validationType,
                condition: condition,
                errorText: errorText,
                validationText: validationText,
              },
            }
            : q
        )
      );
    }
  };

  // Toggle the required status of the question
  const handleRequired = () => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) =>
        q.id === question.id ? { ...q, required: !q.required } : q
      )
    );
    setRequired(!required);
  };

  // Update the question text
  const handleQuestionChange = (newText) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) =>
        q.id === question.id ? { ...q, text: newText } : q
      )
    );
  };

  // Delete the current question and reassign sequential IDs
  const handleDelete = () => {
    setQuestions((prevQuestions) => {
      const filtered = prevQuestions.filter((q) => q.id !== question.id);
      return filtered.map((q, index) => ({ ...q, id: index + 1 }));
    });
  };

  // Upload an image for the question
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setQuestions((prevQuestions) =>
          prevQuestions.map((q) =>
            q.id === question.id ? { ...q, image: e.target.result } : q
          )
        );
      };
      reader.readAsDataURL(file);
    }
  };

  // Copy the current question: insert duplicate immediately below,
  // assign copied question an id equal to original id + 1,
  // and increment IDs for all subsequent questions.
  const handleCopy = () => {
    const index = questions.findIndex((q) => q.id === question.id);
    const newId = question.id + 1;
    const copiedQuestion = {
      ...question,
      id: newId,
    };

    // Increment IDs for questions with id greater than the current one
    const updatedQuestions = questions.map((q) =>
      q.id > question.id ? { ...q, id: q.id + 1 } : q
    );

    // Insert the copied question right after the original
    updatedQuestions.splice(index + 1, 0, copiedQuestion);
    // Sort to maintain sequential order
    updatedQuestions.sort((a, b) => a.id - b.id);
    setQuestions(updatedQuestions);
  };

  // handle updating the validation type
  const handleValidationTypeChange = (event) => {
    const selectedType = event.target.value;
    setValidationType(selectedType);
    setCondition(conditions[selectedType][0]); // Reset condition to the first one
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) =>
        q.id === question.id ? {
          ...q,
          meta: {
            ...q.meta,
            validationType: selectedType,
            condition: conditions[selectedType][0],
          },
        } : q
      )
    );
  };
  // handle updating the condition
  const handleConditionChange = (event) => {
    const selectedCondition = event.target.value;
    setCondition(selectedCondition);
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) =>
        q.id === question.id ? {
          ...q,
          meta: {
            ...q.meta,
            condition: selectedCondition,
          },
        } : q
      )
    );
  };
  // handle updating the validation text
  const handleValidationTextChange = (event) => {
    const newValidationText = event.target.value;
    setValidationText(newValidationText);
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) =>
        q.id === question.id ? {
          ...q,
          meta: {
            ...q.meta,
            validationText: newValidationText,
          },
        } : q
      )
    );
  };

  // handle updating the error text
  const handleErrorTextChange = (event) => {
    const newErrorText = event.target.value;
    setErrorText(newErrorText);
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) =>
        q.id === question.id ? {
          ...q,
          meta: {
            ...q.meta,
            errorText: newErrorText,
          },
        } : q
      )
    );
  };


  return (
    <div className="mb-3">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <label className="ms-2" style={{ fontSize: "1.2rem" }}>
          <em>
            <strong>Text</strong>
          </em>
        </label>

        {/* Use the TagManager component */}
        <TagManager
          questionId={question.id}
          questionText={question.text}
          questions={questions}
          setQuestions={setQuestions}
        />
      </div>


      {/* Question Input */}
      <div className="d-flex align-items-center mt-2 mb-2">
        <input
          type="text"
          className="form-control"
          value={question.text}
          onChange={(e) => handleQuestionChange(e.target.value)}
        />
      </div>
      <div className="mb-2">
        {/* Image Preview */}
        {question.image && (
          <img
            src={question.image}
            alt="Uploaded"
            className="img-fluid mb-2"
            style={{ maxHeight: "400px" }}
          />
        )}
      </div>
      <input
        type="text"
        className="form-control"
        placeholder="Enter your answer here"
        readOnly
      />
      {inputValidation && (
        <div>
          <div className="d-flex align-items-center mt-2">
            <select
              className="form-select me-2"
              onChange={(e) => {
                handleValidationTypeChange(e);
              }}
              value={validationType}
            >
              {Object.keys(conditions).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <select
              className="form-select"
              onChange={(e) => {
                handleConditionChange(e);
              }}
              value={condition}
            >
              {conditions[validationType].map((condition) => (
                <option key={condition} value={condition}>
                  {condition}
                </option>
              ))}
            </select>
          </div>
          {(condition === "Between" || condition === "Not Between") && (
            <div className="d-flex align-items-center mt-2">
              <input
                type="text"
                className="form-control me-2"
                placeholder="Type here"
              />
              <label> & </label>
              <input
                type="text"
                className="form-control ms-2"
                placeholder="Type here"
              />
            </div>
          )}
          {(condition !== "Between" || condition !== "Not Between") && (
            <div className="d-flex align-items-center mt-2">
              <input
                type="text"
                className="form-control me-2"
                placeholder="Type here"
                value={validationText}
                onChange={(e) => handleValidationTextChange(e)}
              />
            </div>
          )}
          <div>
            <input
              type="text"
              className="form-control me-2 mt-2"
              placeholder="Custom Error Message (Optional)"
              value={errorText}
              onChange={(e) => handleErrorTextChange(e)}
            />
          </div>
        </div>
      )}
      <div className="d-flex align-items-center mt-3">
        <button className="btn btn-outline-secondary me-2" onClick={handleCopy}>
          <i className="bi bi-clipboard"></i>
        </button>
        <button
          className="btn btn-outline-secondary me-2"
          onClick={handleDelete}
        >
          <i className="bi bi-trash"></i>
        </button>
        <label className="btn btn-outline-secondary me-2">
          <i className="bi bi-image"></i>
          <input type="file" hidden onChange={handleImageUpload} />
        </label>
        <button
          className="btn btn-outline-secondary me-2"
          onClick={handleSettings}
        >
          <i className="bi bi-gear"></i>
        </button>
        <div className="form-check form-switch ms-auto">
          <input
            className="form-check-input"
            type="checkbox"
            onChange={handleRequired}
            checked={required}
          />
          <label className="form-check-label">Required</label>
        </div>
      </div>
    </div>
  );
};

export default Text;
