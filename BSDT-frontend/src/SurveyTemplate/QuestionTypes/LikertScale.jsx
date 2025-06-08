import React, { useState, useCallback, useMemo, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import ImageCropper from "./QuestionSpecificUtils/ImageCropper";
import TagManager from "./QuestionSpecificUtils/Tag";

const MAX_COLUMNS = 7; 

const LikertScale = ({ question, questions, setQuestions, language, setLanguage, getLabel }) => {
  const [showCropper, setShowCropper] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [required, setRequired] = useState(question.required || false);

  const [requireEachRowResponse, setRequireEachRowResponse] = useState(
    question.meta?.requireEachRowResponse || false
  );
  const [enableRowShuffle, setEnableRowShuffle] = useState(
    question.meta?.enableRowShuffle || false
  );

  useEffect(() => {
    setRequired(question.required || false);
  }, [question.required]);

  useEffect(() => {
    setRequireEachRowResponse(question.meta?.requireEachRowResponse || false);
  }, [question.meta?.requireEachRowResponse]);

  useEffect(() => {
    setEnableRowShuffle(question.meta?.enableRowShuffle || false);
  }, [question.meta?.enableRowShuffle]);

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

  const handleQuestionImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setShowCropper(true);
    if(event.target) event.target.value = null;
  };

  const removeImage = useCallback(
    (index) => {
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === question.id
            ? { ...q, imageUrls: (q.imageUrls || []).filter((_, i) => i !== index) }
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
                imageUrls: (q.imageUrls || []).map((img, i) =>
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
      id: -1, 
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

  return (
    <div className="mb-3 dnd-isolate">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <label className="ms-2 mb-2 mb-2" style={{ fontSize: "1.2rem" }}>
          <em>
            <strong>{getLabel("Likert Scale")}</strong>
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
              <div className={`d-flex justify-content-${img.alignment || "start"}`}>
                <img
                  src={img.url}
                  alt={`Question ${idx}`}
                  className="img-fluid rounded"
                  style={{ maxHeight: 400 }}
                />
              </div>
              <div className="d-flex flex-wrap justify-content-between align-items-center mt-2 gap-2">
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
                  className="btn btn-sm btn-outline-danger hover:bg-red-700 transition-colors"
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
        placeholder={getLabel("Enter your question here")}
        value={question.text || ""}
        onChange={(e) => handleQuestionChange(e.target.value)}
      />

      <div className="mb-3">
        <h6><b>{getLabel("Rows")}</b></h6>
        <DragDropContext onDragEnd={handleRowDragEnd}>
          <Droppable droppableId={`likert-rows-${question.id}`}>
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {rows.map((row, index) => (
                  <Draggable
                    key={`row-${question.id}-${index}`}
                    draggableId={`likert-row-${question.id}-${index}`}
                    index={index}
                  >
                    {(prov) => (
                      <div
                        ref={prov.innerRef}
                        {...prov.draggableProps}
                        className="d-flex align-items-center mb-2"
                      >
                        <span {...prov.dragHandleProps} className="me-2 flex-shrink-0" style={{ cursor: "grab" }}>
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

      <div className="mb-3">
        <h6><b>{getLabel("Columns")}</b></h6>
        <DragDropContext onDragEnd={handleColumnDragEnd}>
          <Droppable droppableId={`likert-columns-${question.id}`}>
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {columns.map((col, index) => (
                  <Draggable
                    key={`col-${question.id}-${index}`}
                    draggableId={`likert-col-${question.id}-${index}`}
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
          <table className="table table-bordered table-sm">
            <thead>
              <tr>
                <th style={{minWidth: '120px', width: '25%', wordBreak: 'break-word'}}></th>
                {columns.map((col, colIndex) => (
                  <th
                    key={`header-likert-${colIndex}`} // Changed prefix for uniqueness
                    className="text-center"
                    style={{ wordBreak: 'break-word' }}
                  >
                    {col || `Col ${colIndex + 1}`}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={`preview-row-likert-${rowIndex}`}>
                  <td style={{ wordBreak: 'break-word' }}>{row || `Row ${rowIndex + 1}`}</td>
                  {columns.map((_, colIndex) => (
                    <td key={`cell-likert-${rowIndex}-${colIndex}`} className="text-center align-middle"> 
                      <input className="form-check-input" type="radio" name={`likert-q${question.id}-row-${rowIndex}`} disabled />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )} */}

      {/* Action Buttons - now separate from toggles */}
      <div className="d-flex align-items-center mt-3">
        <button className="btn btn-sm btn-outline-secondary w-auto me-2" onClick={handleCopy} title="Copy Question">
          <i className="bi bi-clipboard"></i>
        </button>
        <button
          className="btn btn-sm btn-outline-secondary w-auto me-2"
          onClick={handleDelete}
          title="Delete Question"
        >
          <i className="bi bi-trash"></i>
        </button>
        <label className="btn btn-sm btn-outline-secondary w-auto me-2" title="Add Image">
          <i className="bi bi-image"></i>
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={handleQuestionImageUpload}
          />
        </label>
      </div>
      {/* Additional Toggles Separated for Clarity */}
      <div className="mt-3 border-top pt-3">
         <div className="form-check form-switch mb-2">
          <input
            className="form-check-input"
            type="checkbox"
            id={`requireEachRowLikert${question.id}`}
            onChange={handleRequireEachRowResponseToggle}
            checked={requireEachRowResponse}
          />
          <label className="form-check-label" htmlFor={`requireEachRowLikert${question.id}`}>
            {getLabel("Require a response in each row")}
          </label>
        </div>
        <div className="form-check form-switch mb-2">
          <input
            className="form-check-input"
            type="checkbox"
            id={`enableRowShuffleLikert${question.id}`}
            onChange={handleEnableRowShuffleToggle}
            checked={enableRowShuffle}
          />
          <label className="form-check-label" htmlFor={`enableRowShuffleLikert${question.id}`}>
            {getLabel("Shuffle row order")}
          </label>
        </div>
         <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            id={`requiredSwitchLikert${question.id}`}
            onChange={handleRequired}
            checked={required}
          />
          <label className="form-check-label" htmlFor={`requiredSwitchLikert${question.id}`}>
            {getLabel("Required")}
          </label>
        </div>
      </div>
    </div>
  );
};

export default LikertScale;