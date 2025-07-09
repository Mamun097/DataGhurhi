import React, { useState, useCallback, useMemo } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Option from "./QuestionSpecificUtils/OptionClass";
import ImageCropper from "./QuestionSpecificUtils/ImageCropper";
import TagManager from "./QuestionSpecificUtils/Tag";
import translateText from "./QuestionSpecificUtils/Translation";

const Radio = ({
  question,
  questions,
  setQuestions,
  language,
  getLabel,
}) => {
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
  
  const [normalOptions, otherOption] = useMemo(() => {
    const others = options.filter((opt) => opt.text === "Other");
    const normal = options.filter((opt) => opt.text !== "Other");
    return [normal, others.length > 0 ? others[0] : null];
  }, [options]);

  const hasOtherOption = useMemo(() => !!otherOption, [otherOption]);

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

  const handleQuestionChange = useCallback(
    (newText) => {
      setQuestions((prev) =>
        prev.map((q) => (q.id === question.id ? { ...q, text: newText } : q))
      );
    },
    [question.id, setQuestions]
  );
  
  const handleTranslation = useCallback(async () => {
    try {
      if (question.text && question.text.trim()) {
        const questionResponse = await translateText(question.text);
        const translatedQuestion = questionResponse?.data?.data?.translations?.[0]?.translatedText;
        if (translatedQuestion) {
          handleQuestionChange(translatedQuestion);
        }
      }

      const optionsToTranslate = normalOptions.map(opt => opt.text);
      if (optionsToTranslate.length === 0) return;

      const translationResponse = await translateText(optionsToTranslate, "bn");
      const translatedTexts = translationResponse?.data?.data?.translations.map(t => t.translatedText);
      if (!translatedTexts || translatedTexts.length !== optionsToTranslate.length) {
        throw new Error("Mismatch in returned translations for options");
      }
      
      const newNormalOptions = normalOptions.map((option, index) => {
        return new Option(translatedTexts[index], option.value);
      });
      
      const finalOptions = otherOption 
        ? [...newNormalOptions, otherOption] 
        : newNormalOptions;

      updateQuestionMeta({ options: finalOptions });

    } catch (error) {
      console.error("Error in handleTranslation:", error);
    }
  }, [question.text, normalOptions, otherOption, handleQuestionChange, updateQuestionMeta]);

  const updateOption = useCallback(
    (idx, newText) => {
      const newOptions = [...options];
      newOptions[idx] = { ...newOptions[idx], text: newText };
      updateQuestionMeta({ options: newOptions });
    },
    [options, updateQuestionMeta]
  );

  const updateOptionValue = useCallback(
    (idx, newValue) => {
      const newOptions = [...options];
      newOptions[idx] = { ...newOptions[idx], value: parseFloat(newValue) || 0 };
      updateQuestionMeta({ options: newOptions });
    },
    [options, updateQuestionMeta]
  );

  const removeOption = useCallback(
    (idx) => {
        const newOptions = options.filter((_, i) => i !== idx);
        updateQuestionMeta({ options: newOptions });
    },
    [options, updateQuestionMeta]
  );
  
  const addOption = useCallback(() => {
    const newOption = new Option(`Option ${normalOptions.length + 1}`, 0);
    const newOptions = [...normalOptions, newOption];
    if (otherOption) {
      newOptions.push(otherOption);
    }
    updateQuestionMeta({ options: newOptions });
  }, [normalOptions, otherOption, updateQuestionMeta]);


  const handleAddOtherOption = useCallback(() => {
    if (!hasOtherOption) {
        const newOptions = [...options, new Option('Other', 0)];
        updateQuestionMeta({ options: newOptions });
    }
  }, [options, hasOtherOption, updateQuestionMeta]);


  const handleDragEnd = useCallback(
    (result) => {
      if (!result.destination) return;
      
      const reorderedNormalOpts = Array.from(normalOptions);
      const [movedItem] = reorderedNormalOpts.splice(result.source.index, 1);
      reorderedNormalOpts.splice(result.destination.index, 0, movedItem);
      
      const finalOptions = otherOption 
        ? [...reorderedNormalOpts, otherOption]
        : reorderedNormalOpts;

      updateQuestionMeta({ options: finalOptions });
    },
    [normalOptions, otherOption, updateQuestionMeta]
  );

  const handleCopy = useCallback(() => {
    const index = questions.findIndex((q) => q.id === question.id);
    const copiedQuestion = {
      ...question,
      id: -1,
      meta: {
        ...question.meta,
        options: (question.meta?.options || []).map(
          (opt) => new Option(opt.text, opt.value ?? 0)
        ),
      },
    };
    
    const updatedQuestions = [...questions];
    updatedQuestions.splice(index + 1, 0, copiedQuestion);
    
    const finalQuestions = updatedQuestions.map((q, i) => ({ ...q, id: i + 1 }));
    setQuestions(finalQuestions);
  }, [question, questions, setQuestions]);


  const handleEnableMarksToggle = useCallback(() => {
    const newValue = !enableMarks;
    setEnableMarks(newValue);
    const updatedOptions = !newValue
        ? options.map((opt) => ({ ...opt, value: 0 }))
        : options;
    updateQuestionMeta({ enableMarks: newValue, options: updatedOptions });
  }, [enableMarks, options, updateQuestionMeta]);
  
  const handleRequired = useCallback(() => {
    const newRequiredState = !required;
    setRequired(newRequiredState);
     setQuestions((prev) =>
      prev.map((q) =>
        q.id === question.id ? { ...q, required: newRequiredState } : q
      )
    );
  }, [question.id, setQuestions, required]);
  
  const handleEnableOptionShuffleToggle = useCallback(() => {
    const newValue = !enableOptionShuffle;
    setEnableOptionShuffle(newValue);
    updateQuestionMeta({ enableOptionShuffle: newValue });
  }, [enableOptionShuffle, updateQuestionMeta]);
  
   const handleDelete = useCallback(() => {
    setQuestions((prev) => {
      const filtered = prev.filter((q) => q.id !== question.id);
      return filtered.map((q, i) => ({ ...q, id: i + 1 }));
    });
  }, [question.id, setQuestions]);
  
   const handleQuestionImageUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setShowCropper(true);
    if (event.target) {
      event.target.value = null;
    }
  }, []);
  
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
  
  return (
    <div className="mb-3 p-3 border rounded shadow-sm bg-white">
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
              {normalOptions.map((option, idx) => {
                 const originalIndex = options.findIndex(o => o === option);
                 const draggableId = `draggable-option-${question.id}-${originalIndex}`;
                 
                 return (
                  <Draggable
                    key={draggableId}
                    draggableId={draggableId}
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
                            onChange={(e) => updateOption(originalIndex, e.target.value)}
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
                              onChange={(e) => updateOptionValue(originalIndex, e.target.value)}
                              placeholder="Pts"
                            />
                          </div>
                        )}
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
                );
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
              <input className="form-check-input" type="radio" disabled />
            </div>
            <div className="col">
              <input type="text" readOnly className="form-control-plaintext form-control-sm" value="Other" />
            </div>
            <div className="col-auto">
                {enableMarks && <div style={{ minWidth: "75px", maxWidth: "100px" }}></div>}
            </div>
            <div className="col-auto">
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => removeOption(options.findIndex(o => o.text === "Other"))}
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

       <div className="d-flex flex-wrap align-items-center mt-3 gap-2">
        <button
          className="btn btn-outline-secondary w-auto"
          onClick={handleCopy}
          title={getLabel("Copy Question")}
        >
          <i className="bi bi-clipboard"></i>
        </button>
        <button
          className="btn btn-outline-secondary w-auto"
          onClick={handleDelete}
          title={getLabel("Delete Question")}
        >
          <i className="bi bi-trash"></i>
        </button>
        <label className="btn btn-outline-secondary w-auto" title={getLabel("Add Image")}>
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
          title={getLabel("Translate Question")}
        >
          <i className="bi bi-translate"></i>
        </button>
      </div>

      <div className="mt-3 border-top pt-3">
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