import React, { useMemo } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const TickBoxGrid = ({ question, userResponse, setUserResponse }) => {
  // Define the canonical (original order) rows and columns with fallbacks
  const rows = useMemo(
    () => (question.meta?.rows?.length ? question.meta.rows : ["Row 1"]),
    [question.meta?.rows]
  );
  const columns = question.meta?.columns?.length
    ? question.meta.columns
    : ["Column 1"];

  // Initialize user response for the question
  const userAnswer =
    userResponse.find((response) => response.questionText === question.text)
      ?.userResponse || [];

  // Check if a specific checkbox is checked
  const isChecked = (row, col) => {
    return userAnswer.some(
      (ans) => ans.row === row && ans.column && ans.column.includes(col)
    );
  };

  // Handle checkbox selection changes
  const handleChange = (row, col, checked) => {
    setUserResponse((prevUserResponse) => {
      const existingQuestionIndex = prevUserResponse.findIndex(
        (response) => response.questionText === question.text
      );

      if (existingQuestionIndex !== -1) {
        const existingQuestionResponse = prevUserResponse[existingQuestionIndex];
        let updatedUserResponse = [...existingQuestionResponse.userResponse];

        const existingRowIndex = updatedUserResponse.findIndex(
          (ans) => ans.row === row
        );

        if (checked) {
          if (existingRowIndex !== -1) {
            const existingRow = updatedUserResponse[existingRowIndex];
            if (!existingRow.column.includes(col)) {
              updatedUserResponse[existingRowIndex] = {
                ...existingRow,
                column: [...(existingRow.column || []), col],
              };
            }
          } else {
            updatedUserResponse.push({ row, column: [col] });
          }
        } else {
          if (existingRowIndex !== -1) {
            const existingRow = updatedUserResponse[existingRowIndex];
            const updatedColumns = existingRow.column.filter((c) => c !== col);
            if (updatedColumns.length === 0) {
              updatedUserResponse = updatedUserResponse.filter(
                (ans) => ans.row !== row
              );
            } else {
              updatedUserResponse[existingRowIndex] = {
                ...existingRow,
                column: updatedColumns,
              };
            }
          }
        }

        if (updatedUserResponse.length === 0) {
          return prevUserResponse.filter(
            (response) => response.questionText !== question.text
          );
        } else {
          return prevUserResponse.map((resp, index) =>
            index === existingQuestionIndex
              ? { ...resp, userResponse: updatedUserResponse }
              : resp
          );
        }
      } else {
        if (checked) {
          return [
            ...prevUserResponse,
            {
              questionText: question.text,
              userResponse: [{ row, column: [col] }],
            },
          ];
        }
        return prevUserResponse;
      }
    });
  };
  
  const shuffledRows = useMemo(() => {
    if (question.meta?.enableRowShuffle) {
      const newRows = [...rows];
      for (let i = newRows.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newRows[i], newRows[j]] = [newRows[j], newRows[i]];
      }
      return newRows;
    }
    return rows;
  }, [rows, question.meta?.enableRowShuffle]);


  const isRequiredValid = () => {
    if (!question.required) return true;
    return rows.every((row) => {
      const rowValue = typeof row === 'object' && row?.text ? row.text : row;
      return userAnswer.some((ans) => ans.row === rowValue && ans.column?.length > 0);
    });
  };

  return (
    <div className="mt-2 ms-2 me-2">
      {/* Question Text */}
      <h5 className="mb-2" style={{ fontSize: "1.2rem" }}>
        {question.text || "Untitled Question"}
        {question.required && <span className="text-danger ms-1">*</span>}
      </h5>

      {/* Image Preview */}
      {question.imageUrls && question.imageUrls.length > 0 && (
        <div className="mt-4 mb-4">
          {question.imageUrls.map((img, idx) => (
            <div key={idx} className="mb-3 bg-gray-50">
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
            </div>
          ))}
        </div>
      )}

      {/* Grid for Answers */}
      <div className="table-responsive mt-4">
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
            {shuffledRows.map((row, rowIndex) => {
              const rowValue = typeof row === 'object' && row?.text ? row.text : row;
              return (
              <tr key={rowIndex}>
                <td>{rowValue || `Row ${rowIndex + 1}`}</td>
                {columns.map((col, colIndex) => {
                  const colValue = typeof col === 'object' && col?.text ? col.text : col;
                  return (
                  <td key={colIndex} className="text-center">
                    <input
                      type="checkbox"
                      className="form-check-input me-2"
                      checked={isChecked(rowValue, colValue)}
                      onChange={(e) => handleChange(rowValue, colValue, e.target.checked)}
                      disabled={question.disabled}
                      aria-label={`Select ${colValue} for ${rowValue}`}
                    />
                  </td>
                )})}
              </tr>
            )})}
          </tbody>
        </table>
      </div>

      {question.required && !isRequiredValid() && (
        <small className="text-danger">
          At least one box per row is required.
        </small>
      )}
    </div>
  );
};

export default TickBoxGrid;