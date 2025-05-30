import { useState } from "react";
import TagManager from "./QuestionSpecificUtils/Tag";
import ImageCropper from "./QuestionSpecificUtils/ImageCropper";

const Text = ({ question, questions, setQuestions }) => {
  const [showCropper, setShowCropper] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [required, setRequired] = useState(question.required || false);
  const [inputValidation, setInputValidation] = useState(
    question.meta?.validationType ? true : false
  );
  const [validationType, setValidationType] = useState(
    question.meta?.validationType || "Number"
  );
  const [condition, setCondition] = useState(
    question.meta?.condition || "Greater Than"
  );
  const [errorText, setErrorText] = useState(question.meta?.errorText || "");
  const [validationText, setValidationText] = useState(
    question.meta?.validationText || ""
  );
  const [min, setMin] = useState(
    question.meta?.validationText?.split(",")[0] || ""
  );
  const [max, setMax] = useState(
    question.meta?.validationText?.split(",")[1] || ""
  );

  console.log("Text component rendered with question:", question);
  console.log("Valuation Type:", validationType);
  console.log("Condition:", condition);
  console.log("validationText:", validationText);
  console.log("Min:", min);
  console.log("Max:", max);

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
    } else {
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

  // Handle image upload trigger
  const handleQuestionImageUpload = (event, id) => {
    const file = event.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setShowCropper(true);
  };

  // Remove image
  const removeImage = (index) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === question.id
          ? { ...q, imageUrls: q.imageUrls.filter((_, i) => i !== index) }
          : q
      )
    );
  };

  // Update image alignment
  const updateAlignment = (index, alignment) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === question.id
          ? {
              ...q,
              imageUrls: q.imageUrls.map((img, i) =>
                i === index ? { ...img, alignment } : img
              ),
            }
          : q
      )
    );
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
        q.id === question.id
          ? {
              ...q,
              meta: {
                ...q.meta,
                validationType: selectedType,
                condition: conditions[selectedType][0],
              },
            }
          : q
      )
    );
  };
  // handle updating the condition
  const handleConditionChange = (event) => {
    const selectedCondition = event.target.value;
    setCondition(selectedCondition);
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) =>
        q.id === question.id
          ? {
              ...q,
              meta: {
                ...q.meta,
                condition: selectedCondition,
              },
            }
          : q
      )
    );
  };
  // handle updating the validation text
  const handleValidationTextChange = (event) => {
    const newValidationText = event.target.value;
    setValidationText(newValidationText);
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) =>
        q.id === question.id
          ? {
              ...q,
              meta: {
                ...q.meta,
                validationText: newValidationText,
              },
            }
          : q
      )
    );
  };

  // handle updating the min and max values for conditions like "Between" or "Not Between"
  const handleMinMaxChange = (minValue, maxValue) => {
    setMin(minValue);
    setMax(maxValue);
    const newValidationText = `${minValue},${maxValue}`;
    setValidationText(newValidationText);
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) =>
        q.id === question.id
          ? {
              ...q,
              meta: {
                ...q.meta,
                validationText: newValidationText,
              },
            }
          : q
      )
    );
  };

  // handle updating the error text
  const handleErrorTextChange = (event) => {
    const newErrorText = event.target.value;
    setErrorText(newErrorText);
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) =>
        q.id === question.id
          ? {
              ...q,
              meta: {
                ...q.meta,
                errorText: newErrorText,
              },
            }
          : q
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
          placeholder="Enter your question here"
        />
      </div>
      <div className="mb-2">
        {showCropper && selectedFile && (
          <ImageCropper
            file={selectedFile}
            questionId={question.id}
            setQuestions={setQuestions}
            onClose={() => {
              setShowCropper(false);
              setSelectedFile(null);
            }}
          />
        )}

        {/* Image Previews with Remove and Alignment Options */}
        {question.imageUrls && question.imageUrls.length > 0 && (
          <div className="mb-2">
            {question.imageUrls.map((img, idx) => (
              <div
                key={idx}
                className="mb-3 bg-gray-50 p-3 rounded-lg shadow-sm"
              >
                <div
                  className={`d-flex justify-content-${
                    img.alignment || "start"
                  }`}
                >
                  <img
                    src={img.url}
                    alt={`Question ${idx}`}
                    className="img-fluid rounded"
                    style={{ maxHeight: 400 }}
                  />
                </div>
                <div className="d-flex justify-content-between mt-2 gap-2">
                  <select
                    className="form-select w-auto text-sm border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    value={img.alignment || "start"}
                    onChange={(e) => updateAlignment(idx, e.target.value)}
                  >
                    <option value="start">Left</option>
                    <option value="center">Center</option>
                    <option value="end">Right</option>
                  </select>
                  <button
                    className="btn btn-sm btn-outline-danger hover:bg-red-700 transition-colors me-1"
                    onClick={() => removeImage(idx)}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
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
                value={min}
                onChange={(e) => handleMinMaxChange(e.target.value, max)}
              />
              <label> & </label>
              <input
                type="text"
                className="form-control ms-2"
                placeholder="Type here"
                value={max}
                onChange={(e) => handleMinMaxChange(min, e.target.value)}
              />
            </div>
          )}
          {condition !== "Between" && condition !== "Not Between" && (
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
        <label className="btn btn-outline-secondary hover:bg-gray-100 transition-colors me-2">
          <i className="bi bi-image"></i>
          <input
            type="file"
            hidden
            onChange={(e) => handleQuestionImageUpload(e, question.id)}
          />
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
