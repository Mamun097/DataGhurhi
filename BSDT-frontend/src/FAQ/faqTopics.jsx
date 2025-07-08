import "./FaqTopics.css";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import NavbarHome from "../Homepage/NavbarHome";
import NavbarAcholder from "../ProfileManagement/NavbarAccountHolder";

// MUI Icons
import SchoolIcon from "@mui/icons-material/School";
import BarChartIcon from "@mui/icons-material/BarChart";
import LockIcon from "@mui/icons-material/Lock";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import BuildIcon from "@mui/icons-material/Build";
import GroupIcon from "@mui/icons-material/Group";
import NoteAltIcon from "@mui/icons-material/NoteAlt";
import PushPinIcon from "@mui/icons-material/PushPin";
import FolderIcon from "@mui/icons-material/Folder";
import PsychologyIcon from "@mui/icons-material/Psychology";

const iconComponents = [
  SchoolIcon,
  BarChartIcon,
  LockIcon,
  LightbulbIcon,
  BuildIcon,
  GroupIcon,
  NoteAltIcon,
  PushPinIcon,
  FolderIcon,
  PsychologyIcon,
];

// Google API Key from Vite environment variables
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY;

const translateText = async (textArray, targetLang) => {
  try {
    console.log("Sending to translation API:", textArray, targetLang); // Log request data

    // Ensure inputText is always an array
    const inputText = Array.isArray(textArray) ? textArray : [textArray];

    const translatedTexts = [];

    // Translate one topic at a time
    for (let text of inputText) {
      const response = await axios.post(
        `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_API_KEY}`,
        {
          q: text, // Translate one string at a time
          target: targetLang,
          format: "text",
        },
        {
          headers: {
            "Content-Type": "application/json", // Ensure we are sending JSON
          },
        }
      );

      console.log("API Response:", response.data);

      if (
        response.data &&
        response.data.data &&
        response.data.data.translations
      ) {
        translatedTexts.push(response.data.data.translations[0].translatedText);
      } else {
        translatedTexts.push(text); // If translation fails, fallback to original text
      }
    }

    return translatedTexts;
  } catch (error) {
    console.error("Translation error:", error.response || error.message);
    return textArray; // Return original text if translation fails
  }
};

export default function FaqTopics() {
  const [topicsWithIcons, setTopicsWithIcons] = useState([]);
  const [error, setError] = useState("");
  const [language, setLanguage] = useState(
    localStorage.getItem("language") || "English"
  );
  const [translatedTopics, setTranslatedTopics] = useState([]);
  const [loadingTranslation, setLoadingTranslation] = useState(false);
  // Add this inside FaqTopics component (top level state)
  const baseLabels = {
    heading: "Browse FAQ Topics",
    empty: "No FAQs under this topic.",
    loading: "Loading translations...",
  };

  const [uiLabels, setUiLabels] = useState(baseLabels);

  // Fetch translated UI labels when language changes
  useEffect(() => {
    const translateUiLabels = async () => {
      if (language === "English") {
        setUiLabels(baseLabels);
      } else {
        const keys = Object.keys(baseLabels);
        const values = Object.values(baseLabels);
        const translated = await translateText(values, "bn");
        const mapped = {};
        keys.forEach((k, i) => {
          mapped[k] = translated[i];
        });
        setUiLabels(mapped);
      }
    };

    translateUiLabels();
  }, [language]);

  const isLoggedIn = !!localStorage.getItem("token");

  // Whenever the language changes, re-fetch the FAQ topics and translations
  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const response = await axios.get("http://localhost:2000/api/faq");
        const faqs = response.data.faqs || [];
        const uniqueTopics = [...new Set(faqs.map((faq) => faq.topic))];

        const topicsWithIcons = uniqueTopics.map((topic) => {
          const RandomIcon =
            iconComponents[Math.floor(Math.random() * iconComponents.length)];
          return { topic, Icon: RandomIcon };
        });

        setTopicsWithIcons(topicsWithIcons);

        if (language !== "English") {
          setLoadingTranslation(true);

          const translatedNames = await translateText(uniqueTopics, "bn");
          setTranslatedTopics(translatedNames);
          setLoadingTranslation(false);
          console.log("Translated topics:", translatedNames);
        }
      } catch (err) {
        console.error("Error fetching FAQ topics:", err);
        setError("Failed to load FAQ topics.");
      }
    };

    fetchFaqs();
  }, [language]); // Runs every time the language state changes

  // Function to toggle language to Bengali
  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    localStorage.setItem("language", newLanguage); // Save the language preference in localStorage
    setTranslatedTopics([]); // Reset translations when switching language
  };

  return (
    <div>
      {isLoggedIn ? (
        <NavbarAcholder
          language={language}
          setLanguage={handleLanguageChange}
        />
      ) : (
        <NavbarHome language={language} setLanguage={handleLanguageChange} />
      )}

      <div className="faq-container">
        <h1 className="faq-heading">{uiLabels.heading}</h1>

        {error && <p className="faq-error">{error}</p>}
        {loadingTranslation ? (
          <p>{uiLabels.loading}</p>
        ) : topicsWithIcons.length === 0 && !error ? (
          <p className="faq-empty">{uiLabels.empty}</p>
        ) : (
          <div className="faq-grid">
            {topicsWithIcons.map(({ topic, Icon }, idx) => (
              <Link
                key={idx}
                to={`/faq/${encodeURIComponent(topic)}`}
                className="faq-box"
              >
                <div className="faq-icon">
                  <Icon style={{ fontSize: 40 }} />
                </div>
                <div className="faq-text">
                  {language === "English"
                    ? topic
                    : translatedTopics[idx] || topic}
                </div>
                {console.log(
                  "Topic:",
                  topic,
                  "Translation:",
                  translatedTopics[idx]
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
