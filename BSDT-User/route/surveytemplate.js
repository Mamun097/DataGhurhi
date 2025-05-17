const express = require('express');
const router = express.Router();
const surveyTemplateController = require('../controller/surveytemplatecontroller');
const { jwtAuthMiddleware } = require('../auth/authmiddleware');

router.put('/', jwtAuthMiddleware, surveyTemplateController.createSurveyForm);
router.put('/save', jwtAuthMiddleware, surveyTemplateController.saveSurveyForm);

module.exports = router;