import React, { useState } from "react";
import axios from 'axios';
import { motion } from "framer-motion";
import "./Login.css";
import Navbarhome from "../Homepage/navbarhome";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [emailError, setEmailError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({ ...formData, [name]: value });

    // Email Validation
    if (name === "email") {
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailPattern.test(value)) {
        setEmailError("Invalid email address");
      } else {
        setEmailError("");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData.email);
    console.log(formData.password);
    if (emailError) {
      alert("Please enter a valid email before logging in.");
      return;
    }
    try {
      const response = await axios.post('http://localhost:2000/api/login', {
        email: formData.email,
        password: formData.password,
        
      });
      console.log(response);

      if (response.status === 200) {
        console.log(response.data.message);
        alert(`Logged in successfully: ${formData.email}`);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('role', "user");
        localStorage.setItem('user', JSON.stringify(response.data.user));
        window.location.href = '/dashboard';

      } else {
        setErrorMessage(response.data.error);
      }
    } catch (error) {
       console.log('error');
      console.error('Error:', error);
    }
    
  };

  return (
    <div className="login-container">
      <Navbarhome />
      <motion.div
        className="login-box"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <h2 className="login-title">Login to Your Account</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
          />
          {emailError && <p className="error-message">{emailError}</p>}

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <button type="submit" className="login-button">
            Log In
          </button>
        </form>
        <p className="register-link">
          Don't have an account? <a href="/register">Sign up</a>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
