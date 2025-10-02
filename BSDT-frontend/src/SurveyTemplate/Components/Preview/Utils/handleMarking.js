// This function handles marking for radio questions only
export const handleMarking = (userResponse, questions) => {
    let marks = 0;
    userResponse.forEach((response) => {
        const question = questions.find(q => q.text === response.questionText);
        if (question && question.type === "radio") {
            const correctAnswer = question.meta?.options?.find(option => option.value !== undefined && option.value !== null && option.value !== 0);
            if (correctAnswer && response.userResponse === correctAnswer.text) {
                marks += correctAnswer.value;
            }
        }
    });
    return marks;
};
