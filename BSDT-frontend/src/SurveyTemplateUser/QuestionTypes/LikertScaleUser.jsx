import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const LikertScale = ({ question, questions, setQuestions }) => {
  // Default rows and columns with fallbacks
  const rows = question.meta?.rows?.length ? question.meta.rows : ["Row 1"];
  const columns = question.meta?.columns?.length ? question.meta.columns : ["Column 1"];

  // Handle radio button selection
  const handleAnswerChange = (rowIndex, column) => {
    const updatedAnswers = Array.isArray(question.answer) ? [...question.answer] : [];
    updatedAnswers[rowIndex] = { row: rows[rowIndex], column };
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === question.id ? { ...q, answer: updatedAnswers } : q
      )
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

      {/* Grid for Answers */}
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
                      type="radio"
                      name={`row-${question.id}-${rowIndex}`}
                      value={col}
                      checked={
                        Array.isArray(question.answer) &&
                        question.answer[rowIndex]?.column === col
                      }
                      onChange={() => handleAnswerChange(rowIndex, col)}
                      required={question.required}
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
      {question.required &&
        (!Array.isArray(question.answer) ||
          question.answer.some((ans) => !ans?.column)) && (
          <small className="text-danger">
            All rows in this question are required.
          </small>
        )}
    </div>
  );
};

export default LikertScale;