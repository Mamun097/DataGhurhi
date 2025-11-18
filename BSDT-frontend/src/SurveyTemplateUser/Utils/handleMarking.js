// This function handles marking for radio questions only
export const handleMarking = (userResponse, questions) => {
    let marks = 0;
    userResponse.forEach((response) => {
        const question = questions.find(q => q.text === response.questionText);
        if (question && question.type === "radio") {
            const correctAnswer = question.meta?.correctAnswer;
            if (response.userResponse === correctAnswer) {
                marks += question.points || 0;
            }
        }
    });
    return marks;
};
