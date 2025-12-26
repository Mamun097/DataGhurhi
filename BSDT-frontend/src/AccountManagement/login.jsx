import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import "./login.css";
import NavbarAcholder from  "../ProfileManagement/navbarAccountholder"
import { ToastContainer, toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";
const API_KEY = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY;
const API_URL = "https://translation.googleapis.com/language/translate/v2";
import apiClient from "../api";

const translateText = async (text, targetLanguage) => {
  try {
    const response = await axios.post(`${API_URL}?key=${API_KEY}`, {
      q: text,
      target: targetLanguage,
      format: "text",
    });
    return response.data.data.translations[0].translatedText;
  } catch (error) {
    console.error("Translation error:", error);
    return text;
  }
};

const Login = () => {
  const [language, setLanguage] = useState(
    localStorage.getItem("language") || "English"
  );
  const [showPassword, setShowPassword] = useState(false);
  const [translations, setTranslations] = useState({});
  const [loadingTranslations, setLoadingTranslations] = useState(false);
  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
  const toggleLanguage = () => {
    const newLang = language === "English" ? "বাংলা" : "English";
    setLanguage(newLang);
    localStorage.setItem("language", newLang);
  };

  const defaultTexts = {
    title: "Login to Your Account",
    email: "Email Address",
    password: "Password",
    login: "Log In",
    noAccount: "Don’t have an account?",
    signUp: "Sign up",
    whyLogin: "Why Log in to Your Account?",
    features: [
      "Access your surveys anytime",
      "Edit forms and manage responses",
      "See visualizations and reports",
      "Secure and private login",
    ],
    invalidEmail: "Invalid email address",
    enterValidEmail: "Please enter a valid email before logging in.",
    loginSuccess: "Logged in successfully:",
    loginFailed: "Login failed: Wrong email ID or Password",
  };

  useEffect(() => {
    const fetchTranslations = async () => {
      if (language === "English") {
        setTranslations({});
        return;
      }
      setLoadingTranslations(true);
      const translated = {};
      for (const [key, value] of Object.entries(defaultTexts)) {
        if (Array.isArray(value)) {
          translated[key] = await Promise.all(
            value.map((v) => translateText(v, "bn"))
          );
        } else {
          translated[key] = await translateText(value, "bn");
        }
      }
      setTranslations(translated);
      setLoadingTranslations(false);
    };
    fetchTranslations();
  }, [language]);

  const t = (key) =>
    language === "English" || loadingTranslations
      ? defaultTexts[key]
      : translations[key] || defaultTexts[key];

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [emailError, setEmailError] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

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
    if (emailError) {
      toast.error(`❌ ${t("enterValidEmail")}`);
      return;
    }
    try {
      const response = await apiClient.post("/api/login", formData, { withCredentials: true });
      if (response.status === 200) {
        toast.success(`✅ ${t("loginSuccess")} ${formData.email}`);
        localStorage.setItem("token", response.data.token);
        // localStorage.setItem("role", "user");
        // console.log("User type from response:", response.data.user_type);
        localStorage.setItem("user_type", response.data.user_type || "normal");
        localStorage.setItem("user_id", response.data.user_id);
        console.log(localStorage.getItem("token"));

        setTimeout(() => (window.location.href = "/dashboard"), 2500);
      } else {
        setErrorMessage(response.data.error);
        toast.error(response.data.error);
      }
    } catch (error) {
      toast.error(`❌ ${t("loginFailed")}`);
    }
  };

  return (
    <div className="register-container">
      <NavbarAcholder language={language} setLanguage={setLanguage} />
      <div className="register-wrapper">
        <motion.div
          className="register-box"
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          transition={{ duration: 1 }}
        >
          <h2 className="register-title">{t("title")}</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              name="email"
              placeholder={t("email")}
              value={formData.email}
              onChange={handleChange}
              required
            />
            {emailError && <p className="error-message">{emailError}</p>}
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder={t("password")}
                value={formData.password}
                onChange={handleChange}
                required
              />
              <span
                className="password-toggle-icon"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <FaEye /> : <FaEyeSlash />}
              </span>
            </div>
            <button type="submit" className="register-button">
              {t("login")}
            </button>
          </form>
          <p className="login-link">
            {t("noAccount")} <a href="/signup">{t("signUp")}</a>
          </p>
          <p className="forgot-password-text">
            <a href="/forgot-password">Forgot Password?</a>
          </p>
        </motion.div>

        <motion.div
          className="feature-card no-blur"
          initial={{ x: -40 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <img
            src="/assets/images/login.png"
            alt="Login Info"
            className="feature-image"
          />
          <h3>{t("whyLogin")}</h3>
          <ul>
            {t("features").map((feat, i) => (
              <li key={i}>{feat}</li>
            ))}
          </ul>
        </motion.div>
      </div>
      <ToastContainer position="top-center" autoClose={4000} />
    </div>
  );
};

export default Login;
