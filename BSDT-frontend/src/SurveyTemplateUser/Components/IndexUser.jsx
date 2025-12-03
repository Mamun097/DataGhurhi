import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom"; // Combined useParams here
import "bootstrap/dist/css/bootstrap.min.css";
import "../CSS/SurveyForm.css";
import SurveyForm from "../Components/SurveyFormUser";
import NavbarAcholder from "../../ProfileManagement/navbarAccountholder";
import { handleMarking } from "../Utils/handleMarking";
import apiClient from "../../api";
import CustomLoader from "../Utils/CustomLoader";
import SurveyNotOpen from "../Utils/SurveyNotOpen";

// helper to check if survey is open
const isSurveyOpen = (template, setSurveyOpenMessage, setQuizTimeLeft) => {
  if (!template) return false;
  if (!template.template.is_quiz) return true; // Not a quiz, so always open

  const now = new Date();
  const { quiz_settings } = template.template;
  const startTime = quiz_settings.start_time
    ? new Date(quiz_settings.start_time)
    : null;
  const endTime = quiz_settings.end_time
    ? new Date(quiz_settings.end_time)
    : null;

  if (startTime && now < startTime) {
    setSurveyOpenMessage(
      `This survey will open on ${startTime.toLocaleString()}.`
    );
    return false; // Not started yet
  }
  if (endTime && now > endTime) {
    setSurveyOpenMessage(`This survey ended on ${endTime.toLocaleString()}.`);
    return false; // Already ended
  }

  return true; // Survey is open
};

const Index = () => {
  const navigate = useNavigate();
  let isPreview = false;
  let { slug } = useParams();
  if (!slug) {
    const location = useLocation();
    slug = location.state?.slug;
    isPreview = true;
  }
  
  const STORAGE_KEY = `survey_response_${slug}`;
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
  const [userResponse, setUserResponse] = useState(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      return savedData ? JSON.parse(savedData) : [];
    } catch (e) {
      return [];
    }
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalMarks, setTotalMarks] = useState(0);

  // Survey Open/Close related states
  const [isSurveyCurrentlyOpen, setIsSurveyCurrentlyOpen] = useState(null);
  const [surveyOpenMessage, setSurveyOpenMessage] = useState("");

  // Whenever userResponse changes (user answers a question), save to storage
  useEffect(() => {
    if (userResponse && userResponse.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userResponse));
    }
  }, [userResponse, STORAGE_KEY]);

  useEffect(() => {
    const load = async () => {
      if (slug) {
        try {
          const token = localStorage.getItem("token");
          const config = {};
          if (token) {
            config.headers = {
              Authorization: `Bearer ${token}`,
            };
          }
          const response = await apiClient.get(
            `/api/fetch-survey-user/${slug}`,
            config
          );

          const surveyData = response.data.data;
          setTemplate(surveyData);

          // Check if survey is open
          if (surveyData) {
            const isOpen = isSurveyOpen(surveyData, setSurveyOpenMessage);
            setIsSurveyCurrentlyOpen(isOpen);
          }

          setTitle(surveyData.title);
          setSections(surveyData.template.sections);
          setQuestions(surveyData.template.questions);
          setLogo(surveyData.template.logo);
          setLogoAlignment(surveyData.template.logoAlignment || "left");
          setLogoText(surveyData.template.logoText || "");
          setBackgroundImage(surveyData.template.backgroundImage);
          setShuffle(surveyData.shuffle_questions);
          setTotalMarks(surveyData.template?.quiz_settings?.total_marks || 0);
        } catch (err) {
          console.error("Failed to load template:", err);
          if (err.response) {
            if (err.response.data?.status === "LOGIN_REQUIRED") {
              alert(err.response.data.message);
              navigate("/"); // Redirect to login or home
            } else {
              alert(
                err.response.data.message || "This survey could not be loaded."
              );
              navigate("/");
            }
          } else {
            alert("Could not connect to the server. Please try again later.");
          }
        }
      }
    };

    load();
  }, [slug, navigate]);

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (isPreview) return;

    setIsSubmitting(true);
    const calculatedMarks = handleMarking(userResponse, questions);

    // If it is a quiz, userResponse will include obtained marks in submission
    if (template.template.is_quiz) {
      userResponse.push({
        questionText: "Obtained Marks",
        userResponse: calculatedMarks,
      });
    }

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
          metadata: {
            is_quiz: template.is_quiz || false,
            obtained_marks: calculatedMarks,
          },
        },
        config
      );

      try {
        const payload = {
          template: template,
          userResponse: userResponse,
          calculatedMarks: calculatedMarks,
          totalMarks: totalMarks,
        };
        localStorage.setItem("surveySuccessState", JSON.stringify(payload));
      } catch (err) {
        console.error("Failed to save user response view state:", err);
      }

      navigate("/survey-success");
    } catch (error) {
      console.error("Error submitting survey:", error);
      alert("There was an error submitting your survey. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (
    template === undefined ||
    template === null ||
    isSurveyCurrentlyOpen === null
  ) {
    return <CustomLoader />;
  }

  return (
    <>
      {/* <NavbarAcholder language={language} setLanguage={setLanguage} /> */}
      <div className="container-fluid bg-green">
        <div className="row justify-content-center">
          {isSurveyCurrentlyOpen ? (
            !submitted ? (
              <div className="col-12 col-md-8 border">
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
                  isPreview={isPreview}
                />
              </div>
            ) : (
              <div className="col-12 col-md-8" />
            )
          ) : (
            <SurveyNotOpen
              surveyOpenMessage={surveyOpenMessage}
              template={template}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default Index;
