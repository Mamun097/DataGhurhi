// This file simulates the backend API for generating questions
// In a real implementation, this would be replaced with actual API calls

const mockQuestionGenerator = {
    generateQuestion: async (questionData) => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generate a question based on the type and metadata
      const questionId = Date.now().toString();
      const baseQuestion = {
        id: questionId,
        type: questionData.type,
        required: false,
        section: 1 // Default to first section
      };
      
      // Generate appropriate question text and metadata based on type
      switch (questionData.type) {
        case "radio":
          return {
            ...baseQuestion,
            text: generateQuestionText("radio", questionData.additionalInfo),
            options: generateOptions(questionData.metadata.numOptions || 4)
          };
          
        case "checkbox":
          return {
            ...baseQuestion,
            text: generateQuestionText("checkbox", questionData.additionalInfo),
            options: generateOptions(questionData.metadata.numOptions || 4)
          };
          
        case "dropdown":
          return {
            ...baseQuestion,
            text: generateQuestionText("dropdown", questionData.additionalInfo),
            options: generateOptions(questionData.metadata.numOptions || 4)
          };
          
        case "text":
          return {
            ...baseQuestion,
            text: generateQuestionText("text", questionData.additionalInfo)
          };
          
        case "rating":
          return {
            ...baseQuestion,
            text: generateQuestionText("rating", questionData.additionalInfo),
            scale: questionData.metadata.scale || 5
          };
          
        case "linearScale":
          return {
            ...baseQuestion,
            text: generateQuestionText("linearScale", questionData.additionalInfo),
            min: questionData.metadata.min || 1,
            max: questionData.metadata.max || 5,
            minLabel: "Not at all likely",
            maxLabel: "Extremely likely"
          };
          
        case "datetime":
          return {
            ...baseQuestion,
            text: generateQuestionText("datetime", questionData.additionalInfo)
          };
          
        case "likert":
          return {
            ...baseQuestion,
            text: "Please indicate your level of agreement with the following statements:",
            statements: generateStatements(questionData.metadata.numStatements || 3, questionData.additionalInfo),
            options: [
              { id: "1", text: "Strongly Disagree" },
              { id: "2", text: "Disagree" },
              { id: "3", text: "Neutral" },
              { id: "4", text: "Agree" },
              { id: "5", text: "Strongly Agree" }
            ]
          };
          
        case "tickboxGrid":
          return {
            ...baseQuestion,
            text: "Please select all that apply:",
            rows: generateRows(questionData.metadata.rows || 3, questionData.additionalInfo),
            columns: generateColumns(questionData.metadata.cols || 3)
          };
          
        default:
          return {
            ...baseQuestion,
            text: "Generated question"
          };
      }
    }
  };
  
  // Helper functions for generating question content
  function generateQuestionText(type, additionalInfo) {
    const info = additionalInfo ? ` about ${additionalInfo}` : "";
    
    const questions = {
      radio: [
        `Which of the following best describes your experience${info}?`,
        `What is your preferred option${info}?`,
        `How would you rate your satisfaction${info}?`,
        `What aspect${info} is most important to you?`
      ],
      checkbox: [
        `Select all that apply${info}:`,
        `Which of these have you experienced${info}?`,
        `Which features${info} would you like to see?`,
        `What improvements${info} would you recommend?`
      ],
      dropdown: [
        `Please select your preference${info}:`,
        `Which category${info} best describes you?`,
        `What is your primary interest${info}?`,
        `Which option${info} would you choose?`
      ],
      text: [
        `Please describe your experience${info}:`,
        `What are your thoughts${info}?`,
        `How would you improve${info}?`,
        `Tell us more${info}:`
      ],
      rating: [
        `How would you rate your experience${info}?`,
        `Please rate your satisfaction${info}:`,
        `How likely are you to recommend${info}?`,
        `Rate the quality${info}:`
      ],
      linearScale: [
        `How likely are you to recommend${info} to a friend or colleague?`,
        `How satisfied are you${info}?`,
        `How would you rate the importance${info}?`,
        `To what extent do you agree${info}?`
      ],
      datetime: [
        `When did you last${info}?`,
        `Please select the date${info}:`,
        `When would you prefer to${info}?`,
        `What date${info} works best for you?`
      ]
    };
    
    const questionList = questions[type] || questions.text;
    const randomIndex = Math.floor(Math.random() * questionList.length);
    return questionList[randomIndex];
  }
  
  function generateOptions(numOptions) {
    const commonOptions = [
      "Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied",
      "Excellent", "Good", "Average", "Fair", "Poor",
      "Strongly Agree", "Agree", "Neither Agree nor Disagree", "Disagree", "Strongly Disagree",
      "Always", "Often", "Sometimes", "Rarely", "Never",
      "Daily", "Weekly", "Monthly", "Quarterly", "Yearly",
      "Essential", "Important", "Somewhat Important", "Not Important", "Irrelevant"
    ];
    
    const options = [];
    for (let i = 0; i < numOptions; i++) {
      options.push({
        id: (i + 1).toString(),
        text: commonOptions[i] || `Option ${i + 1}`
      });
    }
    
    return options;
  }
  
  function generateStatements(numStatements, additionalInfo) {
    const info = additionalInfo ? ` ${additionalInfo}` : "";
    
    const commonStatements = [
      `The product${info} meets my needs.`,
      `The service${info} is easy to use.`,
      `The staff${info} was helpful and courteous.`,
      `I would recommend${info} to others.`,
      `The quality${info} exceeds my expectations.`,
      `The pricing${info} is reasonable.`,
      `The support${info} responds quickly to my needs.`,
      `The features${info} are useful to me.`,
      `The onboarding process${info} was smooth.`,
      `The documentation${info} is clear and helpful.`
    ];
    
    const statements = [];
    for (let i = 0; i < numStatements; i++) {
      statements.push({
        id: (i + 1).toString(),
        text: commonStatements[i] || `Statement ${i + 1}${info}`
      });
    }
    
    return statements;
  }
  
  function generateRows(numRows, additionalInfo) {
    const info = additionalInfo ? ` ${additionalInfo}` : "";
    
    const commonRows = [
      `Website${info}`,
      `Mobile App${info}`,
      `Customer Service${info}`,
      `Product Quality${info}`,
      `Delivery${info}`,
      `Price${info}`,
      `User Interface${info}`,
      `Features${info}`,
      `Reliability${info}`,
      `Documentation${info}`
    ];
    
    const rows = [];
    for (let i = 0; i < numRows; i++) {
      rows.push({
        id: (i + 1).toString(),
        text: commonRows[i] || `Row ${i + 1}${info}`
      });
    }
    
    return rows;
  }
  
  function generateColumns(numCols) {
    const commonColumns = [
      "Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied",
      "Excellent", "Good", "Fair", "Poor", "Terrible"
    ];
    
    const columns = [];
    for (let i = 0; i < numCols; i++) {
      columns.push({
        id: (i + 1).toString(),
        text: commonColumns[i] || `Column ${i + 1}`
      });
    }
    
    return columns;
  }
  
  export default mockQuestionGenerator;