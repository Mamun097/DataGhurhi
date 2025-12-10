// This function handles marking for radio questions only
export const handleMarking = (userResponse, questions) => {
  let marks = 0;
  userResponse.forEach((response) => {
    const question = questions.find((q) => q.text === response.questionText);
    if (question && question.type === "radio") {
      if (question.meta?.advanceMarkingEnabled) {
        const optionIndex = question.meta?.options?.indexOf(
          response.userResponse
        );
        if (optionIndex !== -1) {
          const optionMarks =
            parseFloat(question.meta?.optionSpecificMarks?.[optionIndex]) || 0;
          marks += optionMarks;
        }
      } else {
        const correctAnswer = question.meta?.correctAnswer;
        if (response.userResponse === correctAnswer) {
          marks += question.points || 0;
        }
      }
    }
  });

  return marks;
};
