import { useState, useCallback, useRef, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import ImageCropper from "./QuestionSpecificUtils/ImageCropper";
import TagManager from "./QuestionSpecificUtils/Tag";
import translateText from "./QuestionSpecificUtils/Translation";
import { handleOtherOption } from "./QuestionSpecificUtils/OtherOption";

const Radio = ({
  index,
  question,
  questions,
  setQuestions,
  language,
  setLanguage,
  getLabel,
  isQuiz,
  defaultPointValue,
  totalMarks,
  setTotalMarks,
}) => {
  const [required, setRequired] = useState(question.required || false);
  const [otherOption, setOtherOption] = useState(
    question.otherAsOption || false
  );
  const [showCropper, setShowCropper] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const [enableOptionShuffle, setEnableOptionShuffle] = useState(
    question.meta?.enableOptionShuffle || false
  );

  // Mark for an individual question
  const [mark, setMark] = useState(question.points || defaultPointValue);

  const handleOptionChange = useCallback(
    (index, value) => {
      if (value.includes("\n")) {
        const lines = value.split("\n").filter((line) => line.trim() !== "");
        if (lines.length > 1) {
          setQuestions((prev) =>
            prev.map((q) => {
              if (q.id === question.id) {
                const currentOptions = [...(q.meta?.options || [])];
                currentOptions[index] = {
                  ...currentOptions[index],
                  text: lines[0].trim(),
                };
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
                currentOptions[index] = {
                  ...currentOptions[index],
                  text: lines[0].trim(),
                };
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

  const handleQuestionImageUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setShowCropper(true);
    if (event.target) {
      event.target.value = null;
    }
  }, []);

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
        prev.map((q) =>
          q.id === question.id
            ? {
                ...q,
                meta: {
                  ...q.meta,
                  options: (q.meta?.options || []).filter((_, i) => i !== idx),
                },
              }
            : q
        )
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
          if (q.id !== question.id) return q;
          const opts = Array.from(q.meta?.options || []);
          const [moved] = opts.splice(src, 1);
          opts.splice(dest, 0, moved);
          return { ...q, meta: { ...q.meta, options: opts } };
        })
      );
    },
    [question.id, setQuestions]
  );

  const handleCopy = useCallback(() => {
    const index = questions.findIndex((q) => q.id === question.id);
    const copiedQuestion = {
      ...question,
      id: questions.length + 1,
      meta: {
        ...question.meta,
        options: [...(question.meta?.options || []).map((opt) => opt)],
        enableOptionShuffle: enableOptionShuffle,
      },
    };
    let updatedQuestions = [...questions];
    updatedQuestions.splice(index + 1, 0, copiedQuestion);
    updatedQuestions = updatedQuestions.map((q, i) => ({ ...q, id: i + 1 }));
    setQuestions(updatedQuestions);
  }, [question, questions, setQuestions, enableOptionShuffle]);

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
    const response = await translateText(question.text);
    const optionTexts = (question.meta.options || []).map((opt) => opt.text);
    const translatedOptions = await translateText(optionTexts, "bn");
    handleQuestionChange(response.data.data.translations[0].translatedText);
    const translatedTexts = translatedOptions.data.data.translations.map(
      (t) => t.translatedText
    );
    translatedTexts.forEach((translatedText, idx) => {
      handleOptionChange(idx, translatedText);
    });
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

  // Update mark for one particular question
  const handleQuestionPointValueChange = useCallback(
    (value) => {
      const pointValue = parseFloat(value);
      setMark(isNaN(pointValue) ? 0 : pointValue);

      setQuestions((prev) =>
        prev.map((q) =>
          q.id === question.id
            ? { ...q, points: isNaN(pointValue) ? 0 : pointValue }
            : q
        )
      );
    },
    [setQuestions]
  );

  // Function to handle correct answer selection in quiz mode
  const handleCorrectAnswerSelection = useCallback(
    (optionText) => {
      if (!isQuiz) return;

      setQuestions((prev) =>
        prev.map((q) =>
          q.id === question.id
            ? { ...q, meta: { ...q.meta, correctAnswer: optionText } }
            : q
        )
      );
    },
    [isQuiz, question.id, setQuestions]
  );

  // Function to handle correct answer deselection in quiz mode; If the same option is clicked again, it will be deselected
  const handleCorrectAnswerDeselection = useCallback(
    (optionText) => () => {
      if (!isQuiz) return;

      setQuestions((prev) =>
        prev.map((q) => {
          if (q.id === question.id) {
            if (q.meta?.correctAnswer === optionText) {
              const updatedMeta = { ...q.meta };
              delete updatedMeta.correctAnswer;
              return { ...q, meta: updatedMeta };
            }
          }
          return q;
        })
      );
    },
    [isQuiz, question.id, setQuestions]
  );

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
            <div key={idx} className="mb-3 bg-light p-3 rounded shadow-sm">
              <div
                className={`d-flex justify-content-${img.alignment || "start"}`}
              >
                <img
                  src={img.url}
                  alt={`Question visual aid ${idx + 1}`}
                  className="img-fluid rounded"
                  style={{ maxHeight: "300px", maxWidth: "100%" }}
                />
              </div>
              <div className="d-flex flex-wrap justify-content-between align-items-center mt-2 gap-2">
                <select
                  className="form-select form-select-sm"
                  style={{ width: "100px" }}
                  value={img.alignment || "start"}
                  onChange={(e) => updateAlignmentCb(idx, e.target.value)}
                >
                  <option value="start">{getLabel("Left")}</option>
                  <option value="center">{getLabel("Center")}</option>
                  <option value="end">{getLabel("Right")}</option>
                </select>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => removeImageCb(idx)}
                >
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId={`options-radio-${question.id}`}>
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {(question.meta?.options || []).map((option, idx) => {
                const keyForOption = `option-${question.id}-${
                  option.id || idx
                }`;
                const draggableIdForOption = `draggable-option-${question.id}-${
                  option.id || idx
                }`;

                return (
                  <Draggable
                    key={keyForOption}
                    draggableId={draggableIdForOption}
                    index={idx}
                    isDragDisabled={showCropper}
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
                            className="form-check-input"
                            type="radio"
                            name={`display-radio-${question.id}`}
                            disabled={!isQuiz}
                            checked={question.meta?.correctAnswer === option}
                            onChange={() => {
                              handleCorrectAnswerSelection(option);
                            }}
                            onClick={handleCorrectAnswerDeselection(option)}
                          />
                        </div>
                        <div className="col">
                          <input
                            type="text"
                            className="survey-form-control survey-form-control-sm"
                            value={option || ""}
                            onChange={(e) =>
                              handleOptionChange(idx, e.target.value)
                            }
                            onPaste={(e) => handleOptionPaste(idx, e)}
                            onFocus={(e) => e.target.select()}
                            placeholder={`Option ${idx + 1}`}
                          />
                        </div>

                        {/* Remove Option Button; If the option was selected as correct answer then
                            remove it from the question's meta */}
                        <div className="col-auto">
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => {
                              if (isQuiz) {
                                handleCorrectAnswerDeselection(option)();
                              }
                              removeOption(idx);
                            }}
                            disabled={
                              (question.meta?.options || []).length <= 1
                            }
                            title={
                              (question.meta?.options || []).length <= 1
                                ? getLabel("At least one option is required.")
                                : getLabel("Remove Option")
                            }
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <button className="add-option-btn ms-5 mt-2" onClick={addOption}>
        ➕ {getLabel("Add Option")}
      </button>

      <hr />
      {/* Mark for an individual question - Quiz feature */}
      {isQuiz && (
        <div className="mb-3 d-flex align-items-center gap-3">
          <label className="fw-bold mb-0">{getLabel("Points:")}</label>
          <input
            type="number"
            className="survey-form-control survey-form-control-sm"
            style={{ width: "100px" }}
            value={mark}
            min={0}
            onChange={(e) => {
              handleQuestionPointValueChange(e.target.value);
            }}
          />
        </div>
      )}

      {/* Selected option will be displayed as "Selected Correct Answer" in quiz mode */}
      {isQuiz && (
        <div className="mb-3">
          <label className="fw-bold">
            {getLabel("Selected Correct Answer:")}
          </label>{" "}
          {question.meta?.correctAnswer || getLabel("None")}
        </div>
      )}

      {/* Action Buttons and Toggles */}
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
            id={`requiredSwitchRadio-${question.id}`}
            checked={required}
            onChange={handleRequired}
          />
          <label
            className="form-check-label small"
            htmlFor={`requiredSwitchRadio-${question.id}`}
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
                    id={`enableOptionShuffleRadio-${question.id}`}
                    checked={enableOptionShuffle}
                    onChange={handleEnableOptionShuffleToggle}
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

export default Radio;
