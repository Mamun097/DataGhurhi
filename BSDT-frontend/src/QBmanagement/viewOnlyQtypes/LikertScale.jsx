import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const LikertScaleView = ({ question, surveyTitle, projectTitle }) => {
  const {
    text,
    image,
    meta = {},
    owner_name,
    required,
    meta_data = {},
  } = question;

  const rows = meta.rows?.length ? meta.rows : ["Row 1"];
  const columns = meta.columns?.length ? meta.columns : ["Column 1"];
  const tags = meta_data.tag || [];

  return (
    <div className="p-3 mb-4 border rounded shadow-sm bg-light">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-start mb-2">
        <span className="badge bg-secondary">Likert Scale</span>
        <div className="text-end text-muted small">
          <div><strong>Owner:</strong> {owner_name}</div>
          {surveyTitle && <div><strong>Survey:</strong> {surveyTitle}</div>}
          {projectTitle && <div><strong>Project:</strong> {projectTitle}</div>}
        </div>
      </div>

      {/* Question Text and Tags */}
      <div className="d-flex justify-content-between align-items-start mb-2">
        <h5 className="me-3">
          {required && <span className="text-danger me-1">*</span>}
          {text}
        </h5>
        {tags.length > 0 && (
          <div className="d-flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span key={index} className="badge bg-info text-dark">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Image */}
      {image && (
        <div className="mb-3 text-center">
          <img
            src={image}
            alt="Question Visual"
            className="img-fluid rounded"
            style={{ maxHeight: "400px" }}
          />
        </div>
      )}

      {/* Grid */}
      <div className="table-responsive">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th></th>
              {columns.map((col, index) => (
                <th key={index} className="text-center">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                <td><strong>{row}</strong></td>
                {columns.map((_, colIndex) => (
                  <td key={colIndex} className="text-center">
                    <input
                      type="radio"
                      disabled
                      name={`row-${rowIndex}`}
                      style={{ pointerEvents: "none" }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LikertScaleView;
