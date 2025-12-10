import { useEffect, useMemo, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const ResponseRadio = ({ index, question, userResponse, template }) => {
  const userAnswer = userResponse.find(
    (response) => response.questionText === question.text
  )?.userResponse;

  const [choseCorrectOption, setChoseCorrectOption] = useState(false);

  const [otherOption, setOtherOption] = useState("");
  const [otherSelected, setOtherSelected] = useState(false);

  const options = question.meta.options || [];
  const assignedPoints = template.template.is_quiz ? question.points : null;
  const [obtainedPoints, setObtainedPoints] = useState(0);
  const correctAnswer = template.template.is_quiz
    ? question.meta.correctAnswer
    : null;
  const see_correct_answers = template.template.is_quiz
    ? template.template.quiz_settings.see_correct_answers
    : false;
  const see_point_values = template.template.is_quiz
    ? template.template.quiz_settings.see_point_values
    : false;
  console.log("Questions: ", question);
  useEffect(() => {
    if (!question.meta?.advanceMarkingEnabled) {
      if (userAnswer === correctAnswer) {
        setObtainedPoints(assignedPoints);
        setChoseCorrectOption(true);
      } else {
        setObtainedPoints(0);
        setChoseCorrectOption(false);
      }
    } else {
      if (userAnswer) {
        const optionIndex = options.findIndex((opt) => opt === userAnswer);
        if (optionIndex !== -1) {
          const optionPoints =
            question.meta.advanceMarkingOptions?.[optionIndex]?.points || 0;
          setObtainedPoints(optionPoints);
          if (optionPoints === assignedPoints) {
            setChoseCorrectOption(true);
          } else {
            setChoseCorrectOption(false);
          }
        } else {
          setObtainedPoints(0);
          setChoseCorrectOption(false);
        }
      }
    }
  }, [userAnswer, correctAnswer, assignedPoints]);

  return (
    <div className="mt-2 ms-2">
      {/* Question Text */}
      <h5 className="mb-2" style={{ fontSize: "1.2rem" }}>
        {index}
        {". "}
        {question.text || "Untitled Question"}
        {question.required && <span className="text-danger ms-1">*</span>}
      </h5>

      {/* Image Preview */}
      {question.imageUrls && question.imageUrls.length > 0 && (
        <div className="mt-4 mb-4">
          {question.imageUrls.map((img, idx) => (
            <div key={idx} className="mb-3 bg-gray-50">
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
            </div>
          ))}
        </div>
      )}

      {/* Radio Options */}
      <div>
        {options.map((option, idx) => (
          <div key={idx} className="form-check mb-3 ps-2 ms-3">
            <input
              type="radio"
              className="form-check-input me-2"
              name={`radio-${question.id}`}
              id={`radio-opt-${question.id}-${idx}`}
              value={option}
              checked={userAnswer === option}
              disabled={question.disabled}
              readOnly
            />
            <label
              className="form-check-label pe-2 mt-2"
              htmlFor={`radio-opt-${question.id}-${idx}`}
            >
              <>
                <span
                  style={{
                    padding: "6px 20px",
                    borderRadius: "6px",
                    display: "inline-block",
                    backgroundColor:
                      see_correct_answers &&
                      choseCorrectOption &&
                      userAnswer === option
                        ? "#d4edda"
                        : see_correct_answers &&
                          !choseCorrectOption &&
                          userAnswer === option
                        ? "#f8d7da"
                        : see_correct_answers &&
                          !choseCorrectOption &&
                          correctAnswer === option
                        ? "#d4edda"
                        : "transparent",
                    boxShadow:
                      see_correct_answers &&
                      choseCorrectOption &&
                      userAnswer === option
                        ? "0 2px 6px rgba(40, 167, 69, 0.2)"
                        : see_correct_answers &&
                          !choseCorrectOption &&
                          userAnswer === option
                        ? "0 2px 6px rgba(220, 53, 69, 0.2)"
                        : see_correct_answers &&
                          !choseCorrectOption &&
                          correctAnswer === option
                        ? "0 2px 6px rgba(40, 167, 69, 0.2)"
                        : "none",
                  }}
                >
                  {option || `Option ${idx + 1}`}
                </span>
                {see_correct_answers &&
                  choseCorrectOption &&
                  userAnswer === option && (
                    <i
                      className="bi bi-check-circle-fill text-success ms-2 me-2"
                      style={{ fontSize: "1rem" }}
                    ></i>
                  )}
                {see_correct_answers &&
                  !choseCorrectOption &&
                  userAnswer === option && (
                    <i
                      className="bi bi-x-circle-fill text-danger ms-2 me-2"
                      style={{ fontSize: "1rem" }}
                    ></i>
                  )}
                {see_correct_answers &&
                  !choseCorrectOption &&
                  correctAnswer === option && (
                    <i
                      className="bi bi-check-circle-fill text-success ms-2 me-2"
                      style={{ fontSize: "1rem" }}
                    ></i>
                  )}
              </>
            </label>
          </div>
        ))}
      </div>
      {question.otherAsOption && (
        <div className="form-check mb-3 ps-2 ms-3 d-flex align-items-center">
          <input
            type="radio"
            value={otherOption}
            checked={userAnswer === otherOption}
            disabled={question.disabled}
            className="form-check-input me-2"
            name={`radio-${question.id}`}
            id={`radio-other-${question.id}`}
          />
          <label
            className="form-check-label pe-2"
            htmlFor={`radio-other-${question.id}`}
          >
            Other
          </label>
          <input
            type="text"
            className="form-control ms-2"
            style={{ maxWidth: "300px" }}
            placeholder="Write your own option"
            value={otherOption}
          />
        </div>
      )}

      {/* {see_correct_answers && correctAnswer && (
        <div className="mt-3">
          <strong>Correct Answer: </strong> {correctAnswer}
        </div>
      )} */}
      {see_point_values && assignedPoints !== null && (
        <div className="mt-1">
          <strong>Obtained marks: </strong> {obtainedPoints} / {assignedPoints}
        </div>
      )}
    </div>
  );
};

export default ResponseRadio;
