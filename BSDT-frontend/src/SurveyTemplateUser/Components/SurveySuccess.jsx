import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import NavbarAcholder from "../../ProfileManagement/navbarAccountholder";

const SurveySuccess = () => {
  const [language, setLanguage] = useState(
    localStorage.getItem("language") || "English"
  );

  // Values are in localStorage to survive page reloads
  const savedData = (() => {
    try {
      return JSON.parse(localStorage.getItem("surveySuccessState"));
    } catch (e) {
      return null;
    }
  })();

  const isQuiz = savedData?.template?.template?.is_quiz || false;
  const releaseMarks =
    savedData?.template?.template?.quiz_settings?.release_marks ||
    "immediately";
  const calculatedMarksState = useState(savedData?.calculatedMarks || null);
  const totalMarksState = useState(savedData?.totalMarks || 0);

  // Disable browser back button to prevent resubmission
  useEffect(() => {
    window.history.pushState(null, document.title, window.location.href);
    window.addEventListener("popstate", handleBackButton);

    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };
  }, []);

  const handleBackButton = (event) => {
    window.alert("You cannot go back to the previous page.");
    return false;
  };

  // Function to handle "See Your Responses" button click
  const handleResponseShow = () => {
    window.open("/user-response-view", "_blank");

    // navigate("/user-response-view", { state: { template: templateState, calculatedMarks: calculatedMarksState, totalMarks: totalMarksState }});
  };

  return (
    <>
      {/* <NavbarAcholder language={language} setLanguage={setLanguage} /> */}
      <div className="container-fluid bg-green min-vh-100 py-4">
        <div className="row">
          <div className="col-2"></div>

          <div className="col-8">
            <div
              className="d-flex justify-content-center align-items-center"
              style={{ minHeight: "70vh" }}
            >
              <div className="text-center">
                <div className="mb-4">
                  <i
                    className="bi bi-check-circle-fill text-success"
                    style={{ fontSize: "4rem" }}
                  ></i>
                </div>
                {/* Different messages based on whether it's a quiz or survey */}
                {isQuiz ? (
                  <>
                    <h2 className="text-success mb-3">
                      Quiz Submitted Successfully!
                    </h2>
                    {releaseMarks === "immediately" ? (
                      <p className="text-muted mb-4">
                        Thank you for completing the quiz. Your obtained score
                        is <strong>{calculatedMarksState}</strong> out of{" "}
                        <strong>{totalMarksState}</strong>.
                      </p>
                    ) : (
                      <p className="text-muted mb-4">
                        Thank you for completing the quiz. Your responses have
                        been recorded and your score will be released later.
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <h2 className="text-success mb-3">
                      Survey Response Submitted Successfully!
                    </h2>
                    <p className="text-muted mb-4">
                      Thank you for taking the time to complete our survey. Your
                      response has been recorded.
                    </p>
                  </>
                )}

                {/* Action buttons - should be aligned */}
                <div className="d-flex justify-content-center gap-2">
                  {isQuiz && (
                    <button
                      className="btn btn-primary"
                      onClick={handleResponseShow}
                    >
                      See Your Responses
                    </button>
                  )}
                  <button
                    className="btn btn-primary"
                    onClick={() => (window.location.href = "/")}
                  >
                    Go Back to Home
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="col-2" />
        </div>
      </div>
    </>
  );
};

export default SurveySuccess;
