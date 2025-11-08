import React, { useState, useEffect, useCallback,useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import TagManager from "./QuestionSpecificUtils/Tag";
import ImageCropper from "./QuestionSpecificUtils/ImageCropper";
import translateText from "./QuestionSpecificUtils/Translation";

const LinearScaleQuestion = ({
  index,
  question,
  questions,
  setQuestions,
  language,
  setLanguage,
  getLabel,
}) => {
  const [showCropper, setShowCropper] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const [required, setRequired] = useState(question.required || false);
  const [minValue, setMinValue] = useState(question.min || 1);
  const [maxValue, setMaxValue] = useState(question.max || 5);
  const [leftLabel, setLeftLabel] = useState(question.leftLabel || "");
  const [rightLabel, setRightLabel] = useState(question.rightLabel || "");

  // Initialize showLabels based on the initial question prop's labels
  const [showLabels, setShowLabels] = useState(
    !!(question.leftLabel || question.rightLabel)
  );

  // Main useEffect to sync with most question prop changes (excluding showLabels direct control)
  useEffect(() => {
    setRequired(question.required || false);
    // setImage(question.image || null); // Consider if this 'image' state is needed
    setMinValue(question.min || 1);
    setMaxValue(question.max || 5);
    setLeftLabel(question.leftLabel || "");
    setRightLabel(question.rightLabel || "");
    // DO NOT set showLabels here directly based on question.leftLabel/rightLabel
    // as it overrides user's explicit toggle when unrelated props (min/max) change.
  }, [question]);

  // Separate useEffect to update showLabels if the actual label props change
  useEffect(() => {
    setShowLabels(!!(question.leftLabel || question.rightLabel));
  }, [question.leftLabel, question.rightLabel]);

  const updateQuestion = useCallback(
    (updates) => {
      setQuestions((prev) =>
        prev.map((q) => (q.id === question.id ? { ...q, ...updates } : q))
      );
    },
    [setQuestions, question.id]
  );

  const handleRequired = () => {
    const newRequiredState = !required;
    updateQuestion({ required: newRequiredState });
    setRequired(newRequiredState);
  };

  const handleQuestionChange = useCallback(
    (newText) => {
      updateQuestion({ text: newText });
    },
    [updateQuestion]
  );

  const [validationError, setValidationError] = useState("");

  const handleMinChange = (e) => {
    const newMin = Number(e.target.value);

    if (newMin >= maxValue) {
      setValidationError(`Minimum value must be less than ${maxValue}`);
      return;
    }

    setValidationError("");
    setMinValue(newMin);
    updateQuestion({ min: newMin });
  };

  const handleMaxChange = (e) => {
    const newMax = Number(e.target.value);

    if (newMax <= minValue) {
      setValidationError(`Maximum value must be greater than ${minValue}`);
      return;
    }

    setValidationError("");
    setMaxValue(newMax);
    updateQuestion({ max: newMax });
  };

  const handleLeftLabelChange = (e) => {
    const newLabel = e.target.value;
    setLeftLabel(newLabel);
    updateQuestion({ leftLabel: newLabel });
  };

  const handleRightLabelChange = (e) => {
    const newLabel = e.target.value;
    setRightLabel(newLabel);
    updateQuestion({ rightLabel: newLabel });
  };

  const toggleLabels = () => {
    const newShowLabelsState = !showLabels;
    setShowLabels(newShowLabelsState);

    if (!newShowLabelsState) {
      // If turning labels off, clear them and update the question
      setLeftLabel("");
      setRightLabel("");
      updateQuestion({ leftLabel: "", rightLabel: "" });
    }
    // If turning labels on, local state is updated.
    // Persisted labels will be updated when user types into label inputs.
  };

  const handleDelete = () => {
    setQuestions((prevQuestions) => {
      const filtered = prevQuestions.filter((q) => q.id !== question.id);
      return filtered.map((q, index) => ({ ...q, id: index + 1 }));
    });
  };

  const handleQuestionImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setShowCropper(true);
    if (event.target) event.target.value = null;
  };

  const removeImage = (index) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === question.id
          ? {
              ...q,
              imageUrls: (q.imageUrls || []).filter((_, i) => i !== index),
            }
          : q
      )
    );
  };

  const updateAlignment = (index, alignment) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === question.id
          ? {
              ...q,
              imageUrls: (q.imageUrls || []).map((img, i) =>
                i === index ? { ...img, alignment } : img
              ),
            }
          : q
      )
    );
  };

  const handleCopy = () => {
    const index = questions.findIndex((q) => q.id === question.id);
    const copiedMeta = question.meta ? { ...question.meta } : {};
    const copiedImageUrls = question.imageUrls
      ? [...question.imageUrls.map((img) => ({ ...img }))]
      : [];

    const copiedQuestion = {
      // Copy all relevant properties from the original question
      text: question.text,
      type: question.type, // Assuming type is a property
      required: question.required,
      min: question.min,
      max: question.max,
      leftLabel: question.leftLabel,
      rightLabel: question.rightLabel,
      // End of direct properties from LinearScaleQuestion state
      id: -1, // Temporary ID, will be reassigned
      meta: copiedMeta,
      imageUrls: copiedImageUrls,
    };

    let updatedQuestions = [...questions];
    updatedQuestions.splice(index + 1, 0, copiedQuestion);

    updatedQuestions = updatedQuestions.map((q, i) => ({ ...q, id: i + 1 }));

    setQuestions(updatedQuestions);
  };
  const handleTranslation = useCallback(async () => {
    try {
      const questionResponse = await translateText(question.text);
      if (!questionResponse?.data?.data?.translations?.[0]?.translatedText) {
        throw new Error("No translation returned for question");
      }
      handleQuestionChange(
        questionResponse.data.data.translations[0].translatedText
      );

      const metaResponse = await translateText([
        question.meta?.min?.toString() || "",
        question.meta?.max?.toString() || "",
        question.leftLabel || "",
        question.rightLabel || "",
      ]);
      if (!metaResponse?.data?.data?.translations) {
        throw new Error("No translations returned for meta properties");
      }
      const [
        minTranslation,
        maxTranslation,
        leftLabelTranslation,
        rightLabelTranslation,
      ] = metaResponse.data.data.translations.map(
        (t) => t.translatedText || ""
      );

      setMinValue(minTranslation);
      setMaxValue(maxTranslation);
      setLeftLabel(leftLabelTranslation);
      setRightLabel(rightLabelTranslation);
      updateQuestion({
        min: minTranslation,
        max: maxTranslation,
        leftLabel: leftLabelTranslation,
        rightLabel: rightLabelTranslation,
      });
    } catch (error) {
      console.error("Error in handleTranslation:", error.message);
    }
  }, [
    question.text,
    question.leftLabel,
    question.rightLabel,
    question.meta?.min,
    question.meta?.max,
    handleQuestionChange,
    updateQuestion,
  ]);
const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="mb-3">
      {/* <div className="d-flex flex-column flex-sm-row justify-content-sm-between align-items-start align-items-sm-center mb-2">
        <label className="ms-2 mb-2 mb-sm-0" style={{ fontSize: "1.2rem" }}>
          <em>
            Question No: {index}
            <hr />
            Type: <strong>{getLabel("Linear Scale")}</strong>
          </em>
        </label>
        <TagManager
          questionId={question.id}
          questionText={question.text}
          questions={questions}
          setQuestions={setQuestions}
          getLabel={getLabel}
        />
      </div> */}

      {showCropper && selectedFile && (
        <ImageCropper
          file={selectedFile}
          questionId={question.id}
          setQuestions={setQuestions}
          getLabel={getLabel}
          onClose={() => {
            setShowCropper(false);
            setSelectedFile(null);
          }}
        />
      )}

      {question.imageUrls && question.imageUrls.length > 0 && (
        <div className="mb-2">
          {question.imageUrls.map((img, idx) => (
            <div key={idx} className="mb-3 bg-gray-50 p-3 rounded-lg shadow-sm">
              <div
                className={`d-flex justify-content-${img.alignment || "start"}`}
              >
                <img
                  src={img.url}
                  alt={`Question ${idx}`}
                  className="img-fluid rounded"
                  style={{ maxHeight: 400 }}
                />
              </div>
              <div className="d-flex flex-wrap justify-content-between align-items-center mt-2 gap-2">
                <select
                  className="form-select w-auto text-sm border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  value={img.alignment || "start"}
                  onChange={(e) => updateAlignment(idx, e.target.value)}
                >
                  <option value="start">{getLabel("Left")}</option>
                  <option value="center">{getLabel("Center")}</option>
                  <option value="end">{getLabel("Right")}</option>
                </select>
                <button
                  className="btn btn-sm btn-outline-danger hover:bg-red-700 transition-colors"
                  onClick={() => removeImage(idx)}
                >
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* <div className="mb-3">
        <input
          type="text"
          className="survey-form-control"
          placeholder={getLabel("Enter your question here")}
          value={question.text || ""}
          onChange={(e) => handleQuestionChange(e.target.value)}
          onFocus={(e) => e.target.select()}
        />
      </div> */}

      {validationError && (
        <div className="alert alert-danger mt-2" role="alert">
          {validationError}
        </div>
      )}

      <div className="mb-3">
        <div className="row g-3 align-items-center mb-3">
          <div className="col-12 col-sm-auto">
            <div className="d-flex align-items-center">
              <label
                htmlFor={`min-${question.id}`}
                className="survey-form-label me-2 mb-0" style={{fontSize:"14px"}}
              >
                <i>{getLabel("Min")}</i>
              </label>
              <input
                type="number"
                id={`min-${question.id}`}
                className="survey-form-control"
                style={{ width: "80px" }}
                value={minValue}
                onChange={handleMinChange}
                onFocus={(e) => e.target.select()}
              />
            </div>
          </div>
          <div className="col-12 col-sm-auto">
            <div className="d-flex align-items-center mt-2 mt-sm-0">
              <label
                htmlFor={`max-${question.id}`}
                className="survey-form-label me-2 mb-0" style={{fontSize:"14px"}}
              >
                <i>{getLabel("Max")}</i>
              </label>
              <input
                type="number"
                id={`max-${question.id}`}
                className="survey-form-control"
                style={{ width: "80px" }}
                value={maxValue}
                onChange={handleMaxChange}
                onFocus={(e) => e.target.select()}
              />
            </div>
          </div>
        </div>

        {showLabels && (
          <div className="row g-3">
            <div className="col-12 col-sm-6" style={{fontSize:"14px"}}>
              <label
                htmlFor={`leftLabel-${question.id}`}
                className="form-label"
              >
                <i>
                  Left Label{" "}
                  <span className="text-muted small">(Optional)</span>
                </i>
              </label>
              <input
                type="text"
                id={`leftLabel-${question.id}`}
                className="survey-form-control"
                value={leftLabel}
                onChange={handleLeftLabelChange}
                onFocus={(e) => e.target.select()}
              />
            </div>
            <div className="col-12 col-sm-6" style={{fontSize:"14px"}}>
              <label
                htmlFor={`rightLabel-${question.id}`}
                className="form-label"
              >
                <i>
                  Right Label{" "}
                  <span className="text-muted small">(Optional)</span>
                </i>
              </label>
              <input
                type="text"
                id={`rightLabel-${question.id}`}
                className="survey-form-control"
                value={rightLabel}
                onChange={handleRightLabelChange}
                onFocus={(e) => e.target.select()}
              />
            </div>
          </div>
        )}
      </div>
{/* 
      <div className="d-flex flex-wrap align-items-center mt-3 gy-3">
        <button
          className="btn btn-outline-secondary w-auto me-2"
          onClick={handleCopy}
          title="Copy Question"
        >
          <i className="bi bi-clipboard"></i>
        </button>
        <button
          className="btn btn-outline-secondary w-auto me-2"
          onClick={handleDelete}
          title="Delete Question"
        >
          <i className="bi bi-trash"></i>
        </button>
        <label
          className="btn btn-outline-secondary w-auto me-0 me-sm-2"
          title="Add Image"
        >
          <i className="bi bi-image"></i>
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={handleQuestionImageUpload}
          />
        </label>
        <button
          className="btn btn-outline-secondary w-auto"
          onClick={handleTranslation}
          title="Translate Question"
        >
          <i className="bi bi-translate"></i>
        </button>
        <div className="d-flex w-100 w-sm-auto ms-0 ms-sm-auto mt-2 mt-sm-0">
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id={`linearRequired-${question.id}`}
              onChange={handleRequired}
              checked={required}
            />
            <label
              className="form-check-label"
              htmlFor={`linearRequired-${question.id}`}
            >
              {getLabel("Required")}
            </label>
          </div>
          <div className="form-check form-switch mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              id={`showLabels-${question.id}`}
              checked={showLabels}
              onChange={toggleLabels}
            />
            <label
              className="form-check-label"
              htmlFor={`showLabels-${question.id}`}
            >
              {getLabel("Show Labels")}
            </label>
          </div>
        </div>
      </div> */}

        <div className="question-actions d-flex align-items-center justify-content-end gap-2">
      {/* Copy */}
      <button className="survey-icon-btn" onClick={handleCopy} title="Copy Question">
        <i className="bi bi-copy"></i>
      </button>

      {/* Delete */}
      <button className="survey-icon-btn" onClick={handleDelete} title="Delete Question">
        <i className="bi bi-trash"></i>
      </button>

      {/* Required */}
      <div className="form-check form-switch mb-0">
        <input
          className="form-check-input"
          type="checkbox"
          id={`linearRequired-${question.id}`}
          onChange={handleRequired}
          checked={required}
        />
        <label
          className="form-check-label small"
          htmlFor={`linearRequired-${question.id}`}
        >
          {getLabel("Required")}
        </label>
      </div>

      {/* Three Dots Menu */}
      <div className="menu-container" ref={menuRef}>
        <button
          className="icon-btn"
          onClick={() => setShowMenu((prev) => !prev)}
          title="More Options"
        >
          <i className="bi bi-three-dots-vertical"></i>
        </button>

      {showMenu && (
        <div className="custom-menu">
          {/* Shuffle Options */}
          <div className="menu-item">
            <div className="menu-label">
              <i className="bi bi-eye"></i>
               {getLabel("Show Labels")}
            </div>
            <label className="switch-small">
              <input
                type="checkbox"
                id={`showLabels-${question.id}`}
                checked={showLabels}
                onChange={toggleLabels}
              />
              <span className="slider-small"></span>
            </label>
          </div>

          {/* Add Image */}
          <label className="menu-item" style={{ cursor: "pointer" }}>
            <div className="menu-label">
              <i className="bi bi-image"></i>
              {getLabel("Add Image")}
            </div>
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleQuestionImageUpload}
            />
          </label>

          {/* Translate */}
          <button className="menu-item" onClick={handleTranslation}>
            <div className="menu-label">
              <i className="bi bi-translate"></i>
              {getLabel("Translate Question")}
            </div>
          </button>
        </div>
      )}

      </div>
    </div>
    </div>
  );
};

export default LinearScaleQuestion;
