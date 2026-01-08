import { useEffect, useRef, useState } from "react";
import "./ChatbotLoading.css";

const AISurveyChatbot = ({ onClose, onGenerateSurvey , getLabel}) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState("intro");
  const [surveyMeta, setSurveyMeta] = useState({
    topic: "",
    audience: "",
    numQuestions: 10,
    questionTypes: "mixed"
  });
  const chatRef = useRef(null);

  useEffect(() => {
    setMessages([
      {
        sender: "bot",
        text: getLabel("Hi! I can generate a full survey using AI. Want to give me some info?"),
        options: [
          { id: "custom", label: "Give Info" },
          { id: "skip", label: "Let AI decide" }
        ]
      }
    ]);
  }, []);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const addMessage = (sender, text, options = []) => {
    setMessages((prev) => [...prev, { sender, text, options }]);
  };

  const handleOptionSelect = (optionId) => {
    if (step === "intro") {
      if (optionId === "skip") {
        addMessage("user", getLabel("Let AI decide"));
        addMessage("bot", getLabel("Perfect! Generating your survey..."));
        setTimeout(() => {
          onGenerateSurvey(surveyMeta); // default values
        }, 1000);
      } else {
        addMessage("user", getLabel("Give Info"));
        setStep("topic");
        addMessage("bot", getLabel("What is the topic or purpose of your survey?"));
      }
    }
  };

  const handleInputSubmit = (e) => {
    e.preventDefault();
    const value = input.trim();
    if (!value) return;
    addMessage("user", value);
    setInput("");

    if (step === "topic") {
      setSurveyMeta((prev) => ({ ...prev, topic: value }));
      setStep("audience");
      addMessage("bot", getLabel("Who is your target audience?"));
    } else if (step === "audience") {
      setSurveyMeta((prev) => ({ ...prev, audience: value }));
      setStep("numQuestions");
      addMessage("bot", getLabel("How many questions? (default is 10)"));
    } else if (step === "numQuestions") {
      const num = parseInt(value);
      setSurveyMeta((prev) => ({ ...prev, numQuestions: isNaN(num) ? 10 : num }));
      setStep("questionTypes");
      addMessage("bot", "What type of questions? (e.g., Mixed, Radio, Text, Rating, Linear Scale, Checkbox, Dropdown, Date/Time, Likert Scale, Multiple Choice Grid)");
    } else if (step === "questionTypes") {
      setSurveyMeta((prev) => ({ ...prev, questionTypes: value }));
      setStep("confirm");
      addMessage("bot", getLabel("Ready! Click 'Generate Survey' to start."));
    }
  };

  return (
    <div className="ai-chatbot-container">
      <div className="chatbot-header">
        <h5>LLM Survey Generator</h5>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="chatbot-messages" ref={chatRef}>
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            <div className="message-content">{msg.text}</div>
            {msg.options && (
              <div className="options-container-chatbot">
                {msg.options.map((opt) => (
                  <button
                    key={opt.id}
                    className="option-btn"
                    onClick={() => handleOptionSelect(opt.id)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <form className="chatbot-input" onSubmit={handleInputSubmit}>
        {step === "confirm" ? (
          <button
            type="button"
            className="generate-btn"
            onClick={() => onGenerateSurvey(surveyMeta)}
          >
            Generate Survey
          </button>
        ) : (
          <>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type here..."
              disabled={step === "intro"}
            />
            <button type="submit">Send</button>
          </>
        )}
      </form>
    </div>
  );
};

export default AISurveyChatbot;
