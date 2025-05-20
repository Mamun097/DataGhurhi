const express = require('express');
const router = express.Router();
const surveyTemplateController = require('../controller/surveytemplatecontroller');
const { jwtAuthMiddleware } = require('../auth/authmiddleware');


// Route to create a survey template
router.post('/', surveyTemplateController.createSurveyTemplate);
router.delete('/:survey_id', jwtAuthMiddleware, surveyTemplateController.deleteSurveyForm);
module.exports = router;