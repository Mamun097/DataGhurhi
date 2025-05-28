import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const TickBoxGrid = ({ question, questions, setQuestions }) => {
  // Default rows and columns with fallbacks
  const rows = question.meta?.rows?.length ? question.meta.rows : ["Row 1"];
  const columns = question.meta?.columns?.length ? question.meta.columns : ["Column 1"];

  // Handle checkbox selection
  const handleAnswerChange = (rowIndex, col, checked) => {
    const updatedAnswers = Array.isArray(question.answer) ? [...question.answer] : [];
    if (checked) {
      // Add the selection
      updatedAnswers.push({ row: rows[rowIndex], column: col });
    } else {
      // Remove the selection
      const index = updatedAnswers.findIndex(
        (ans) => ans.row === rows[rowIndex] && ans.column === col
      );
      if (index !== -1) updatedAnswers.splice(index, 1);
    }
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === question.id ? { ...q, answer: updatedAnswers } : q
      )
    );
  };

  // Check if a specific checkbox is checked
  const isChecked = (row, col) => {
    return (
      Array.isArray(question.answer) &&
      question.answer.some((ans) => ans.row === row && ans.column === col)
    );
  };

  // Check if all required rows have at least one selection
  const isRequiredValid = () => {
    if (!question.required) return true;
    return rows.every((row) =>
      question.answer?.some((ans) => ans.row === row)
    );
  };

  return (
    <div className="mb-3">
      {/* Question Text */}
      <h5 className="mb-2" style={{ fontSize: "1.2rem" }}>
        {question.text || "Untitled Question"}
        {question.required && <span className="text-danger ms-1">*</span>}
      </h5>

      {/* Image Preview */}
      {question.image && (
        <img
          src={question.image}
          alt="Question Image"
          className="img-fluid mb-2"
          style={{ maxHeight: "400px" }}
        />
      )}

      {/* Checkbox Grid */}
      <div className="table-responsive mb-3">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th></th>
              {columns.map((col, colIndex) => (
                <th key={colIndex} className="text-center">
                  {col || `Column ${colIndex + 1}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                <td>{row || `Row ${rowIndex + 1}`}</td>
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="text-center">
                    <input
                      type="checkbox"
                      checked={isChecked(row, col)}
                      onChange={(e) =>
                        handleAnswerChange(rowIndex, col, e.target.checked)
                      }
                      disabled={question.disabled} // Optional: if you want to disable interaction
                      aria-label={`Select ${col} for ${row}`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Required Question Indicator */}
      {question.required && !isRequiredValid() && (
        <small className="text-danger">
          At least one box per row is required.
        </small>
      )}
    </div>
  );
};

export default TickBoxGrid;