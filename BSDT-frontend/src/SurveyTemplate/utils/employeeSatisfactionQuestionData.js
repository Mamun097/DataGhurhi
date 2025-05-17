[
  {
    "id": 1,
    "meta": {
      "rows": [
        "Frontend",
        "Backend",
        "Database",
        "Version Control"
      ],
      "tags": [
        "web development",
        "tools",
        "categories"
      ],
      "columns": [
        "Tool 1",
        "Tool 2",
        "Tool 3"
      ]
    },
    "text": "What tools do you use for web development?",
    "type": "tickboxGrid",
    "image": null,
    "section": 1,
    "subText": "Please select one tool for each category.",
    "required": false,
    "multipleSelection": true
  },
  {
    "id": 2,
    "meta": {
      "tags": [
        "programming",
        "languages",
        "skills"
      ],
      "options": [
        "JavaScript",
        "Python",
        "Java",
        "C++",
        "Go"
      ]
    },
    "text": "Which programming languages do you use regularly?",
    "type": "checkbox",
    "image": null,
    "section": 1,
    "subText": "",
    "required": false,
    "multipleSelection": true
  },
  {
    "id": 3,
    "meta": {
      "tags": [
        "experience",
        "career",
        "professional"
      ],
      "options": [
  { "text": "Less than 1 year", "value": 0 },
  { "text": "1-3 years", "value": 1 },
  { "text": "4-6 years", "value": 2 },
  { "text": "7+ years", "value": 3 }
]

    },
    "text": "How many years of experience do you have?",
    "type": "radio",
    "image": null,
    "section": 1,
    "subText": "",
    "required": false,
    "multipleSelection": false
  },
  {
    "id": 4,
    "meta": {
      "rows": [
        "There are opportunities for professional growth",
        "My organisation is dedicated to my professional development",
        "My organisation offers job-related training"
      ],
      "tags": [
        "career",
        "professional development",
        "opportunities"
      ],
      "columns": [
        "Strongly Disagree",
        "Disagree",
        "Neutral",
        "Agree",
        "Strongly Agree"
      ]
    },
    "text": "How strongly do you agree or disagree with the following statements around career opportunities?",
    "type": "likert",
    "image": null,
    "section": 1,
    "subText": "",
    "required": false,
    "multipleSelection": false
  },
  {
    "id": 5,
    "meta": {
      "tags": [
        "feedback",
        "open-ended"
      ],
      "options": []
    },
    "text": "Any other feedback you want to provide?",
    "type": "text",
    "image": null,
    "section": 1,
    "subText": "",
    "required": false,
    "multipleSelection": false
  },
  {
    "id": 6,
    "meta": {
      "tags": [
        "event",
        "rating",
        "feedback"
      ],
      "scale": 5
    },
    "text": "How would you rate the event overall?",
    "type": "rating",
    "image": null,
    "section": 1,
    "subText": "",
    "required": false,
    "multipleSelection": false
  },
  {
    "id": 7,
    "meta": {
      "tags": [
        "event",
        "date",
        "attendance"
      ],
      "dateType": "date"
    },
    "text": "When did the event take place?",
    "type": "datetime",
    "image": null,
    "section": 1,
    "subText": "",
    "required": false,
    "multipleSelection": false
  },
  {
    "id": 8,
    "meta": {
      "tags": [
        "event",
        "session",
        "attendance"
      ],
      "options": [
        "Session 1",
        "Session 2",
        "Session 3"
      ]
    },
    "text": "Which session did you attend?",
    "type": "dropdown",
    "image": null,
    "section": 1,
    "subText": "",
    "required": false,
    "multipleSelection": false
  },
  {
    "id": 9,
    "meta": {
      "max": 5,
      "min": 1,
      "tags": [
        "speaker",
        "performance",
        "event"
      ],
      "leftLabel": "Poor",
      "rightLabel": "Excellent"
    },
    "text": "Rate the speaker's performance",
    "type": "linearScale",
    "image": null,
    "section": 1,
    "subText": "",
    "required": false,
    "multipleSelection": false
  }
]