import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import TagManager from "./QuestionSpecificUtils/Tag";
import ImageCropper from "./QuestionSpecificUtils/ImageCropper";

const DateTimeQuestion = ({ question, questions, setQuestions, language, setLanguage, getLabel }) => {
  const [showCropper, setShowCropper] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  
  const [required, setRequired] = useState(question.required || false);

  useEffect(() => {
    setRequired(question.required || false);
  }, [question.required]);

  useEffect(() => {
    if (question.dateType === undefined) {
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === question.id ? { ...q, dateType: "date" } : q
        )
      );
    }
  }, [question.id, question.dateType, setQuestions]);

  const handleRequired = () => {
    const newRequiredState = !required;
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === question.id ? { ...q, required: newRequiredState } : q
      )
    );
    setRequired(newRequiredState);
  };

  const handleQuestionChange = (newText) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === question.id ? { ...q, text: newText } : q))
    );
  };

  const handleTypeChange = (newType) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === question.id ? { ...q, dateType: newType } : q))
    );
  };

  const handleDelete = () => {
    setQuestions((prev) => {
      const updatedQuestions = prev.filter((q) => q.id !== question.id);
      return updatedQuestions.map((q, index) => ({ ...q, id: index + 1 }));
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
      text: question.text,
      type: question.type, 
      required: question.required,
      dateType: question.dateType || "date", // Ensure dateType is copied
      id: -1, 
      meta: copiedMeta,
      imageUrls: copiedImageUrls,
    };

    let updatedQuestions = [...questions];
    updatedQuestions.splice(index + 1, 0, copiedQuestion);
    updatedQuestions = updatedQuestions.map((q, i) => ({ ...q, id: i + 1 }));

    setQuestions(updatedQuestions);
  };

  return (
    <div className="mb-3">
      {/* Top Bar: Label and TagManager */}
      <div className="d-flex flex-column flex-sm-row justify-content-sm-between align-items-start align-items-sm-center mb-2">
        <label className="ms-2 mb-2 mb-sm-0" style={{ fontSize: "1.2em" }}>
          <em>
            <strong>{getLabel("Date/Time")}</strong>
          </em>
        </label>
        <TagManager
          questionId={question.id}
          questionText={question.text}
          questions={questions}
          setQuestions={setQuestions}
        />
      </div>

      {/* Image Cropper and Previews */}
      <div className="mb-2">
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
      </div>

      {/* Question Text Input */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder={getLabel("Enter your question here")}
          value={question.text || ""}
          onChange={(e) => handleQuestionChange(e.target.value)}
        />
      </div>

      {/* Date/Time Input & Type Selector */}
      <div className="d-flex flex-wrap align-items-center gap-2 ms-1 mb-3">
        <input
          type={question.dateType === "time" ? "time" : "date"}
          className="form-control form-control-sm w-auto"
          readOnly 
        />
        <select
          className="form-select form-select-sm w-auto"
          onChange={(e) => handleTypeChange(e.target.value)}
          value={question.dateType || "date"}
        >
          <option value="date">{getLabel("Date")}</option>
          <option value="time">{getLabel("Time")}</option>
        </select>
      </div>

      {/* Action Buttons & Required Toggle */}
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
        <div className="d-flex w-100 w-sm-auto ms-0 ms-sm-auto mt-2 mt-sm-0">
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id={`dateTimeRequired-${question.id}`}
              onChange={handleRequired}
              checked={required}
            />
            <label className="form-check-label" htmlFor={`dateTimeRequired-${question.id}`}>Required</label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateTimeQuestion;