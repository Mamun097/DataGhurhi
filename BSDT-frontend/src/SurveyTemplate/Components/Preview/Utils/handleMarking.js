// This function handles marking for radio questions only
export const handleMarking = (userResponse, questions) => {
  let marks = 0;
  userResponse.forEach((response) => {
    const question = questions.find((q) => q.text === response.questionText);
    if (
      question &&
      question.type === "radio" &&
      !question.meta.advancedMarkingEnabled
    ) {
      const correctAnswer = question.meta?.options?.find(
        (option) =>
          option.value !== undefined &&
          option.value !== null &&
          option.value !== 0
      );
      if (correctAnswer && response.userResponse === correctAnswer.text) {
        marks += correctAnswer.value;
      }
    } else if (
      question &&
      question.type === "radio" &&
      question.meta.advancedMarkingEnabled
    ) {
      const selectedOption = question.meta?.options?.find(
        (option) => option.text === response.userResponse
      );
      // There is optionSpecificMarks array which contains marks for each option
      if (selectedOption) {
        const index = question.meta.options.indexOf(selectedOption);
        if (
          question.meta.optionSpecificMarks &&
          question.meta.optionSpecificMarks[index] !== undefined
        ) {
          marks += question.meta.optionSpecificMarks[index];
        }
      }
    }
  });
  return marks;
};
