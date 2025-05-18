const express = require("express");
const router = express.Router();
const generate_question_with_llm = require("../controller/generatequestionwithllm");

//!Generate question tags with LLM
router.post("/generate-question-with-llm/", generate_question_with_llm.generateQuestionWithLLM);

module.exports = router;