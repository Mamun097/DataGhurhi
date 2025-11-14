import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../CSS/SurveyForm.css";
import ResponseSurveyForm from "./ResponseSurveyForm";
import NavbarAcholder from "../../ProfileManagement/navbarAccountholder";

const ResponseIndex = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { template, userResponse, calculatedMarks } = location.state || {};

  const [language, setLanguage] = useState(
    localStorage.getItem("language") || "English"
  );

  return (
    <>
      {/* <NavbarAcholder language={language} setLanguage={setLanguage} /> */}
      <div className="container-fluid bg-white">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8">
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
