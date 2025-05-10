const express = require('express');
const router = express.Router();
const surveyTemplateController = require('../controller/surveytemplatecontroller');

// Route to create a survey template
router.post('/', surveyTemplateController.createSurveyTemplate);

module.exports = router;