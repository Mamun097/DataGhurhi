import React from "react";
import { useState } from "react";
import AIChatbot from "./AIChatbot";
import LoadingOverlay from "./LoadingOverlay";
import "./ChatbotLoading.css"
import mockQuestionGenerator from "./mockApiService";

const AutoGeneration = ({ addGeneratedQuestion, questionInfo, getLabel}) => {
  const [showChatbot, setShowChatbot] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState("initial"); // "initial", "almost-there"

  const handleGenerateQuestion = async (questionData) => {
    setShowChatbot(false);
    setIsLoading(true);
    setLoadingPhase("initial");
    
    try {
      // Use the mock API service instead of making a real API call
    //   const generatedQuestion = await mockQuestionGenerator.generateQuestion(questionData);
    //   console.log(generatedQuestion);
      console.log("Question Data:", questionData);
      console.log("Question Info:", questionInfo);

      const response = await fetch('http://localhost:2000/api/generate-question-with-llm/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ questionData, questionInfo }),
    });

    if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
    }

    const generatedQuestion = await response.json();
    console.log(generatedQuestion);
      
      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // Show the "almost there" message
      setLoadingPhase("almost-there");
      await new Promise((resolve) => setTimeout(resolve, 4000));
      
      // Add the generated question to the survey
      addGeneratedQuestion(generatedQuestion);
      console.log("Generated question added:", generatedQuestion);
      
    } catch (error) {
      console.error("Error generating question:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        className="btn btn-outline-primary btn-lg mt-4 ms-4"
        onClick={() => setShowChatbot(true)}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="16" 
          height="16" 
          fill="currentColor" 
          className="bi bi-cpu me-2" 
          viewBox="0 0 16 16"
        >
          <path d="M5 0a.5.5 0 0 1 .5.5V2h1V.5a.5.5 0 0 1 1 0V2h1V.5a.5.5 0 0 1 1 0V2h1V.5a.5.5 0 0 1 1 0V2A2.5 2.5 0 0 1 14 4.5h1.5a.5.5 0 0 1 0 1H14v1h1.5a.5.5 0 0 1 0 1H14v1h1.5a.5.5 0 0 1 0 1H14v1h1.5a.5.5 0 0 1 0 1H14a2.5 2.5 0 0 1-2.5 2.5v1.5a.5.5 0 0 1-1 0V14h-1v1.5a.5.5 0 0 1-1 0V14h-1v1.5a.5.5 0 0 1-1 0V14h-1v1.5a.5.5 0 0 1-1 0V14A2.5 2.5 0 0 1 2 11.5H.5a.5.5 0 0 1 0-1H2v-1H.5a.5.5 0 0 1 0-1H2v-1H.5a.5.5 0 0 1 0-1H2v-1H.5a.5.5 0 0 1 0-1H2A2.5 2.5 0 0 1 4.5 2V.5A.5.5 0 0 1 5 0zm-.5 3A1.5 1.5 0 0 0 3 4.5v7A1.5 1.5 0 0 0 4.5 13h7a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 11.5 3h-7zM5 6.5A1.5 1.5 0 0 1 6.5 5h3A1.5 1.5 0 0 1 11 6.5v3A1.5 1.5 0 0 1 9.5 11h-3A1.5 1.5 0 0 1 5 9.5v-3z"/>
        </svg>
        {getLabel("Generate Question using LLM")}
      </button>
      
      {showChatbot && (
        <AIChatbot 
          onClose={() => setShowChatbot(false)} 
          onGenerate={handleGenerateQuestion}
        />
      )}
      
      {isLoading && <LoadingOverlay phase={loadingPhase} />}
    </>
  );
};

export default AutoGeneration;