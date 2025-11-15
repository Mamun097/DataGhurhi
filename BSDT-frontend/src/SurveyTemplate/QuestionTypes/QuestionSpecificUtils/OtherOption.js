// The following function adds otherAsOption = true in the question data (not in meta)
export const handleOtherOption = (newState, id, setQuestions) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === id ? { ...q, otherAsOption: newState } : q
      )
    );
};