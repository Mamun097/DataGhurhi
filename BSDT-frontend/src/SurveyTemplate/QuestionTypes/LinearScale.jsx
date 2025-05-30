import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import TagManager from "./QuestionSpecificUtils/Tag";
import ImageCropper from "./QuestionSpecificUtils/ImageCropper";

const LinearScaleQuestion = ({ question, questions, setQuestions }) => {

  const [showCropper, setShowCropper] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  
  const [required, setRequired] = useState(question.required || false);
  const [image, setImage] = useState(question.image || null);
  const [minValue, setMinValue] = useState(question.min || 1);
  const [maxValue, setMaxValue] = useState(question.max || 5);
  const [leftLabel, setLeftLabel] = useState(question.leftLabel || "");
  const [rightLabel, setRightLabel] = useState(question.rightLabel || "");
  const [showLabels, setShowLabels] = useState(!!leftLabel || !!rightLabel);

  useEffect(() => {
    setMinValue(question.min || 1);
    setMaxValue(question.max || 5);
    setLeftLabel(question.leftLabel || "");
    setRightLabel(question.rightLabel || "");
  }, [question]);

  const updateQuestion = (updates) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === question.id ? { ...q, ...updates } : q))
    );
  };

  const handleRequired = () => {
    updateQuestion({ required: !required });
    setRequired(!required);
  };

  const handleQuestionChange = (newText) => {
    updateQuestion({ text: newText });
  };

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
    const newShowLabels = !showLabels;
    setShowLabels(newShowLabels);

    if (!newShowLabels) {
      setLeftLabel("");
      setRightLabel("");
      updateQuestion({ leftLabel: "", rightLabel: "" });
    }
  };

  const handleDelete = () => {
    setQuestions((prevQuestions) => {
      const filtered = prevQuestions.filter((q) => q.id !== question.id);
      return filtered.map((q, index) => ({ ...q, id: index + 1 }));
    });
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

  const handleCopy = () => {
    const index = questions.findIndex((q) => q.id === question.id);
    const newId = question.id + 1;
    const copiedQuestion = {
      ...question,
      id: newId,
      text: question.text,
      meta: { ...question.meta },
      image,
    };

    const updatedQuestions = questions.map((q) =>
      q.id > question.id ? { ...q, id: q.id + 1 } : q
    );

    updatedQuestions.splice(index + 1, 0, copiedQuestion);
    updatedQuestions.sort((a, b) => a.id - b.id);
    setQuestions(updatedQuestions);
  };

  return (
    <div className="mb-3">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <label className="ms-2 mb-2" style={{ fontSize: "1.2rem" }}>
          <em>
            <strong>Linear Scale</strong>
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

      <div className="d-flex align-items-center mb-4">
        <input
          type="text"
          className="form-control me-2"
          placeholder="Enter your question here"
          value={question.text}
          onChange={(e) => handleQuestionChange(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <div className="d-flex ms-2 mb-2">
          <div className="d-flex align-items-center">
            <label className="me-2">
              <i>Min</i>
            </label>
            <input
              type="number"
              className="form-control me-2"
              style={{ width: "80px" }}
              value={minValue}
              onChange={handleMinChange}
            />
          </div>
          <div className="d-flex align-items-center">
            <label className="me-2">
              <i>Max</i>
            </label>
            <input
              type="number"
              className="form-control me-2"
              style={{ width: "80px" }}
              value={maxValue}
              onChange={handleMaxChange}
            />
          </div>
        </div>

        <div className="form-check form-switch mt-4 mb-4 ms-2 mb-2">
          <input
            className="form-check-input"
            type="checkbox"
            checked={showLabels}
            onChange={toggleLabels}
          />
          <label className="form-check-label">Show Labels</label>
        </div>

        {showLabels && (
          <div className="d-flex ms-2 mb-2">
            <div className="d-flex align-items-center">
              <label className="me-2">
                <i>Left Label</i>
              </label>
              <input
                type="text"
                className="form-control me-2"
                value={leftLabel}
                onChange={handleLeftLabelChange}
              />
            </div>
            <div className="d-flex align-items-center ms-3">
              <label className="me-2">
                <i>Right Label</i>
              </label>
              <input
                type="text"
                className="form-control me-2"
                value={rightLabel}
                onChange={handleRightLabelChange}
              />
            </div>
          </div>
        )}
      </div>

      <div className="d-flex align-items-center mt-3">
        <button className="btn btn-outline-secondary me-2" onClick={handleCopy}>
          <i className="bi bi-clipboard"></i>
        </button>
        <button className="btn btn-outline-secondary me-2" onClick={handleDelete}>
          <i className="bi bi-trash"></i>
        </button>
        <label className="btn btn-outline-secondary hover:bg-gray-100 transition-colors">
          <i className="bi bi-image"></i>
          <input
            type="file"
            hidden
            onChange={(e) => handleQuestionImageUpload(e, question.id)}
          />
        </label>
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

export default LinearScaleQuestion;
