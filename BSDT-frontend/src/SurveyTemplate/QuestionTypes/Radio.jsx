import React, { useState, useEffect, useCallback, useMemo } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Option from "./QuestionSpecificUtils/OptionClass";
import ImageCropper from "./QuestionSpecificUtils/ImageCropper";
import TagManager from "./QuestionSpecificUtils/Tag";

const Radio = ({ question, questions, setQuestions }) => {
  const [required, setRequired] = useState(question.required || false);
  const [showCropper, setShowCropper] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const [enableOptionShuffle, setEnableOptionShuffle] = useState(
    question.meta?.enableOptionShuffle || false
  );
  // New state for enabling marks
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

  // Toggle Enable Marks
  const handleEnableMarksToggle = useCallback(() => {
    const newValue = !enableMarks;
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === question.id) {
          const updatedOptions = !newValue
            ? (q.meta?.options || []).map(opt => ({ ...opt, value: 0 }))
            : (q.meta?.options || []);
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
                    i === idx ? { ...opt, value: parseFloat(newValue) || 0 } : opt
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
        options: [...(question.meta?.options || []).map(opt => new Option(opt.text, opt.value))],
        enableOptionShuffle: enableOptionShuffle,
        enableMarks: enableMarks,
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
    enableMarks,
  ]);

  const handleAddTag = useCallback(() => {
    const tagsInput = prompt("Enter tags (comma-separated):");
    if (tagsInput) {
      const newTags = tagsInput.split(",").map((tag) => tag.trim());
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === question.id
            ? { ...q, meta: { ...q.meta, tags: [...(q.meta?.tags || []), ...newTags] } }
            : q
        )
      );
    }
  }, [question.id, setQuestions]);

  const removeImageCb = useCallback((index) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === question.id
          ? { ...q, imageUrls: (q.imageUrls || []).filter((_, i) => i !== index) }
          : q
      )
    );
  }, [question.id, setQuestions]);

  const updateAlignmentCb = useCallback((index, alignment) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === question.id
          ? { ...q, imageUrls: (q.imageUrls || []).map((img, i) => i === index ? { ...img, alignment } : img) }
          : q
      )
    );
  }, [question.id, setQuestions]);

  return (
    <div className="mb-3 dnd-isolate">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <label className="ms-2 mb-2" style={{ fontSize: "1.2rem" }}>
          <em><strong>Multiple Choice</strong></em>
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
                <img src={img.url} alt={`Question ${idx}`} className="img-fluid rounded" style={{ maxHeight: 400 }} />
              </div>
              <div className="d-flex justify-content-between mt-2 gap-2">
                <select
                  className="form-select w-auto text-sm border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  value={img.alignment || "start"}
                  onChange={(e) => updateAlignmentCb(idx, e.target.value)}
                >
                  <option value="start">Left</option>
                  <option value="center">Center</option>
                  <option value="end">Right</option>
                </select>
                <button className="btn btn-sm btn-outline-danger hover:bg-red-700 transition-colors me-1" onClick={() => removeImageCb(idx)}>
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <input
        type="text"
        className="form-control mb-2 mt-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        value={question.text}
        onChange={(e) => handleQuestionChange(e.target.value)}
        placeholder="Enter your question here"
      />

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId={`options-radio-${question.id}`}>
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {(question.meta?.options || []).map((option, idx) => (
                <Draggable
                  key={`opt-radio-${question.id}-${option.text}-${idx}`}
                  draggableId={`opt-radio-${question.id}-${idx}`}
                  index={idx}
                  isDragDisabled={showCropper}
                >
                  {(prov) => (
                    <div ref={prov.innerRef} {...prov.draggableProps} className="row mb-1 align-items-center">
                      <div className="col-auto" {...prov.dragHandleProps}>
                        <i className="bi bi-grip-vertical" style={{ fontSize: "1.5rem", cursor: "grab" }}></i>
                      </div>
                      <div className={enableMarks ? "col-6 col-md-7" : "col-10 col-md-10"}> 
                        <input
                          type="text"
                          className="form-control border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                          value={option.text}
                          onChange={(e) => updateOption(idx, e.target.value)}
                          placeholder={`Option ${idx + 1}`}
                        />
                      </div>
                      {enableMarks && ( 
                        <div className="col-3 col-md-2">
                          <input
                            type="number"
                            className="form-control border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                            value={option.value ?? ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === '' || /^-?\d+$/.test(val)) {
                                updateOptionValue(idx, val === '' ? 0 : parseInt(val, 10));
                              }
                            }}
                            placeholder="Pts"
                          />
                        </div>
                      )}
                      <div className="col-1">
                        <button
                          className="btn btn-outline-danger hover:bg-red-100 transition-colors"
                          onClick={() => removeOption(idx)}
                          disabled={(question.meta?.options || []).length <= 1}
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

      <button className="btn btn-sm btn-outline-primary mt-2 hover:bg-blue-100 transition-colors" onClick={addOption}>
        ➕ Add Option
      </button>

      <div className="d-flex align-items-center mt-3 gap-2">
        <button className="btn btn-outline-secondary hover:bg-gray-100 transition-colors" onClick={handleCopy}>
          <i className="bi bi-clipboard"></i>
        </button>
        <button className="btn btn-outline-secondary hover:bg-gray-100 transition-colors" onClick={handleDelete}>
          <i className="bi bi-trash"></i>
        </button>
        <label className="btn btn-outline-secondary hover:bg-gray-100 transition-colors">
          <i className="bi bi-image"></i>
          <input type="file" accept="image/*" hidden onChange={handleQuestionImageUpload} />
        </label>
      </div>

      <div className="mt-3 border-top pt-3">
        <div className="form-check form-switch mb-2">
          <input
            className="form-check-input"
            type="checkbox"
            id={`enableMarksRadio${question.id}`}
            onChange={handleEnableMarksToggle}
            checked={enableMarks}
          />
          <label className="form-check-label" htmlFor={`enableMarksRadio${question.id}`}>
            Enable Marks
          </label>
        </div>
        <div className="form-check form-switch mb-2">
          <input
            className="form-check-input"
            type="checkbox"
            id={`enableOptionShuffleRadio${question.id}`}
            onChange={handleEnableOptionShuffleToggle}
            checked={enableOptionShuffle}
          />
          <label className="form-check-label" htmlFor={`enableOptionShuffleRadio${question.id}`}>
            Shuffle option order
          </label>
        </div>
        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            id={`requiredSwitchRadio${question.id}`}
            checked={required}
            onChange={handleRequired}
          />
          <label className="form-check-label" htmlFor={`requiredSwitchRadio${question.id}`}>
            Required
          </label>
        </div>
      </div>
    </div>
  );
};

export default Radio;