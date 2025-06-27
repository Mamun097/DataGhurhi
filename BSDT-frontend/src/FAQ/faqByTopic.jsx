import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import NavbarHome from "../Homepage/NavbarHome";
import NavbarAcholder from "../ProfileManagement/NavbarAccountHolder";
import "./faqByTopic.css";

// MUI Icons
import SchoolIcon from "@mui/icons-material/School";
import BarChartIcon from "@mui/icons-material/BarChart";
// other icons ...

const iconComponents = [
  SchoolIcon,
  BarChartIcon,
  // Add more icons as needed
];

const GOOGLE_API_KEY = "YOUR_GOOGLE_API_KEY"; // Add your Google API Key

const translateText = async (textArray, targetLang) => {
  try {
    const response = await axios.post(
      `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_API_KEY}`,
      {
        q: textArray,
        target: targetLang,
        format: "text",
      }
    );
    return response.data.data.translations.map((t) => t.translatedText);
  } catch (error) {
    console.error("Translation error:", error);
    return textArray;
  }
};

export default function FaqByTopic() {
  const { topic } = useParams();
  const [faqs, setFaqs] = useState([]);
  const [error, setError] = useState("");
  const [language, setLanguage] = useState(localStorage.getItem("language") || "en");
  const [newQuestion, setNewQuestion] = useState({ question: "", answer: "", topic });
  const [isCreating, setIsCreating] = useState(false);
  const isLoggedIn = !!localStorage.getItem("token");

  // Fetch FAQs by topic
  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const response = await axios.get("http://localhost:2000/api/faq");
        const allFaqs = response.data.faqs || [];
        const filteredFaqs = allFaqs.filter((faq) => faq.topic === topic);
        setFaqs(filteredFaqs);
      } catch (err) {
        console.error("Error loading FAQs for topic:", err);
        setError("Failed to load FAQs.");
      }
    };

    fetchFaqs();
  }, [topic]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewQuestion((prevState) => ({ ...prevState, [name]: value }));
  };

  // Handle submitting the new question
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:2000/api/faq", newQuestion);
      if (response.data) {
        setFaqs((prevFaqs) => [...prevFaqs, response.data]);
        setIsCreating(false); // Close form after submission
      }
    } catch (err) {
      console.error("Error creating FAQ:", err);
      setError("Failed to create FAQ.");
    }
  };

  const handleTranslation = useCallback(async () => {
    try {
      const questionResponse = await translateText(newQuestion.question, "bn");
      if (questionResponse?.[0]) {
        setNewQuestion((prev) => ({
          ...prev,
          question: questionResponse[0], // Update the question with translation
        }));
      }

      const translatedAnswer = await translateText(newQuestion.answer, "bn");
      if (translatedAnswer?.[0]) {
        setNewQuestion((prev) => ({
          ...prev,
          answer: translatedAnswer[0], // Update the answer with translation
        }));
      }
    } catch (error) {
      console.error("Error in handleTranslation:", error.message);
    }
  }, [newQuestion]);

  return (
    <div>
      {isLoggedIn ? <NavbarAcholder /> : <NavbarHome />}
      <div className="faq-topic-container">
        <h1 className="faq-topic-heading">{decodeURIComponent(topic)}</h1>
        <Link to="/faq" className="faq-back-link">← Back to topics</Link>

        {error && <p className="faq-error">{error}</p>}

        {/* If no FAQs found, show the "Create Question" button */}
        {faqs.length === 0 && !error ? (
          <div className="faq-empty">
            <p>No FAQs under this topic.</p>
            {isLoggedIn && (
              <button className="create-question-button" onClick={() => setIsCreating(true)}>
                Create a Question
              </button>
            )}
          </div>
        ) : (
          <div className="faq-list">
            {faqs.map((faq) => (
              <div key={faq.id} className="faq-card">
                <p className="faq-question">{faq.question}</p>
                <p className="faq-answer">{faq.answer}</p>
                {faq.link && (
                  <a
                    href={faq.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="faq-link"
                  >
                    Learn more
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Create Question Form */}
        {isCreating && (
          <div className="faq-create-form">
            <h2 className="faq-create-heading">Create a New Question</h2>
            <form onSubmit={handleSubmit} className="faq-form">
              <div className="faq-form-field">
                <label>Question:</label>
                <input
                  type="text"
                  name="question"
                  value={newQuestion.question}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="faq-form-field">
                <label>Answer:</label>
                <textarea
                  name="answer"
                  value={newQuestion.answer}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>
              <button type="submit" className="submit-button">
                Submit Question
              </button>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="cancel-button"
              >
                Cancel
              </button>
            </form>
            <button onClick={handleTranslation} className="translate-button">
              Translate to Bengali
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
