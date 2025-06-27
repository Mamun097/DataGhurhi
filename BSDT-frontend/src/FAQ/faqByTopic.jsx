import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import NavbarHome from "../Homepage/NavbarHome";
import NavbarAcholder from "../ProfileManagement/NavbarAccountHolder";
import "./faqByTopic.css";

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY;

const translateText = async (textArray, targetLang) => {
  try {
    const inputText = Array.isArray(textArray) ? textArray : [textArray];
    const translatedTexts = [];

    for (let text of inputText) {
      const response = await axios.post(
        `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_API_KEY}`,
        {
          q: text,
          target: targetLang,
          format: "text",
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const translated = response.data?.data?.translations?.[0]?.translatedText;
      translatedTexts.push(translated || text);
    }

    return translatedTexts;
  } catch (error) {
    console.error("Translation error:", error.response?.data?.error || error.message);
    return textArray;
  }
};

export default function FaqByTopic() {
  const { topic } = useParams();
  const [faqs, setFaqs] = useState([]);
  const [error, setError] = useState("");
  const [language, setLanguage] = useState(localStorage.getItem("language") || "English");
  const [translatedFaqs, setTranslatedFaqs] = useState([]);
  const [newQuestion, setNewQuestion] = useState({ question: "", answer: "", topic });
  const [isCreating, setIsCreating] = useState(false);
  const [uiLabels, setUiLabels] = useState({}); // for translated buttons/labels
  const isLoggedIn = !!localStorage.getItem("token");

  const baseLabels = {
    heading: "FAQ Section",
    back: "Back to topics",
    noFaqs: "No FAQs under this topic.",
    create: "Create a Question",
    learnMore: "Learn more",
    createHeading: "Create a New Question",
    question: "Question:",
    answer: "Answer:",
    submit: "Submit Question",
    cancel: "Cancel",
    translate: "Translate to Bengali",
  };

  // Fetch translated UI labels if language is not English
  useEffect(() => {
    const fetchUiLabels = async () => {
      if (language === "English") {
        setUiLabels(baseLabels);
      } else {
        const keys = Object.keys(baseLabels);
        const values = Object.values(baseLabels);
        const translations = await translateText(values, "bn");
        const labelMap = {};
        keys.forEach((k, i) => (labelMap[k] = translations[i]));
        setUiLabels(labelMap);
      }
    };

    fetchUiLabels();
  }, [language]);

  // Fetch FAQs by topic and translate them
  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const response = await axios.get("http://localhost:2000/api/faq");
        const allFaqs = response.data.faqs || [];
        const filteredFaqs = allFaqs.filter((faq) => faq.topic === topic);
        setFaqs(filteredFaqs);

        if (language !== "English" && filteredFaqs.length > 0) {
          const questions = filteredFaqs.map((f) => f.question);
          const answers = filteredFaqs.map((f) => f.answer);
          const translatedQuestions = await translateText(questions, "bn");
          const translatedAnswers = await translateText(answers, "bn");

          const updated = filteredFaqs.map((f, idx) => ({
            ...f,
            question: translatedQuestions[idx],
            answer: translatedAnswers[idx],
          }));

          setTranslatedFaqs(updated);
        } else {
          setTranslatedFaqs([]);
        }
      } catch (err) {
        console.error("Error loading FAQs for topic:", err);
        setError("Failed to load FAQs.");
      }
    };

    fetchFaqs();
  }, [topic, language]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewQuestion((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:2000/api/faq", newQuestion);
      if (response.data) {
        setFaqs((prevFaqs) => [...prevFaqs, response.data]);
        setIsCreating(false);
      }
    } catch (err) {
      console.error("Error creating FAQ:", err);
      setError("Failed to create FAQ.");
    }
  };

  const handleTranslation = useCallback(async () => {
    try {
      const translatedQ = await translateText(newQuestion.question, "bn");
      const translatedA = await translateText(newQuestion.answer, "bn");

      setNewQuestion((prev) => ({
        ...prev,
        question: translatedQ[0],
        answer: translatedA[0],
      }));
    } catch (error) {
      console.error("Error in handleTranslation:", error.message);
    }
  }, [newQuestion]);

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    localStorage.setItem("language", newLanguage);
  };

  const displayFaqs = language === "English" ? faqs : translatedFaqs;

  return (
    <div>
      {isLoggedIn ? (
        <NavbarAcholder language={language} setLanguage={handleLanguageChange} />
      ) : (
        <NavbarHome language={language} setLanguage={handleLanguageChange} />
      )}

      <div className="faq-topic-container">
        <h1 className="faq-topic-heading">{language === "English" ? decodeURIComponent(topic) : uiLabels.heading}</h1>
        <Link to="/faq" className="faq-back-link">← {uiLabels.back}</Link>

        {error && <p className="faq-error">{error}</p>}

        {displayFaqs.length === 0 && !error ? (
          <div className="faq-empty">
            <p>{uiLabels.noFaqs}</p>
            {isLoggedIn && (
              <button className="create-question-button" onClick={() => setIsCreating(true)}>
                {uiLabels.create}
              </button>
            )}
          </div>
        ) : (
          <div className="faq-list">
            {displayFaqs.map((faq, idx) => (
              <div key={faq.id || idx} className="faq-card">
                <p className="faq-question">{faq.question}</p>
                <p className="faq-answer">{faq.answer}</p>
                {faq.link && (
                  <a href={faq.link} target="_blank" rel="noopener noreferrer" className="faq-link">
                    {uiLabels.learnMore}
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {isCreating && (
          <div className="faq-create-form">
            <h2 className="faq-create-heading">{uiLabels.createHeading}</h2>
            <form onSubmit={handleSubmit} className="faq-form">
              <div className="faq-form-field">
                <label>{uiLabels.question}</label>
                <input
                  type="text"
                  name="question"
                  value={newQuestion.question}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="faq-form-field">
                <label>{uiLabels.answer}</label>
                <textarea
                  name="answer"
                  value={newQuestion.answer}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>
              <button type="submit" className="submit-button">
                {uiLabels.submit}
              </button>
              <button type="button" onClick={() => setIsCreating(false)} className="cancel-button">
                {uiLabels.cancel}
              </button>
            </form>
            <button onClick={handleTranslation} className="translate-button">
              {uiLabels.translate}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
