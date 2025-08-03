import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import "./register.css";
import Navbarhome from "../Homepage/navbarhome";
import { ToastContainer, toast } from "react-toastify";
import apiClient from "../api";

const API_KEY = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY;
const API_URL = "https://translation.googleapis.com/language/translate/v2";

// Batch translation for array of texts
const translateText = async (textArray, targetLang) => {
  if (!Array.isArray(textArray) || textArray.length === 0 || !targetLang)
    return textArray;

  try {
    const response = await axios.post(`${API_URL}?key=${API_KEY}`, {
      q: textArray,
      target: targetLang,
      format: "text",
    });
    return response.data.data.translations.map((t) => t.translatedText);
  } catch (error) {
    console.error("Translation error:", error.response?.data || error.message);
    return textArray;
  }
};

const Register = () => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("language") || "English";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  
  const [translations, setTranslations] = useState({});
  const [loadingTranslations, setLoadingTranslations] = useState(false);

  const toggleLanguage = () =>
    setLanguage((prev) => (prev === "English" ? "বাংলা" : "English"));

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

  const defaultTexts = {
    title: "Create an Account",
    firstName: "First Name",
    lastName: "Last Name",
    email: "Email Address",
    password: "Password",
    confirmPassword: "Confirm Password",
    signUp: "Sign Up",
    alreadyAccount: "Already have an account?",
    login: "Log in",
    whyAccount: "Why Create an Account?",
    benefits: [
      "Create smart surveys effortlessly and share them easily",
      "Collaborate with your team in real-time",
      "Access data analysis and charts",
      "Save progress, track deadlines and manage responses",
      "Generate reports in English & Bangla",
    ],
    invalidEmail: "Invalid email address",
    emailRequired: "Please enter a valid email before submitting.",
    passwordMismatch: "Passwords do not match.",
    registrationSuccess: "Registered Successfully",
  };

  useEffect(() => {
    const fetchTranslations = async () => {
      if (language === "English") {
        setTranslations({});
        return;
      }

      setLoadingTranslations(true);

      try {
        const flatTexts = [];
        const keysMap = [];

        for (const [key, value] of Object.entries(defaultTexts)) {
          if (Array.isArray(value)) {
            for (const v of value) {
              flatTexts.push(v);
              keysMap.push({ key, isArray: true });
            }
          } else {
            flatTexts.push(value);
            keysMap.push({ key, isArray: false });
          }
        }

        const translatedArray = await translateText(flatTexts, "bn");

        const newTranslations = {};
        let idx = 0;

        for (const { key, isArray } of keysMap) {
          if (isArray) {
            if (!newTranslations[key]) newTranslations[key] = [];
            newTranslations[key].push(translatedArray[idx]);
          } else {
            newTranslations[key] = translatedArray[idx];
          }
          idx++;
        }

        setTranslations(newTranslations);
      } catch (error) {
        console.error("Translation loading error:", error);
      }

      setLoadingTranslations(false);
    };

    fetchTranslations();
  }, [language]);

  const t = (key) =>
    language === "English" || loadingTranslations
      ? defaultTexts[key]
      : translations[key] || defaultTexts[key];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "email") {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setEmailError(emailPattern.test(value) ? "" : t("invalidEmail"));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (emailError) return toast.error(`❌ ${t("emailRequired")}`);
    if (formData.password !== formData.confirmPassword) {
      const msg = `❌ ${t("passwordMismatch")}`;
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
          `🎉 ${t("registrationSuccess")}: ${formData.firstName} ${
            formData.lastName
          }`
        );
        setTimeout(() => (window.location.href = "/login"), 3000);
      }
    } catch (err) {
      toast.error("❌ Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <Navbarhome language={language} setLanguage={setLanguage} />
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
          <h3>{t("whyAccount")}</h3>
          <ul>
            {t("benefits").map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
          {/* <button className="language-toggle" onClick={toggleLanguage}>
            {language === "English" ? "বাংলায় দেখুন" : "View in English"}
          </button> */}
        </motion.div>

        <motion.div
          className="register-box"
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          transition={{ duration: 1 }}
        >
          <h2 className="register-title">{t("title")}</h2>
          <form onSubmit={handleSubmit}>
            <div className="name-fields">
              <input
                type="text"
                name="firstName"
                placeholder={t("firstName")}
                value={formData.firstName}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="lastName"
                placeholder={t("lastName")}
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
            <input
              type="email"
              name="email"
              placeholder={t("email")}
              value={formData.email}
              onChange={handleChange}
              required
            />
            {emailError && <p className="error-message">{emailError}</p>}
            <input
              type="password"
              name="password"
              placeholder={t("password")}
              value={formData.password}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder={t("confirmPassword")}
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            <button
              type="submit"
              className="register-button"
              disabled={isLoading}
            >
              {isLoading ? "..." : t("signUp")}
            </button>
          </form>
          <p className="login-link">
            {t("alreadyAccount")} <a href="/login">{t("login")}</a>
          </p>
        </motion.div>
      </div>
      <ToastContainer position="top-center" autoClose={4000} />
    </div>
  );
};

export default Register;
