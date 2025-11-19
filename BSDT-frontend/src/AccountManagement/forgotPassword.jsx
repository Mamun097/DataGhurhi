import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import "./register.css"; // reuse same CSS
import Navbarhome from "../Homepage/navbarhome";
import { ToastContainer, toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import apiClient from "../api"; 

const API_KEY = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY;
const API_URL = "https://translation.googleapis.com/language/translate/v2";

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

const ForgotPassword = () => {
  const [language, setLanguage] = useState(
    localStorage.getItem("language") || "English"
  );
  const [translations, setTranslations] = useState({});
  const [loadingTranslations, setLoadingTranslations] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(180); // 3 minutes
  useEffect(() => {
    let timer;
    if (otpCooldown > 0) {
      timer = setInterval(() => {
        setOtpCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpCooldown]);

  const defaultTexts = React.useMemo(
    () => ({
      title: "Reset Your Password",
      // email: "Email Address",
      // sendOtp: "Send OTP",
      otp: "Enter OTP",
      // verifyOtp: "Verify OTP",
      // newPassword: "New Password",
      confirmPassword: "Confirm Password",
      // resetPassword: "Reset Password",
      otpSent: "OTP sent to your email.",
      invalidOtp: "Invalid OTP.",
      otpVerified: "OTP verified successfully.",
      passwordMismatch: "Passwords do not match.",
      passwordResetSuccess: "Password reset successful!",
      passwordRequirement: "Password must be at least 8 characters.",
      login: "Back to Login",
      process: "To reset your password, follow these steps:",
      resendOtpIn: "Resend OTP in",

      email: "Enter your registered email address.",
      sendOtp: "Click 'Send OTP' to receive a verification code in your email.",
      writeOtp: "Enter the OTP you received in your inbox.",
      verifyOtp: "Click 'Verify OTP' to confirm your identity.",
      newPassword: "Enter your new password and confirm it.",
      resetPassword: "Click 'Reset Password' to update your credentials.",
      logincan: "You can now log in using your new password.",
      sendOtpbutton: "Send OTP",
      verifyOtpbutton: "Verify OTP",
      newPasswordinput: "New Password",
      confirmPasswordinput: "Confirm Password",
      resetPasswordbutton: "Reset Password",
      Passwordmustinclude: "Password must include:",
      Atleast8characters: "At least 8 characters",
      Oneuppercaseletter: "At least one uppercase letter",
      Onelowercaseletter: "At least one lowercase letter",
      Onenumber: "At least one number",
      specialCharacter: "At least one special character",
      passwordsMustMatch: "Both passwords must match",
    }),
    []
  );

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language, defaultTexts]);
  const getPasswordValidations = (password, confirmPassword) => ({
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    specialCharacter: /[~`!@#$%^&*(),.?":{}|<>]/.test(password),
    match: password === confirmPassword && confirmPassword !== "",
  });

  
  const [passwordValidations, setPasswordValidations] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    specialCharacter: false,
    match: false,
  });

  useEffect(() => {
    const fetchTranslations = async () => {
      if (language === "English") {
        setTranslations({});
        return;
      }

      setLoadingTranslations(true);
      const flatTexts = Object.values(defaultTexts);
      const translatedArray = await translateText(flatTexts, "bn");

      const newTranslations = {};
      Object.keys(defaultTexts).forEach((key, i) => {
        newTranslations[key] = translatedArray[i];
      });

      setTranslations(newTranslations);
      setLoadingTranslations(false);
    };

    fetchTranslations();
  }, [language, defaultTexts]);

  const t = (key) =>
    language === "English" || loadingTranslations
      ? defaultTexts[key]
      : translations[key] || defaultTexts[key];

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [passwords, setPasswords] = useState({ password: "", confirm: "" });
  const [show, setShow] = useState({ pass: false, confirm: false });
  useEffect(() => {
    const { password, confirm } = passwords;
    setPasswordValidations(getPasswordValidations(password, confirm));
  }, [passwords]);
  const sendOtp = async () => {
    if (!email) return toast.error(`❌ ${t("email")}`);
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    setOtpCooldown(180); // restart timer when OTP is sent

    try {
      await apiClient.post("/api/send-otp", {
        email,
        otp: newOtp,
      });
      toast.success(`📧 ${t("otpSent")}`);
      setStep(2);
    } catch (err) {
      toast.error("❌ Failed to send OTP.");
      console.error("OTP sending error:", err);
    }
  };

  const verifyOtp = () => {
    if (otp === generatedOtp) {
      toast.success(`✅ ${t("otpVerified")}`);
      setOtpVerified(true);
      setStep(3);
    } else {
      toast.error(`❌ ${t("invalidOtp")}`);
    }
  };

  const resetPassword = async () => {
    const { password, confirm } = passwords;
    if (password.length < 8)
      return toast.error(`❌ ${t("passwordRequirement")}`);
    if (password !== confirm) return toast.error(`❌ ${t("passwordMismatch")}`);

    try {
      await apiClient.post("/api/login/reset-password", {
        email,
        newPassword: password,
      });
      toast.success(`🎉 ${t("passwordResetSuccess")}`);
      setTimeout(() => (window.location.href = "/login"), 3000);
    } catch {
      toast.error("❌ Failed to reset password.");
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
            src="/assets/images/login.png"
            alt="Reset Info"
            className="feature-image"
          />
          <h3>{t("process")}</h3>

          <ul>
            <li>{t("email")}</li>
            <li>{t("sendOtp")}</li>
            <li>{t("writeOtp")}</li>
            <li>{t("verifyOtp")}</li>
            <li>{t("newPassword")}</li>
            <li>{t("resetPassword")}</li>
            <li>{t("logincan")}</li>
          </ul>
        </motion.div>

        <motion.div
          className="register-box"
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          transition={{ duration: 1 }}
        >
          <h2 className="register-title">{t("title")}</h2>

          {step === 1 && (
            <>
              <input
                type="email"
                placeholder={t("email")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button className="register-button" onClick={sendOtp}>
                {t("sendOtpbutton")}
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <input
                type="text"
                placeholder={t("otp")}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />

              <div className="otp-button-group">
                <button className="register-button" onClick={verifyOtp}>
                  {t("verifyOtpbutton")}
                </button>

                <button
                  className="register-button"
                  onClick={sendOtp}
                  disabled={otpCooldown > 0}
                >
                  {otpCooldown > 0
                    ? `${t("resendOtpIn")} ${Math.floor(otpCooldown / 60)
                        .toString()
                        .padStart(2, "0")}:${(otpCooldown % 60)
                        .toString()
                        .padStart(2, "0")}`
                    : t("sendOtpbutton")}
                </button>
              </div>
            </>
          )}

          {step === 3 && otpVerified && (
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
                  type={show.pass ? "text" : "password"}
                  placeholder={t("newPasswordinput")}
                  value={passwords.password}
                  onChange={(e) =>
                    setPasswords({ ...passwords, password: e.target.value })
                  }
                />
                <span
                  className="password-toggle-icon"
                  onClick={() => setShow((s) => ({ ...s, pass: !s.pass }))}
                >
                  {show.pass ? <FaEye /> : <FaEyeSlash />}
                </span>
              </div>

              <div className="password-input-wrapper">
                <input
                  type={show.confirm ? "text" : "password"}
                  placeholder={t("confirmPasswordinput")}
                  value={passwords.confirm}
                  onChange={(e) =>
                    setPasswords({ ...passwords, confirm: e.target.value })
                  }
                />
                <span
                  className="password-toggle-icon"
                  onClick={() =>
                    setShow((s) => ({ ...s, confirm: !s.confirm }))
                  }
                >
                  {show.confirm ? <FaEye /> : <FaEyeSlash />}
                </span>
              </div>

              <button
                className="register-button"
                onClick={resetPassword}
                disabled={Object.values(passwordValidations).includes(false)}
              >
                {t("resetPasswordbutton")}
              </button>
            </>
          )}

          <p className="login-link">
            <a href="/login">← {t("login")}</a>
          </p>
        </motion.div>
      </div>
      <ToastContainer position="top-center" autoClose={4000} />
    </div>
  );
};

export default ForgotPassword;
