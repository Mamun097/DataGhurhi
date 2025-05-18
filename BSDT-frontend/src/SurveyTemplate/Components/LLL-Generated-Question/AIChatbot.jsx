import React, { useState, useEffect, useRef } from "react";
import "./ChatbotLoading.css"

const AIChatbot = ({ onClose, onGenerate }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [currentStep, setCurrentStep] = useState("greeting");
  const [questionType, setQuestionType] = useState(null);
  const [metadata, setMetadata] = useState({});
  const [additionalInfo, setAdditionalInfo] = useState("");
  const chatContainerRef = useRef(null);

  const questionTypes = [
    { id: "radio", label: "MCQ" },
    { id: "text", label: "Text" },
    { id: "rating", label: "Rating" },
    { id: "linearScale", label: "Linear Scale" },
    { id: "checkbox", label: "Checkbox" },
    { id: "dropdown", label: "Dropdown" },
    { id: "datetime", label: "Date/Time" },
    { id: "likert", label: "Likert Scale" },
    { id: "tickboxGrid", label: "Multiple Choice Grid" }
  ];

  useEffect(() => {
    // Initial greeting message
    setMessages([
      {
        sender: "bot",
        text: "Hi there! I can help you generate survey questions. What type of question would you like to create?",
        options: questionTypes.map(type => ({ id: type.id, label: type.label }))
      }
    ]);
  }, []);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleOptionSelect = (optionId) => {
    const selectedType = questionTypes.find(type => type.id === optionId);

    setQuestionType(optionId);
    addMessage("user", selectedType.label);

    // Ask for metadata based on question type
    setCurrentStep("metadata");
    let nextMessage = "";
    let nextOptions = [];

    switch (optionId) {
      case "radio":
      case "checkbox":
      case "dropdown":
        nextMessage = `How many options would you like for your ${selectedType.label} question?`;
        nextOptions = [
          { id: "2", label: "2 options" },
          { id: "3", label: "3 options" },
          { id: "4", label: "4 options" },
          { id: "5", label: "5 options" },
          { id: "custom", label: "Custom number" }
        ];
        break;
      case "linearScale":
        nextMessage = "What range would you like for your Linear Scale?";
        nextOptions = [
          { id: "1-5", label: "1 to 5" },
          { id: "1-10", label: "1 to 10" },
          { id: "0-5", label: "0 to 5" },
          { id: "custom", label: "Custom range" }
        ];
        break;
      case "rating":
        nextMessage = "How many stars would you like for your Rating question?";
        nextOptions = [
          { id: "5", label: "5 stars" },
          { id: "7", label: "7 stars" },
          { id: "10", label: "10 stars" }
        ];
        break;
      case "likert":
        nextMessage = "What size grid would you like for your Likert Scale?";
        nextOptions = [
          { id: "3x3", label: "3 rows x 3 columns" },
          { id: "4x4", label: "4 rows x 4 columns" },
          { id: "5x3", label: "5 rows x 3 columns" },
          { id: "custom", label: "Custom dimensions" }
        ];
        break;
      case "tickboxGrid":
        nextMessage = "What size grid would you like for your Multiple Choice Grid?";
        nextOptions = [
          { id: "3x3", label: "3 rows x 3 columns" },
          { id: "4x4", label: "4 rows x 4 columns" },
          { id: "5x3", label: "5 rows x 3 columns" },
          { id: "custom", label: "Custom dimensions" }
        ];
        break;
      case "text":
      case "datetime":
        // These types don't need additional metadata
        nextMessage = "Being an LLM model, I can generate your desired question if you provide me the best contexts. Would you like to provide any additional context or specifications for this question? (Optional)";
        setCurrentStep("additionalInfo");
        break;
    }

    addMessage("bot", nextMessage, nextOptions);
  };

  const handleMetadataSelect = (optionId) => {
    addMessage("user", optionId);

    if (optionId === "custom") {
      addMessage("bot", "Please type in your custom value:");
      return;
    }

    // Process the selected metadata
    switch (questionType) {
      case "radio":
      case "checkbox":
      case "dropdown":
        setMetadata({ numOptions: parseInt(optionId) });
        break;
      case "linearScale":
        const [min, max] = optionId.split("-").map(Number);
        setMetadata({ min, max });
        break;
      case "rating":
        setMetadata({ scale: parseInt(optionId) });
        break;
      case "likert":
        const [rows_count, cols_count] = optionId.split("x").map(Number);
        setMetadata({ rows_count, cols_count });
        break;
      case "tickboxGrid":
        const [rows, cols] = optionId.split("x").map(Number);
        setMetadata({ rows, cols });
        break;
    }

    // Move to additional info step
    setCurrentStep("additionalInfo");
    addMessage("bot", "Being an LLM model, I can generate your desired question if you provide me the best contexts. Would you like to provide any additional context or specifications for this question? (Optional)");
  };

  const handleCustomMetadata = (value) => {
    let processedValue;
    let updatedMetadata = {};

    switch (questionType) {
      case "radio":
      case "checkbox":
      case "dropdown":
        processedValue = parseInt(value);
        updatedMetadata = { numOptions: processedValue };
        break;
      case "linearScale":
        const [min, max] = value.split("-").map(Number);
        updatedMetadata = { min, max };
        break;
      case "rating":
        processedValue = parseInt(value);
        updatedMetadata = { scale: processedValue };
        break;
      case "likert":
        const [rows_count, cols_count] = value.split("x").map(Number);
        updatedMetadata = { rows_count, cols_count };
        break;
      case "tickboxGrid":
        const [rows, cols] = value.split("x").map(Number);
        updatedMetadata = { rows, cols };
        break;
    }

    setMetadata(updatedMetadata);
    setCurrentStep("additionalInfo");
    addMessage("bot", "Being an LLM model, I can generate your desired question if you provide me the best contexts. Would you like to provide any additional context or specifications for this question? (Optional)");
  };

  const handleAdditionalInfo = (info) => {
    setAdditionalInfo(info);
    // No longer adding user message here - it will be handled by handleInputSubmit
    addMessage("bot", "Great! I have everything I need. Click 'Generate Question' when you're ready.");
    setCurrentStep("generate");
  };

  const addMessage = (sender, text, options = []) => {
    setMessages(prev => [...prev, { sender, text, options }]);
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleInputSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userInput = input.trim();
    addMessage("user", userInput);
    setInput("");

    if (currentStep === "metadata" && questionType) {
      handleCustomMetadata(userInput);
    } else if (currentStep === "additionalInfo") {
      handleAdditionalInfo(userInput);
    }
  };

  const handleGenerate = () => {
    const questionData = {
      type: questionType,
      metadata: metadata,
      additionalInfo: additionalInfo
    };

    onGenerate(questionData);
  };

  const handleSkip = () => {
    if (currentStep === "additionalInfo") {
      setAdditionalInfo("");
      addMessage("user", "Skip additional information");
      addMessage("bot", "No problem! I have everything I need. Click 'Generate Question' when you're ready.");
      setCurrentStep("generate");
    }
  };

  return (
    <div className="ai-chatbot-container">
      <div className="chatbot-header">
        <h5>AI Question Generator</h5>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="chatbot-messages" ref={chatContainerRef}>
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.sender}`}>
            <div className="message-content">
              {message.text}
            </div>

            {message.options && message.options.length > 0 && (
              <div className="options-container">
                {message.options.map(option => (
                  <button
                    key={option.id}
                    className="option-btn"
                    onClick={() => {
                      if (currentStep === "greeting") {
                        handleOptionSelect(option.id);
                      } else if (currentStep === "metadata") {
                        handleMetadataSelect(option.id);
                      }
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <form className="chatbot-input" onSubmit={handleInputSubmit}>
        {currentStep !== "generate" ? (
          <>
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Type your response..."
              disabled={currentStep === "greeting" || (currentStep === "metadata" && !messages.some(m => m.options && m.options.some(o => o.id === "custom")))}
            />
            <button type="submit" disabled={!input.trim() && currentStep !== "additionalInfo"}>Send</button>
            {currentStep === "additionalInfo" && (
              <button type="button" onClick={handleSkip}>Skip</button>
            )}
          </>
        ) : (
          <button
            type="button"
            className="generate-btn"
            onClick={handleGenerate}
          >
            Generate Question
          </button>
        )}
      </form>
    </div>
  );
};

export default AIChatbot;