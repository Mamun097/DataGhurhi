import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../CSS/SurveyForm.css";
import SurveyForm from "../Components/SurveyFormUser";
import NavbarAcholder from "../../ProfileManagement/navbarAccountholder";
import { handleMarking } from "../Utils/handleMarking";
import apiClient from "../../api";
import CustomLoader from "../Utils/CustomLoader";

const Index = () => {
  const navigate = useNavigate();
  const { slug } = useParams();

  const [pageState, setPageState] = useState({
    status: "loading",
    message: "",
  });

  const [language, setLanguage] = useState(
    localStorage.getItem("language") || "English"
  );
  const [template, setTemplate] = useState(undefined);
  const [title, setTitle] = useState(null);
  const [sections, setSections] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [shuffle, setShuffle] = useState(false);
  const [logo, setLogo] = useState(null);
  const [logoAlignment, setLogoAlignment] = useState("left");
  const [logoText, setLogoText] = useState("");
  const [userResponse, setUserResponse] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (slug) {
        try {
          const token = localStorage.getItem("token");
          const config = {};
          if (token) {
            config.headers = { Authorization: `Bearer ${token}` };
          }
          const response = await apiClient.get(
            `/api/fetch-survey-user/${slug}`,
            config
          );

          const surveyData = response.data.data;
          setTemplate(surveyData);
          setTitle(surveyData.title);
          setSections(surveyData.template.sections);
          setQuestions(surveyData.template.questions);
          setLogo(surveyData.template.logo);
          setLogoAlignment(surveyData.template.logoAlignment || "left");
          setLogoText(surveyData.template.logoText || "");
          setBackgroundImage(surveyData.template.backgroundImage);
          setShuffle(surveyData.shuffle_questions);

          setPageState({ status: "open", message: "" });
        } catch (err) {
          console.error("Failed to load survey:", err);
          if (err.response) {
            const { status, message } = err.response.data;
            if (status === "SURVEY_CLOSED") {
              setPageState({ status: "closed", message: message });
            }
            else if (status === "LOGIN_REQUIRED") {
              alert(message);
              navigate("/");
            }
            else {
              setPageState({
                status: "error",
                message: message || "This survey could not be loaded.",
              });
            }
          } else {
            setPageState({
              status: "error",
              message: "Could not connect to the server.",
            });
          }
        }
      }
    };
    load();
  }, [slug, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const calculatedMarks = handleMarking(userResponse, questions);
    try {
      const token = localStorage.getItem("token");
      const config = { headers: {} };
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      await apiClient.post(
        `/api/submit-survey/${slug}`,
        {
          userResponse: userResponse,
          calculatedMarks: calculatedMarks,
        },
        config
      );
      navigate("/survey-success");
    } catch (error) {
      console.error("Error submitting survey:", error);
      alert("There was an error submitting your survey. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (pageState.status === "loading") {
    return <CustomLoader />;
  }

  if (pageState.status === "closed" || pageState.status === "error") {
    return (
      <>
        <NavbarAcholder language={language} setLanguage={setLanguage} />
        <div className="container text-center" style={{ marginTop: "100px" }}>
          <div className="alert alert-warning" role="alert">
            <h4 className="alert-heading">
              {pageState.status === "closed" ? "Survey Closed" : "Error"}
            </h4>
            <p>{pageState.message}</p>
          </div>
          <a href="/dashboard" className="btn btn-primary mt-3">
            Return to Dashboard
          </a>
        </div>
      </>
    );
  }

  return (
    <>
      <NavbarAcholder language={language} setLanguage={setLanguage} />
      <div className="container-fluid bg-white">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8">
            <SurveyForm
              title={title}
              sections={sections}
              questions={questions}
              setQuestions={setQuestions}
              logo={logo}
              logoAlignment={logoAlignment}
              logoText={logoText}
              image={backgroundImage}
              userResponse={userResponse}
              setUserResponse={setUserResponse}
              template={template}
              shuffle={shuffle}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Index;
