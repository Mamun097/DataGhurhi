import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import "./login.css";
import Navbarhome from "../Homepage/navbarhome";
import {ToastContainer, toast } from "react-toastify";

const Login = () => {
  const [language, setLanguage] = useState(
    localStorage.getItem("language") || "English"
  );
  
  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "English" ? "বাংলা" : "English"));
    localStorage.setItem("language", language); // Store the selected language in local storage
  };


  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [emailError, setEmailError] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({ ...formData, [name]: value });

    if (name === "email") {
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailPattern.test(value)) {
        setEmailError(
          language === "English"
            ? "Invalid email address"
            : "ইমেইল ঠিকানা সঠিক নয়"
        );
      } else {
        setEmailError("");
      }
    }
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   if (emailError) {
  //     alert(
  //       language === "English"
  //         ? "Please enter a valid email before logging in."
  //         : "লগইন করার আগে একটি বৈধ ইমেইল দিন।"
  //     );
  //     return;
  //   }

  //   try {
  //     const response = await axios.post("http://localhost:2000/api/login", {
  //       email: formData.email,
  //       password: formData.password,
  //     });

  //     if (response.status === 200) {
  //       alert(
  //         language === "English"
  //           ? `Logged in successfully: ${formData.email}`
  //           : `সফলভাবে লগইন হয়েছে: ${formData.email}`
  //       );
  //       localStorage.setItem("token", response.data.token);
  //       localStorage.setItem("role", "user");
  //       localStorage.setItem("user", JSON.stringify(response.data.user));
  //       window.location.href = "/dashboard";
  //     } else {
  //       setErrorMessage(response.data.error);
  //     }
  //   } catch (error) {
  //     alert(
  //       language === "English" ? "Login failed." : "লগইন ব্যর্থ হয়েছে।"
  //     );
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (emailError) {
      toast.error(
        language === "English"
          ? "❌ Please enter a valid email before logging in."
          : "❌ লগইন করার আগে একটি বৈধ ইমেইল দিন।",
        { className: "custom-error-toast" }
      );
      return;
    }

    try {
      const response = await axios.post("http://localhost:2000/api/login", {
        email: formData.email,
        password: formData.password,
      });

      if (response.status === 200) {
        toast.success(
          language === "English"
            ? `Logged in successfully: ${formData.email}`
            : `সফলভাবে লগইন হয়েছে: ${formData.email}`,
          { className: "custom-success-toast" }
        );

        localStorage.setItem("token", response.data.token);
        localStorage.setItem("role", "user");     
        localStorage.setItem("user", JSON.stringify(response.data.user));

        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 2500); // Show toast before redirect
      } else {
        setErrorMessage(response.data.error);
        toast.error(` ${response.data.error}`, {
          className: "custom-error-toast",
        });
      }
    } catch (error) {
      const fallback =
        language === "English" ? "Login failed: Wrong email ID or Password" : "লগইন ব্যর্থ হয়েছে। ইমেইল আইডি বা পাসওয়ার্ড ভুল।";
      toast.error(` ${fallback}`, { className: "custom-error-toast" });
    }
    
  };

  return (
    <div className="register-container">
      <Navbarhome />
      <div className="register-wrapper">
        {/* Left Feature Card */}
        <motion.div
          className="feature-card"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <img
            src="/assets/images/login.png"
            alt="Login Info"
            className="feature-image"
          />
          <h3>
            {language === "English"
              ? "Why Log in to Your Account?"
              : "কেন লগইন করবেন?"}
          </h3>
          <ul>
            {language === "English" ? (
              <>
                <li>Access your surveys anytime</li>
                <li>Edit forms and manage responses</li>
                <li>See visualizations and reports</li>
                <li>Secure and private login</li>
              </>
            ) : (
              <>
                <li>যেকোনো সময় আপনার সার্ভে অ্যাক্সেস করুন</li>
                <li>ফর্ম এডিট করুন ও উত্তর ম্যানেজ করুন</li>
                <li>গ্রাফ ও রিপোর্ট দেখুন</li>
                <li>নিরাপদ ও ব্যক্তিগত লগইন</li>
              </>
            )}
          </ul>
        </motion.div>

        {/* Right Login Form */}
        <motion.div
          className="register-box"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h2 className="register-title">
            {language === "English"
              ? "Login to Your Account"
              : "আপনার অ্যাকাউন্টে লগইন করুন"}
          </h2>
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              name="email"
              placeholder={
                language === "English" ? "Email Address" : "ইমেইল ঠিকানা"
              }
              value={formData.email}
              onChange={handleChange}
              required
            />
            {emailError && <p className="error-message">{emailError}</p>}

            <input
              type="password"
              name="password"
              placeholder={language === "English" ? "Password" : "পাসওয়ার্ড"}
              value={formData.password}
              onChange={handleChange}
              required
            />

            <button type="submit" className="register-button">
              {language === "English" ? "Log In" : "লগ ইন"}
            </button>
          </form>

          <p className="login-link">
            {language === "English" ? (
              <>
                Don’t have an account? <a href="/signup">Sign up</a>
              </>
            ) : (
              <>
                অ্যাকাউন্ট নেই? <a href="/signup">সাইন আপ করুন</a>
              </>
            )}
          </p>

          <div className="language-toggle-register">
            <label className="switch">
              <input
                type="checkbox"
                onChange={toggleLanguage}
                checked={language === "বাংলা"}
              />
              <span className="slider"></span>
            </label>
            <div className="language-labels">
              <span className={language === "English" ? "active" : ""}>
                English
              </span>
              <span className={language === "বাংলা" ? "active" : ""}>
                বাংলা
              </span>
            </div>
          </div>
        </motion.div>
      </div>
      <ToastContainer
        position="top-center"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        toastClassName="custom-success-toast"
      />
    </div>
  );
};

export default Login;
