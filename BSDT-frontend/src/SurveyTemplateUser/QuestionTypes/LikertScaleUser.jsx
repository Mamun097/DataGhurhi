import React, { useMemo } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const LikertScale = ({ index, question, userResponse, setUserResponse }) => {
  // Columns remain as they are, with a fallback
  const columns = question.meta?.columns?.length
    ? question.meta.columns
    : ["Column 1"];

  // Initialize user response for the question
  const userAnswer =
    userResponse.find((response) => response.questionText === question.text)
      ?.userResponse || [];

  // This handler for selecting/deselecting an answer remains unchanged
  const handleClick = (row, columnValue) => {
    setUserResponse((prevUserResponse) => {
      const existingQuestionIndex = prevUserResponse.findIndex(
        (response) => response.questionText === question.text
      );

      if (existingQuestionIndex !== -1) {
        const existingQuestionResponse =
          prevUserResponse[existingQuestionIndex];
        const existingRowAnswer = existingQuestionResponse.userResponse.find(
          (ans) => ans.row === row
        );

        if (existingRowAnswer) {
          if (existingRowAnswer.column === columnValue) {
            const updatedUserResponse =
              existingQuestionResponse.userResponse.filter(
                (ans) => ans.row !== row
              );
            if (updatedUserResponse.length === 0) {
              // If no answers left for this question, remove the entire question response
              return prevUserResponse.filter(
                (response) => response.questionText !== question.text
              );
            } else {
              // Update existing question response
              return prevUserResponse.map((resp, index) =>
                index === existingQuestionIndex
                  ? { ...resp, userResponse: updatedUserResponse }
                  : resp
              );
            }
          } else {
            const updatedUserResponse =
              existingQuestionResponse.userResponse.map((ans) =>
                ans.row === row ? { ...ans, column: columnValue } : ans
              );
            return prevUserResponse.map((resp, index) =>
              index === existingQuestionIndex
                ? { ...resp, userResponse: updatedUserResponse }
                : resp
            );
          }
        } else {
          const updatedUserResponse = [
            ...existingQuestionResponse.userResponse,
            { row, column: columnValue },
          ];
          return prevUserResponse.map((resp, index) =>
            index === existingQuestionIndex
              ? { ...resp, userResponse: updatedUserResponse }
              : resp
          );
        }
      } else {
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

  const shuffledRows = useMemo(() => {
    const rows = question.meta?.rows?.length ? question.meta.rows : ["Row 1"];
    if (question.meta?.enableRowShuffle) {
      const newRows = [...rows];
      for (let i = newRows.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newRows[i], newRows[j]] = [newRows[j], newRows[i]];
      }
      return newRows;
    }
    return rows;
  }, [question]); // Dependency: re-calculate only if the question object changes

  return (
    <div className="mt-2 ms-2 me-2">
      {/* Question Text */}
      <h5 className="mb-2" style={{ fontSize: "1.2rem" }}>
        {index}{". "}
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
              const rowValue =
                typeof row === "object" && row?.text ? row.text : row;
              return (
                <tr key={rowIndex}>
                  <td>{rowValue || `Row ${rowIndex + 1}`}</td>
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className="text-center">
                      <input
                        type="radio"
                        className="form-check-input me-2"
                        name={`row-${question.id}-${rowIndex}`}
                        value={col}
                        checked={userAnswer.some(
                          (ans) => ans.row === rowValue && ans.column === col
                        )}
                        onChange={() => handleClick(rowValue, col)}
                        required={question.required}
                        disabled={question.disabled}
                        aria-label={`Select ${col} for ${rowValue}`}
                      />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LikertScale;
