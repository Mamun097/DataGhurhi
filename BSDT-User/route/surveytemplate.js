const express = require('express');
const router = express.Router();
const surveyTemplateController = require('../controller/surveytemplatecontroller');
const { jwtAuthMiddleware } = require('../auth/authmiddleware');

router.put('/', jwtAuthMiddleware, surveyTemplateController.createSurveyForm);
router.put('/save', jwtAuthMiddleware, surveyTemplateController.saveSurveyForm);
router.delete('/:survey_id', jwtAuthMiddleware, surveyTemplateController.deleteSurveyForm);
router.get('/:survey_id', jwtAuthMiddleware, surveyTemplateController.getSurvey);

module.exports = router;