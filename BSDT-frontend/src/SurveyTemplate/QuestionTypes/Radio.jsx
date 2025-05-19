// src/QuestionTypes/Radio.jsx
import React, { useState, useCallback, use } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Option from "./QuestionSpecificUtils/OptionClass";
import { handleQuestionImageUpload } from "./QuestionSpecificUtils/handleQuestionImageUpload";
import ImageCropper from "./QuestionSpecificUtils/ImageCropper";

const Radio = ({ question, questions, setQuestions }) => {
  const [required, setRequired] = useState(question.required || false);

  const [showCropper, setShowCropper] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleQuestionImageUpload = (event, id) => {
    const file = event.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    // setCurrentQuestionId(id);
    setShowCropper(true);
  };

  // Toggle required
  const handleRequired = useCallback(
    (id) => {
      setQuestions((prev) =>
        prev.map((q) => (q.id === id ? { ...q, required: !q.required } : q))
      );
      setRequired((r) => !r);
    },
    [setQuestions]
  );

  // Update question text
  const handleQuestionChange = useCallback(
    (newText) => {
      setQuestions((prev) =>
        prev.map((q) => (q.id === question.id ? { ...q, text: newText } : q))
      );
    },
    [question.id, setQuestions]
  );

  // Delete question and resequence IDs
  const handleDelete = useCallback(() => {
    setQuestions((prev) => {
      const filtered = prev.filter((q) => q.id !== question.id);
      return filtered.map((q, i) => ({ ...q, id: i + 1 }));
    });
  }, [question.id, setQuestions]);

  // Image upload
  // const handleImageUpload = useCallback(
  //   (e) => {
  //     const file = e.target.files[0];
  //     if (!file) return;
  //     const reader = new FileReader();
  //     reader.onload = () => {
  //       setQuestions((prev) =>
  //         prev.map((q) =>
  //           q.id === question.id ? { ...q, image: reader.result } : q
  //         )
  //       );
  //     };
  //     reader.readAsDataURL(file);
  //   },
  //   [question.id, setQuestions]
  // );

  // Add new option
  const addOption = useCallback(() => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === question.id
          ? {
              ...q,
              meta: {
                ...q.meta,
                options: [
                  ...q.meta.options,
                  `Option ${q.meta.options.length + 1}`,
                ],
              },
            }
          : q
      )
    );
  }, [question.id, setQuestions]);

  // Update an option's text
  const updateOption = useCallback(
    (idx, newText) => {
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === question.id
            ? {
                ...q,
                meta: {
                  ...q.meta,
                  options: q.meta.options.map((opt, i) =>
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

  // const updateOption = useCallback(
  //   (idx, newText) => {
  //     setQuestions((prev) =>
  //       prev.map((q) =>
  //         q.id === question.id
  //           ? {
  //               ...q,
  //               meta: {
  //                 ...q.meta,
  //                 options: q.meta.options.map((opt, i) =>
  //                   i === idx ? newText : opt
  //                 ),
  //               },
  //             }
  //           : q
  //       )
  //     );
  //   },
  //   [question.id, setQuestions]
  // );

  // Update option's value
  const updateOptionValue = useCallback(
    (idx, newValue) => {
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === question.id
            ? {
                ...q,
                meta: {
                  ...q.meta,
                  options: q.meta.options.map((opt, i) =>
                    i === idx ? { ...opt, value: newValue } : opt
                  ),
                },
              }
            : q
        )
      );
    },
    [question.id, setQuestions]
  );

  // Remove an option
  const removeOption = useCallback(
    (idx) => {
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === question.id
            ? {
                ...q,
                meta: {
                  ...q.meta,
                  options: q.meta.options.filter((_, i) => i !== idx),
                },
              }
            : q
        )
      );
    },
    [question.id, setQuestions]
  );

  // Handle drag end to reorder options
  const handleDragEnd = useCallback(
    (result) => {
      if (!result.destination) return;

      const src = result.source.index;
      const dest = result.destination.index;

      setQuestions((prev) =>
        prev.map((q) => {
          if (q.id !== question.id) return q;
          const opts = Array.from(q.meta.options);
          const [moved] = opts.splice(src, 1);
          opts.splice(dest, 0, moved);
          return {
            ...q,
            meta: {
              ...q.meta,
              options: opts,
            },
          };
        })
      );
    },
    [question.id, setQuestions]
  );

  // Copy question: duplicate with id+1, bump subsequent IDs
  const handleCopy = useCallback(() => {
    const index = questions.findIndex((q) => q.id === question.id);
    const newId = question.id + 1;
    const copied = { ...question, id: newId };

    // bump IDs
    const bumped = questions.map((q) =>
      q.id > question.id ? { ...q, id: q.id + 1 } : q
    );
    bumped.splice(index + 1, 0, copied);
    bumped.sort((a, b) => a.id - b.id);
    setQuestions(bumped);
  }, [question, questions, setQuestions]);

  // handle add tag
  const handleAddTag = useCallback(() => {
    const tagsInput = prompt("Enter tags (comma-separated):");
    if (tagsInput) {
      const newTags = tagsInput.split(",").map((tag) => tag.trim()); // Split and trim tags
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === question.id
            ? {
                ...q,
                meta: {
                  ...q.meta,
                  tags: [...(q.meta.tags || []), ...newTags], // Add new tags
                },
              }
            : q
        )
      );
    }
  }, [question.id, setQuestions]);

  return (
    <div className="mb-3 dnd-isolate">
      <div>
        <label className="ms-2 mb-2" style={{ fontSize: "1.2rem" }}>
          <em>
            <strong>MCQ</strong>
          </em>
        </label>
      </div>

      {showCropper && selectedFile && (
        <ImageCropper
          file={selectedFile}
          questionId={question.id}
          setQuestions={setQuestions}
          onClose={() => setShowCropper(false)}
        />
      )}

      {/* Image Preview */}
      {question.imageUrl && (
        <img
          src={question.imageUrl}
          alt="Question"
          className="img-fluid mb-2"
          style={{ maxHeight: 200 }}
        />
      )}

      {/* Question Text */}
      <input
        type="text"
        className="form-control mb-2"
        value={question.text}
        onChange={(e) => handleQuestionChange(e.target.value)}
        placeholder="Enter question..."
      />

      {/* Drag-and-Drop Options */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId={`options-${question.id}`}>
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {question.meta.options.map((option, idx) => (
                <Draggable
                  key={idx}
                  draggableId={`opt-${question.id}-${idx}`}
                  index={idx}
                  isDragDisabled={showCropper}
                >
                  {(prov) => (
                    <div
                      ref={prov.innerRef}
                      {...prov.draggableProps}
                      className="row  mb-1"
                    >
                      <div className="col-auto" {...prov.dragHandleProps}>
                        <i
                          className="bi bi-grip-vertical"
                          style={{ fontSize: "1.5rem", cursor: "grab" }}
                        ></i>
                      </div>
                      <div className="col-8">
                        <input
                          type="text"
                          className="form-control"
                          value={option.text}
                          onChange={(e) => updateOption(idx, e.target.value)}
                        />
                      </div>
                      <div className="col-2">
                        <input
                          type="number"
                          className="form-control"
                          value={option.value ?? 0}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (/^-?\d*$/.test(val))
                              updateOptionValue(idx, val);
                          }}
                        />
                      </div>
                      <div className="col-1">
                        <button
                          className="btn btn-outline-danger"
                          onClick={() => removeOption(idx)}
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

      {/* Add option */}
      <button
        className="btn btn-sm btn-outline-primary mt-2"
        onClick={addOption}
      >
        ➕ Add Option
      </button>

      {/* Actions */}
      <div className="d-flex align-items-center mt-3">
        <button className="btn btn-outline-secondary me-2" onClick={handleCopy}>
          <i className="bi bi-clipboard"></i>
        </button>
        <button
          className="btn btn-outline-secondary me-2"
          onClick={handleDelete}
        >
          <i className="bi bi-trash"></i>
        </button>
        <label className="btn btn-outline-secondary me-2">
          <i className="bi bi-image"></i>
          <input
            type="file"
            hidden
            onChange={(e) => handleQuestionImageUpload(e, question.id)}
          />
        </label>
        <button
          className="btn btn-outline-secondary me-2"
          onClick={handleAddTag}
        >
          <i className="bi bi-tags"></i>
        </button>
        <div className="form-check form-switch ms-auto">
          <input
            className="form-check-input"
            type="checkbox"
            checked={required}
            onChange={() => handleRequired(question.id)}
          />
          <label className="form-check-label">Required</label>
        </div>
      </div>
    </div>
  );
};

export default Radio;
