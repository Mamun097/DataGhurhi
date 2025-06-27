import React, { useState, useEffect, useCallback } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import TagManager from "./QuestionSpecificUtils/Tag";
import ImageCropper from "./QuestionSpecificUtils/ImageCropper";
import translateText from "./QuestionSpecificUtils/Translation";


const LinearScaleQuestion = ({ question, questions, setQuestions, language, setLanguage, getLabel }) => {
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

  const handleMinChange = (e) => {
    const newMin = Number(e.target.value);
    setMinValue(newMin);
    updateQuestion({ min: newMin });
  };

  const handleMaxChange = (e) => {
    const newMax = Number(e.target.value);
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
          ? { ...q, imageUrls: (q.imageUrls || []).filter((_, i) => i !== index) }
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
    const copiedImageUrls = question.imageUrls ? [...question.imageUrls.map(img => ({...img}))] : [];

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
    handleQuestionChange(questionResponse.data.data.translations[0].translatedText);

    const metaResponse = await translateText([
      question.meta?.min?.toString() || "",
      question.meta?.max?.toString() || "",
      question.leftLabel || "",
      question.rightLabel || ""
    ]);
    if (!metaResponse?.data?.data?.translations) {
      throw new Error("No translations returned for meta properties");
    }
    const [minTranslation, maxTranslation, leftLabelTranslation, rightLabelTranslation] = 
      metaResponse.data.data.translations.map(t => t.translatedText || "");

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
  updateQuestion
]);


  return (
    <div className="mb-3">
      <div className="d-flex flex-column flex-sm-row justify-content-sm-between align-items-start align-items-sm-center mb-2">
        <label className="ms-2 mb-2 mb-sm-0" style={{ fontSize: "1.2rem" }}>
          <em>
            <strong>{getLabel("Linear Scale")}</strong>
          </em>
        </label>
        <TagManager
          questionId={question.id}
          questionText={question.text}
          questions={questions}
          setQuestions={setQuestions}
          getLabel={getLabel}
        />
      </div>

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
              <div className={`d-flex justify-content-${img.alignment || "start"}`}>
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

      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder={getLabel("Enter your question here")}
          value={question.text || ""}
          onChange={(e) => handleQuestionChange(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <div className="row g-3 align-items-center mb-3">
          <div className="col-12 col-sm-auto">
            <div className="d-flex align-items-center">
              <label htmlFor={`min-${question.id}`} className="form-label me-2 mb-0"><i>{getLabel("Min")}</i></label>
              <input
                type="number"
                id={`min-${question.id}`}
                className="form-control"
                style={{ width: "80px" }}
                value={minValue}
                onChange={handleMinChange}
              />
            </div>
          </div>
          <div className="col-12 col-sm-auto">
            <div className="d-flex align-items-center mt-2 mt-sm-0">
              <label htmlFor={`max-${question.id}`} className="form-label me-2 mb-0"><i>{getLabel("Max")}</i></label>
              <input
                type="number"
                id={`max-${question.id}`}
                className="form-control"
                style={{ width: "80px" }}
                value={maxValue}
                onChange={handleMaxChange}
              />
            </div>
          </div>
        </div>



        {showLabels && (
          <div className="row g-3">
            <div className="col-12 col-sm-6">
              <label htmlFor={`leftLabel-${question.id}`} className="form-label"><i>Left Label <span className="text-muted small">(Optional)</span></i></label>
              <input
                type="text"
                id={`leftLabel-${question.id}`}
                className="form-control"
                value={leftLabel}
                onChange={handleLeftLabelChange}
              />
            </div>
            <div className="col-12 col-sm-6">
              <label htmlFor={`rightLabel-${question.id}`} className="form-label"><i>Right Label <span className="text-muted small">(Optional)</span></i></label>
              <input
                type="text"
                id={`rightLabel-${question.id}`}
                className="form-control"
                value={rightLabel}
                onChange={handleRightLabelChange}
              />
            </div>
          </div>
        )}
      </div>

      <div className="d-flex flex-wrap align-items-center mt-3 gy-3">
        <button className="btn btn-outline-secondary w-auto me-2" onClick={handleCopy} title="Copy Question">
          <i className="bi bi-clipboard"></i>
        </button>
        <button className="btn btn-outline-secondary w-auto me-2" onClick={handleDelete} title="Delete Question">
          <i className="bi bi-trash"></i>
        </button>
        <label className="btn btn-outline-secondary w-auto me-0 me-sm-2" title="Add Image">
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
            <label className="form-check-label" htmlFor={`linearRequired-${question.id}`}>{getLabel("Required")}</label>
          </div>
          <div className="form-check form-switch mb-3">
          <input
            className="form-check-input"
            type="checkbox"
            id={`showLabels-${question.id}`}
            checked={showLabels}
            onChange={toggleLabels}
          />
          <label className="form-check-label" htmlFor={`showLabels-${question.id}`}>{getLabel("Show Labels")}</label>
        </div>
        </div>
      </div>
    </div>
  );
};

export default LinearScaleQuestion;