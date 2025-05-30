import React, { useState, useCallback, useMemo } from "react"; // Added useMemo
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import TagManager from "./QuestionSpecificUtils/Tag";
import ImageCropper from "./QuestionSpecificUtils/ImageCropper";

const Checkbox = ({ question, questions, setQuestions }) => {
  const [required, setRequired] = useState(question.required || false);
  const [showCropper, setShowCropper] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // New states for additional toggles
  const [enableOptionShuffle, setEnableOptionShuffle] = useState(
    question.meta?.enableOptionShuffle || false
  );
  const [requireAtLeastOneSelection, setRequireAtLeastOneSelection] = useState(
    question.meta?.requireAtLeastOneSelection || false
  );

  const options = useMemo( // Memoizing options array
    () => question.meta?.options || [],
    [question.meta?.options]
  );

  // Toggle required
  const handleRequired = useCallback(() => {
    // Standardized: Uses question.id from closure
    const newRequiredState = !required;
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === question.id ? { ...q, required: newRequiredState } : q
      )
    );
    setRequired(newRequiredState);
  }, [question.id, setQuestions, required]);

  // Toggle Shuffle Option Order
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

  // Toggle Require At Least One Selection
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

  // Copy question
  const handleCopy = useCallback(() => {
    const index = questions.findIndex((q) => q.id === question.id);
    // Standardized ID generation and re-sequencing
    const copiedQuestion = {
      ...question,
      id: questions.length + 1, // Temporary ID, will be re-sequenced
      meta: {
        ...question.meta,
        options: [...(question.meta?.options || [])],
        enableOptionShuffle: enableOptionShuffle, // Copy shuffle state
        requireAtLeastOneSelection: requireAtLeastOneSelection, // Copy validation state
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

  // Handle image upload trigger
  const handleQuestionImageUpload = useCallback((event) => {

    const file = event.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setShowCropper(true);
    event.target.value = null;
  }, []); // Dependencies: setSelectedFile, setShowCropper

  // Add new option
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

  // Update option text
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
                    i === idx ? newText : opt
                  ),
                },
              }
            : q
        )
      );
    },
    [question.id, setQuestions]
  );

  // Remove option
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

  // Handle drag end
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
          return {
            ...q,
            meta: { ...q.meta, options: opts },
          };
        })
      );
    },
    [question.id, setQuestions]
  );

  // Remove image
  const removeImageCb = useCallback((index) => { // Wrapped in useCallback
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === question.id
          ? { ...q, imageUrls: (q.imageUrls || []).filter((_, i) => i !== index) }
          : q
      )
    );
  }, [question.id, setQuestions]);

  // Update image alignment
  const updateAlignmentCb = useCallback((index, alignment) => { 
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
  }, [question.id, setQuestions]);


  return (
    <div className="mb-3 dnd-isolate">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <label className="ms-2 mb-2" style={{ fontSize: "1.2rem" }}>
          <em>
            <strong>Checkbox</strong>
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
                  onChange={(e) => updateAlignmentCb(idx, e.target.value)}
                >
                  <option value="start">Left</option>
                  <option value="center">Center</option>
                  <option value="end">Right</option>
                </select>
                <button
                  className="btn btn-sm btn-outline-danger hover:bg-red-700 transition-colors me-1"
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
        className="form-control mb-2"
        placeholder="Enter your question here"
        value={question.text}
        onChange={(e) => handleQuestionChange(e.target.value)}
      />

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
                      {...prov.dragHandleProps}
                      className="d-flex align-items-center mb-2"
                    >
                      <i
                        className="bi bi-grip-vertical me-2" 
                        style={{ fontSize: "1.5rem", cursor: "grab" }}
                      ></i>
                      <input
                        type="text"
                        className="form-control me-2"
                        value={option}
                        onChange={(e) => updateOption(idx, e.target.value)}
                        placeholder={`Option ${idx + 1}`}
                      />
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => removeOption(idx)}
                        disabled={(question.meta?.options || []).length <= 1 && (question.meta?.options || [])[0] !== "Other"}

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
        <label className="btn btn-outline-secondary me-2 hover:bg-gray-100 transition-colors">
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
            id={`enableOptionShuffleCheckbox${question.id}`}
            onChange={handleEnableOptionShuffleToggle}
            checked={enableOptionShuffle}
          />
          <label className="form-check-label" htmlFor={`enableOptionShuffleCheckbox${question.id}`}>
            Shuffle option order
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
          <label className="form-check-label" htmlFor={`requireAtLeastOneSelectionCheckbox${question.id}`}>
            Require at least one selection
          </label>
        </div>
        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            id={`requiredSwitchCheckbox${question.id}`}
            checked={required}
            onChange={handleRequired} // Standardized call
          />
          <label className="form-check-label" htmlFor={`requiredSwitchCheckbox${question.id}`}>
            Required
          </label>
        </div>
      </div>
    </div>
  );
};

export default Checkbox;