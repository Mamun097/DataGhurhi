import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const LinearScaleQuestion = ({ question, questions, setQuestions }) => {
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

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target.result);
        updateQuestion({ image: e.target.result });
      };
      reader.readAsDataURL(file);
    }
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
      <label className="ms-2 mb-2" style={{ fontSize: "1.2rem" }}>
        <em>
          <strong>Linear Scale</strong>
        </em>
      </label>

      {image && (
        <img
          src={image}
          alt="Uploaded"
          className="img-fluid mb-2"
          style={{ maxHeight: "400px" }}
        />
      )}

      <div className="d-flex align-items-center mb-2">
        <input
          type="text"
          className="form-control me-2"
          placeholder="Question"
          value={question.text}
          onChange={(e) => handleQuestionChange(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <div className="d-flex ms-2 mb-2">
          <div className="d-flex align-items-center">
            <label className="me-2">
              <i>Min Value</i>
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
              <i>Max Value</i>
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

        <div className="form-check form-switch ms-2 mb-2">
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
            <div className="d-flex align-items-center">
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
        <label className="btn btn-outline-secondary me-2">
          <i className="bi bi-image"></i>
          <input type="file" hidden onChange={handleImageUpload} />
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
