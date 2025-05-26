const express = require('express');
const router = express.Router();
const surveySubmissionController = require('../controller/surveysubmissioncontroller');
const { jwtAuthMiddleware } = require('../auth/authmiddleware');

router.post('/:slug', jwtAuthMiddleware, surveySubmissionController.submitSurvey);

module.exports = router;