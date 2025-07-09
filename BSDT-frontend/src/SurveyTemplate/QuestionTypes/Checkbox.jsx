import React, { useState, useCallback, useMemo, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import TagManager from "./QuestionSpecificUtils/Tag";
import ImageCropper from "./QuestionSpecificUtils/ImageCropper";
import translateText from "./QuestionSpecificUtils/Translation";

const Checkbox = ({ question, questions, setQuestions, language, getLabel }) => {
  const [showCropper, setShowCropper] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const { 
    required = false, 
    meta: { 
      enableOptionShuffle = false, 
      requireAtLeastOneSelection = false,
      options = [] 
    } = {} 
  } = question;


  const [normalOptions, hasOtherOption] = useMemo(() => {
    const otherExists = options.includes("Other");
    const normal = options.filter(opt => opt !== "Other");
    return [normal, otherExists];
  }, [options]);

  const updateQuestionMeta = useCallback((newMeta) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === question.id
          ? {
              ...q,
              meta: { ...q.meta, ...newMeta },
            }
          : q
      )
    );
  }, [question.id, setQuestions]);

  const addOption = useCallback(() => {
    const newOptionText = `Option ${normalOptions.length + 1}`;
    const newOptions = [...normalOptions, newOptionText];
    if (hasOtherOption) {
      newOptions.push("Other");
    }
    updateQuestionMeta({ options: newOptions });
  }, [normalOptions, hasOtherOption, updateQuestionMeta]);

  const handleAddOtherOption = useCallback(() => {
    if (!hasOtherOption) {
      updateQuestionMeta({ options: [...options, "Other"] });
    }
  }, [options, hasOtherOption, updateQuestionMeta]);
  
  const removeOption = useCallback((indexToRemove) => {
      const newOptions = options.filter((_, i) => i !== indexToRemove);
      updateQuestionMeta({ options: newOptions });
    },
    [options, updateQuestionMeta]
  );

  const updateOption = useCallback((indexToUpdate, newText) => {
      const newOptions = options.map((opt, i) => i === indexToUpdate ? newText : opt);
      updateQuestionMeta({ options: newOptions });
    },
    [options, updateQuestionMeta]
  );

  const handleDragEnd = useCallback((result) => {
      if (!result.destination) return;
      
      const reorderedNormalOpts = Array.from(normalOptions);
      const [movedItem] = reorderedNormalOpts.splice(result.source.index, 1);
      reorderedNormalOpts.splice(result.destination.index, 0, movedItem);

      const finalOptions = hasOtherOption 
        ? [...reorderedNormalOpts, "Other"] 
        : reorderedNormalOpts;

      updateQuestionMeta({ options: finalOptions });
    },
    [normalOptions, hasOtherOption, updateQuestionMeta]
  );
  
  
  const updateQuestion = useCallback((key, value) => {
     setQuestions((prev) =>
      prev.map((q) => (q.id === question.id ? { ...q, [key]: value } : q))
    );
  }, [question.id, setQuestions]);

  const handleRequired = useCallback(() => {
    updateQuestion('required', !required);
  }, [required, updateQuestion]);

  const handleEnableOptionShuffleToggle = useCallback(() => {
    updateQuestionMeta({ enableOptionShuffle: !enableOptionShuffle });
  }, [enableOptionShuffle, updateQuestionMeta]);

  const handleRequireAtLeastOneSelectionToggle = useCallback(() => {
    updateQuestionMeta({ requireAtLeastOneSelection: !requireAtLeastOneSelection });
  }, [requireAtLeastOneSelection, updateQuestionMeta]);

  const handleQuestionChange = useCallback((newText) => {
      updateQuestion('text', newText);
    }, [updateQuestion]);

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
        options: [...options], 
      },
    };

    const updatedQuestions = [...questions];
    updatedQuestions.splice(index + 1, 0, copiedQuestion);
    setQuestions(updatedQuestions.map((q, i) => ({ ...q, id: i + 1 })));
  }, [question, questions, setQuestions, options]);
  
  const handleQuestionImageUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setShowCropper(true);
    if (event.target) event.target.value = null;
  }, []);

  const removeImageCb = useCallback((index) => {
    const newImageUrls = (question.imageUrls || []).filter((_, i) => i !== index);
    updateQuestion('imageUrls', newImageUrls);
  }, [question.imageUrls, updateQuestion]);

  const updateAlignmentCb = useCallback((index, alignment) => { 
    const newImageUrls = (question.imageUrls || []).map((img, i) =>
        i === index ? { ...img, alignment } : img
    );
    updateQuestion('imageUrls', newImageUrls);
  }, [question.imageUrls, updateQuestion]);
  
  const handleTranslation = useCallback(async () => {
    try {
      if (question.text) {
        const questionResponse = await translateText(question.text);
        const translatedQuestion = questionResponse?.data?.data?.translations?.[0]?.translatedText;
        if (translatedQuestion) {
          handleQuestionChange(translatedQuestion);
        }
      }

      const optionsToTranslate = (question.meta.options || [])
        .filter(opt => opt && opt.trim() && opt !== "Other");

      if (optionsToTranslate.length === 0) {
        console.warn("No options to translate.");
        return;
      }

      const translationResponse = await translateText(optionsToTranslate, "bn");
      const translatedTexts = translationResponse?.data?.data?.translations.map(t => t.translatedText);

      if (!translatedTexts || translatedTexts.length !== optionsToTranslate.length) {
        throw new Error("Mismatch in returned translations for options");
      }
      
      const newOptions = [...translatedTexts];
      if (question.meta.options.includes("Other")) {
        newOptions.push("Other");
      }

      updateQuestionMeta({ options: newOptions });

    } catch (error) {
      console.error("Error in handleTranslation:", error);
    }
  }, [
    question.text, 
    question.meta.options, 
    handleQuestionChange, 
    updateQuestionMeta
  ]);

  return (
    <div className="mb-3 p-3 border rounded shadow-sm bg-white">
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
              {normalOptions.map((option, idx) => {
                 const originalIndex = options.findIndex(o => o === option);
                 const draggableId = `checkbox-opt-${question.id}-${originalIndex}`;

                 return (
                  <Draggable
                    key={draggableId}
                    draggableId={draggableId}
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
                            style={{ fontSize: "1.5rem", cursor: "grab" }}
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
                            className="form-control form-control-sm"
                            value={option}
                            onChange={(e) => updateOption(originalIndex, e.target.value)}
                            placeholder={`Option ${idx + 1}`}
                          />
                        </div>
                        <div className="col-auto">
                          <button
                            className="btn btn-sm btn-outline-secondary w-auto"
                            onClick={() => removeOption(originalIndex)}
                            disabled={normalOptions.length <= 1}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                )
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      
      {hasOtherOption && (
        <div className="row g-2 mb-2 align-items-center">
            <div className="col-auto">
                <i className="bi bi-grip-vertical" style={{ fontSize: "1.5rem", color: 'transparent' }}></i>
            </div>
            <div className="col-auto">
              <input className="form-check-input" type="checkbox" disabled />
            </div>
            <div className="col">
              <input type="text" readOnly className="form-control-plaintext form-control-sm" value="Other" />
            </div>
            <div className="col-auto">
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => removeOption(options.indexOf("Other"))}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
        </div>
      )}

      <div className="d-flex align-items-center mt-2">
        <button
          className="btn btn-sm btn-outline-secondary w-auto"
          onClick={addOption}
        >
          {getLabel("Add Option")}
        </button>
        {!hasOtherOption && (
          <div className="ms-3">
            or{' '}
            <span
              onClick={handleAddOtherOption}
              role="button"
              tabIndex="0"
              onKeyPress={(e) => { if (e.key === 'Enter') handleAddOtherOption(); }}
              style={{ color: '#0d6efd', cursor: 'pointer' }}
            >
              Add "Other"
            </span>
          </div>
        )}
      </div>

      {/* Action buttons and Settings switches are fine */}
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