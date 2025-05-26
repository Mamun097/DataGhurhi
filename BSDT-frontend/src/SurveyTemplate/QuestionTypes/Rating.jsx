import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import TagManager from "./QuestionSpecificUtils/Tag";
import ImageCropper from "./QuestionSpecificUtils/ImageCropper";


const RatingQuestion = ({ question, questions, setQuestions }) => {
  const [image, setImage] = useState(question.image || null);
  const [showCropper, setShowCropper] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleRequired = (id) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) =>
        q.id === id ? { ...q, required: !q.required } : q
      )
    );
  };

  const handleQuestionChange = (newText) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === question.id ? { ...q, text: newText } : q))
    );
  };

  const handleScaleChange = (newScale) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === question.id
          ? { ...q, meta: { ...q.meta, scale: newScale } }
          : q
      )
    );
  };

  // Handle image upload trigger
  const handleQuestionImageUpload = (event, id) => {
    const file = event.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setShowCropper(true);
  };

  // Remove image
  const removeImage = (index) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === question.id
          ? { ...q, imageUrls: q.imageUrls.filter((_, i) => i !== index) }
          : q
      )
    );
  };

  // Update image alignment
  const updateAlignment = (index, alignment) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === question.id
          ? {
              ...q,
              imageUrls: q.imageUrls.map((img, i) =>
                i === index ? { ...img, alignment } : img
              ),
            }
          : q
      )
    );
  };

  const handleDelete = () => {
    setQuestions((prevQuestions) => {
      const filtered = prevQuestions.filter((q) => q.id !== question.id);
      return filtered.map((q, index) => ({ ...q, id: index + 1 }));
    });
  };

  const handleCopy = () => {
    const index = questions.findIndex((q) => q.id === question.id);
    const newId = question.id + 1;
    const copiedQuestion = {
      ...question,
      id: newId,
      text: question.text,
      image: image,
      meta: { ...question.meta },
    };

    const updatedQuestions = questions.map((q) =>
      q.id > question.id ? { ...q, id: q.id + 1 } : q
    );

    updatedQuestions.splice(index + 1, 0, copiedQuestion);
    updatedQuestions.sort((a, b) => a.id - b.id);
    setQuestions(updatedQuestions);
  };

  return (
    <div className="mb-3">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <label className="ms-2 mb-2" style={{ fontSize: "1.2em" }}>
          <em>
            <strong>Rating</strong>
          </em>
        </label>

        {/* Use the TagManager component */}
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
      
      {/* Image Previews with Remove and Alignment Options */}
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
                  onChange={(e) => updateAlignment(idx, e.target.value)}
                >
                  <option value="start">Left</option>
                  <option value="center">Center</option>
                  <option value="end">Right</option>
                </select>
                <button
                  className="btn btn-sm btn-outline-danger hover:bg-red-700 transition-colors me-1"
                  onClick={() => removeImage(idx)}
                >
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="d-flex align-items-center mt-2 mb-2">
        <input
          type="text"
          className="form-control"
          placeholder="Question"
          value={question.text}
          onChange={(e) => handleQuestionChange(e.target.value)}
        />
      </div>

      <div>
        <select
          className="form-select form-select-sm w-auto"
          onChange={(e) => handleScaleChange(Number(e.target.value))}
          value={question.meta?.scale || 5}
        >
          {[3, 5, 7, 10].map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>
      </div>

      <div className="d-flex justify-content-center">
        {[...Array(question.meta?.scale || 5)].map((_, i) => (
          <div key={i} className="text-center mx-2">
            <i className="bi bi-star" style={{ fontSize: "24px" }}></i>
            <div>{i + 1}</div>
          </div>
        ))}
      </div>

      <div className="d-flex align-items-center mt-3">
        <button className="btn btn-outline-secondary me-2" onClick={handleCopy}>
          <i className="bi bi-clipboard"></i>
        </button>
        <button className="btn btn-outline-secondary me-2" onClick={handleDelete}>
          <i className="bi bi-trash"></i>
        </button>
        <label className="btn btn-outline-secondary hover:bg-gray-100 transition-colors">
          <i className="bi bi-image"></i>
          <input
            type="file"
            hidden
            onChange={(e) => handleQuestionImageUpload(e, question.id)}
          />
        </label>
        <div className="form-check form-switch ms-auto">
          <input
            className="form-check-input"
            type="checkbox"
            checked={question.required}
            onChange={() => handleRequired(question.id)}
          />
          <label className="form-check-label">Required</label>
        </div>
      </div>
    </div>
  );
};

export default RatingQuestion;
