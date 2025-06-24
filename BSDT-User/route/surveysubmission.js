const express = require('express');
const router = express.Router();
const surveySubmissionController = require('../controller/surveysubmissioncontroller');
const { jwtAuthMiddleware, optionalJwtAuthMiddleware } = require('../auth/authmiddleware');

router.post('/:slug', optionalJwtAuthMiddleware, surveySubmissionController.submitSurvey);

module.exports = router;