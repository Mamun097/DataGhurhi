import React, { useEffect, useState } from "react";
import axios from "axios";

// Google Translate API Key
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY;

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

const AddQuestion = ({
  newQuestion,
  setNewQuestion,
  addNewQuestion,
  language
}) => {
  const [translations, setTranslations] = useState({});

  const labels = [
    "Select the type of question you want to add",
    "MCQ",
    "Text",
    "Rating",
    "Linear Scale",
    "Checkbox",
    "Dropdown",
    "Date/Time",
    "Likert Scale",
    "Multiple Choice Grid",
    "Add Question",
  ];

  useEffect(() => {
    const loadTranslations = async () => {
      const langCode = language === "বাংলা" ? "bn" : "en";
      const translated = await translateText(labels, langCode);

      const translatedMap = {};
      labels.forEach((label, idx) => {
        translatedMap[label] = translated[idx];
      });

      setTranslations(translatedMap);
    };

    loadTranslations();
  }, [language]);

  const getLabel = (text) => translations[text] || text;

  return (
    <div className="add-question-container">
      {newQuestion && (
        <div className="mt-3">
          <p className="text-center" style={{ fontSize: "20px" }}>
            <b>{getLabel("Select the type of question you want to add")}</b>
          </p>
          <div className="row justify-content-around">
            {[
              ["radio", "MCQ"],
              ["text", "Text"],
              ["rating", "Rating"],
              ["linearScale", "Linear Scale"],
              ["checkbox", "Checkbox"],
              ["dropdown", "Dropdown"],
              ["datetime", "Date/Time"],
              ["likert", "Likert Scale"],
              ["tickboxGrid", "Multiple Choice Grid"],
            ].map(([type, label]) => (
              <button
                key={type}
                className="col-md-3 btn btn-outline-secondary me-2 mb-2"
                onClick={() => addNewQuestion(type)}
              >
                {getLabel(label)}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
         disabled={true}
        // muted
        style={{
            opacity: 0.6,
            cursor: "not-allowed"
        }}
        className="btn btn-outline-primary mt-2 ms-4 mb-3"
        onClick={() => setNewQuestion(true)}
      >
        ➕ {getLabel("Add Question")}
      </button>
    </div>
  );
};

export default AddQuestion;
