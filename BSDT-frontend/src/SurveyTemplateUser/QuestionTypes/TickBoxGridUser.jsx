import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const TickBoxGrid = ({ question, userResponse, setUserResponse }) => {
  // Default rows and columns with fallbacks
  const rows = question.meta?.rows?.length ? question.meta.rows : ["Row 1"];
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
      (ans) => ans.row === row && ans.column.includes(col)
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

        if (checked) {
          // Add the selection if not already present
          const existingRowIndex = updatedUserResponse.findIndex(
            (ans) => ans.row === row
          );
          if (existingRowIndex !== -1) {
            // Update the existing row with the new column
            const existingRow = updatedUserResponse[existingRowIndex];
            if (!existingRow.column.includes(col)) {
              updatedUserResponse[existingRowIndex] = {
                ...existingRow,
                column: [...(existingRow.column || []), col],
              };
            }
          } else {
            // Add a new selection for the row and column
            updatedUserResponse.push({ row, column: [col] });
          }
        } else {
          // Remove the selection
          const existingRowIndex = updatedUserResponse.findIndex(
            (ans) => ans.row === row
          );
          if (existingRowIndex !== -1) {
            const existingRow = updatedUserResponse[existingRowIndex];
            const updatedColumns = existingRow.column.filter((c) => c !== col);
            if (updatedColumns.length === 0) {
              // If no columns left for the row, remove the row
              updatedUserResponse = updatedUserResponse.filter(
                (ans) => ans.row !== row
              );
            } else {
              // Update the row with remaining columns
              updatedUserResponse[existingRowIndex] = {
                ...existingRow,
                column: updatedColumns,
              };
            }
          }
        }

        if (updatedUserResponse.length === 0) {
          // If no selections left, remove the question response
          return prevUserResponse.filter(
            (response) => response.questionText !== question.text
          );
        } else {
          // Update the question response
          return [
            ...prevUserResponse.slice(0, existingQuestionIndex),
            { ...existingQuestionResponse, userResponse: updatedUserResponse },
            ...prevUserResponse.slice(existingQuestionIndex + 1),
          ];
        }
      } else {
        if (checked) {
          // Add new question response with the selection
          return [
            ...prevUserResponse,
            {
              questionText: question.text,
              userResponse: [{ row, column: [col] }],
            },
          ];
        }
        // If unchecking and no existing response, do nothing
        return prevUserResponse;
      }
    });
  };


  // Check if all required rows have at least one selection
  const isRequiredValid = () => {
    if (!question.required) return true;
    return rows.every((row) => userAnswer.some((ans) => ans.row === row));
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
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                <td>{row || `Row ${rowIndex + 1}`}</td>
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="text-center">
                    <input
                      type="checkbox"
                      className="form-check-input me-2"
                      checked={isChecked(row, col)}
                      onChange={(e) => handleChange(row, col, e.target.checked)}
                      disabled={question.disabled}
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
