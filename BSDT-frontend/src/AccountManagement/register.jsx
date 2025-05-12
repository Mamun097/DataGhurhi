import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import "./register.css";
import Navbarhome from "../Homepage/navbarhome";
import { ToastContainer, toast } from "react-toastify";


const Register = () => {
  const [language, setLanguage] = useState("English");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (emailError) {
      toast.error(
        language === "English"
          ? "❌ Please enter a valid email before submitting."
          : "❌ সাবমিট করার আগে একটি বৈধ ইমেইল দিন।",
        { className: "custom-error-toast" }
      );
      return;
    }
  
    if (formData.password !== formData.confirmPassword) {
      const msg =
        language === "English"
          ? "❌ Passwords do not match."
          : "❌ পাসওয়ার্ড মিলছে না।";
      setErrorMessage(msg);
      toast.error(msg, { className: "custom-error-toast" });
      return;
    }
  
    setIsLoading(true);
  
    try {
      const response = await axios.post("http://localhost:2000/api/register", {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
      });
  
      if (response.status === 201) {
        toast.success(
          language === "English"
            ? `🎉 Registered Successfully: Account name: ${formData.firstName} ${formData.lastName}`
            : `🎉 সফলভাবে রেজিস্ট্রেশন সম্পন্ন হয়েছে: একাউন্টের নাম ${formData.firstName} ${formData.lastName}`,
          { className: "custom-success-toast" }
        );
  
        setTimeout(() => {
          window.location.href = "/login";
        }, 3000);
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.error ||
        (language === "English"
          ? "❌ Something went wrong."
          : "❌ কিছু একটা ভুল হয়েছে।");
  
      setErrorMessage(errorMsg);
      toast.error(errorMsg, { className: "custom-error-toast" });
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <div className="register-container">
      <Navbarhome />
      <div className="register-wrapper">
        {/* Left Info Card */}
        <motion.div
          className="feature-card"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Inserted Image */}
          <img
            src="/assets/images/register.png" // ✅ Replace with your actual image path
            alt="Account Benefits"
            className="feature-image"
          />

          <h3>
            {language === "English"
              ? "Why Create an Account?"
              : "কেন একটি অ্যাকাউন্ট তৈরি করবেন?"}
          </h3>

          <ul>
            {language === "English" ? (
              <>
                <li>Create smart surveys effortlessly and share them easily</li>
                <li>Collaborate with your team in real-time</li>
                <li>Access data analysis and charts</li>
                <li>Save progress, track deadlines and manage responses</li>
                <li>Generate reports in English & Bangla</li>
              </>
            ) : (
              <>
                <li>সহজেই স্মার্ট সার্ভে তৈরি করুন এবং সহজেই বিতরণ করুন</li>
                <li>দলের সাথে রিয়েলটাইমে কাজ করুন </li>
                <li>তথ্য বিশ্লেষণ ও গ্রাফ দেখুন</li>
                <li>উত্তর সংরক্ষণ, ব্যবস্থাপনা ও ডেডলাইন ট্র্যাক করুন</li>
                <li>বাংলা ও ইংরেজিতে রিপোর্ট তৈরি করুন</li>
              </>
            )}
          </ul>

          {/* Language Toggle */}
        </motion.div>

        {/* Right Registration Form */}
        <motion.div
          className="register-box"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h2 className="register-title">
            {language === "English"
              ? "Create an Account"
              : "একটি অ্যাকাউন্ট তৈরি করুন"}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="name-fields">
              <input
                type="text"
                name="firstName"
                placeholder={
                  language === "English" ? "First Name" : "নামের প্রথম অংশ"
                }
                value={formData.firstName}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="lastName"
                placeholder={
                  language === "English" ? "Last Name" : "নামের শেষ অংশ"
                }
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>

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
            <input
              type="password"
              name="confirmPassword"
              placeholder={
                language === "English"
                  ? "Confirm Password"
                  : "পাসওয়ার্ড নিশ্চিত করুন"
              }
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />

            <button type="submit" className="register-button">
              {language === "English" ? "Sign Up" : "সাইন আপ"}
            </button>
          </form>
          <p className="login-link">
            {language === "English" ? (
              <>
                Already have an account? <a href="/login">Log in</a>
              </>
            ) : (
              <>
                ইতিমধ্যে অ্যাকাউন্ট রয়েছে? <a href="/login">লগ ইন করুন</a>
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
      {/* 
      {errorMessage && (
        <div className="error-toast">
          {language === "English" ? errorMessage : "কিছু ভুল হয়েছে।"}
        </div>
      )} */}
    </div>
  );
};

export default Register;
