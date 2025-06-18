const express = require("express");
const router = express.Router();
const generate_question_with_llm = require("../controller/generatequestionwithllm");
const { generateMultipleQuestionsWithLLM } = require("../controller/generateMultipleQuestionsWithLLM");

//!Generate question tags with LLM
router.post("/generate-question-with-llm/", generate_question_with_llm.generateQuestionWithLLM);
router.post("/generate-multiple-questions-with-llm", generateMultipleQuestionsWithLLM);

module.exports = router;