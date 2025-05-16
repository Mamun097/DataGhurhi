import React from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

// Import your question type components:
import Radio from "../QuestionTypes/Radio";
import Text from "../QuestionTypes/Text";
import Likert from "../QuestionTypes/LikertScale";
import RatingQuestion from "../QuestionTypes/Rating";
import DateTimeQuestion from "../QuestionTypes/DateTime";
import DropdownQuestion from "../QuestionTypes/Dropdown";
import LinearScaleQuestion from "../QuestionTypes/LinearScale";
import Checkbox from "../QuestionTypes/Checkbox";
import TickBoxGrid from "../QuestionTypes/TickBoxGrid";

const SurveyQuestions = ({ section, questions, setQuestions }) => {
  // Filter only the questions for the current section.
  const sectionQuestions = questions.filter((q) => q.section === section.id);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    // Create a copy of the section's questions and reorder them.
    const reordered = Array.from(sectionQuestions);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);

    // Update each question's id based solely on the new index (starting at 1).
    const updatedSectionQuestions = reordered.map((q, idx) => ({
      ...q,
      id: idx + 1,
    }));

    // Merge the updated questions back with those from other sections.
    const newQuestions = questions
      .filter((q) => q.section !== section.id)
      .concat(updatedSectionQuestions);

    // Optionally sort newQuestions by section and then by id.
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
          />
        );
      case "text":
        return (
          <Text
            question={question}
            questions={questions}
            setQuestions={setQuestions}
          />
        );
      case "likert":
        return (
          <Likert
            question={question}
            questions={questions}
            setQuestions={setQuestions}
          />
        );
      case "rating":
        return (
          <RatingQuestion
            question={question}
            questions={questions}
            setQuestions={setQuestions}
          />
        );
      case "linearScale":
        return (
          <LinearScaleQuestion
            question={question}
            questions={questions}
            setQuestions={setQuestions}
          />
        );
      case "datetime":
        return (
          <DateTimeQuestion
            question={question}
            questions={questions}
            setQuestions={setQuestions}
          />
        );
      case "dropdown":
        return (
          <DropdownQuestion
            question={question}
            questions={questions}
            setQuestions={setQuestions}
          />
        );
      case "tickboxGrid":
        return (
          <TickBoxGrid
            question={question}
            questions={questions}
            setQuestions={setQuestions}
          />
        );
      case "checkbox":
        return (
          <Checkbox
            question={question}
            questions={questions}
            setQuestions={setQuestions}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="mb-3 ">
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId={`section-${section.id}`}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="mt-2"
          >
            {sectionQuestions.map((question, index) => (
              <Draggable
                key={question.id}
                draggableId={question.id.toString()}
                index={index}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{
                      userSelect: "none",
                      padding: 8,
                      margin: "0 0 8px 0",
                      background: snapshot.isDragging ? "#e0e0e0" : "#ffffff",
                      border: "1px solid #ccc",
                      ...provided.draggableProps.style,
                    }}
                  >
                    {renderQuestionComponent(question)}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
    </div>
  );
};

export default SurveyQuestions;
