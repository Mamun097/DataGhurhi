export const savedQuestions = [
  {
    "id": 1,
    "section": 1,
    "text": "What tools do you use for web development?",
    "subText": "Please select one tool for each category.",
    "type": "tickboxGrid",
    "meta":{
      "rows": ["Frontend", "Backend", "Database", "Version Control"],
    "columns": ["Tool 1", "Tool 2", "Tool 3"],
    },
    "multipleSelection": true,
    "required": false,
    "image": null
  },
    {
      id: 2,
      section: 1,
      text: "Which programming languages do you use regularly?",
      subText: "",
      type: "checkbox", // This ensures it's handled by your Checkbox component
      meta:{
        options: ["JavaScript", "Python", "Java", "C++", "Go"],
      },
      multipleSelection: true, // Checkboxes allow multiple selections
      required: false,
      image: null,
    },
    {
      id: 3,
      section: 1,
      text: "How many years of experience do you have?",
      subText: "",
      type: "radio",
      meta: {options: ["Less than 1 year", "1-3 years", "4-6 years", "7+ years"],},
      multipleSelection: false,
      required: false,
      image: null,
    },
    {
      id: 4,
      section: 1,
      text: "How strongly do you agree or disagree with the following statements around career opportunities?",
      meta: {
        rows: [
          "There are opportunities for professional growth",
          "My organisation is dedicated to my professional development",
          "My organisation offers job-related training",
        ],
        columns: [
          "Strongly Disagree",
          "Disagree",
          "Neutral",
          "Agree",
          "Strongly Agree",
        ],
      },
      type: "likert",
      multipleSelection: false,
      required: false,
    },
    {
      id: 5,
      section: 1,
      text: "Any other feedback you want to provide?",
      subText: "",
      type: "text",
      meta:{
        options: [],
      },
      multipleSelection: false,
      required: false,
    },
    {
      id: 6,
      section: 1,
      text: "How would you rate the event overall?",
      scale: 5,
      type: "rating",
    },
    {
      id: 7,
      section: 1,
      text: "When did the event take place?",
      meta:{
        dateType: "date",
      },
      type: "datetime",
    },
    {
      id: 8,
      section: 1,
      text: "Which session did you attend?",
      meta:{
        options: ["Session 1", "Session 2", "Session 3"],
      },
      type: "dropdown",
      image: null,
    },
    {
      id: 9,
      section: 1,
      text: "Rate the speaker's performance",
      type: "linearScale",
      meta:{
        min: 1,
        max: 5,
        leftLabel: "Poor",
        rightLabel: "Excellent",
      },
    },
  ];
  