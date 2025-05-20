[
  {
  "id": 1,
  "meta": {
    "tags": ["communication", "preference"],
    "options": [
      { "text": "Email", "value": 0 },
      { "text": "Phone", "value": 0 },
      { "text": "Text", "value": 0 },
      { "text": "Video Call", "value": 0 }
    ]
  },
  "text": "What is your preferred communication method?",
  "type": "radio",
  "image": null,
  "section": 1,
  "subText": "",
  "required": false,
  "multipleSelection": false
},
  {
    "id": 2,
    "meta": {
      "tags": [
        "design",
        "resources",
        "quality"
      ],
      "scale": 5
    },
    "text": "How would you rate the quality of our design resources?",
    "type": "rating",
    "section": 1,
    "required": false,
    "multipleSelection": false
  },
  {
    "id": 3,
    "meta": {
      "tags": [
        "design",
        "workshop",
        "conference",
        "attendance"
      ],
      "dateType": "date"
    },
    "text": "When was the last time you attended a design workshop or conference?",
    "type": "datetime",
    "section": 1,
    "required": false,
    "multipleSelection": false
  },
  {
    "id": 4,
    "meta": {
      "tags": [
        "design",
        "conference",
        "preference"
      ],
      "options": [
        "UI/UX Design",
        "Graphic Design",
        "Web Design",
        "Product Design"
      ]
    },
    "text": "Which type of design conference would you prefer?",
    "type": "dropdown",
    "section": 1,
    "required": false,
    "multipleSelection": false
  },
  {
    "id": 5,
    "meta": {
      "max": 5,
      "min": 1,
      "tags": [
        "workshop",
        "speaker",
        "presentation",
        "skills"
      ],
      "leftLabel": "Poor",
      "rightLabel": "Excellent"
    },
    "text": "Rate the presentation skills of the last workshop speaker you attended",
    "type": "linearScale",
    "section": 1,
    "required": false,
    "multipleSelection": false
  },
  {
    "id": 6,
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
    "id": 7,
    "meta": {
      "tags": [
        "design",
        "improvement",
        "skills"
      ],
      "options": []
    },
    "text": "What areas of design do you want to improve in?",
    "type": "text",
    "section": 1,
    "subText": "",
    "required": false,
    "multipleSelection": false
  },
  {
    "id": 8,
    "meta": {
      "tags": [
        "career",
        "goals",
        "future"
      ],
      "options": []
    },
    "text": "What are your future career goals?",
    "type": "text",
    "section": 1,
    "subText": "",
    "required": true,
    "multipleSelection": false
  },
  {
    "id": 9,
    "meta": {
      "tags": [
        "design",
        "process",
        "satisfaction"
      ],
      "scale": 10
    },
    "text": "How satisfied are you with the current design process at your company?",
    "type": "rating",
    "section": 1,
    "subText": "",
    "required": true,
    "multipleSelection": false
  },
{
  "id": 10,
  "meta": {
    "tags": ["design", "team", "recommendation"],
    "options": [
      { "text": "Yes", "value": 0 },
      { "text": "No", "value": 0 }
    ]
  },
  "text": "Would you recommend working in your design team to others?",
  "type": "radio",
  "section": 1,
  "subText": "",
  "required": true,
  "multipleSelection": false
}
]