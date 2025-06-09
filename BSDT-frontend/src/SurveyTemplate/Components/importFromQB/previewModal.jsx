import React, { useState, useEffect } from "react";

const PreviewImportModal = ({ show, onClose, questions, onConfirm, selectedIds, setSelectedIds}) => {
  const [filterType, setFilterType] = useState("");
  const [filterTag, setFilterTag] = useState("");
  



  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const filtered = questions.filter((q) => {
    const matchesType = filterType ? q.type === filterType : true;
    const matchesTag = filterTag
      ? q.tags?.some((tag) => tag.toLowerCase().includes(filterTag.toLowerCase()))
      : true;
    return matchesType && matchesTag;
  });

  const handleConfirm = () => {
    const selectedQuestions = questions.filter((q) => selectedIds.includes(q.question_id));
    if (selectedQuestions.length === 0) {
        alert("Please select at least one question to add.");
        return;
    }
    console.log("Selected Questions:", selectedQuestions);
    onConfirm(selectedQuestions);
 
    onClose();
  };

  return (
    <div className={`modal fade ${show ? "show d-block" : "d-none"}`} tabIndex="-1">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Preview & Select Questions</h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {/* Filters */}
            <div className="row mb-3">
              <div className="col">
                <label className="form-label">Filter by Type</label>
                <select
                  className="form-select"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="">All</option>
                  <option value="radio">MCQ</option>
                  <option value="checkbox">Checkbox</option>
                  <option value="dropdown">Dropdown</option>
                  <option value="linearScale">Linear Scale</option>
                  <option value="likert">Likert</option>
                  <option value="rating">Rating</option>
                  <option value="datetime">Date</option>
                  <option value="text">Text</option>
                  <option value="tickboxGrid">Grid</option>
                </select>
              </div>
              <div className="col">
                <label className="form-label">Filter by Tag</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. math"
                  value={filterTag}
                  onChange={(e) => setFilterTag(e.target.value)}
                />
              </div>
            </div>

            {/* Question List */}
            <div style={{ maxHeight: "300px", overflowY: "auto" }}>
              {filtered.map((q) => (
                <div key={q.question_id} className="form-check border-bottom py-2">
                  <input
                    className="form-check-input me-2"
                    type="checkbox"
                    checked={selectedIds.includes(q.question_id)}
                    onChange={() => toggleSelect(q.question_id)}
                  />
                  <label className="form-check-label">
                    <strong>{q.text}</strong> <br />
                    <small className="text-muted">
                      Type: {q.type} | Tags: {q.tags?.join(", ")}
                    </small>
                  </label>
                </div>
              ))}
              {filtered.length === 0 && <p className="text-muted">No questions match your filters.</p>}
            </div>
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn btn-success"
              onClick={handleConfirm}
              disabled={selectedIds.length === 0}
            >
              Add Selected ({selectedIds.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewImportModal;
