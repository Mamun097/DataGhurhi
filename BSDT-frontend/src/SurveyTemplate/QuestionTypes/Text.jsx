import React, { useState, useEffect, useCallback, useRef } from "react";
import TagManager from "./QuestionSpecificUtils/Tag";
import ImageCropper from "./QuestionSpecificUtils/ImageCropper";
import translateText from "./QuestionSpecificUtils/Translation";
import "./CSS/Text.css";

const Text = ({
  index,
  question,
  questions,
  setQuestions,
  language,
  setLanguage,
  getLabel,
}) => {
  const [showCropper, setShowCropper] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [required, setRequired] = useState(question.required || false);
  const [inputValidation, setInputValidation] = useState(
    question.meta?.validationType ? true : false
  );
  const [validationType, setValidationType] = useState(
    question.meta?.validationType || "Number"
  );
  const [condition, setCondition] = useState(
    question.meta?.condition || "Greater Than"
  );
  const [errorText, setErrorText] = useState(question.meta?.errorText || "");
  const [validationText, setValidationText] = useState(
    question.meta?.validationText || ""
  );
  const [min, setMin] = useState(
    question.meta?.validationText?.split(",")[0] || ""
  );
  const [max, setMax] = useState(
    question.meta?.validationText?.split(",")[1] || ""
  );

  const [responseType, setResponseType] = useState(
    question.meta?.responseType || "short"
  );

  const conditions = React.useMemo(
    () => ({
      [getLabel("Number")]: [
        getLabel("Greater Than"),
        getLabel("Greater Than or Equal To"),
        getLabel("Less Than"),
        getLabel("Less Than or Equal To"),
        getLabel("Equal To"),
        getLabel("Not Equal To"),
        getLabel("Between"),
        getLabel("Not Between"),
        getLabel("Is Number"),
        getLabel("Is Not Number"),
      ],
      [getLabel("Text")]: [
        getLabel("Contains"),
        getLabel("Does Not Contain"),
        getLabel("Email"),
        getLabel("URL"),
      ],
      [getLabel("Length")]: [
        getLabel("Maximum character Count"),
        getLabel("Minimum character Count"),
      ],
      [getLabel("Regex")]: [
        getLabel("Contains"),
        getLabel("Doesn't Contain"),
        getLabel("Matches"),
        getLabel("Doesn't Match"),
      ],
    }),
    []
  );

  const updateQuestionMeta = useCallback(
    (metaUpdate) => {
      setQuestions((prevQuestions) =>
        prevQuestions.map((q) =>
          q.id === question.id
            ? { ...q, meta: { ...q.meta, ...metaUpdate } }
            : q
        )
      );
    },
    [question.id, setQuestions]
  );

  const handleSettings = useCallback(() => {
    const newValidationState = !inputValidation;
    setInputValidation(newValidationState);
    if (newValidationState) {
      updateQuestionMeta({
        validationType: validationType,
        condition: condition,
        errorText: errorText,
        validationText: validationText,
      });
    } else {
      updateQuestionMeta({
        validationType: null,
        condition: null,
        errorText: "",
        validationText: "",
      });
    }
  }, [
    inputValidation,
    validationType,
    condition,
    errorText,
    validationText,
    updateQuestionMeta,
  ]);

  const handleQuestionImageUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setShowCropper(true);
    if (event.target) event.target.value = null;
  }, []);

  const removeImage = useCallback(
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

  const updateAlignment = useCallback(
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

  const handleRequired = useCallback(() => {
    const newRequiredState = !required;
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) =>
        q.id === question.id ? { ...q, required: newRequiredState } : q
      )
    );
    setRequired(newRequiredState);
  }, [required, question.id, setQuestions]);

  const handleQuestionChange = useCallback(
    (newText) => {
      setQuestions((prevQuestions) =>
        prevQuestions.map((q) =>
          q.id === question.id ? { ...q, text: newText } : q
        )
      );
    },
    [question.id, setQuestions]
  );

  const handleDelete = useCallback(() => {
    setQuestions((prevQuestions) => {
      const filtered = prevQuestions.filter((q) => q.id !== question.id);
      return filtered.map((q, index) => ({ ...q, id: index + 1 }));
    });
  }, [question.id, setQuestions]);

  const handleCopy = useCallback(() => {
    const index = questions.findIndex((q) => q.id === question.id);
    const copiedQuestion = {
      ...question,
      id: questions.length + 1,
      meta: {
        ...question.meta,
        responseType: responseType,
        validationType: inputValidation ? validationType : null,
        condition: inputValidation ? condition : null,
        validationText: inputValidation ? validationText : "",
        errorText: inputValidation ? errorText : "",
      },
    };

    let updatedQuestions = [...questions];
    updatedQuestions.splice(index + 1, 0, copiedQuestion);
    updatedQuestions = updatedQuestions.map((q, i) => ({ ...q, id: i + 1 }));

    setQuestions(updatedQuestions);
  }, [
    questions,
    question,
    responseType,
    inputValidation,
    validationType,
    condition,
    validationText,
    errorText,
    setQuestions,
  ]);

  const handleValidationTypeChange = useCallback(
    (event) => {
      const selectedType = event.target.value;
      const newCondition =
        conditions[selectedType]?.[0] ||
        conditions[Object.keys(conditions)[0]][0];
      setValidationType(selectedType);
      setCondition(newCondition);
      updateQuestionMeta({
        validationType: selectedType,
        condition: newCondition,
      });
    },
    [conditions, updateQuestionMeta]
  );

  const handleConditionChange = useCallback(
    (event) => {
      const selectedCondition = event.target.value;
      setCondition(selectedCondition);
      updateQuestionMeta({ condition: selectedCondition });
    },
    [updateQuestionMeta]
  );

  const handleValidationTextChange = useCallback(
    (event) => {
      const newValidationText = event.target.value;
      setValidationText(newValidationText);
      updateQuestionMeta({ validationText: newValidationText });
    },
    [updateQuestionMeta]
  );

  const handleMinMaxChange = useCallback(
    (minValue, maxValue) => {
      setMin(minValue);
      setMax(maxValue);
      const newValidationText = `${minValue},${maxValue}`;
      setValidationText(newValidationText);
      updateQuestionMeta({ validationText: newValidationText });
    },
    [updateQuestionMeta]
  );

  const handleErrorTextChange = useCallback(
    (event) => {
      const newErrorText = event.target.value;
      setErrorText(newErrorText);
      updateQuestionMeta({ errorText: newErrorText });
    },
    [updateQuestionMeta]
  );

  const handleResponseTypeToggle = useCallback(() => {
    const newResponseType = responseType === "short" ? "long" : "short";
    setResponseType(newResponseType);
    updateQuestionMeta({ responseType: newResponseType });
  }, [responseType, updateQuestionMeta]);

  useEffect(() => {
    setRequired(question.required || false);
    setInputValidation(question.meta?.validationType ? true : false);
    const initialValidationType = question.meta?.validationType || "Number";
    setValidationType(initialValidationType);
    setCondition(
      question.meta?.condition ||
        conditions[initialValidationType]?.[0] ||
        conditions[Object.keys(conditions)[0]][0]
    );
    setErrorText(question.meta?.errorText || "");
    setValidationText(question.meta?.validationText || "");
    if (
      question.meta?.validationText &&
      (question.meta?.condition === "Between" ||
        question.meta?.condition === "Not Between")
    ) {
      const parts = question.meta.validationText.split(",");
      setMin(parts[0] || "");
      setMax(parts[1] || "");
    } else {
      setMin("");
      setMax("");
    }
    setResponseType(question.meta?.responseType || "short");
  }, [question, conditions]);

  const handleTranslation = useCallback(async () => {
    const response = await translateText(question.text);
    handleQuestionChange(response.data.data.translations[0].translatedText);
  }, [handleQuestionChange, question.text]);

  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);

  // Close on outside click and position menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(e.target)
      ) {
        setShowMenu(false);
      }
    };

    const handleMenuPosition = () => {
      if (showMenu && menuButtonRef.current && menuRef.current) {
        const buttonRect = menuButtonRef.current.getBoundingClientRect();
        const menu = menuRef.current.querySelector(".custom-menu");
        if (menu) {
          const isMobile = window.innerWidth <= 768;

          if (isMobile) {
            const menuTop = buttonRect.bottom + 8;
            const menuRight = window.innerWidth - buttonRect.right;
            menu.style.position = "fixed";
            menu.style.top = `${menuTop}px`;
            menu.style.right = `${menuRight}px`;
            menu.style.left = "auto";
            menu.style.bottom = "auto";
            menu.style.zIndex = "10000";

            requestAnimationFrame(() => {
              const menuRect = menu.getBoundingClientRect();
              if (menuRect.bottom > window.innerHeight) {
                menu.style.top = `${Math.max(
                  8,
                  buttonRect.top - menuRect.height - 8
                )}px`;
              }
              if (menuRect.left < 16) {
                menu.style.left = "16px";
                menu.style.right = "auto";
              }
            });
          } else {
            menu.style.position = "absolute";
            menu.style.top = "calc(100% + 8px)";
            menu.style.right = "0";
            menu.style.left = "auto";
            menu.style.bottom = "auto";
            menu.style.zIndex = "1000";
          }
        }
      }
    };

    const handleOutside = (e) => {
      handleClickOutside(e);
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside, { passive: true });

    let scrollTimeout = null;
    const throttledMenuPosition = () => {
      if (scrollTimeout) return;
      scrollTimeout = setTimeout(() => {
        handleMenuPosition();
        scrollTimeout = null;
      }, 16);
    };

    if (showMenu) {
      handleMenuPosition();
      window.addEventListener("resize", handleMenuPosition, { passive: true });
      window.addEventListener("scroll", throttledMenuPosition, {
        passive: true,
      });
    }

    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
      window.removeEventListener("resize", handleMenuPosition);
      window.removeEventListener("scroll", throttledMenuPosition);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [showMenu]);

  return (
    <div className="mb-3">
      {/* <div className="d-flex flex-column flex-sm-row justify-content-sm-between align-items-start align-items-sm-center mb-2">
        <label className="ms-2 mb-2 mb-sm-0" style={{ fontSize: "1.2rem" }}>
          <em>
            Question No: {index}
            <hr />
            Type: <strong>{getLabel("Text")}</strong>
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

      <div className="d-flex align-items-center mt-2 mb-2">
        <input
          type="text"
          className="form-control"
          value={question.text}
          onChange={(e) => handleQuestionChange(e.target.value)}
          placeholder={getLabel("Enter your question here")}
          onFocus={(e) => e.target.select()}
        />
      </div> */}
      <div className="mb-2">
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
              <div
                key={idx}
                className="mb-3 bg-gray-50 p-3 rounded-lg shadow-sm"
              >
                <div
                  className={`d-flex justify-content-${
                    img.alignment || "start"
                  }`}
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
                    onChange={(e) => updateAlignment(idx, e.target.value)}
                  >
                    <option value="start">{getLabel("Left")}</option>
                    <option value="center">{getLabel("Center")}</option>
                    <option value="end">{getLabel("Right")}</option>
                  </select>
                  <button
                    className="btn btn-sm btn-outline-danger hover:bg-red-700 transition-colors"
                    onClick={() => removeImage(idx)}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {responseType === "short" ? (
        <input
          type="text"
          className="survey-form-control mb-2"
          placeholder={getLabel("Short answer text")}
          readOnly
        />
      ) : (
        <textarea
          className="survey-form-control mb-2"
          rows="3"
          placeholder={getLabel("Long answer text (paragraph)")}
          readOnly
        ></textarea>
      )}

      {inputValidation && (
        <div className="border-top pt-3 mt-3">
          <h6 className="mb-2" style={{ fontSize: "14px" }}>
            {getLabel("Response Validation")}
          </h6>
          <div className="d-flex flex-column flex-sm-row align-items-stretch mt-2">
            <select
              className="form-select mb-2 mb-sm-0 me-sm-2 "
              style={{ fontSize: "14px" }}
              onChange={handleValidationTypeChange}
              value={validationType}
            >
              {Object.keys(conditions).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <select
              className="form-select"
              style={{ fontSize: "14px" }}
              onChange={handleConditionChange}
              value={condition}
            >
              {conditions[validationType]?.map((cond) => (
                <option key={cond} value={cond}>
                  {cond}
                </option>
              ))}
            </select>
          </div>
          {condition === "Between" || condition === "Not Between" ? (
            <div className="d-flex flex-column flex-sm-row align-items-sm-center mt-2">
              <input
                type="text"
                className="survey-form-control mb-2 mb-sm-0 me-sm-2"
                placeholder="Value 1"
                value={min}
                onChange={(e) => handleMinMaxChange(e.target.value, max)}
              />
              <span className="mx-0 mx-sm-1 mb-2 mb-sm-0">&</span>
              <input
                type="text"
                className="survey-form-control"
                placeholder="Value 2"
                value={max}
                onChange={(e) => handleMinMaxChange(min, e.target.value)}
              />
            </div>
          ) : (
            ((condition !== "Is Number" &&
              condition !== "Is Not Number" &&
              validationType !== "Text") ||
              (validationType === "Text" &&
                (condition === "Contains" ||
                  condition === "Does Not Contain"))) && (
              <div className="d-flex align-items-center mt-2">
                <input
                  type={
                    validationType === "Number" &&
                    condition !== "Is Number" &&
                    condition !== "Is Not Number"
                      ? "number"
                      : "text"
                  }
                  className="survey-form-control"
                  placeholder="Value"
                  value={validationText}
                  onChange={handleValidationTextChange}
                />
              </div>
            )
          )}
          <div>
            <input
              type="text"
              className="survey-form-control mt-2"
              placeholder={getLabel("Custom Error Message (Optional)")}
              value={errorText}
              onChange={handleErrorTextChange}
            />
          </div>
        </div>
      )}

      {/* <div className="d-flex flex-wrap align-items-center gy-5">
        <button
          className="btn btn-outline-secondary w-auto me-2 mt-3"
          onClick={handleCopy}
          title="Copy Question"
        >
          <i className="bi bi-clipboard"></i>
        </button>
        <button
          className="btn btn-outline-secondary w-auto me-2 mt-3"
          onClick={handleDelete}
          title="Delete Question"
        >
          <i className="bi bi-trash"></i>
        </button>
        <label
          className="btn btn-outline-secondary w-auto me-2 mt-3"
          title="Add Image"
        >
          <i className="bi bi-image"></i>
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={handleQuestionImageUpload}
          />
        </label>
        <button
          className="btn btn-outline-secondary w-auto me-2 mt-3"
          onClick={handleTranslation}
          title="Translate Question"
        >
          <i className="bi bi-translate"></i>
        </button>
        <button
          className="btn btn-outline-secondary w-auto me-2 mt-3"
          onClick={handleSettings}
          title="Response Validation Settings"
        >
          <i
            className={`bi ${
              inputValidation ? "bi-gear-fill text-primary" : "bi-gear"
            }`}
          ></i>
        </button>

        <div className="d-flex w-100 w-sm-auto ms-0 ms-sm-auto mt-2 mt-sm-0">
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id={`responseTypeSwitch-${question.id}`}
              onChange={handleResponseTypeToggle}
              checked={responseType === "long"}
            />
            <label
              className="form-check-label"
              htmlFor={`responseTypeSwitch-${question.id}`}
            >
              {getLabel("Long Answer")}
            </label>
          </div>
          <div className="form-check form-switch ms-3">
            <input
              className="form-check-input"
              type="checkbox"
              id={`requiredSwitch-${question.id}`}
              onChange={handleRequired}
              checked={required}
            />
            <label
              className="form-check-label"
              htmlFor={`requiredSwitch-${question.id}`}
            >
              {getLabel("Required")}
            </label>
          </div>
        </div>
      </div> */}
      <div
        className="question-actions d-flex align-items-center justify-content-end gap-2"
        style={{ width: "100%", maxWidth: "100%", boxSizing: "border-box" }}
      >
        {/* Copy and Delete - side by side on mobile */}
        <div className="question-actions-copy-delete-wrapper">
          <button
            className="survey-icon-btn"
            onClick={handleCopy}
            title="Copy Question"
          >
            <i className="bi bi-copy"></i>
          </button>

          <button
            className="survey-icon-btn"
            onClick={handleDelete}
            title="Delete Question"
          >
            <i className="bi bi-trash"></i>
          </button>
        </div>

        {/* Required */}
        <div className="form-check form-switch mb-0 required-switch-container">
          <label
            className="form-check-label small"
            htmlFor={`requiredSwitch-${question.id}`}
          >
            {getLabel("Required")}
          </label>
          <input
            className="form-check-input"
            type="checkbox"
            id={`requiredSwitch-${question.id}`}
            checked={required}
            onChange={handleRequired}
          />
        </div>

        {/* Three Dots Menu */}
        <div className="menu-container" ref={menuRef}>
          <button
            ref={menuButtonRef}
            className="icon-btn"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowMenu((prev) => !prev);
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowMenu((prev) => !prev);
            }}
            title="More Options"
            type="button"
          >
            <i className="bi bi-three-dots-vertical"></i>
          </button>

          {showMenu && (
            <>
              <div
                className="menu-backdrop"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowMenu(false);
                }}
                onTouchStart={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowMenu(false);
                }}
              ></div>
              <div className="custom-menu">
                {/* Shuffle Options */}
                <div className="menu-item">
                  <div className="menu-label">
                    <i className="bi bi-gear"></i>
                    {getLabel("Response Validation Settings")}
                  </div>
                  <label className="switch-small">
                    <input type="checkbox" onClick={handleSettings} />
                    <span className="slider-small"></span>
                  </label>
                </div>

                {/* long answer */}
                <div className="menu-item">
                  <div className="menu-label">
                    <i className="bi bi-card-text"></i>
                    {getLabel("Long Answer")}
                  </div>
                  <label className="switch-small">
                    <input
                      type="checkbox"
                      id={`responseTypeSwitch-${question.id}`}
                      onChange={handleResponseTypeToggle}
                      checked={responseType === "long"}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Text;
