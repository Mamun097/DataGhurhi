import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

import Radio from "../QuestionTypes/Radio";
import Text from "../QuestionTypes/Text";
import Likert from "../QuestionTypes/LikertScale";
import RatingQuestion from "../QuestionTypes/Rating";
import DateTimeQuestion from "../QuestionTypes/DateTime";
import DropdownQuestion from "../QuestionTypes/Dropdown";
import LinearScaleQuestion from "../QuestionTypes/LinearScale";
import Checkbox from "../QuestionTypes/Checkbox";
import TickBoxGrid from "../QuestionTypes/TickBoxGrid";
import "../CSS/SurveyQuestions.css";
import AddQuestion from "../Components/AddNewQuestion";

const SurveyQuestions = ({
  section,
  questions,
  setQuestions,
  newQuestion,
  setNewQuestion,
  addNewQuestion,
  addGeneratedQuestion,
  addImportedQuestion,
  language,
  setLanguage,
  getLabel,
}) => {
  // Insert Question related state management here
  const [insertQuestionIndex, setInsertQuestionIndex] = useState(null);
  // Function to handle click on the "Insert Question" button
  const handleInsertQuestionClick = (index) => {
    if (insertQuestionIndex === index) {
      setInsertQuestionIndex(null);
    } else {
      setInsertQuestionIndex(index);
    }
  };

  const sectionQuestions = questions.filter((q) => q.section === section.id);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const reordered = Array.from(sectionQuestions);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);

    const updatedSectionQuestions = reordered.map((q, idx) => ({
      ...q,
      id: idx + 1,
    }));

    const newQuestions = questions
      .filter((q) => q.section !== section.id)
      .concat(updatedSectionQuestions);

    newQuestions.sort((a, b) => {
      if (a.section === b.section) {
        return a.id - b.id;
      }
      return a.section - b.section;
    });

    setQuestions(newQuestions);
  };

  const renderQuestionComponent = (question) => {
    switch (question.type) {
      case "radio":
        return (
          <Radio
            question={question}
            questions={questions}
            setQuestions={setQuestions}
            language={language}
            setLanguage={setLanguage}
            getLabel={getLabel}
          />
        );
      case "text":
        return (
          <Text
            question={question}
            questions={questions}
            setQuestions={setQuestions}
            language={language}
            setLanguage={setLanguage}
            getLabel={getLabel}
          />
        );
      case "likert":
        return (
          <Likert
            question={question}
            questions={questions}
            setQuestions={setQuestions}
            language={language}
            setLanguage={setLanguage}
            getLabel={getLabel}
          />
        );
      case "rating":
        return (
          <RatingQuestion
            question={question}
            questions={questions}
            setQuestions={setQuestions}
            language={language}
            setLanguage={setLanguage}
            getLabel={getLabel}
          />
        );
      case "linearScale":
        return (
          <LinearScaleQuestion
            question={question}
            questions={questions}
            setQuestions={setQuestions}
            language={language}
            setLanguage={setLanguage}
            getLabel={getLabel}
          />
        );
      case "datetime":
        return (
          <DateTimeQuestion
            question={question}
            questions={questions}
            setQuestions={setQuestions}
            language={language}
            setLanguage={setLanguage}
            getLabel={getLabel}
          />
        );
      case "dropdown":
        return (
          <DropdownQuestion
            question={question}
            questions={questions}
            setQuestions={setQuestions}
            language={language}
            setLanguage={setLanguage}
            getLabel={getLabel}
          />
        );
      case "tickboxGrid":
        return (
          <TickBoxGrid
            question={question}
            questions={questions}
            setQuestions={setQuestions}
            language={language}
            setLanguage={setLanguage}
            getLabel={getLabel}
          />
        );
      case "checkbox":
        return (
          <Checkbox
            question={question}
            questions={questions}
            setQuestions={setQuestions}
            language={language}
            setLanguage={setLanguage}
            getLabel={getLabel}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="mb-3">
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId={`section-${section.id}`}>
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="survey-questions-droppable-area"
            >
              {sectionQuestions.map((question, index) => {
                return (
                  <div className="mb-3" key={question.id}>
                    <Draggable
                      key={question.id}
                      draggableId={question.id.toString()}
                      index={index}
                    >
                      {(providedDraggable, snapshot) => (
                        <div
                          ref={providedDraggable.innerRef}
                          {...providedDraggable.draggableProps}
                          style={providedDraggable.draggableProps.style}
                          className="survey-question-draggable-item"
                        >
                          <div
                            className={`survey-question-inner-container ${
                              snapshot.isDragging ? "is-dragging" : ""
                            }`}
                          >
                            <div
                              {...providedDraggable.dragHandleProps}
                              className="survey-question-drag-handle"
                              aria-label="Drag question"
                            >
                              <i className="bi bi-grip-vertical survey-question-drag-icon"></i>
                            </div>
                            <div className="survey-question-content-wrapper">
                              {renderQuestionComponent(question)}
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                    <button
                      className="btn btn-outline-secondary btn-sm me-1"
                      onClick={() => handleInsertQuestionClick(index)}
                      title={
                        insertQuestionIndex === index
                          ? getLabel("Close")
                          : getLabel("Insert Question")
                      }
                    >
                      <i
                        className={
                          insertQuestionIndex === index
                            ? "bi bi-x"
                            : "bi bi-plus"
                        }
                      ></i>{" "}
                      {insertQuestionIndex === index
                        ? getLabel("Close")
                        : getLabel("Insert Question")}
                    </button>
                    {insertQuestionIndex === index && (
                      <AddQuestion
                        newQuestion={newQuestion}
                        setNewQuestion={setNewQuestion}
                        addNewQuestion={addNewQuestion}
                        addGeneratedQuestion={addGeneratedQuestion}
                        addImportedQuestion={addImportedQuestion}
                        questionInfo={{
                          id: questions.length + 1,
                          index: questions.findIndex(q => q.id === question.id) + 1,
                          section: section.id,
                        }}
                        language={language}
                        setLanguage={setLanguage}
                        getLabel={getLabel}
                      />
                    )}
                  </div>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default SurveyQuestions;
