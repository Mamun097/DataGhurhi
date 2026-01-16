import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import ImageCropper from "./QuestionSpecificUtils/ImageCropper";
import TagManager from "./QuestionSpecificUtils/Tag";
import translateText from "./QuestionSpecificUtils/Translation";
import "./CSS/LikertScale.css";

const MAX_COLUMNS = 7;

const LikertScale = ({
  index,
  question,
  questions,
  setQuestions,
  language,
  setLanguage,
  getLabel,
}) => {
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
      question.meta?.columns?.length ? question.meta.columns : ["Column 1"],
    [question.meta?.columns]
  );
  const updateMeta = useCallback(
    (metaUpdate) => {
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === question.id
            ? { ...q, meta: { ...q.meta, ...metaUpdate } }
            : q
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
      if (newValue.includes("\n")) {
        const lines = newValue.split("\n").filter((line) => line.trim() !== "");
        if (lines.length > 1) {
          const currentRows = [...rows];
          currentRows[index] = lines[0].trim();
          const newRows = lines.slice(1).map((line) => line.trim());
          currentRows.splice(index + 1, 0, ...newRows);

          updateMeta({ rows: currentRows });
        } else if (lines.length === 1) {
          const updated = [...rows];
          updated[index] = lines[0].trim();
          updateMeta({ rows: updated });
        }
      } else {
        const updated = [...rows];
        updated[index] = newValue;
        updateMeta({ rows: updated });
      }
    },
    [rows, updateMeta]
  );
  const handleColumnChange = useCallback(
    (index, newValue) => {
      if (newValue.includes("\n")) {
        const lines = newValue.split("\n").filter((line) => line.trim() !== "");
        if (lines.length > 1) {
          const currentColumns = [...columns];
          const totalNewColumns = currentColumns.length + lines.length - 1;
          if (totalNewColumns > MAX_COLUMNS) {
            const allowedNewColumns = MAX_COLUMNS - currentColumns.length;
            const truncatedLines = lines.slice(0, allowedNewColumns + 1);
            currentColumns[index] = truncatedLines[0].trim();
            const newColumns = truncatedLines
              .slice(1)
              .map((line) => line.trim());
            currentColumns.splice(index + 1, 0, ...newColumns);
          } else {
            currentColumns[index] = lines[0].trim();
            const newColumns = lines.slice(1).map((line) => line.trim());
            currentColumns.splice(index + 1, 0, ...newColumns);
          }

          updateMeta({ columns: currentColumns });
        } else if (lines.length === 1) {
          const updated = [...columns];
          updated[index] = lines[0].trim();
          updateMeta({ columns: updated });
        }
      } else {
        const updated = [...columns];
        updated[index] = newValue;
        updateMeta({ columns: updated });
      }
    },
    [columns, updateMeta]
  );
  const handleRowPaste = useCallback(
    (index, event) => {
      event.preventDefault();
      const pastedText = event.clipboardData.getData("text");

      if (pastedText.includes("\n")) {
        const lines = pastedText
          .split("\n")
          .filter((line) => line.trim() !== "");
        if (lines.length > 1) {
          const currentRows = [...rows];
          currentRows[index] = lines[0].trim();
          const newRows = lines.slice(1).map((line) => line.trim());
          currentRows.splice(index + 1, 0, ...newRows);
          updateMeta({ rows: currentRows });
        } else if (lines.length === 1) {
          const updated = [...rows];
          updated[index] = lines[0].trim();
          updateMeta({ rows: updated });
        }
      } else {
        const updated = [...rows];
        updated[index] = pastedText;
        updateMeta({ rows: updated });
      }
    },
    [rows, updateMeta]
  );
  const handleColumnPaste = useCallback(
    (index, event) => {
      event.preventDefault();
      const pastedText = event.clipboardData.getData("text");

      if (pastedText.includes("\n")) {
        const lines = pastedText
          .split("\n")
          .filter((line) => line.trim() !== "");
        if (lines.length > 1) {
          const currentColumns = [...columns];
          const totalNewColumns = currentColumns.length + lines.length - 1;
          if (totalNewColumns > MAX_COLUMNS) {
            const allowedNewColumns = MAX_COLUMNS - currentColumns.length;
            const truncatedLines = lines.slice(0, allowedNewColumns + 1);
            currentColumns[index] = truncatedLines[0].trim();
            const newColumns = truncatedLines
              .slice(1)
              .map((line) => line.trim());
            currentColumns.splice(index + 1, 0, ...newColumns);
          } else {
            currentColumns[index] = lines[0].trim();
            const newColumns = lines.slice(1).map((line) => line.trim());
            currentColumns.splice(index + 1, 0, ...newColumns);
          }

          updateMeta({ columns: currentColumns });
        } else if (lines.length === 1) {
          const updated = [...columns];
          updated[index] = lines[0].trim();
          updateMeta({ columns: updated });
        }
      } else {
        const updated = [...columns];
        updated[index] = pastedText;
        updateMeta({ columns: updated });
      }
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
    if (event.target) event.target.value = null;
  };
  const removeImage = useCallback(
    (index) => {
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === question.id
            ? {
                ...q,
                imageUrls: (q.imageUrls || []).filter((_, i) => i !== index),
              }
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
  }, [
    question,
    questions,
    rows,
    columns,
    setQuestions,
    requireEachRowResponse,
    enableRowShuffle,
  ]);
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
      handleQuestionChange(
        questionResponse.data.data.translations[0].translatedText
      );
      console.log("Meta rows before translation:", question.meta.rows);
      const rowResponse = (question.meta.rows || [])
        .map((opt) => opt.trim())
        .filter((opt) => opt);
      const colResponse = (question.meta.columns || [])
        .map((opt) => opt.trim())
        .filter((opt) => opt);
      if (rowResponse.length > 0) {
        const rowTranslations = await translateText(rowResponse, "bn");
        const translatedRows = rowTranslations.data.data.translations.map(
          (t) => t.translatedText
        );
        console.log("Translated rows:", translatedRows);
        updateMeta({ rows: translatedRows });
      }
      if (colResponse.length > 0) {
        const colTranslations = await translateText(colResponse, "bn");
        const translatedColumns = colTranslations.data.data.translations.map(
          (t) => t.translatedText
        );
        console.log("Translated columns:", translatedColumns);
        updateMeta({ columns: translatedColumns });
      }
    } catch (error) {
      console.error("Error in handleTranslation:", error.message);
    }
  }, [
    handleQuestionChange,
    question.text,
    question.meta.rows,
    question.meta.columns,
    updateMeta,
  ]);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);

  // Close on outside click and position menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(e.target)
      ) {
        setShowMenu(false);
      }
    };

    const handleMenuPosition = () => {
      if (showMenu && menuButtonRef.current && menuRef.current) {
        const buttonRect = menuButtonRef.current.getBoundingClientRect();
        const menu = menuRef.current.querySelector(".custom-menu");
        if (menu) {
          const isMobile = window.innerWidth <= 768;

          if (isMobile) {
            const menuTop = buttonRect.bottom + 8;
            const menuRight = window.innerWidth - buttonRect.right;
            menu.style.position = "fixed";
            menu.style.top = `${menuTop}px`;
            menu.style.right = `${menuRight}px`;
            menu.style.left = "auto";
            menu.style.bottom = "auto";
            menu.style.zIndex = "10000";

            requestAnimationFrame(() => {
              const menuRect = menu.getBoundingClientRect();
              if (menuRect.bottom > window.innerHeight) {
                menu.style.top = `${Math.max(
                  8,
                  buttonRect.top - menuRect.height - 8
                )}px`;
              }
              if (menuRect.left < 16) {
                menu.style.left = "16px";
                menu.style.right = "auto";
              }
            });
          } else {
            menu.style.position = "absolute";
            menu.style.top = "calc(100% + 8px)";
            menu.style.right = "0";
            menu.style.left = "auto";
            menu.style.bottom = "auto";
            menu.style.zIndex = "1000";
          }
        }
      }
    };

    const handleOutside = (e) => {
      handleClickOutside(e);
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside, { passive: true });

    let scrollTimeout = null;
    const throttledMenuPosition = () => {
      if (scrollTimeout) return;
      scrollTimeout = setTimeout(() => {
        handleMenuPosition();
        scrollTimeout = null;
      }, 16);
    };

    if (showMenu) {
      handleMenuPosition();
      window.addEventListener("resize", handleMenuPosition, { passive: true });
      window.addEventListener("scroll", throttledMenuPosition, {
        passive: true,
      });
    }

    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
      window.removeEventListener("resize", handleMenuPosition);
      window.removeEventListener("scroll", throttledMenuPosition);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [showMenu]);
  return (
    <div className="mb-3 dnd-isolate">
      {/* <div className="d-flex justify-content-between align-items-center mb-2">
        <label className="ms-2 mb-2 mb-2" style={{ fontSize: "1.2rem" }}>
          <em>
            Question No: {index}
            <hr />
            Type: <strong>{getLabel("Likert Scale")}</strong>
          </em>
        </label>
        <TagManager
          questionId={question.id}
          questionText={question.text}
          questions={questions}
          setQuestions={setQuestions}
          getLabel={getLabel}
        />
      </div> */}

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

      {/* <input
        type="text"
        className="form-control mb-2"
        placeholder={getLabel("Enter your question here")}
        value={question.text || ""}
        onChange={(e) => handleQuestionChange(e.target.value)}
        onFocus={(e) => e.target.select()}
      /> */}

      <div className="mb-3">
        <h6>
          <b>{getLabel("Rows")}</b>
        </h6>
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
                        className="likert-row-row"
                      >
                        <div
                          className="likert-row-content"
                          {...prov.dragHandleProps}
                        >
                          <div className="likert-row-drag-handle">
                            <i
                              className="bi bi-grip-vertical"
                              style={{
                                fontSize: "1.2rem",
                                cursor: "grab",
                                color: "gray",
                              }}
                            ></i>
                          </div>
                          <input
                            type="text"
                            className="survey-form-control survey-form-control-sm likert-row-text-input"
                            value={row}
                            onChange={(e) =>
                              handleRowChange(index, e.target.value)
                            }
                            onPaste={(e) => handleRowPaste(index, e)}
                            onFocus={(e) => e.target.select()}
                            placeholder={`Row ${index + 1}`}
                          />
                          <button
                            className="btn btn-sm btn-outline-danger likert-delete-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteRow(index);
                            }}
                            disabled={rows.length <= 1}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        <button className="add-option-btn" onClick={handleAddRow}>
          ➕ {getLabel("Add Row")}
        </button>
      </div>

      <div className="mb-3">
        <h6>
          <b>{getLabel("Columns")}</b>
        </h6>
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
                        className="likert-col-row"
                      >
                        <div
                          className="likert-col-content"
                          {...prov.dragHandleProps}
                        >
                          <div className="likert-col-drag-handle">
                            <i
                              className="bi bi-grip-vertical"
                              style={{
                                fontSize: "1.2rem",
                                cursor: "grab",
                                color: "gray",
                              }}
                            ></i>
                          </div>
                          <input
                            type="text"
                            className="survey-form-control survey-form-control-sm likert-col-text-input"
                            value={col}
                            onChange={(e) =>
                              handleColumnChange(index, e.target.value)
                            }
                            onPaste={(e) => handleColumnPaste(index, e)}
                            onFocus={(e) => e.target.select()}
                            placeholder={`Column ${index + 1}`}
                          />
                          <button
                            className="btn btn-sm btn-outline-danger likert-delete-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteColumn(index);
                            }}
                            disabled={columns.length <= 1}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
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
          className="add-option-btn"
          onClick={handleAddColumn}
          disabled={columns.length >= MAX_COLUMNS}
        >
          ➕ {getLabel("Add Column")}{" "}
          {columns.length >= MAX_COLUMNS && `(Max ${MAX_COLUMNS})`}
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
      {/* <div className="d-flex align-items-center mt-3">
        <button
          className="btn btn-sm btn-outline-secondary w-auto me-2"
          onClick={handleCopy}
          title="Copy Question"
        >
          <i className="bi bi-clipboard"></i>
        </button>
        <button
          className="btn btn-sm btn-outline-secondary w-auto me-2"
          onClick={handleDelete}
          title="Delete Question"
        >
          <i className="bi bi-trash"></i>
        </button>
        <label
          className="btn btn-sm btn-outline-secondary w-auto me-2"
          title="Add Image"
        >
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
      </div> */}
      {/* Additional Toggles Separated for Clarity */}
      {/* <div className="mt-3 border-top pt-3">
        <div className="form-check form-switch mb-2">
          <input
            className="form-check-input"
            type="checkbox"
            id={`requireEachRowLikert${question.id}`}
            onChange={handleRequireEachRowResponseToggle}
            checked={requireEachRowResponse}
          />
          <label
            className="form-check-label"
            htmlFor={`requireEachRowLikert${question.id}`}
          >
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
          <label
            className="form-check-label"
            htmlFor={`enableRowShuffleLikert${question.id}`}
          >
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
          <label
            className="form-check-label"
            htmlFor={`requiredSwitchLikert${question.id}`}
          >
            {getLabel("Required")}
          </label>
        </div>
      </div> */}
      <div
        className="question-actions d-flex align-items-center justify-content-end gap-2"
        style={{ width: "100%", maxWidth: "100%", boxSizing: "border-box" }}
      >
        {/* Copy and Delete - side by side on mobile */}
        <div className="question-actions-copy-delete-wrapper">
          <button
            className="survey-icon-btn"
            onClick={handleCopy}
            title="Copy Question"
          >
            <i className="bi bi-copy"></i>
          </button>

          <button
            className="survey-icon-btn"
            onClick={handleDelete}
            title="Delete Question"
          >
            <i className="bi bi-trash"></i>
          </button>
        </div>

        {/* Required */}
        <div className="form-check form-switch mb-0 required-switch-container">
          <label
            className="form-check-label small"
            htmlFor={`requiredSwitchLikert${question.id}`}
          >
            {getLabel("Required")}
          </label>
          <input
            className="form-check-input"
            type="checkbox"
            id={`requiredSwitchLikert${question.id}`}
            checked={required}
            onChange={handleRequired}
          />
        </div>

        {/* Three Dots Menu */}
        <div className="menu-container" ref={menuRef}>
          <button
            ref={menuButtonRef}
            className="icon-btn"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowMenu((prev) => !prev);
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowMenu((prev) => !prev);
            }}
            title="More Options"
            type="button"
          >
            <i className="bi bi-three-dots-vertical"></i>
          </button>

          {showMenu && (
            <>
              <div
                className="menu-backdrop"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowMenu(false);
                }}
                onTouchStart={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowMenu(false);
                }}
              ></div>
              <div className="custom-menu">
                {/* Shuffle Options */}
                <div className="menu-item">
                  <div className="menu-label">
                    <i className="bi bi-shuffle"></i>
                    {getLabel("Shuffle Option Order")}
                  </div>
                  <label className="switch-small">
                    <input
                      type="checkbox"
                      id={`enableRowShuffleLikert${question.id}`}
                      onChange={handleEnableRowShuffleToggle}
                    />
                    <span className="slider-small"></span>
                  </label>
                </div>
                {/* Require at least one row*/}
                <div className="menu-item">
                  <div className="menu-label">
                    <i className="bi bi-check2-square"></i>
                    {getLabel("Require at least one selection")}
                  </div>
                  <label className="switch-small">
                    <input
                      type="checkbox"
                      id={`requireEachRowLikert${question.id}`}
                      onChange={handleRequireEachRowResponseToggle}
                      checked={requireEachRowResponse}
                    />
                    <span className="slider-small"></span>
                  </label>
                </div>
                {/* Add Image */}
                <label className="menu-item" style={{ cursor: "pointer" }}>
                  <div className="menu-label">
                    <i className="bi bi-image"></i>
                    {getLabel("Add Image")}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleQuestionImageUpload}
                  />
                </label>

                {/* Translate */}
                <button className="menu-item" onClick={handleTranslation}>
                  <div className="menu-label">
                    <i className="bi bi-translate"></i>
                    {getLabel("Translate Question")}
                  </div>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LikertScale;
