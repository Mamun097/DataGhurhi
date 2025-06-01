import React, { useEffect,useState, useRef } from "react";
// Google Translate API Key (make sure you set this up correctly in your environment)
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY;

// Function to translate the text using Google Translate API
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
    return textArray; // If there's an error, fallback to original text
  }
};


const AddQuestion = ({ newQuestion, setNewQuestion, addNewQuestion, language, setLanguage}) => {
    const [translations, setTranslations] = useState({});
    
      // Fetch translations when language changes
      useEffect(() => {
        const loadTranslations = async () => {
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
    
          const translated = await translateText(
            labels,
            console.log("Language:", language),
            language === "বাংলা" ? "bn" : "en"
          );
    
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
    <div className= "add-question-container">
      {newQuestion && (
        <div className="mt-3">
          <p className="text-center" style={{ fontSize: '20px' }}>
            <b>{getLabel("Select the type of question you want to add")}</b>
          </p>
          <div className="row justify-content-around">
            <button
              className="col-md-3 btn btn-outline-secondary me-2 mb-2"
              onClick={() => addNewQuestion("radio")}
            >
              {getLabel("MCQ")}
            </button>
            <button
              className="col-md-3 btn btn-outline-secondary me-2 mb-2"
              onClick={() => addNewQuestion("text")}
            >
              {getLabel("Text")}
            </button>
            <button
              className="col-md-3 btn btn-outline-secondary me-2 mb-2"
              onClick={() => addNewQuestion("rating")}
            >
              {getLabel("Rating")}
            </button>
            <button
              className="col-md-3 btn btn-outline-secondary me-2 mb-2"
              onClick={() => addNewQuestion("linearScale")}
            >
              {getLabel("Linear Scale")}
            </button>
            <button
              className="col-md-3 btn btn-outline-secondary me-2 mb-2"
              onClick={() => addNewQuestion("checkbox")}
            >
              {getLabel("Checkbox")}
            </button>
            <button
              className="col-md-3 btn btn-outline-secondary me-2 mb-2"
              onClick={() => addNewQuestion("dropdown")}
            >
              {getLabel("Dropdown")}
            </button>
            <button
              className="col-md-3 btn btn-outline-secondary me-2 mb-2"
              onClick={() => addNewQuestion("datetime")}
            >
              {getLabel("Date/Time")}
            </button>
            <button
              className="col-md-3 btn btn-outline-secondary me-2 mb-2"
              onClick={() => addNewQuestion("likert")}
            >
              {getLabel("Likert Scale")}
            </button>
            <button
              className="col-md-3 btn btn-outline-secondary me-2 mb-2"
              onClick={() => addNewQuestion("tickboxGrid")}
            >
              {getLabel("Multiple Choice Grid")}
            </button>
          </div>
        </div>
      )}

      <button
        className="btn btn-outline-primary mt-2 ms-4 mb-3"
        onClick={() => setNewQuestion(true)}
      >
        ➕ {getLabel("Add Question")}
      </button>

   
    
    </div>
  );
};

export default AddQuestion;
