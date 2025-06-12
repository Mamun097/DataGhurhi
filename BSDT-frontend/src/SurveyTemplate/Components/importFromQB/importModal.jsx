import React, { useState } from "react";

const ImportQuestionModal = ({ show, onClose, onImport}) => {
  const [limit, setLimit] = useState(5);
  const [tags, setTags] = useState("");
  const [visibility, setVisibility] = useState("public");


  const handleSubmit = () => {
    const payload = {
      limit,
      tags: tags.split(",").map(t => t.trim()).filter(t => t !== ""),
      visibility,
    };
    onImport(payload); // Trigger import
    onClose();         // Close import config modal
  };

  return (
    <div className={`modal fade ${show ? "show d-block" : "d-none"}`} tabIndex="-1">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Import Questions</h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="mb-2">
              <label className="form-label">Number of Questions</label>
              <input
                type="number"
                className="form-control"
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
              />
            </div>
            <div className="mb-2">
              <label className="form-label">Tags (comma-separated)</label>
              <input
                type="text"
                className="form-control"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>
            <div className="mb-2">
              <label className="form-label">Question Visibility</label>
              <select
                className="form-select"
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
              >
                <option value="public">Public</option>
                <option value="own">Own</option>
                <option value="all">All</option>
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-success" onClick={handleSubmit}>
              Import
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


export default ImportQuestionModal;
