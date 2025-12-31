import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { Modal, Button, Form } from "react-bootstrap";
import { QRCodeCanvas } from "qrcode.react";
import "../CSS/SurveyForm.css";
import SurveyForm from "../Components/SurveyFormUser";
import apiClient from "../../api";
import CustomLoader from "../Utils/CustomLoader";
import SurveyNotOpen from "../Utils/SurveyNotOpen";

// --- IMPORTS FOR PRINT VIEW RENDERING ---
import Checkbox from "../QuestionTypes/CheckboxUser";
import DateTime from "../QuestionTypes/DateTimeUser";
import Dropdown from "../QuestionTypes/DropdownUser";
import LikertScale from "../QuestionTypes/LikertScaleUser";
import LinearScaleQuestion from "../QuestionTypes/LinearScaleUser";
import RadioQuestion from "../QuestionTypes/RadioUser";
import RatingQuestion from "../QuestionTypes/RatingUser";
import Text from "../QuestionTypes/TextUser";
import TickBoxGrid from "../QuestionTypes/TickBoxGridUser";

const isSurveyOpen = (template, setSurveyOpenMessage) => {
  if (!template) return false;
  if (!template.template.is_quiz) return true;

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
    return false;
  }
  if (endTime && now > endTime) {
    setSurveyOpenMessage(`This survey ended on ${endTime.toLocaleString()}.`);
    return false;
  }

  return true;
};

const renderPreviewQuestion = (question, index) => {
  const staticProps = {
    question,
    index,
    userResponse: [],
    setUserResponse: () => {},
  };

  switch (question.type) {
    case "checkbox":
      return <Checkbox {...staticProps} />;
    case "datetime":
      return <DateTime {...staticProps} />;
    case "dropdown":
      return <Dropdown {...staticProps} />;
    case "likert":
      return <LikertScale {...staticProps} />;
    case "linearScale":
      return <LinearScaleQuestion {...staticProps} />;
    case "radio":
      return <RadioQuestion {...staticProps} />;
    case "rating":
      return <RatingQuestion {...staticProps} />;
    case "text":
      return <Text {...staticProps} />;
    case "tickboxGrid":
      return <TickBoxGrid {...staticProps} />;
    default:
      return null;
  }
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
      if (isPreview) return [];
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

  // --- PRINT SETTINGS STATE ---
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printIncludeQR, setPrintIncludeQR] = useState(false);
  const [printIncludeURL, setPrintIncludeURL] = useState(false);

  // --- FIX: Force the correct public URL format ---
  const publicSurveyLink = `https://dataghurhi.cse.buet.ac.bd/v/${slug}`;

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
          const config = token
            ? { headers: { Authorization: `Bearer ${token}` } }
            : {};
          const response = await apiClient.get(
            `/api/fetch-survey-user/${slug}`,
            config
          );
          const surveyData = response.data.data;
          setTemplate(surveyData);

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
            navigate("/");
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

    if (template.template.is_quiz) {
      userResponse.push({
        questionText: "Obtained Marks",
        userResponse: calculatedMarks,
      });
    }

    try {
      const token = localStorage.getItem("token");
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : { headers: {} };

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

      localStorage.setItem(
        "surveySuccessState",
        JSON.stringify({
          template,
          userResponse,
          calculatedMarks,
          totalMarks,
        })
      );

      navigate("/survey-success");
    } catch (error) {
      console.error("Error submitting survey:", error);
      alert("Error submitting survey.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => window.history.back();

  const handlePrintClick = () => {
    setShowPrintModal(true);
  };

  const handleConfirmPrint = () => {
    setShowPrintModal(false);
    setTimeout(() => {
      window.print();
    }, 500);
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
      {/* ================================================================
        PRINT OPTIONS MODAL
        ================================================================
      */}
      <Modal
        show={showPrintModal}
        onHide={() => setShowPrintModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Print Options</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                id="check-qr"
                label="Include QR Code"
                checked={printIncludeQR}
                onChange={(e) => setPrintIncludeQR(e.target.checked)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                id="check-url"
                label="Include Survey Link (URL)"
                checked={printIncludeURL}
                onChange={(e) => setPrintIncludeURL(e.target.checked)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPrintModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirmPrint}>
            Print Now
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ================================================================
        1. ON-SCREEN VIEW 
        ================================================================
      */}
      <div className="d-print-none">
        <div className="container-fluid bg-green">
          <div className="row justify-content-center">
            {isPreview && (
              <div className="col-12 col-md-8 border my-5 p-3">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "#72b366ff",
                    color: "#212529",
                    textAlign: "center",
                    padding: "8px",
                    fontWeight: "bold",
                  }}
                >
                  Preview Mode - Responses will not be recorded.
                </div>
                <div>
                  <button
                    onClick={handleGoBack}
                    style={{
                      padding: "8px 20px",
                      marginTop: "10px",
                      borderRadius: "5px",
                      backgroundColor: "#fff",
                      border: "2px solid #25856fff",
                    }}
                  >
                    Go Back
                  </button>
                  <button
                    onClick={handlePrintClick}
                    style={{
                      padding: "8px 20px",
                      marginTop: "10px",
                      marginLeft: "10px",
                      borderRadius: "5px",
                      color: "#fff",
                      backgroundColor: "#25856fff",
                      border: "2px solid #25856fff",
                    }}
                  >
                    Print All Questions
                  </button>
                </div>
              </div>
            )}

            {isSurveyCurrentlyOpen ? (
              !submitted ? (
                <div className="col-12 col-md-8 border my-5">
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
      </div>

      {/* ================================================================
        2. PRINTABLE VIEW 
        ================================================================
      */}
      <div className="d-none d-print-block print-container">
        {/* --- HEADER (Logo + Title) --- */}
        <div className="d-flex justify-content-between align-items-start mb-4">
          <div>
            {logo && (
              <img
                src={logo}
                alt="Logo"
                style={{
                  maxHeight: "80px",
                  marginBottom: "10px",
                  display: "block",
                }}
              />
            )}
            <h1>{title || "Untitled Survey"}</h1>
          </div>

          {/* --- QR / URL SECTION --- */}
          <div className="text-end">
            {printIncludeQR && (
              <div className="mb-2">
                {/* QR Code now uses publicSurveyLink */}
                <QRCodeCanvas value={publicSurveyLink} size={100} />
              </div>
            )}
            {printIncludeURL && (
              <div
                style={{
                  fontSize: "10px",
                  color: "#555",
                  maxWidth: "200px",
                  wordBreak: "break-all",
                }}
              >
                {/* Text now uses publicSurveyLink */}
                {publicSurveyLink}
              </div>
            )}
          </div>
        </div>

        <hr />

        {(sections || []).map((section) => (
          <div key={`print-sec-${section.id}`} className="mt-4">
            <h2
              style={{
                fontSize: "1.4em",
                color: "#333",
                borderBottom: "1px solid #ccc",
                paddingBottom: "5px",
                marginTop: "20px",
              }}
            >
              {section.title || `Section ${section.id}`}
            </h2>

            {(questions || [])
              .filter((q) => q.section === section.id)
              .map((question, index) => (
                <div
                  key={`print-q-${question.id}`}
                  className="print-question-wrapper"
                  style={{
                    pageBreakInside: "avoid",
                    marginBottom: "15px",
                    padding: "10px",
                    border: "1px solid #dee2e6",
                    borderRadius: "4px",
                  }}
                >
                  {renderPreviewQuestion(question, index + 1)}
                </div>
              ))}
          </div>
        ))}
      </div>

      {/* ================================================================
         CSS & PRINT STYLES
         ================================================================
      */}
      <style>
        {`
          @media print {
            body { 
              -webkit-print-color-adjust: exact; 
              print-color-adjust: exact;
            }
            
            /* Alignment fix for checkboxes during print */
            .print-container .form-check {
              display: flex !important;
              align-items: center !important;
              justify-content: flex-start !important;
              text-align: left !important;
              padding-left: 0 !important; 
            }
            
            .print-container .form-check-input {
              float: none !important;
              margin-right: 10px !important;
              margin-left: 0 !important;
            }

            .print-container .form-check-label {
              text-align: left !important;
              width: auto !important;
            }
            
            .print-question-wrapper div {
               text-align: left !important;
               justify-content: flex-start !important;
            }
          }
        `}
      </style>
    </>
  );
};

export default Index;
