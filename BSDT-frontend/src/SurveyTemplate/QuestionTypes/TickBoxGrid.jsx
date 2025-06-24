// Desc: Tick Box Grid component for the form builder
// Allows multiple selections per row.

import React, { useState, useCallback, useMemo } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import TagManager from "./QuestionSpecificUtils/Tag";
import ImageCropper from "./QuestionSpecificUtils/ImageCropper";
import translateText from "./QuestionSpecificUtils/Translation";

const MAX_COLUMNS = 7; // Define maximum number of columns

const TickBoxGrid = ({ question, questions, setQuestions, language, setLanguage, getLabel }) => { 
  const [showCropper, setShowCropper] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // State for toggles, mirroring LikertScale
  const [required, setRequired] = useState(question.required || false);
  const [requireEachRowResponse, setRequireEachRowResponse] = useState(
    question.meta?.requireEachRowResponse || false
  );
  const [enableRowShuffle, setEnableRowShuffle] = useState(
    question.meta?.enableRowShuffle || false
  );
  const rows = useMemo(
    () => (question.meta?.rows?.length ? question.meta.rows : ["Row 1"]),
    [question.meta?.rows]
  );
  const columns = useMemo(
    () =>
      question.meta?.columns?.length
        ? question.meta.columns
        : ["Column 1"],
    [question.meta?.columns]
  );

  const updateMeta = useCallback(
    (metaUpdate) => {
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === question.id ? { ...q, meta: { ...q.meta, ...metaUpdate } } : q
        )
      );
    },
    [question.id, setQuestions]
  );

  const handleRequired = useCallback(() => {
    const newRequiredState = !required;
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === question.id ? { ...q, required: newRequiredState } : q
      )
    );
    setRequired(newRequiredState);
  }, [question.id, setQuestions, required]);

  const handleRequireEachRowResponseToggle = useCallback(() => {
    const newValue = !requireEachRowResponse;
    updateMeta({ requireEachRowResponse: newValue });
    setRequireEachRowResponse(newValue);
  }, [requireEachRowResponse, updateMeta]);

  const handleEnableRowShuffleToggle = useCallback(() => {
    const newValue = !enableRowShuffle;
    updateMeta({ enableRowShuffle: newValue });
    setEnableRowShuffle(newValue);
  }, [enableRowShuffle, updateMeta]);

  const handleQuestionChange = useCallback(
    (newText) => {
      setQuestions((prev) =>
        prev.map((q) => (q.id === question.id ? { ...q, text: newText } : q))
      );
    },
    [question.id, setQuestions]
  );

  const handleRowChange = useCallback(
    (index, newValue) => {
      const updated = [...rows];
      updated[index] = newValue;
      updateMeta({ rows: updated });
    },
    [rows, updateMeta]
  );

  const handleColumnChange = useCallback(
    (index, newValue) => {
      const updated = [...columns];
      updated[index] = newValue;
      updateMeta({ columns: updated });
    },
    [columns, updateMeta]
  );

  const handleAddRow = useCallback(() => {
    updateMeta({ rows: [...rows, `Row ${rows.length + 1}`] });
  }, [rows, updateMeta]);

  const handleAddColumn = useCallback(() => {
    if (columns.length < MAX_COLUMNS) {
      updateMeta({ columns: [...columns, `Column ${columns.length + 1}`] });
    }
  }, [columns, updateMeta]);

  const handleDeleteRow = useCallback(
    (index) => {
      const updated = rows.filter((_, i) => i !== index);
      updateMeta({ rows: updated.length ? updated : ["Row 1"] });
    },
    [rows, updateMeta]
  );

  const handleDeleteColumn = useCallback(
    (index) => {
      const updated = columns.filter((_, i) => i !== index);
      updateMeta({ columns: updated.length ? updated : ["Column 1"] });
    },
    [columns, updateMeta]
  );

  const handleQuestionImageUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setShowCropper(true);
    event.target.value = null; 
  }, []); 

  const removeImage = useCallback(
    (index) => {
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === question.id
            ? { ...q, imageUrls: q.imageUrls.filter((_, i) => i !== index) }
            : q
        )
      );
    },
    [question.id, setQuestions]
  );

  const updateAlignment = useCallback(
    (index, alignment) => {
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
    },
    [question.id, setQuestions]
  );

  const handleDelete = useCallback(() => {
    setQuestions((prev) => {
      const filtered = prev.filter((q) => q.id !== question.id);
      return filtered.map((q, i) => ({ ...q, id: i + 1 }));
    });
  }, [question.id, setQuestions]);

  const handleCopy = useCallback(() => {
    const index = questions.findIndex((q) => q.id === question.id);
    const copiedQuestion = {
      ...question,
      id: questions.length + 1,
      meta: {
        ...question.meta,
        rows: [...rows],
        columns: [...columns],
        requireEachRowResponse: requireEachRowResponse,
        enableRowShuffle: enableRowShuffle,
      },
    };

    let updatedQuestions = [...questions];
    updatedQuestions.splice(index + 1, 0, copiedQuestion);
    updatedQuestions = updatedQuestions.map((q, i) => ({ ...q, id: i + 1 }));

    setQuestions(updatedQuestions);
  }, [question, questions, rows, columns, setQuestions, requireEachRowResponse, enableRowShuffle]);

  const handleRowDragEnd = useCallback(
    (result) => {
      if (!result.destination) return;
      const src = result.source.index;
      const dest = result.destination.index;
      const reorderedRows = Array.from(rows);
      const [movedRow] = reorderedRows.splice(src, 1);
      reorderedRows.splice(dest, 0, movedRow);
      updateMeta({ rows: reorderedRows });
    },
    [rows, updateMeta]
  );

  const handleColumnDragEnd = useCallback(
    (result) => {
      if (!result.destination) return;
      const src = result.source.index;
      const dest = result.destination.index;
      const reorderedColumns = Array.from(columns);
      const [movedColumn] = reorderedColumns.splice(src, 1);
      reorderedColumns.splice(dest, 0, movedColumn);
      updateMeta({ columns: reorderedColumns });
    },
    [columns, updateMeta]
  );
  const handleTranslation = useCallback(async () => {
    try {
      const questionResponse = await translateText(question.text);
      if (!questionResponse?.data?.data?.translations?.[0]?.translatedText) {
        throw new Error("No translation returned for question");
      }
      handleQuestionChange(questionResponse.data.data.translations[0].translatedText);
      //translate the array of meta.rows
      console.log("Meta rows before translation:", question.meta.rows);
      const rowResponse = (question.meta.rows || []).map((opt) => opt.trim()).filter(opt => opt);
      const colResponse = (question.meta.columns || []).map((opt) => opt.trim()).filter(opt => opt);
      if (rowResponse.length > 0) {
        const rowTranslations = await translateText(rowResponse, "bn");
        const translatedRows = rowTranslations.data.data.translations.map((t) => t.translatedText);
        console.log("Translated rows:", translatedRows);
        updateMeta({ rows: translatedRows });
      }
      //translate the array of meta.columns
      if (colResponse.length > 0) {
        const colTranslations = await translateText(colResponse, "bn");
        const translatedColumns = colTranslations.data.data.translations.map((t) => t.translatedText);
        console.log("Translated columns:", translatedColumns);
        updateMeta({ columns: translatedColumns });
      }
      
    } catch (error) {
      console.error("Error in handleTranslation:", error.message);
    }
  }, [handleQuestionChange, question.text, question.meta.rows, question.meta.columns, updateMeta]);
  

  return (
    <div className="mb-3 dnd-isolate">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <label className="ms-2 mb-2" style={{ fontSize: "1.2rem" }}>
          <em>
            <strong>{getLabel("Tick Box Grid")}</strong>
          </em>
        </label>
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
          getLabel={getLabel}
          onClose={() => {
            setShowCropper(false);
            setSelectedFile(null);
          }}
        />
      )}

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
                  <option value="start">{getLabel("Left")}</option>
                  <option value="center">{getLabel("Center")}</option>
                  <option value="end">{getLabel("Right")}</option>
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

      <input
        type="text"
        className="form-control mb-2"
        placeholder="Enter your question here"
        value={question.text}
        onChange={(e) => handleQuestionChange(e.target.value)}
      />

      {/* Rows with Drag & Drop */}
      <div className="mb-3">
        <h6>
          <b>{getLabel("Rows")}</b>
        </h6>
        <DragDropContext onDragEnd={handleRowDragEnd}>
          <Droppable droppableId={`tickbox-rows-${question.id}`}>
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {rows.map((row, index) => (
                  <Draggable
                    key={`row-tickbox-${question.id}-${index}`} 
                    draggableId={`tickbox-row-${question.id}-${index}`} 
                    index={index}
                  >
                    {(prov) => (
                      <div
                        ref={prov.innerRef}
                        {...prov.draggableProps}
                        className="d-flex align-items-center mb-2"
                      >
                        <span {...prov.dragHandleProps} className="me-2" style={{ cursor: "grab" }}>
                          <i className="bi bi-grip-vertical" style={{ fontSize: "1.5rem" }}></i>
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          value={row}
                          onChange={(e) => handleRowChange(index, e.target.value)}
                          placeholder={`Row ${index + 1}`}
                        />
                        <button
                          className="btn btn-outline-secondary ms-2 w-auto"
                          onClick={() => handleDeleteRow(index)}
                          disabled={rows.length <= 1}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        <button
          className="btn btn-sm btn-outline-primary mt-2 w-auto"
          onClick={handleAddRow}
        >
          ➕ {getLabel("Add Row")}
        </button>
      </div>

      {/* Columns with Drag & Drop */}
      <div className="mb-3">
        <h6>
          <b>{getLabel("Columns")}</b>
        </h6>
        <DragDropContext onDragEnd={handleColumnDragEnd}>
          <Droppable droppableId={`tickbox-columns-${question.id}`}>
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {columns.map((col, index) => (
                  <Draggable
                    key={`col-tickbox-${question.id}-${index}`} 
                    draggableId={`tickbox-col-${question.id}-${index}`} 
                    index={index}
                  >
                    {(prov) => (
                      <div
                        ref={prov.innerRef}
                        {...prov.draggableProps}
                        className="d-flex align-items-center mb-2"
                      >
                         <span {...prov.dragHandleProps} className="me-2" style={{ cursor: "grab" }}>
                          <i className="bi bi-grip-vertical" style={{ fontSize: "1.5rem" }}></i>
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          value={col}
                          onChange={(e) => handleColumnChange(index, e.target.value)}
                          placeholder={`Column ${index + 1}`}
                        />
                        <button
                          className="btn btn-outline-secondary ms-2 w-auto"
                          onClick={() => handleDeleteColumn(index)}
                          disabled={columns.length <= 1}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        <button
          className="btn btn-sm btn-outline-primary mt-2 w-auto"
          onClick={handleAddColumn}
          disabled={columns.length >= MAX_COLUMNS}
        >
          ➕ {getLabel("Add Column")} {columns.length >= MAX_COLUMNS && `(Max ${MAX_COLUMNS})`}
        </button>
      </div>

      {/* Grid Preview */}
      {/* {rows.length > 0 && columns.length > 0 && (
        <div className="table-responsive mb-3">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th style={{minWidth: '120px', wordBreak: 'break-word'}}></th>
                {columns.map((col, colIndex) => (
                  <th
                    key={`header-tickbox-${colIndex}`}
                    className="text-center"
                    style={{ wordBreak: 'break-word' }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={`preview-row-tickbox-${rowIndex}`}>
                  <td style={{ wordBreak: 'break-word' }}>{row}</td>
                  {columns.map((_, colIndex) => (
                    <td key={`cell-tickbox-${rowIndex}-${colIndex}`} className="text-center">
                      <input
                        type="checkbox"
                        name={`tickbox-q${question.id}-row${rowIndex}-col${colIndex}`}
                        disabled
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )} */}

      {/* Action Buttons */}
      <div className="d-flex align-items-center mt-3">
        <button className="btn btn-sm btn-outline-secondary w-auto me-2" onClick={handleCopy}>
          <i className="bi bi-clipboard"></i>
        </button>
        <button
          className="btn btn-sm btn-outline-secondary w-auto me-2"
          onClick={handleDelete}
        >
          <i className="bi bi-trash"></i>
        </button>
        <label className="btn btn-sm btn-outline-secondary w-auto me-2">
          <i className="bi bi-image"></i>
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={handleQuestionImageUpload}
          />
        </label>
        <button
          className="btn btn-outline-secondary w-auto"
          onClick={handleTranslation}
          title="Translate Question"
        >
          <i className="bi bi-translate"></i>
        </button>
      </div>

      {/* Additional Toggles Separated for Clarity */}
      <div className="mt-3 border-top pt-3">
         <div className="form-check form-switch mb-2">
          <input
            className="form-check-input"
            type="checkbox"
            id={`requireEachRowTickbox${question.id}`}
            onChange={handleRequireEachRowResponseToggle}
            checked={requireEachRowResponse}
          />
          <label className="form-check-label" htmlFor={`requireEachRowTickbox${question.id}`}>
            {getLabel("Require a response in each row")}
          </label>
          </div>
          <div className="form-check form-switch mb-2">
          <input
            className="form-check-input"
            type="checkbox"
            id={`enableRowShuffleTickbox${question.id}`}
            onChange={handleEnableRowShuffleToggle}
            checked={enableRowShuffle}
          />
          <label className="form-check-label" htmlFor={`enableRowShuffleTickbox${question.id}`}>
            {getLabel("Shuffle row order")}
          </label>
          </div>
          <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            id={`requiredSwitchTickbox${question.id}`}
            onChange={handleRequired}
            checked={required}
          />
          <label className="form-check-label" htmlFor={`requiredSwitchTickbox${question.id}`}>
            {getLabel("Required")}
          </label>
          </div>
      </div>
    </div>
  );
};

export default TickBoxGrid;