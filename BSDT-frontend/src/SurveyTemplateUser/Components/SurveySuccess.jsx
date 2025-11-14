import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useLocation, useNavigate } from "react-router-dom";
import NavbarAcholder from "../../ProfileManagement/navbarAccountholder";

const SurveySuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { template, userResponse, calculatedMarks } = location.state || {};

  const isQuiz = template?.template?.is_quiz || false;
  const releaseMarks =
    template?.template?.quiz_settings?.releaseMarks || "immediately";
  const [language, setLanguage] = useState(
    localStorage.getItem("language") || "English"
  );

  // Function to handle "See Your Responses" button click
  // Redirects to a page showing user's responses
  const handleResponseShow = () => {
    navigate("/user-response-view", { state: { template, userResponse, calculatedMarks } });
  };

  return (
    <>
      {/* <NavbarAcholder language={language} setLanguage={setLanguage} /> */}
      <div className="container-fluid bg-white">
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
                        Thank you for completing the quiz. Your score is{" "}
                        <strong>{calculatedMarks}</strong>.
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
                <button
                  className="btn btn-primary mx-2"
                  onClick={handleResponseShow}
                >
                  See Your Responses
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => (window.location.href = "/")}
                >
                  Go Back to Home
                </button>
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
