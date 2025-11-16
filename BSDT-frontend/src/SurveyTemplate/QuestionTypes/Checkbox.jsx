import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import TagManager from "./QuestionSpecificUtils/Tag";
import ImageCropper from "./QuestionSpecificUtils/ImageCropper";
import translateText from "./QuestionSpecificUtils/Translation";
import { handleOtherOption } from "./QuestionSpecificUtils/OtherOption";
import "../CSS/SurveyQuestions.css";

const Checkbox = ({
  index,
  question,
  questions,
  setQuestions,
  language,
  setLanguage,
  getLabel,
}) => {
  const [otherOption, setOtherOption] = useState(
    question.otherAsOption || false
  );

  const [showCropper, setShowCropper] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [required, setRequired] = useState(question.required || false);
  const [enableOptionShuffle, setEnableOptionShuffle] = useState(
    question.meta?.enableOptionShuffle || false
  );
  const [requireAtLeastOneSelection, setRequireAtLeastOneSelection] = useState(
    question.meta?.requireAtLeastOneSelection || false
  );

  const handleOptionChange = useCallback(
    (index, value) => {
      if (value.includes("\n")) {
        const lines = value.split("\n").filter((line) => line.trim() !== "");
        if (lines.length > 1) {
          setQuestions((prev) =>
            prev.map((q) => {
              if (q.id === question.id) {
                const currentOptions = [...(q.meta?.options || [])];
                currentOptions[index] = lines[0].trim();
                const newOptions = lines.slice(1).map((line) => line.trim());
                currentOptions.splice(index + 1, 0, ...newOptions);

                return {
                  ...q,
                  meta: {
                    ...q.meta,
                    options: currentOptions,
                  },
                };
              }
              return q;
            })
          );
        } else if (lines.length === 1) {
          setQuestions((prev) =>
            prev.map((q) =>
              q.id === question.id
                ? {
                    ...q,
                    meta: {
                      ...q.meta,
                      options: (q.meta?.options || []).map((opt, i) =>
                        i === index ? lines[0].trim() : opt
                      ),
                    },
                  }
                : q
            )
          );
        }
      } else {
        setQuestions((prev) =>
          prev.map((q) =>
            q.id === question.id
              ? {
                  ...q,
                  meta: {
                    ...q.meta,
                    options: (q.meta?.options || []).map((opt, i) =>
                      i === index ? value : opt
                    ),
                  },
                }
              : q
          )
        );
      }
    },
    [question.id, setQuestions]
  );

  const handleOptionPaste = useCallback(
    (index, event) => {
      event.preventDefault();
      const pastedText = event.clipboardData.getData("text");

      if (pastedText.includes("\n")) {
        const lines = pastedText
          .split("\n")
          .filter((line) => line.trim() !== "");
        if (lines.length > 1) {
          setQuestions((prev) =>
            prev.map((q) => {
              if (q.id === question.id) {
                const currentOptions = [...(q.meta?.options || [])];
                currentOptions[index] = lines[0].trim();
                const newOptions = lines.slice(1).map((line) => line.trim());
                currentOptions.splice(index + 1, 0, ...newOptions);

                return {
                  ...q,
                  meta: {
                    ...q.meta,
                    options: currentOptions,
                  },
                };
              }
              return q;
            })
          );
        } else if (lines.length === 1) {
          setQuestions((prev) =>
            prev.map((q) =>
              q.id === question.id
                ? {
                    ...q,
                    meta: {
                      ...q.meta,
                      options: (q.meta?.options || []).map((opt, i) =>
                        i === index ? lines[0].trim() : opt
                      ),
                    },
                  }
                : q
            )
          );
        }
      } else {
        setQuestions((prev) =>
          prev.map((q) =>
            q.id === question.id
              ? {
                  ...q,
                  meta: {
                    ...q.meta,
                    options: (q.meta?.options || []).map((opt, i) =>
                      i === index ? pastedText : opt
                    ),
                  },
                }
              : q
          )
        );
      }
    },
    [question.id, setQuestions]
  );

  useEffect(() => {
    setRequired(question.required || false);
  }, [question.required]);

  useEffect(() => {
    setEnableOptionShuffle(question.meta?.enableOptionShuffle || false);
  }, [question.meta?.enableOptionShuffle]);

  useEffect(() => {
    setRequireAtLeastOneSelection(
      question.meta?.requireAtLeastOneSelection || false
    );
  }, [question.meta?.requireAtLeastOneSelection]);

  const handleRequired = useCallback(() => {
    const newRequiredState = !required;
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === question.id ? { ...q, required: newRequiredState } : q
      )
    );
    setRequired(newRequiredState);
  }, [question.id, setQuestions, required]);

  const handleEnableOptionShuffleToggle = useCallback(() => {
    const newValue = !enableOptionShuffle;
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === question.id
          ? { ...q, meta: { ...q.meta, enableOptionShuffle: newValue } }
          : q
      )
    );
    setEnableOptionShuffle(newValue);
  }, [enableOptionShuffle, question.id, setQuestions]);

  const handleRequireAtLeastOneSelectionToggle = useCallback(() => {
    const newValue = !requireAtLeastOneSelection;
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === question.id
          ? { ...q, meta: { ...q.meta, requireAtLeastOneSelection: newValue } }
          : q
      )
    );
    setRequireAtLeastOneSelection(newValue);
  }, [requireAtLeastOneSelection, question.id, setQuestions]);

  const handleQuestionChange = useCallback(
    (newText) => {
      setQuestions((prev) =>
        prev.map((q) => (q.id === question.id ? { ...q, text: newText } : q))
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
        options: [...(question.meta?.options || [])],
        enableOptionShuffle: enableOptionShuffle,
        requireAtLeastOneSelection: requireAtLeastOneSelection,
      },
    };

    let updatedQuestions = [...questions];
    updatedQuestions.splice(index + 1, 0, copiedQuestion);
    updatedQuestions = updatedQuestions.map((q, i) => ({ ...q, id: i + 1 }));

    setQuestions(updatedQuestions);
  }, [
    question,
    questions,
    setQuestions,
    enableOptionShuffle,
    requireAtLeastOneSelection,
  ]);

  const handleQuestionImageUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setShowCropper(true);
    if (event.target) event.target.value = null;
  }, []);

  const addOption = useCallback(() => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === question.id) {
          const currentOptions = q.meta?.options || [];
          return {
            ...q,
            meta: {
              ...q.meta,
              options: [
                ...currentOptions,
                `Option ${currentOptions.length + 1}`,
              ],
            },
          };
        }
        return q;
      })
    );
  }, [question.id, setQuestions]);

  const removeOption = useCallback(
    (idx) => {
      setQuestions((prev) =>
        prev.map((q) => {
          if (q.id === question.id) {
            const currentOptions = q.meta?.options || [];
            const updatedOptions = currentOptions.filter((_, i) => i !== idx);
            return {
              ...q,
              meta: {
                ...q.meta,
                options: updatedOptions,
              },
            };
          }
          return q;
        })
      );
    },
    [question.id, setQuestions]
  );

  const handleDragEnd = useCallback(
    (result) => {
      if (!result.destination) return;
      const src = result.source.index;
      const dest = result.destination.index;
      setQuestions((prev) =>
        prev.map((q) => {
          if (q.id === question.id) {
            const opts = Array.from(q.meta?.options || []);
            const [moved] = opts.splice(src, 1);
            opts.splice(dest, 0, moved);
            return { ...q, meta: { ...q.meta, options: opts } };
          }
          return q;
        })
      );
    },
    [question.id, setQuestions]
  );

  const removeImageCb = useCallback(
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

  const updateAlignmentCb = useCallback(
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

  const handleTranslation = useCallback(async () => {
    try {
      const questionResponse = await translateText(question.text);
      if (!questionResponse?.data?.data?.translations?.[0]?.translatedText) {
        throw new Error("No translation returned for question");
      }
      handleQuestionChange(
        questionResponse.data.data.translations[0].translatedText
      );

      const optionTexts = (question.meta.options || [])
        .map((opt) => opt.trim())
        .filter((opt) => opt);

      if (!optionTexts.length) {
        console.warn("No options to translate");
        return;
      }

      const translatedOptions = await translateText(optionTexts, "bn");
      if (!translatedOptions?.data?.data?.translations) {
        throw new Error("No translations returned for options");
      }

      const translatedTexts = translatedOptions.data.data.translations.map(
        (t) => t.translatedText
      );

      translatedTexts.forEach((translatedText, idx) => {
        handleOptionChange(idx, translatedText);
      });
    } catch (error) {
      console.error("Error in handleTranslation:", error.message);
    }
  }, [
    handleQuestionChange,
    question.meta.options,
    question.text,
    handleOptionChange,
  ]);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="mb-3 dnd-isolate">
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
                  onChange={(e) => updateAlignmentCb(idx, e.target.value)}
                >
                  <option value="start">{getLabel("Left")}</option>
                  <option value="center">{getLabel("Center")}</option>
                  <option value="end">{getLabel("Right")}</option>
                </select>
                <button
                  className="btn btn-sm btn-outline-danger hover:bg-red-700 transition-colors"
                  onClick={() => removeImageCb(idx)}
                >
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* 
      <input
        type="text"
        className="form-control mb-3"
        placeholder={getLabel("Enter your question here")}
        value={question.text || ""}
        onChange={(e) => handleQuestionChange(e.target.value)}
        onFocus={(e) => e.target.select()}
      /> */}

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId={`checkbox-options-${question.id}`}>
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {(question.meta?.options || []).map((option, idx) => (
                <Draggable
                  key={`opt-checkbox-${question.id}-${idx}`}
                  draggableId={`checkbox-opt-${question.id}-${idx}`}
                  index={idx}
                >
                  {(prov) => (
                    <div
                      ref={prov.innerRef}
                      {...prov.draggableProps}
                      className="row g-2 mb-2 align-items-center"
                    >
                      <div className="col-auto" {...prov.dragHandleProps}>
                        <i
                          className="bi bi-grip-vertical"
                          style={{
                            fontSize: "1.2rem",
                            cursor: "grab",
                            color: "gray",
                          }}
                        ></i>
                      </div>
                      <div className="col-auto">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          disabled
                        />
                      </div>
                      <div className="col">
                        <input
                          type="text"
                          className="survey-form-control survey-form-control-sm"
                          value={option}
                          onChange={(e) =>
                            handleOptionChange(idx, e.target.value)
                          }
                          onPaste={(e) => handleOptionPaste(idx, e)}
                          onFocus={(e) => e.target.select()}
                          placeholder={`Option ${idx + 1}`}
                        />
                      </div>
                      <div className="col-auto">
                        <button
                          className="btn btn-sm btn-outline-secondary w-auto"
                          onClick={() => removeOption(idx)}
                          disabled={
                            (question.meta?.options || []).length <= 1 &&
                            (question.meta?.options || [])[0] !== "Other"
                          }
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
      {/* Other Option */}
      {otherOption && (
        <div className="row g-2 mb-2 align-items-center">
          <div className="col-auto">
            <i
              className="bi bi-grip-vertical"
              style={{
                fontSize: "1.2rem",
                cursor: "grab",
                color: "transparent",
              }}
            ></i>
          </div>
          <div className="col-auto">
            <input
              className="form-check-input"
              type="checkbox" // <-- Note: Changed to checkbox
              disabled
            />
          </div>
          <div className="col-auto">
            <span style={{ fontWeight: 600, color: "#0c0b0bff" }}>
              {getLabel("Other: ")}
            </span>
          </div>
          <div className="col">
            <input
              type="text"
              className="survey-form-control survey-form-control-sm"
              disabled
              style={{ backgroundColor: "#f5f5f5", cursor: "not-allowed" }}
            />
          </div>
          <div className="col-auto">
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={() => {
                handleOtherOption(false, question.id, setQuestions);
                setOtherOption(false);
              }}
              title={getLabel("Remove Other")}
            >
              <i className="bi bi-trash"></i>
            </button>
          </div>
        </div>
      )}
      <div className="d-flex gap-2 mt-3">
        <button type="button" className="add-option-btn" onClick={addOption}>
          <i className="bi bi-plus-circle me-1"></i>
          {getLabel("Add Option")}
        </button>

        {!otherOption && (
          <button
            type="button"
            className="add-option-btn"
            onClick={() => {
              handleOtherOption(!otherOption, question.id, setQuestions);
              setOtherOption(true);
            }}
          >
            <i className="bi bi-plus-circle me-1"></i>
            {getLabel('Add "Other"')}
          </button>
        )}
      </div>

      {/* 
      <div className="d-flex flex-wrap align-items-center mt-3 gap-2">
        <button
          className="btn btn-outline-secondary w-auto"
          onClick={handleCopy}
          title="Copy Question"
        >
          <i className="bi bi-copy"></i>
        </button>
        <button
          className="btn btn-outline-secondary w-auto"
          onClick={handleDelete}
          title="Delete Question"
        >
          <i className="bi bi-trash"></i>
        </button>
        <label className="btn btn-outline-secondary w-auto" title="Add Image">
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

      <div className="mt-3 border-top pt-3">
        <div>
          <label className="switch">
            <input
              type="checkbox"
              onChange={() => {
                handleOtherOption(!otherOption, question.id, setQuestions);
                setOtherOption((prev) => !prev);
              }}
              checked={otherOption}
            />
            <span className="slider"></span>
          </label>
          <span className="ms-2 fw-bold">
            {getLabel("Allow others as option")}
          </span>
        </div>
        <div className="form-check form-switch mb-2">
          <input
            className="form-check-input"
            type="checkbox"
            id={`enableOptionShuffleCheckbox${question.id}`}
            onChange={handleEnableOptionShuffleToggle}
            checked={enableOptionShuffle}
          />
          <label
            className="form-check-label"
            htmlFor={`enableOptionShuffleCheckbox${question.id}`}
          >
            {getLabel("Shuffle option order")}
          </label>
        </div>
        <div className="form-check form-switch mb-2">
          <input
            className="form-check-input"
            type="checkbox"
            id={`requireAtLeastOneSelectionCheckbox${question.id}`}
            onChange={handleRequireAtLeastOneSelectionToggle}
            checked={requireAtLeastOneSelection}
          />
          <label
            className="form-check-label"
            htmlFor={`requireAtLeastOneSelectionCheckbox${question.id}`}
          >
            {getLabel("Require at least one selection")}
          </label>
        </div>
        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            id={`requiredSwitchCheckbox${question.id}`}
            checked={required}
            onChange={handleRequired}
          />
          <label
            className="form-check-label"
            htmlFor={`requiredSwitchCheckbox${question.id}`}
          >
            {getLabel("Required")}
          </label>
        </div> */}
      {/* </div> */}
      <div className="question-actions d-flex align-items-center justify-content-end gap-2">
        {/* Copy */}
        <button
          className="survey-icon-btn"
          onClick={handleCopy}
          title="Copy Question"
        >
          <i className="bi bi-copy"></i>
        </button>

        {/* Delete */}
        <button
          className="survey-icon-btn"
          onClick={handleDelete}
          title="Delete Question"
        >
          <i className="bi bi-trash"></i>
        </button>

        {/* Required */}
        <div className="form-check form-switch mb-0">
          <input
            className="form-check-input"
            type="checkbox"
            id={`requiredSwitchCheckbox${question.id}`}
            checked={required}
            onChange={handleRequired}
          />
          <label
            className="form-check-label small"
            htmlFor={`requiredSwitchCheckbox${question.id}`}
          >
            {getLabel("Required")}
          </label>
        </div>

        {/* Three Dots Menu */}
        <div className="menu-container" ref={menuRef}>
          <button
            className="icon-btn"
            onClick={() => setShowMenu((prev) => !prev)}
            title="More Options"
          >
            <i className="bi bi-three-dots-vertical"></i>
          </button>

          {showMenu && (
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
                    checked={enableOptionShuffle}
                    onChange={handleEnableOptionShuffleToggle}
                  />
                  <span className="slider-small"></span>
                </label>
              </div>

              {/* Require at least one */}
              <div className="menu-item">
                <div className="menu-label">
                  <i className="bi bi-check2-square"></i>
                  {getLabel("Require at least one selection")}
                </div>
                <label className="switch-small">
                  <input
                    type="checkbox"
                    checked={requireAtLeastOneSelection}
                    onChange={handleRequireAtLeastOneSelectionToggle}
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
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkbox;
