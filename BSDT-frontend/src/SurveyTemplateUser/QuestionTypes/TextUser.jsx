import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const TextUser = ({ question, userResponse, setUserResponse }) => {
  const userAnswer = userResponse.find(response => response.questionText === question.text)?.userResponse || '';
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const newValue = e.target.value;
    setUserResponse(prev => {
      const existingIndex = prev.findIndex(response => response.questionText === question.text);
      if (existingIndex !== -1) {
        return prev.map((response, index) => index === existingIndex ? { ...response, userResponse: newValue } : response);
      } else {
        return [...prev, { questionText: question.text, userResponse: newValue }];
      }
    });
  };

  const checkValidation = (value, type, condition, validationText) => {
    if (type === "Number") {
      const num = parseFloat(value);
      if (isNaN(num)) {
        if (condition === "Is Number") return false;
        if (condition === "Is Not Number") return true;
        return false;
      }
      if (condition === "Is Number") return true;
      if (condition === "Is Not Number") return false;
      const valNum = parseFloat(validationText);
      switch (condition) {
        case "Greater Than":
          return num > valNum;
        case "Greater Than or Equal To":
          return num >= valNum;
        case "Less Than":
          return num < valNum;
        case "Less Than or Equal To":
          return num <= valNum;
        case "Equal To":
          return num === valNum;
        case "Not Equal To":
          return num !== valNum;
        case "Between":
          const [min, max] = validationText.split(',').map(parseFloat);
          return num >= min && num <= max;
        case "Not Between":
          const [min2, max2] = validationText.split(',').map(parseFloat);
          return num < min2 || num > max2;
        default:
          return true;
      }
    } else if (type === "Text") {
      switch (condition) {
        case "Contains":
          return value.includes(validationText);
        case "Does Not Contain":
          return !value.includes(validationText);
        case "Email":
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(value);
        case "URL":
          const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;
          return urlRegex.test(value);
        default:
          return true;
      }
    } else if (type === "Length") {
      const length = value.length;
      const valNum = parseInt(validationText, 10);
      switch (condition) {
        case "Maximum character Count":
          return length <= valNum;
        case "Minimum character Count":
          return length >= valNum;
        default:
          return true;
      }
    } else if (type === "RegularExpression") {
      try {
        const regex = new RegExp(validationText);
        switch (condition) {
          case "Contains":
          case "Matches":
            return regex.test(value);
          case "Doesn't Contain":
          case "Doesn't Match":
            return !regex.test(value);
          default:
            return true;
        }
      } catch (e) {
        return false;
      }
    }
    return true;
  };

  const validate = () => {
    if (question.required && !userAnswer.trim()) {
      setError('This field is required.');
      return;
    }
    const { validationType, condition, validationText } = question.meta || {};
    if (validationType) {
      const isValid = checkValidation(userAnswer, validationType, condition, validationText);
      if (!isValid) {
        setError(question.meta.errorText || 'Invalid input');
        return;
      }
    }
    setError('');
  };

  useEffect(() => {
    validate();
  }, [userAnswer, question]);

  return (
    <div className="mt-2 ms-2 me-2">
      <h5 className="mb-2" style={{ fontSize: "1.2rem" }}>
        {question.text || "Untitled Question"}
        {question.required && <span className="text-danger ms-1">*</span>}
      </h5>
      {question.imageUrls && question.imageUrls.length > 0 && (
        <div className="mt-4 mb-4">
          {question.imageUrls.map((img, idx) => (
            <div key={idx} className="mb-3 bg-gray-50">
              <div className={`d-flex justify-content-${img.alignment || "start"}`}>
                <img
                  src={img.url}
                  alt={`Question ${idx}`}
                  className="img-fluid rounded"
                  style={{ maxHeight: 400 }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
      <textarea
        rows="3"
        type="text"
        className="form-control mt-3"
        value={userAnswer}
        onChange={handleChange}
        disabled={question.disabled}
        aria-label="Text input"
      />
      {error && <small className="text-danger">{error}</small>}
    </div>
  );
};

export default TextUser;