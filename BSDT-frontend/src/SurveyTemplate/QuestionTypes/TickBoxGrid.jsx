import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import TagManager from "./QuestionSpecificUtils/Tag";
import ImageCropper from "./QuestionSpecificUtils/ImageCropper";


const TickBoxGrid = ({ question, questions, setQuestions }) => {
  const [required, setRequired] = useState(question.required || false);
  const [image, setImage] = useState(question.image || null);
  const [showCropper, setShowCropper] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const rows = question.meta?.rows?.length ? question.meta.rows : ["Row 1"];
  const columns = question.meta?.columns?.length
    ? question.meta.columns
    : ["Column 1"];

  const updateMeta = (metaUpdate) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === question.id ? { ...q, meta: { ...q.meta, ...metaUpdate } } : q
      )
    );
  };

  const handleRequired = (id) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, required: !q.required } : q))
    );
    setRequired(!required);
  };

  const handleQuestionChange = (newText) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === question.id ? { ...q, text: newText } : q))
    );
  };

  const handleRowChange = (index, newValue) => {
    const updated = [...rows];
    updated[index] = newValue;
    updateMeta({ rows: updated });
  };

  const handleColumnChange = (index, newValue) => {
    const updated = [...columns];
    updated[index] = newValue;
    updateMeta({ columns: updated });
  };

  const handleAddRow = () => {
    updateMeta({ rows: [...rows, `Row ${rows.length + 1}`] });
  };

  const handleAddColumn = () => {
    updateMeta({ columns: [...columns, `Column ${columns.length + 1}`] });
  };

  const handleDeleteRow = (index) => {
    const updated = rows.filter((_, i) => i !== index);
    updateMeta({ rows: updated.length ? updated : ["Row 1"] });
  };

  const handleDeleteColumn = (index) => {
    const updated = columns.filter((_, i) => i !== index);
    updateMeta({ columns: updated.length ? updated : ["Column 1"] });
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
  const handleDelete = () => {
    setQuestions((prev) => {
      const filtered = prev.filter((q) => q.id !== question.id);
      return filtered.map((q, index) => ({ ...q, id: index + 1 }));
    });
  };

  const handleCopy = () => {
    const index = questions.findIndex((q) => q.id === question.id);
    const newId = question.id + 1;
    const copiedQuestion = {
      ...question,
      id: newId,
      meta: {
        rows: [...rows],
        columns: [...columns],
      },
      image: image,
    };

    const updated = questions.map((q) =>
      q.id > question.id ? { ...q, id: q.id + 1 } : q
    );

    updated.splice(index + 1, 0, copiedQuestion);
    setQuestions(updated.sort((a, b) => a.id - b.id));
  };

  return (
    <div className="mb-3">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <label className="ms-2 mb-2" style={{ fontSize: "1.2rem" }}>
          <em>
            <strong>Tick Box Grid</strong>
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

      <div className="d-flex align-items-center mt-2 mb-2">
        <input
          type="text"
          className="form-control"
          placeholder="Enter your question here"
          value={question.text}
          onChange={(e) => handleQuestionChange(e.target.value)}
        />
      </div>

      <div>
        {/* Rows */}
        <div className="mb-3">
          <h6>
            <b>Rows</b>
          </h6>
          {rows.map((row, index) => (
            <div key={index} className="d-flex justify-content-between">
              <input
                type="text"
                className="form-control mb-1"
                value={row}
                onChange={(e) => handleRowChange(index, e.target.value)}
                placeholder={`Row ${index + 1}`}
              />
              <button
                className="btn btn-outline-secondary ms-2 me-2 mb-2"
                onClick={() => handleDeleteRow(index)}
              >
                <i className="bi bi-trash"></i>
              </button>
            </div>
          ))}
          <button
            className="btn btn-sm btn-outline-primary mt-2"
            onClick={handleAddRow}
          >
            Add Row
          </button>
        </div>

        {/* Columns */}
        <div className="mb-3">
          <h6>
            <b>Columns</b>
          </h6>
          {columns.map((col, index) => (
            <div key={index} className="d-flex justify-content-between">
              <input
                type="text"
                className="form-control mb-1"
                value={col}
                onChange={(e) => handleColumnChange(index, e.target.value)}
                placeholder={`Column ${index + 1}`}
              />
              <button
                className="btn btn-outline-secondary ms-2 me-2 mb-2"
                onClick={() => handleDeleteColumn(index)}
              >
                <i className="bi bi-trash"></i>
              </button>
            </div>
          ))}
          <button
            className="btn btn-sm btn-outline-primary mt-2"
            onClick={handleAddColumn}
          >
            Add Column
          </button>
        </div>
      </div>

      {/* Grid Preview */}
      <div className="mb-3">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th></th>
              {columns.map((col, colIndex) => (
                <th key={colIndex} className="text-center">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                <td>{row}</td>
                {columns.map((_, colIndex) => (
                  <td key={colIndex} className="text-center">
                    <input type="radio" name={`row-${rowIndex}`} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        {/* Action Buttons */}
        <div className="d-flex align-items-center mt-3">
          <button
            className="btn btn-outline-secondary me-2"
            onClick={handleCopy}
          >
            <i className="bi bi-clipboard"></i>
          </button>
          <button
            className="btn btn-outline-secondary me-2"
            onClick={handleDelete}
          >
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
              onChange={() => handleRequired(question.id)}
              checked={required}
            />
            <label className="form-check-label">Required</label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TickBoxGrid;
