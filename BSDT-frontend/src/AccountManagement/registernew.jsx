import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import "./register.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import apiClient from "../api";
import NavbarAcholder from "../ProfileManagement/navbarAccountholder";
import { ToastContainer, toast } from "react-toastify";

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

  const [step, setStep] = useState(1);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword((prev) => !prev);

  const [emailError, setEmailError] = useState("");
  const [otpCooldown, setOtpCooldown] = useState(0);

  const [passwordValidations, setPasswordValidations] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    specialCharacter: false,
    match: false,
  });

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
      "Enter OTP",
      "Verify OTP",
      "Resend OTP in",
      "Send OTP",
      "Sending...",
      "Info",
      "OTP",
      "OTP verified successfully",
      "Invalid OTP",
      "📧 OTP sent to your email",
      "❌ Failed to send OTP.",
      "Password must include:",
      "At least 8 characters",
      "At least one uppercase letter",
      "At least one lowercase letter",
      "At least one number",
      "At least one special alphabet",
      "Both passwords must match",
      "This email is already registered.",
      "Something went wrong.",
      "❌ Please verify OTP first.",
      "Resend OTP",
      "❌ Password does not meet requirements. Please follow the instructions.",
      "❌ Password and confirm password do not match.",
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

  const checkEmailExists = async () => {
    try {
      const res = await apiClient.post("/api/register/check-email", {
        email: formData.email,
      });
      return res.data.exists;
    } catch (err) {
      console.error("Error checking email:", err);
      return false;
    }
  };

  const getPasswordValidations = (password, confirmPassword) => ({
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    specialCharacter: /[~`!@#$%^&*(),.?":{}|<>]/.test(password),
    match: password === confirmPassword && confirmPassword !== "",
  });

  useEffect(() => {
    const { password, confirmPassword } = formData;
    setPasswordValidations(getPasswordValidations(password, confirmPassword));
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "email") {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setEmailError(emailPattern.test(value) ? "" : getLabel("Invalid email address"));
    }

    if (name === "password" || name === "confirmPassword") {
      const password = name === "password" ? value : formData.password;
      const confirmPassword =
        name === "confirmPassword" ? value : formData.confirmPassword;

      setPasswordValidations({
        length: password.length >= 8,
        upper: /[A-Z]/.test(password),
        lower: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        specialCharacter: /[~`!@#$%^&*(),.?":{}|<>]/.test(password),
        match: password === confirmPassword && confirmPassword !== "",
      });
    }
  };

  const handleSubmitFinal = async (e) => {
    e.preventDefault();
    if (emailError) return toast.error(`❌ ${getLabel("Please enter a valid email before submitting.")}`);
    if (formData.password !== formData.confirmPassword) {
      return toast.error(`❌ ${getLabel("Passwords do not match.")}`);
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
          `🎉 ${getLabel("Registered Successfully")}: ${formData.firstName} ${formData.lastName}`
        );
        setTimeout(() => (window.location.href = "/login"), 3000);
      }
    } catch (error) {
      toast.error(`❌ ${getLabel("Something went wrong.")}`);
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;
    if (!otpVerified) return toast.error(getLabel("❌ Please verify OTP first."));
    if (formData.password !== formData.confirmPassword)
      return toast.error(`❌ ${getLabel("Passwords do not match.")}`);

    setIsLoading(true);
    try {
      toast.success(`🎉 ${getLabel("Registered Successfully")}`);
      setTimeout(() => (window.location.href = "/"), 3000);
    } catch {
      toast.error(`❌ ${getLabel("Something went wrong.")}`);
    } finally {
      setIsLoading(false);
    }
  };

  const sendOtp = async () => {
    setIsLoading(true);
    setEmailError("");

    if (!formData.email) {
      toast.error(`❌ ${getLabel("Please enter a valid email before submitting.")}`);
      setIsLoading(false);
      return;
    }

    const exists = await checkEmailExists();
    if (exists) {
      setEmailError(getLabel("This email is already registered."));
      setIsLoading(false);
      return;
    }

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);

    try {
      await apiClient.post("/api/send-otp", {
        email: formData.email,
        otp: newOtp,
      });

      toast.success(getLabel("📧 OTP sent to your email"));
      setStep(2);
      setOtpCooldown(180);
    } catch (error) {
      console.error("Failed to send OTP:", error);
      toast.error(getLabel("❌ Failed to send OTP."));
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = () => {
    if (otp === generatedOtp) {
      setOtpVerified(true);
      toast.success(getLabel("OTP verified successfully"));
      setStep(3);
    } else {
      toast.error(getLabel("Invalid OTP"));
    }
  };

  useEffect(() => {
    let timer;
    if (otpCooldown > 0) {
      timer = setInterval(() => {
        setOtpCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpCooldown]);

  const validatePassword = () => {
    const { password, confirmPassword } = formData;
    const validations = getPasswordValidations(password, confirmPassword);
    setPasswordValidations(validations);

    if (Object.values(validations).includes(false)) {
      if (
        !validations.length ||
        !validations.upper ||
        !validations.lower ||
        !validations.number ||
        !validations.specialCharacter
      ) {
        toast.error(getLabel("❌ Password does not meet requirements. Please follow the instructions."));
      } else if (!validations.match) {
        toast.error(getLabel("❌ Password and confirm password do not match."));
      }
      return false;
    }

    return true;
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

          <div className="step-indicator">
            <div
              className="step-line"
              style={{
                width: "100%",
                background:
                  "linear-gradient(to right, #4caf50 " +
                  (step - 1) * 50 +
                  "%, #ccc " +
                  (step - 1) * 50 +
                  "%)",
              }}
            ></div>
            {[
              { label: getLabel("Info"), number: 1 },
              { label: getLabel("OTP"), number: 2 },
              { label: getLabel("Password"), number: 3 },
            ].map(({ label, number }) => (
              <div className="step" key={number}>
                <div
                  className={`step-circle ${
                    step === number
                      ? "active"
                      : step > number
                      ? "completed"
                      : ""
                  }`}
                  onClick={() => {
                    if (number < step) setStep(number);
                  }}
                  title={label}
                >
                  {number}
                </div>
                <div className="step-label">{label}</div>
              </div>
            ))}
          </div>

          <form onSubmit={step === 3 ? handleSubmitFinal : handleSubmit}>
            {step === 1 && (
              <>
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
                <button
                  type="button"
                  className="register-button"
                  onClick={sendOtp}
                  disabled={isLoading}
                >
                  {isLoading ? getLabel("Sending...") : getLabel("Send OTP")}
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <input
                  type="text"
                  placeholder={getLabel("Enter OTP")}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
                <div className="otp-button-group">
                  <button
                    type="button"
                    className="register-button"
                    onClick={verifyOtp}
                  >
                    {getLabel("Verify OTP")}
                  </button>

                  <button
                    type="button"
                    className="register-button"
                    onClick={sendOtp}
                    disabled={otpCooldown > 0 || isLoading}
                  >
                    {otpCooldown > 0
                      ? `${getLabel("Resend OTP in")} ${Math.floor(otpCooldown / 60)
                          .toString()
                          .padStart(2, "0")}:${(otpCooldown % 60)
                          .toString()
                          .padStart(2, "0")}`
                      : isLoading
                      ? getLabel("Sending...")
                      : getLabel("Resend OTP")}
                  </button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="password-requirements">
                  <p>{getLabel("Password must include:")}</p>
                  <ul>
                    <li style={{ color: passwordValidations.length ? "green" : "red" }}>
                      ✔️ {getLabel("At least 8 characters")}
                    </li>
                    <li style={{ color: passwordValidations.upper ? "green" : "red" }}>
                      ✔️ {getLabel("At least one uppercase letter")}
                    </li>
                    <li style={{ color: passwordValidations.lower ? "green" : "red" }}>
                      ✔️ {getLabel("At least one lowercase letter")}
                    </li>
                    <li style={{ color: passwordValidations.number ? "green" : "red" }}>
                      ✔️ {getLabel("At least one number")}
                    </li>
                    <li style={{ color: passwordValidations.specialCharacter ? "green" : "red" }}>
                      ✔️ {getLabel("At least one special alphabet")}
                    </li>
                    <li style={{ color: passwordValidations.match ? "green" : "red" }}>
                      ✔️ {getLabel("Both passwords must match")}
                    </li>
                  </ul>
                </div>

                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder={getLabel("Password")}
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

                <div className="password-input-wrapper">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder={getLabel("Confirm Password")}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  <span
                    className="password-toggle-icon"
                    onClick={toggleConfirmPasswordVisibility}
                  >
                    {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
                  </span>
                </div>

                <button
                  type="submit"
                  className="register-button"
                  disabled={
                    isLoading ||
                    Object.values(passwordValidations).includes(false)
                  }
                >
                  {isLoading ? "..." : getLabel("Sign Up")}
                </button>
              </>
            )}
          </form>
          <p className="login-link">
            {getLabel("Already have an account?")} <a href="/">{getLabel("Log in")}</a>
          </p>
        </motion.div>
      </div>
      <ToastContainer position="top-center" autoClose={4000} />
    </div>
  );
};

export default Register;