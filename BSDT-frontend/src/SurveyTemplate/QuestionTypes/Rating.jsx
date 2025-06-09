import React, { useState, useEffect, useCallback, useMemo } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import TagManager from "./QuestionSpecificUtils/Tag";
import ImageCropper from "./QuestionSpecificUtils/ImageCropper";

// Default scale if not provided in question.meta
const DEFAULT_SCALE = 5;

const SCALE_OPTIONS = [3, 5, 7, 10];

const RatingQuestion = ({ question, questions, setQuestions, language, setLanguage, getLabel }) => {
  const [required, setRequired] = useState(question.required || false);
  const [scale, setScale] = useState(question.meta?.scale || DEFAULT_SCALE);
  const [showCropper, setShowCropper] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    setRequired(question.required || false);
    setScale(question.meta?.scale || DEFAULT_SCALE);
  }, [question]);

  const imageUrls = useMemo(() => question.imageUrls || [], [question.imageUrls]);

  const updateQuestion = useCallback((updates) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) =>
        q.id === question.id ? { ...q, ...updates } : q
      )
    );
  }, [question.id, setQuestions]);

  const updateQuestionMeta = useCallback((metaUpdate) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) =>
        q.id === question.id ? { ...q, meta: { ...q.meta, ...metaUpdate } } : q
      )
    );
  }, [question.id, setQuestions]);

  const handleRequired = useCallback(() => {
    const newRequiredState = !required;
    updateQuestion({ required: newRequiredState });
    setRequired(newRequiredState);
  }, [required, updateQuestion]);

  const handleQuestionChange = useCallback((newText) => {
    updateQuestion({ text: newText });
  }, [updateQuestion]);

  const handleScaleChange = useCallback((newScaleValue) => {
    const newScale = Number(newScaleValue);
    updateQuestionMeta({ scale: newScale });
    setScale(newScale);
  }, [updateQuestionMeta]);

  const handleQuestionImageUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setShowCropper(true);
    if (event.target) event.target.value = null;
  }, []);

  const removeImageCb = useCallback((index) => {
    updateQuestion({ imageUrls: imageUrls.filter((_, i) => i !== index) });
  }, [imageUrls, updateQuestion]);

  const updateAlignmentCb = useCallback((index, alignment) => {
    const newImageUrls = imageUrls.map((img, i) =>
      i === index ? { ...img, alignment } : img
    );
    updateQuestion({ imageUrls: newImageUrls });
  }, [imageUrls, updateQuestion]);

  const handleDelete = useCallback(() => {
    setQuestions((prevQuestions) => {
      const filtered = prevQuestions.filter((q) => q.id !== question.id);
      return filtered.map((q, index) => ({ ...q, id: index + 1 }));
    });
  }, [question.id, setQuestions]);

  const handleCopy = useCallback(() => {
    const index = questions.findIndex((q) => q.id === question.id);
    const copiedQuestion = {
      ...question,
      id: questions.length + 1,
      meta: {
        ...question.meta,
        scale: scale,
      },
    };

    let updatedQuestions = [...questions];
    updatedQuestions.splice(index + 1, 0, copiedQuestion);
    updatedQuestions = updatedQuestions.map((q, i) => ({ ...q, id: i + 1 }));

    setQuestions(updatedQuestions);
  }, [questions, question, scale, setQuestions]);

  return (
    <div className="mb-3">
      {/* Top Bar: Label and TagManager */}
      <div className="d-flex flex-column flex-sm-row justify-content-sm-between align-items-start align-items-sm-center mb-2">
        <label className="ms-2 mb-2 mb-sm-0" style={{ fontSize: "1.2rem" }}>
          <em>
            <strong>{getLabel("Rating")}</strong>
          </em>
        </label>
        <TagManager
          questionId={question.id}
          questionText={question.text}
          questions={questions}
          setQuestions={setQuestions}
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

      {/* Image Display */}
      {imageUrls.length > 0 && (
        <div className="mb-2">
          {imageUrls.map((img, idx) => (
            <div key={idx} className="mb-3 bg-gray-50 p-3 rounded-lg shadow-sm">
              <div className={`d-flex justify-content-${img.alignment || "start"}`}>
                <img
                  src={img.url}
                  alt={`Question Preview ${idx}`}
                  className="img-fluid rounded"
                  style={{ maxHeight: 400 }}
                />
              </div>
              {/* Image Controls: Alignment and Remove */}
              <div className="d-flex flex-wrap justify-content-between align-items-center mt-2 gap-2">
                <select
                  className="form-select w-auto text-sm border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  value={img.alignment || "start"}
                  onChange={(e) => updateAlignmentCb(idx, e.target.value)}
                >
                  <option value="start">{getLabel("Left")}</option>
                  <option value="center">{getLabel("Center")}</option>
                  <option value="end">{getLabel("Right")}</option>
                </select>
                <button
                  className="btn btn-sm btn-outline-danger hover:bg-red-700 transition-colors" /* Removed me-1 as gap-2 on parent should handle spacing */
                  onClick={() => removeImageCb(idx)}
                >
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Question Text Input */}
      <div className="d-flex align-items-center mt-2 mb-2">
        <input
          type="text"
          className="form-control"
          placeholder={getLabel("Enter your question here")}
          value={question.text || ""}
          onChange={(e) => handleQuestionChange(e.target.value)}
        />
      </div>

      {/* Scale Selector */}
      <div className="d-flex flex-wrap align-items-center my-3 gap-2"> {/* Added flex-wrap and gap-2 */}
        <label htmlFor={`scale-select-${question.id}`} className="form-label mb-0">{getLabel("Levels:")}</label> {/* Removed me-2, gap-2 on parent handles spacing */}
        <select
          id={`scale-select-${question.id}`}
          className="form-select form-select-sm w-auto"
          onChange={(e) => handleScaleChange(e.target.value)}
          value={scale}
        >
          {SCALE_OPTIONS.map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>
      </div>

      {/* Rating Preview - Already responsive with flex-wrap */}
      <div className="d-flex justify-content-center align-items-center flex-wrap mb-3 p-2 border rounded-md">
        {[...Array(scale)].map((_, i) => (
          <div key={i} className="text-center mx-1 my-1" style={{ minWidth: '40px' }}>
            <i className="bi bi-star-fill text-warning" style={{ fontSize: "24px" }}></i>
            <div className="small mt-1">{i + 1}</div>
          </div>
        ))}
      </div>

      {/* Bottom Action Bar */}
      <div className="d-flex flex-wrap align-items-center mt-3 gy-3"> {/* gy-3 for vertical spacing */}
        <button className="btn btn-outline-secondary w-auto me-2" onClick={handleCopy} title="Copy Question">
          <i className="bi bi-clipboard"></i>
        </button>
        <button className="btn btn-outline-secondary w-auto me-2" onClick={handleDelete} title="Delete Question">
          <i className="bi bi-trash"></i>
        </button>
        <label className="btn btn-outline-secondary w-auto me-0 me-sm-2" title="Add Image"> {/* Adjusted margin for last button before switch */}
          <i className="bi bi-image"></i>
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={handleQuestionImageUpload}
          />
        </label>
        {/* Required Switch Group */}
        <div className="d-flex w-100 w-sm-auto ms-0 ms-sm-auto mt-2 mt-sm-0">
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id={`requiredSwitchRating-${question.id}`}
              checked={required}
              onChange={handleRequired}
            />
            <label className="form-check-label" htmlFor={`requiredSwitchRating-${question.id}`}>{getLabel("Required")}</label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RatingQuestion;