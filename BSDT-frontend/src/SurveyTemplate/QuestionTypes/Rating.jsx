import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const RatingQuestion = ({ question, questions, setQuestions }) => {
  const [image, setImage] = useState(question.image || null);

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

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setQuestions((prevQuestions) =>
          prevQuestions.map((q) =>
            q.id === question.id ? { ...q, image: e.target.result } : q
          )
        );
        setImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
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
      <label className="ms-2 mb-2" style={{ fontSize: "1.2em" }}>
        <em>
          <strong>Rating</strong>
        </em>
      </label>

      {question.image && (
        <img
          src={question.image}
          alt="Uploaded"
          className="img-fluid mb-2"
          style={{ maxHeight: "400px" }}
        />
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
          {[5, 10].map((num) => (
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
        <label className="btn btn-outline-secondary me-2">
          <i className="bi bi-image"></i>
          <input type="file" hidden onChange={handleImageUpload} />
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
