import React, { useState, useCallback, useMemo } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Option from "./QuestionSpecificUtils/OptionClass";
import ImageCropper from "./QuestionSpecificUtils/ImageCropper";
import TagManager from "./QuestionSpecificUtils/Tag";
import axios from "axios";
import translateText from "./QuestionSpecificUtils/Translation";
import { handleOtherOption } from "./QuestionSpecificUtils/OtherOption";

const Radio = ({
  question,
  questions,
  setQuestions,
  language,
  setLanguage,
  getLabel,
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
  const [enableMarks, setEnableMarks] = useState(
    question.meta?.enableMarks || false
  );

  const options = useMemo(
    () => question.meta?.options || [],
    [question.meta?.options]
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

  const handleEnableMarksToggle = useCallback(() => {
    const newValue = !enableMarks;
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === question.id) {
          const updatedOptions = !newValue
            ? (q.meta?.options || []).map((opt) => ({ ...opt, value: 0 }))
            : q.meta?.options || [];
          return {
            ...q,
            meta: {
              ...q.meta,
              enableMarks: newValue,
              options: updatedOptions,
            },
          };
        }
        return q;
      })
    );
    setEnableMarks(newValue);
  }, [enableMarks, question.id, setQuestions]);

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
                new Option(`Option ${currentOptions.length + 1}`, 0),
              ],
            },
          };
        }
        return q;
      })
    );
  }, [question.id, setQuestions]);

  const updateOption = useCallback(
    (idx, newText) => {
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === question.id
            ? {
                ...q,
                meta: {
                  ...q.meta,
                  options: (q.meta?.options || []).map((opt, i) =>
                    i === idx ? { ...opt, text: newText } : opt
                  ),
                },
              }
            : q
        )
      );
    },
    [question.id, setQuestions]
  );

  const updateOptionValue = useCallback(
    (idx, newValue) => {
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === question.id
            ? {
                ...q,
                meta: {
                  ...q.meta,
                  options: (q.meta?.options || []).map((opt, i) =>
                    i === idx
                      ? { ...opt, value: parseFloat(newValue) || 0 }
                      : opt
                  ),
                },
              }
            : q
        )
      );
    },
    [question.id, setQuestions]
  );

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
        options: [
          ...(question.meta?.options || []).map(
            (opt) => new Option(opt.text, opt.value ?? 0)
          ),
        ],
        enableOptionShuffle: enableOptionShuffle,
        enableMarks: enableMarks,
      },
    };
    let updatedQuestions = [...questions];
    updatedQuestions.splice(index + 1, 0, copiedQuestion);
    updatedQuestions = updatedQuestions.map((q, i) => ({ ...q, id: i + 1 }));
    setQuestions(updatedQuestions);
  }, [question, questions, setQuestions, enableOptionShuffle, enableMarks]);

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
      updateOption(idx, translatedText);
    });
  }, [
    handleQuestionChange,
    question.meta.options,
    question.text,
    updateOption,
  ]);

  return (
    <div className="mb-3 dnd-isolate">
      <div className="d-flex flex-column flex-sm-row justify-content-sm-between align-items-start align-items-sm-center mb-2">
        <label className="ms-2 mb-2 mb-sm-0" style={{ fontSize: "1.2rem" }}>
          <em>
            <strong>{getLabel("Multiple Choice Question")}</strong>
          </em>
        </label>
        <TagManager
          questionId={question.id}
          questionText={question.text}
          questions={questions}
          setQuestions={setQuestions}
          getLabel={getLabel}
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
                  className="form-select form-select-sm w-auto"
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

      <input
        type="text"
        className="form-control mb-2 mt-2"
        value={question.text || ""}
        onChange={(e) => handleQuestionChange(e.target.value)}
        placeholder={getLabel("Enter your question here")}
      />

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId={`options-radio-${question.id}`}>
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {options.map((option, idx) => {
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
                            style={{ fontSize: "1.5rem", cursor: "grab" }}
                          ></i>
                        </div>
                        <div className="col-auto">
                          <input
                            className="form-check-input"
                            type="radio"
                            name={`display-radio-${question.id}`}
                            disabled
                          />
                        </div>
                        <div className="col">
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={option.text || ""}
                            onChange={(e) => updateOption(idx, e.target.value)}
                            placeholder={`Option ${idx + 1}`}
                          />
                        </div>
                        {enableMarks && (
                          <div
                            className="col-auto"
                            style={{ minWidth: "75px", maxWidth: "100px" }}
                          >
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              value={option.value ?? ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                updateOptionValue(
                                  idx,
                                  val === "" ? 0 : parseFloat(val) || 0
                                );
                              }}
                              placeholder="Pts"
                            />
                          </div>
                        )}
                        <div className="col-auto">
                          <button
                            className="btn btn-sm btn-outline-secondary w-auto"
                            onClick={() => removeOption(idx)}
                            disabled={options.length <= 1}
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

      <button
        className="btn btn-sm btn-outline-secondary w-auto"
        onClick={addOption}
      >
        ➕ {getLabel("Add Option")}
      </button>

      <div className="d-flex flex-wrap align-items-center mt-3 gap-2">
        <button
          className="btn btn-outline-secondary w-auto"
          onClick={handleCopy}
          title="Copy Question"
        >
          <i className="bi bi-clipboard"></i>
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
            id={`enableMarksRadio-${question.id}`}
            onChange={handleEnableMarksToggle}
            checked={enableMarks}
          />
          <label
            className="form-check-label"
            htmlFor={`enableMarksRadio-${question.id}`}
          >
            {getLabel("Enable Marking System")}
          </label>
        </div>
        <div className="form-check form-switch mb-2">
          <input
            className="form-check-input"
            type="checkbox"
            id={`enableOptionShuffleRadio-${question.id}`}
            onChange={handleEnableOptionShuffleToggle}
            checked={enableOptionShuffle}
          />
          <label
            className="form-check-label"
            htmlFor={`enableOptionShuffleRadio-${question.id}`}
          >
            {getLabel("Shuffle option order")}
          </label>
        </div>
        {/* <div>
          <label className="switch">
            <input
              type="checkbox"
              onChange={handleRequired}
              checked={required}
            />
            <span className="slider"></span>
          </label>
          <span className="ms-2">
            {getLabel("Required")}
          </span>
        </div> */}
        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            id={`requiredSwitchRadio-${question.id}`}
            checked={required}
            onChange={handleRequired}
          />
          <label
            className="form-check-label"
            htmlFor={`requiredSwitchRadio-${question.id}`}
          >
            {getLabel("Required")}
          </label>
        </div>
      </div>
    </div>
  );
};

export default Radio;
