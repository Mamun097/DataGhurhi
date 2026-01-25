import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import "./register.css";
import NavbarAcholder from "../ProfileManagement/navbarAccountholder";
import { ToastContainer, toast } from "react-toastify";
import apiClient from "../api";

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY;

// Language configurations matching dashboard
const LANGUAGES = [
  { code: "en", name: "ENGLISH", flag: "🇬🇧", googleCode: "en" },
  { code: "bn", name: "বাংলা", flag: "🇧🇩", googleCode: "bn" },
  { code: "zh", name: "中文", flag: "🇨🇳", googleCode: "zh-CN" },
  { code: "hi", name: "हिन्दी", flag: "🇮🇳", googleCode: "hi" },
  { code: "es", name: "ESPAÑOL", flag: "🇪🇸", googleCode: "es" },
  { code: "ar", name: "العربية", flag: "🇸🇦", googleCode: "ar" },
  { code: "fr", name: "FRANÇAIS", flag: "🇫🇷", googleCode: "fr" },
  { code: "pt", name: "PORTUGUÊS", flag: "🇵🇹", googleCode: "pt" },
  { code: "ru", name: "РУССКИЙ", flag: "🇷🇺", googleCode: "ru" },
  { code: "ur", name: "اردو", flag: "🇵🇰", googleCode: "ur" },
  { code: "id", name: "BAHASA INDONESIA", flag: "🇮🇩", googleCode: "id" },
  { code: "de", name: "DEUTSCH", flag: "🇩🇪", googleCode: "de" },
  { code: "ja", name: "日本語", flag: "🇯🇵", googleCode: "ja" },
  { code: "sw", name: "KISWAHILI", flag: "🇰🇪", googleCode: "sw" },
  { code: "mr", name: "मराठी", flag: "🇮🇳", googleCode: "mr" },
  { code: "te", name: "తెలుగు", flag: "🇮🇳", googleCode: "te" },
  { code: "tr", name: "TÜRKÇE", flag: "🇹🇷", googleCode: "tr" },
  { code: "ta", name: "தமிழ்", flag: "🇮🇳", googleCode: "ta" },
  { code: "vi", name: "TIẾNG VIỆT", flag: "🇻🇳", googleCode: "vi" },
  { code: "ko", name: "한국어", flag: "🇰🇷", googleCode: "ko" },
  { code: "it", name: "ITALIANO", flag: "🇮🇹", googleCode: "it" },
  { code: "th", name: "ไทย", flag: "🇹🇭", googleCode: "th" },
  { code: "gu", name: "ગુજરાતી", flag: "🇮🇳", googleCode: "gu" },
  { code: "fa", name: "فارسی", flag: "🇮🇷", googleCode: "fa" },
  { code: "pl", name: "POLSKI", flag: "🇵🇱", googleCode: "pl" },
  { code: "uk", name: "УКРАЇНСЬКА", flag: "🇺🇦", googleCode: "uk" },
  { code: "kn", name: "ಕನ್ನಡ", flag: "🇮🇳", googleCode: "kn" },
  { code: "ml", name: "മലയാളം", flag: "🇮🇳", googleCode: "ml" },
  { code: "or", name: "ଓଡ଼ିଆ", flag: "🇮🇳", googleCode: "or" },
  { code: "my", name: "မြန်မာ", flag: "🇲🇲", googleCode: "my" },
  { code: "ha", name: "HAUSA", flag: "🇳🇬", googleCode: "ha" },
  { code: "yo", name: "YORÙBÁ", flag: "🇳🇬", googleCode: "yo" },
  { code: "am", name: "አማርኛ", flag: "🇪🇹", googleCode: "am" },
];

// Translation function
const translateText = async (textArray, targetLang) => {
  if (!Array.isArray(textArray) || textArray.length === 0 || !targetLang)
    return textArray;

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

const Register = () => {
  // Language state - use code instead of full name
  const [language, setLanguage] = useState(
    localStorage.getItem("language") || "en"
  );
  const [translatedLabels, setTranslatedLabels] = useState({});
  const [loadingTranslations, setLoadingTranslations] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [emailError, setEmailError] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Labels to translate
  const labelsToTranslate = React.useMemo(
    () => [
      "Create an Account",
      "First Name",
      "Last Name",
      "Email Address",
      "Password",
      "Confirm Password",
      "Sign Up",
      "Already have an account?",
      "Log in",
      "Why Create an Account?",
      "Create smart surveys effortlessly and share them easily",
      "Collaborate with your team in real-time",
      "Access data analysis and charts",
      "Save progress, track deadlines and manage responses",
      "Generate reports in English & Bangla",
      "Invalid email address",
      "Please enter a valid email before submitting.",
      "Passwords do not match.",
      "Registered Successfully",
      "Something went wrong.",
    ],
    []
  );

  const getLabel = (text) =>
    language === "en" ? text : translatedLabels[text] || text;

  const loadTranslations = useCallback(async () => {
    if (language === "en") {
      setTranslatedLabels({});
      return;
    }

    setLoadingTranslations(true);

    const currentLangObj = LANGUAGES.find(l => l.code === language);
    const targetLang = currentLangObj ? currentLangObj.googleCode : "en";

    const translations = await translateText(labelsToTranslate, targetLang);
    const mapped = {};
    labelsToTranslate.forEach((label, idx) => {
      mapped[label] = translations[idx];
    });
    setTranslatedLabels(mapped);
    setLoadingTranslations(false);
  }, [language, labelsToTranslate]);

  // Listen for language changes from navbar
  useEffect(() => {
    const handleLanguageChange = (event) => {
      const newLanguage = event.detail.language;
      setLanguage(newLanguage);
      localStorage.setItem("language", newLanguage);
    };

    window.addEventListener("languageChanged", handleLanguageChange);
    
    return () => {
      window.removeEventListener("languageChanged", handleLanguageChange);
    };
  }, []);

  useEffect(() => {
    loadTranslations();
  }, [language, loadTranslations]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "email") {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setEmailError(emailPattern.test(value) ? "" : getLabel("Invalid email address"));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (emailError) return toast.error(`❌ ${getLabel("Please enter a valid email before submitting.")}`);
    if (formData.password !== formData.confirmPassword) {
      const msg = `❌ ${getLabel("Passwords do not match.")}`;
      setErrorMessage(msg);
      return toast.error(msg);
    }

    setIsLoading(true);
    try {
      const response = await apiClient.post("/api/register", {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
      });

      if (response.status === 201) {
        toast.success(
          `🎉 ${getLabel("Registered Successfully")}: ${formData.firstName} ${
            formData.lastName
          }`
        );
        setTimeout(() => (window.location.href = "/login"), 3000);
      }
    } catch (err) {
      toast.error(`❌ ${getLabel("Something went wrong.")}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <NavbarAcholder language={language} setLanguage={setLanguage} />
      <div className="register-wrapper">
        <motion.div
          className="feature-card"
          initial={{ x: -40 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <img
            src="/assets/images/register.png"
            alt="Account Benefits"
            className="feature-image"
          />
          <h3>{getLabel("Why Create an Account?")}</h3>
          <ul>
            <li>{getLabel("Create smart surveys effortlessly and share them easily")}</li>
            <li>{getLabel("Collaborate with your team in real-time")}</li>
            <li>{getLabel("Access data analysis and charts")}</li>
            <li>{getLabel("Save progress, track deadlines and manage responses")}</li>
            <li>{getLabel("Generate reports in English & Bangla")}</li>
          </ul>
        </motion.div>

        <motion.div
          className="register-box"
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          transition={{ duration: 1 }}
        >
          <h2 className="register-title">{getLabel("Create an Account")}</h2>
          <form onSubmit={handleSubmit}>
            <div className="name-fields">
              <input
                type="text"
                name="firstName"
                placeholder={getLabel("First Name")}
                value={formData.firstName}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="lastName"
                placeholder={getLabel("Last Name")}
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
            <input
              type="email"
              name="email"
              placeholder={getLabel("Email Address")}
              value={formData.email}
              onChange={handleChange}
              required
            />
            {emailError && <p className="error-message">{emailError}</p>}
            <input
              type="password"
              name="password"
              placeholder={getLabel("Password")}
              value={formData.password}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder={getLabel("Confirm Password")}
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            <button
              type="submit"
              className="register-button"
              disabled={isLoading}
            >
              {isLoading ? "..." : getLabel("Sign Up")}
            </button>
          </form>
          <p className="login-link">
            {getLabel("Already have an account?")} <a href="/login">{getLabel("Log in")}</a>
          </p>
        </motion.div>
      </div>
      <ToastContainer position="top-center" autoClose={4000} />
    </div>
  );
};

export default Register;