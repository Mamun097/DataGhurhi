import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const DateTimeQuestion = ({ question, questions, setQuestions }) => {
  const [required, setRequired] = React.useState(false);

  // Function to toggle the required status of a question
  const handleRequired = () => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === question.id ? { ...q, required: !q.required } : q
      )
    );
    setRequired(!required);
  };

  // Function to update the question text
  const handleQuestionChange = (newText) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === question.id ? { ...q, text: newText } : q))
    );
  };

  // Function to change the input type (date/time)
  const handleTypeChange = (newType) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === question.id ? { ...q, dateType: newType } : q))
    );
  };

  // Function to delete a question
  const handleDelete = () => {
    setQuestions((prev) => {
      // Remove the question with the current id
      const updatedQuestions = prev.filter((q) => q.id !== question.id);
  
      // Adjust ids of subsequent questions to fill in the gap created by the deletion
      const correctedQuestions = updatedQuestions.map((q, index) => ({
        ...q,
        id: index + 1, // Reassign ids starting from 1
      }));
  
      return correctedQuestions;
    });
  };

  // Function to upload an image for the question
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
      };
      reader.readAsDataURL(file);
    }
  };

  // Updated copy functionality: Insert copied question right below the original
  const handleCopy = () => {
    const index = questions.findIndex((q) => q.id === question.id);
    const newId = question.id + 1;
  
    const copiedQuestion = {
      ...question,
      id: newId,
      text: question.text,
      meta: { ...question.meta },
      image: question.image,
    };
  
    // Increment IDs of all questions after or equal to newId
    const updatedQuestions = questions.map((q) =>
      q.id >= newId ? { ...q, id: q.id + 1 } : q
    );
  
    // Insert the copied question after the original one
    updatedQuestions.splice(index + 1, 0, copiedQuestion);
  
    // Sort to maintain sequential order
    updatedQuestions.sort((a, b) => a.id - b.id);
  
    setQuestions(updatedQuestions);
  };

  return (
    <div className="mb-4 p-3 border rounded">
      <label className="ms-2 mb-2">
        <em>
          <strong>Date/Time</strong>
        </em>
      </label>
      <div className="mb-2">
        {/* Image Preview */}
        {question.image && (
          <img
            src={question.image}
            alt="Uploaded"
            className="img-fluid mb-2"
            style={{ maxHeight: "400px" }}
          />
        )}
      </div>
      {/* Question Text & Type Selector */}
      <div className="d-flex align-items-center mb-2">
        <input
          type="text"
          className="form-control me-2"
          placeholder="Question"
          value={question.text}
          onChange={(e) => handleQuestionChange(e.target.value)}
        />
      </div>
      {/* Date/Time Input */}
      <div className="d-flex align-items-center ms-1 mb-2">
        <input
          type={question.dateType === "time" ? "time" : "date"}
          className="form-control-md me-2"
        />
        <select
          className="form-select-sm ms-2"
          onChange={(e) => handleTypeChange(e.target.value)}
          value={question.dateType || "date"}
        >
          <option value="date">Date</option>
          <option value="time">Time</option>
        </select>
      </div>
      {/* Action Buttons */}
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
          <input type="file" hidden onChange={handleImageUpload} />
        </label>

        <div className="form-check form-switch ms-auto">
          <input
            className="form-check-input"
            type="checkbox"
            onChange={() => handleRequired(question.id)}
            checked={required}
          />
          <label className="form-check-label">Required</label>
        </div>
      </div>
    </div>
  );
};

export default DateTimeQuestion;
