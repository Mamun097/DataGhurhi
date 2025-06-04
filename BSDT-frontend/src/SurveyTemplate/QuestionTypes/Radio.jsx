import React, { useEffect, useState, useCallback, useMemo } from "react";
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
    // Reset file input value to allow re-uploading the same file
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
          // When disabling marks, reset all option values to 0
          const updatedOptions = !newValue
            ? (q.meta?.options || []).map(opt => ({ ...opt, value: 0 }))
            : (q.meta?.options || []); // Otherwise, keep existing options (marks might have values)
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
      // Re-index IDs
      return filtered.map((q, i) => ({ ...q, id: i + 1 }));
    });
  }, [question.id, setQuestions]);

  const addOption = useCallback(() => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === question.id) {
          const currentOptions = q.meta?.options || [];
          // Ensure Option class is used if it adds unique IDs or other logic
          return {
            ...q,
            meta: {
              ...q.meta,
              options: [
                ...currentOptions,
                new Option(`Option ${currentOptions.length + 1}`, 0), // Assuming Option class constructor handles ID
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
                    i === idx ? { ...opt, text: newText } : opt // Create a new option object for the updated one
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
      id: questions.length + 1, // Temporary ID, will be re-indexed
      meta: {
        ...question.meta,
        options: [...(question.meta?.options || []).map(opt => new Option(opt.text, opt.value ?? 0))],
        enableOptionShuffle: enableOptionShuffle, // Use current state of these toggles
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
      const newTags = tagsInput.split(",").map((tag) => tag.trim()).filter(tag => tag); // Filter out empty tags
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === question.id
            ? { ...q, meta: { ...q.meta, tags: [...new Set([...(q.meta?.tags || []), ...newTags])] } } // Ensure unique tags
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
    <div className="mb-3 dnd-isolate"> {/* dnd-isolate might be from a custom CSS or dnd setup */}
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
            <div key={idx} className="mb-3 bg-light p-3 rounded shadow-sm"> 
              <div className={`d-flex justify-content-${img.alignment || "start"}`}>
                <img src={img.url} alt={`Question visual aid ${idx + 1}`} className="img-fluid rounded" style={{ maxHeight: '300px', maxWidth: '100%' }} />
              </div>
              <div className="d-flex justify-content-between align-items-center mt-2 gap-2">
                <select
                  className="form-select form-select-sm" // Bootstrap select classes
                  style={{ maxWidth: '100px' }} // Optional: limit width
                  value={img.alignment || "start"}
                  onChange={(e) => updateAlignmentCb(idx, e.target.value)}
                >
                  <option value="start">Left</option>
                  <option value="center">Center</option>
                  <option value="end">Right</option>
                </select>
                <button className="btn btn-sm btn-outline-danger" onClick={() => removeImageCb(idx)}>
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
        placeholder="Enter your question here"
      />

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId={`options-radio-${question.id}`}>
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {options.map((option, idx) => {
                const stableKey = `option-${question.id}-${idx}`;

                return (
                  <Draggable
                    key={stableKey}
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
                            className="form-control" // Standard Bootstrap
                            value={option.text || ""} // Ensure value is controlled
                            onChange={(e) => updateOption(idx, e.target.value)}
                            placeholder={`Option ${idx + 1}`}
                          />
                        </div>
                        {enableMarks && (
                          <div className="col-3 col-md-2">
                            <input
                              type="number"
                              className="form-control" 
                              value={option.value ?? ""} 
                              onChange={(e) => {
                                const val = e.target.value;
                                updateOptionValue(idx, val === "" ? 0 : parseFloat(val) || 0);
                              }}
                              placeholder="Pts"
                            />
                          </div>
                        )}
                        <div className="col-1">
                          <button
                            className="btn btn-sm btn-outline-danger" // Added btn-sm for consistency
                            onClick={() => removeOption(idx)}
                            disabled={options.length <= 1} // Use derived options.length
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

      <button className="btn btn-sm btn-outline-primary mt-2" onClick={addOption}>
        ➕ Add Option
      </button>

      <div className="d-flex align-items-center mt-3 gap-2">
        <button className="btn btn-outline-secondary" onClick={handleCopy}>
          <i className="bi bi-clipboard"></i>
        </button>
        <button className="btn btn-outline-secondary" onClick={handleDelete}>
          <i className="bi bi-trash"></i>
        </button>
        <label className="btn btn-outline-secondary">
          <i className="bi bi-image"></i>
          <input type="file" accept="image/*" hidden onChange={handleQuestionImageUpload} />
        </label>
      </div>

      <div className="mt-3 border-top pt-3">
        <div className="form-check form-switch mb-2">
          <input
            className="form-check-input"
            type="checkbox"
            id={`enableMarksRadio-${question.id}`} // Ensure unique ID
            onChange={handleEnableMarksToggle}
            checked={enableMarks}
          />
          <label className="form-check-label" htmlFor={`enableMarksRadio-${question.id}`}>
            Enable Marks
          </label>
        </div>
        <div className="form-check form-switch mb-2">
          <input
            className="form-check-input"
            type="checkbox"
            id={`enableOptionShuffleRadio-${question.id}`} // Ensure unique ID
            onChange={handleEnableOptionShuffleToggle}
            checked={enableOptionShuffle}
          />
          <label className="form-check-label" htmlFor={`enableOptionShuffleRadio-${question.id}`}>
            Shuffle option order
          </label>
        </div>
        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            id={`requiredSwitchRadio-${question.id}`} // Ensure unique ID
            checked={required}
            onChange={handleRequired}
          />
          <label className="form-check-label" htmlFor={`requiredSwitchRadio-${question.id}`}>
            Required
          </label>
        </div>
      </div>
    </div>
  );
};

export default Radio;