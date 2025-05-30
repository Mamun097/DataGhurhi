import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const LikertScale = ({ question, userResponse, setUserResponse }) => {
  // Default rows and columns with fallbacks
  const rows = question.meta?.rows?.length ? question.meta.rows : ["Row 1"];
  const columns = question.meta?.columns?.length
    ? question.meta.columns
    : ["Column 1"];

  // Initialize user response for the question
  const userAnswer =
    userResponse.find(
      (response) => response.questionText === question.text
    )?.userResponse || [];

  // Modified handleClick to handle both selecting and deselecting
  const handleClick = (row, columnValue) => {
    setUserResponse((prevUserResponse) => {
      const existingQuestionIndex = prevUserResponse.findIndex(
        (response) => response.questionText === question.text
      );

      if (existingQuestionIndex !== -1) {
        const existingQuestionResponse = prevUserResponse[existingQuestionIndex];
        const existingRowAnswer = existingQuestionResponse.userResponse.find(
          (ans) => ans.row === row
        );

        if (existingRowAnswer) {
          if (existingRowAnswer.column === columnValue) {
            // Deselect: remove the answer for this row
            const updatedUserResponse = existingQuestionResponse.userResponse.filter(
              (ans) => ans.row !== row
            );
            if( updatedUserResponse.length === 0) {
              // If no answers left for this question, remove it from userResponse
              return prevUserResponse.filter(
                (response) => response.questionText !== question.text
              );
            }
            else {
              // Update existing question response with empty row
              return [
                ...prevUserResponse.slice(0, existingQuestionIndex),
                { ...existingQuestionResponse, userResponse: updatedUserResponse },
                ...prevUserResponse.slice(existingQuestionIndex + 1),
              ];
            }
          } else {
            // Update to new selection
            const updatedUserResponse = existingQuestionResponse.userResponse.map(
              (ans) => (ans.row === row ? { ...ans, column: columnValue } : ans)
            );
            return [
              ...prevUserResponse.slice(0, existingQuestionIndex),
              { ...existingQuestionResponse, userResponse: updatedUserResponse },
              ...prevUserResponse.slice(existingQuestionIndex + 1),
            ];
          }
        } else {
          // Add new selection
          const updatedUserResponse = [
            ...existingQuestionResponse.userResponse,
            { row, column: columnValue },
          ];
          return [
            ...prevUserResponse.slice(0, existingQuestionIndex),
            { ...existingQuestionResponse, userResponse: updatedUserResponse },
            ...prevUserResponse.slice(existingQuestionIndex + 1),
          ];
        }
      } else {
        // Add new question response
        return [
          ...prevUserResponse,
          {
            questionText: question.text,
            userResponse: [{ row, column: columnValue }],
          },
        ];
      }
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
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                <td>{row || `Row ${rowIndex + 1}`}</td>
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="text-center">
                    <input
                      type="radio"
                      className="form-check-input me-2"
                      name={`row-${question.id}-${rowIndex}`}
                      value={col}
                      checked={userAnswer.some(
                        (ans) => ans.row === row && ans.column === col
                      )}
                      onClick={() => handleClick(row, col)}
                      required={question.required}
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
    </div>
  );
};

export default LikertScale;