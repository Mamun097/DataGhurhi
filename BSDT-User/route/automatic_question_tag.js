const express = require("express");
const router = express.Router();
const automaticQuestionTagController = require("../controller/automaticquestiontagcontroller");

//!Get all previous own questions
router.post("/generate-tags/", automaticQuestionTagController.generateTagsForQuestion);

module.exports = router;