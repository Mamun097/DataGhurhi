const express = require("express");
const router = express.Router();
const automaticQuestionTagController = require("../controller/automaticquestiontagcontroller");

//!Generate question tags with LLM
router.post("/generate-tags/", automaticQuestionTagController.generateTagsForQuestion);
router.get("/", automaticQuestionTagController.getAllTags);

module.exports = router;