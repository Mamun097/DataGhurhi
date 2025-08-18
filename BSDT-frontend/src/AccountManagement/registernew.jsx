import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import "./register.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import apiClient from "../api";

import Navbarhome from "../Homepage/navbarhome";
import { ToastContainer, toast } from "react-toastify";
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
  const [language, setLanguage] = useState(
    () => localStorage.getItem("language") || "English"
  );
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

  const [translations, setTranslations] = useState({});
  const [loadingTranslations, setLoadingTranslations] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [otpCooldown, setOtpCooldown] = useState(0);
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

  const defaultTexts = React.useMemo(
    () => ({
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
      EnterOTP: "Enter OTP",
      VerifyOTP: "Verify OTP",
      ResendOTP: "Resend OTP in",
      sendOtp: "Send OTP",
      Sending: "Sending...",
      Info: "Info",
      OTP: "OTP",
      otpverified: "OTP verified successfully",
      invalidOtp: "Invalid OTP",
      Password: "Password",
      otpsent: "📧 OTP sent to your email",
      failedToSendOtp: "❌ Failed to send OTP.",
      Passwordmustinclude: "Password must include:",
      Atleast8characters: "At least 8 characters",
      Oneuppercaseletter: "At least one uppercase letter",
      Onelowercaseletter: "At least one lowercase letter",
      Onenumber: "At least one number",
      specialCharacter: "At least one special alphabet",
      passwordsMustMatch: "Both passwords must match",

      emailalreadyregistered: "This email is already registered.",
    }),
    []
  );

  const [passwordValidations, setPasswordValidations] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    specialCharacter: false,
  });

  useEffect(() => {
    const { password, confirmPassword } = formData;
    setPasswordValidations({
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      specialCharacter: /[~`!@#$%^&*(),.?":{}|<>]/.test(password),
      match: password === confirmPassword && confirmPassword !== "",
    });
  }, [formData]);

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language, defaultTexts]);

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
  }, [language, defaultTexts]);

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
    if (emailError) return toast.error(`❌ ${t("emailRequired")}`);
    if (formData.password !== formData.confirmPassword) {
      const msg = `❌ ${t("passwordMismatch")}`;
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
    } catch (error) {
      toast.error("❌ Something went wrong.");
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;
    if (!otpVerified) return toast.error("❌ Please verify OTP first.");
    if (formData.password !== formData.confirmPassword)
      return toast.error(`❌ ${t("passwordMismatch")}`);

    setIsLoading(true);
    try {
      toast.success(`🎉 ${t("registrationSuccess")}`);
      setTimeout(() => (window.location.href = "/login"), 3000);
    } catch {
      toast.error("❌ Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const sendOtp = async () => {
    setIsLoading(true);
    setEmailError("");

    // Check if email is provided
    if (!formData.email) {
      toast.error(`❌ ${t("emailRequired")}`);
      setIsLoading(false);
      return;
    }

    // Check if email already exists in DB
    const exists = await checkEmailExists();
    if (exists) {
      setEmailError(t("emailalreadyregistered"));
      setIsLoading(false);
      return;
    }

    // Generate 6-digit OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);

    try {
      await apiClient.post("/api/send-otp", {
        email: formData.email,
        otp: newOtp,
      });

      toast.success(t("otpsent"));
      setStep(2);
      setOtpCooldown(180); // 3 minutes cooldown
    } catch (error) {
      console.error("Failed to send OTP:", error);
      toast.error(t("failedToSendOtp"));
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = () => {
    if (otp === generatedOtp) {
      setOtpVerified(true);
      toast.success(t("otpverified"));
      setStep(3);
    } else {
      toast.error(t("invalidOtp"));
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
        toast.error(
          language === "Bangla"
            ? "❌ পাসওয়ার্ডটি যথাযথ নয়। অনুগ্রহ করে নির্দেশনা অনুসরণ করুন।"
            : "❌ Password does not meet requirements. Please follow the instructions."
        );
      } else if (!validations.match) {
        toast.error(
          language === "Bangla"
            ? "❌ পাসওয়ার্ড ও নিশ্চিতকরণ পাসওয়ার্ড মিলছে না।"
            : "❌ Password and confirm password do not match."
        );
      }
      return false;
    }

    return true;
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
        </motion.div>

        <motion.div
          className="register-box"
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          transition={{ duration: 1 }}
        >
          <h2 className="register-title">{t("title")}</h2>

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
              { label: t("Info"), number: 1 },
              { label: t("OTP"), number: 2 },
              { label: t("Password"), number: 3 },
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
                    if (number < step) setStep(number); // allow back navigation only
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
                <button
                  type="button"
                  className="register-button"
                  onClick={sendOtp}
                  disabled={isLoading}
                >
                  {isLoading ? t("Sending") : t("sendOtp")}
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <input
                  type="text"
                  placeholder={t("EnterOTP")}
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
                    {t("VerifyOTP")}
                  </button>

                  <button
                    type="button"
                    className="register-button"
                    onClick={sendOtp}
                    disabled={otpCooldown > 0 || isLoading}
                  >
                    {otpCooldown > 0
                      ? `${t("ResendOTP")} ${Math.floor(otpCooldown / 60)
                          .toString()
                          .padStart(2, "0")}:${(otpCooldown % 60)
                          .toString()
                          .padStart(2, "0")}`
                      : isLoading
                      ? t("Sending")
                      : t("Resend OTP")}
                  </button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="password-requirements">
                  <p>{t("Passwordmustinclude")}</p>
                  <ul>
                    <li
                      style={{
                        color: passwordValidations.length ? "green" : "red",
                      }}
                    >
                      ✔️ {t("Atleast8characters")}
                    </li>
                    <li
                      style={{
                        color: passwordValidations.upper ? "green" : "red",
                      }}
                    >
                      ✔️ {t("Oneuppercaseletter")}
                    </li>
                    <li
                      style={{
                        color: passwordValidations.lower ? "green" : "red",
                      }}
                    >
                      ✔️ {t("Onelowercaseletter")}
                    </li>
                    <li
                      style={{
                        color: passwordValidations.number ? "green" : "red",
                      }}
                    >
                      ✔️ {t("Onenumber")}
                    </li>
                    <li
                      style={{
                        color: passwordValidations.specialCharacter
                          ? "green"
                          : "red",
                      }}
                    >
                      ✔️ {t("specialCharacter")}
                    </li>

                    <li
                      style={{
                        color: passwordValidations.match ? "green" : "red",
                      }}
                    >
                      ✔️ {t("passwordsMustMatch")}
                    </li>
                  </ul>
                </div>

                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder={t("Password")}
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
                    placeholder={t("confirmPassword")}
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
                  {isLoading ? "..." : t("signUp")}
                </button>
              </>
            )}
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
