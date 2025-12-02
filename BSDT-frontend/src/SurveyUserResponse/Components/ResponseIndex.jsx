import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../CSS/SurveyForm.css";
import ResponseSurveyForm from "./ResponseSurveyForm";
import NavbarAcholder from "../../ProfileManagement/navbarAccountholder";

const ResponseIndex = () => {
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

  const template = savedData?.template || null;
  const userResponse = savedData?.userResponse || null;
  const calculatedMarks = savedData?.calculatedMarks || null;
  const totalMarks = savedData?.totalMarks || 0;

  return (
    <>
      {/* <NavbarAcholder language={language} setLanguage={setLanguage} /> */}
      <div className="container-fluid bg-green min-vh-100 py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 border">
            <ResponseSurveyForm
              template={template}
              userResponse={userResponse}
              calculatedMarks={calculatedMarks}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ResponseIndex;
