import React, { useState, useCallback, useMemo, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import TagManager from "./QuestionSpecificUtils/Tag";
import ImageCropper from "./QuestionSpecificUtils/ImageCropper";
import translateText from "./QuestionSpecificUtils/Translation";

const Checkbox = ({ question, questions, setQuestions, language, setLanguage, getLabel }) => {
  
  useEffect(() => {
    console.log("Question component rendered with question:", question);
  }, [question]);
  
  const [showCropper, setShowCropper] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [required, setRequired] = useState(question.required || false);
  const [enableOptionShuffle, setEnableOptionShuffle] = useState(
    question.meta?.enableOptionShuffle || false
  );
  const [requireAtLeastOneSelection, setRequireAtLeastOneSelection] = useState(
    question.meta?.requireAtLeastOneSelection || false
  );

  useEffect(() => {
    setRequired(question.required || false);
  }, [question.required]);

  useEffect(() => {
    setEnableOptionShuffle(question.meta?.enableOptionShuffle || false);
  }, [question.meta?.enableOptionShuffle]);

  useEffect(() => {
    setRequireAtLeastOneSelection(question.meta?.requireAtLeastOneSelection || false);
  }, [question.meta?.requireAtLeastOneSelection]);

  const options = useMemo(
    () => question.meta?.options || [],
    [question.meta?.options]
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
        options: [...(options || [])], 
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
    options, 
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
          if (q.id !== question.id) return q;
          const opts = Array.from(options); 
          const [moved] = opts.splice(src, 1);
          opts.splice(dest, 0, moved);
          return { ...q, meta: { ...q.meta, options: opts } };
        })
      );
    },
    [question.id, setQuestions, options] 
  );

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

  const handleTranslation = useCallback(async () => {
    try {
      const questionResponse = await translateText(question.text);
      if (!questionResponse?.data?.data?.translations?.[0]?.translatedText) {
        throw new Error("No translation returned for question");
      }
      handleQuestionChange(questionResponse.data.data.translations[0].translatedText);

      const optionTexts = (question.meta.options || []).map((opt) => opt.trim()).filter((opt) => opt);

      if (!optionTexts.length) {
        console.warn("No options to translate");
        return; // Exit if no options
      }

      const translatedOptions = await translateText(optionTexts, "bn");
      if (!translatedOptions?.data?.data?.translations) {
        throw new Error("No translations returned for options");
      }

      const translatedTexts = translatedOptions.data.data.translations.map(
        (t) => t.translatedText
      );

      translatedTexts.forEach((translatedText, idx) => {
        updateOption(idx, translatedText);
      });
    } catch (error) {
      console.error("Error in handleTranslation:", error.message);
    }
  }, [handleQuestionChange, question.meta.options, question.text, updateOption]);
  
  return (
    <div className="mb-3 dnd-isolate">
      <div className="d-flex flex-column flex-sm-row justify-content-sm-between align-items-start align-items-sm-center mb-2">
        <label className="ms-2 mb-2 mb-sm-0" style={{ fontSize: "1.2rem" }}>
          <em>
            <strong>{getLabel("Checkbox")}</strong>
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

      <input
        type="text"
        className="form-control mb-3"
        placeholder={getLabel("Enter your question here")}
        value={question.text || ""}
        onChange={(e) => handleQuestionChange(e.target.value)}
      />

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId={`checkbox-options-${question.id}`}>
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {(options || []).map((option, idx) => (
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
                      className="d-flex align-items-center mb-2 p-1 rounded"
                      style={{ cursor: "grab" }}
                    >
                      <i
                        className="bi bi-grip-vertical me-2"
                        style={{ fontSize: "1.5rem" }}
                      ></i>
                      <div className="flex-grow-1 me-2">
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={option}
                          onChange={(e) => updateOption(idx, e.target.value)}
                          placeholder={`Option ${idx + 1}`}
                        />
                      </div>
                      <button
                        className="btn btn-sm btn-outline-secondary w-auto"
                        onClick={() => removeOption(idx)}
                        disabled={(options || []).length <= 1 && (options || [])[0] !== "Other"} 
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

      {/* Add Option Button - Reverted to default width */}
      <button
        className="btn btn-sm btn-outline-secondary w-auto" 
        onClick={addOption}
      >
        ➕ {getLabel("Add Option")}
      </button>

      <div className="d-flex flex-wrap align-items-center mt-3 gap-2">
        <button className="btn btn-outline-secondary w-auto" onClick={handleCopy} title="Copy Question">
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
        <div className="form-check form-switch mb-2">
          <input
            className="form-check-input"
            type="checkbox"
            id={`enableOptionShuffleCheckbox${question.id}`}
            onChange={handleEnableOptionShuffleToggle}
            checked={enableOptionShuffle}
          />
          <label className="form-check-label" htmlFor={`enableOptionShuffleCheckbox${question.id}`}>
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
          <label className="form-check-label" htmlFor={`requireAtLeastOneSelectionCheckbox${question.id}`}>
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
          <label className="form-check-label" htmlFor={`requiredSwitchCheckbox${question.id}`}>
            {getLabel("Required")}
          </label>
        </div>
      </div>
    </div>
  );
};

export default Checkbox;