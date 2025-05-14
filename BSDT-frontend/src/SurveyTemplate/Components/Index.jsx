import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../CSS/SurveyForm.css";
import EmployeeSatisfactionSurvey from "../Templates/EmployeeSatisfactionSurvey";
import PostEventFeedbackSurvey from "../Templates/PostEventFeedbackSurvey";
import CustomerSatisfactionSurvey from "../Templates/CustomerSatisfactionSurvey";
import EmployeeSatisfactionSurvey2 from "../Templates/EmployeeSatisfactionSurvey2";
import NavbarSurvey from "./navbarSurvey";

const Index = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(
    "Employee Satisfaction Survey"
  );

  return (
    <div>
      {/* <NavbarSurvey /> */}
    <div className="container-fluid mt-5">
      <div className="row">
        <div className="col-2 me-5">
          <div className="container mt-5 align-items-center">
            <h2 className="mb-4">Survey Templates</h2>
            <div className="mt-3 d-flex flex-column align-items-center gap-3">
              {/* Employee Satisfaction Survey Card */}
              <div>
                <div
                  className="card text-center shadow-sm"
                  onClick={() =>
                    setSelectedTemplate("Employee Satisfaction Survey")
                  }
                  style={{ cursor: "pointer" }}
                >
                  <div className="card-body">
                    <h5 className="card-title">Employee Satisfaction Survey</h5>
                  </div>
                </div>
              </div>

              {/* Post-Event Feedback Survey Card */}
              <div>
                <div
                  className="card text-center shadow-sm"
                  onClick={() =>
                    setSelectedTemplate("Post-Event Feedback Survey")
                  }
                  style={{ cursor: "pointer" }}
                >
                  <div className="card-body">
                    <h5 className="card-title">Post-Event Feedback Survey</h5>
                  </div>
                </div>
              </div>

              {/* Customer Satisfaction Survey Card */}
              <div>
                <div
                  className="card text-center shadow-sm"
                  onClick={() =>
                    setSelectedTemplate("Customer Satisfaction Survey")
                  }
                  style={{ cursor: "pointer" }}
                >
                  <div className="card-body">
                    <h5 className="card-title">Customer Satisfaction Survey</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-7 mt-5 align-items-center">
          {selectedTemplate === "Employee Satisfaction Survey" && (
            <EmployeeSatisfactionSurvey2 />
          )}
          {selectedTemplate === "Post-Event Feedback Survey" && (
            <PostEventFeedbackSurvey />
          )}
          {selectedTemplate === "Customer Satisfaction Survey" && (
            <CustomerSatisfactionSurvey />
          )}
        </div>
      </div>
    </div>
    </div>
  );
};

export default Index;
