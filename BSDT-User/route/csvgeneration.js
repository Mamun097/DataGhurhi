const express = require('express');
const router = express.Router();
const csvGenerationController = require('../controller/csvgenerationcontroller')
const { jwtAuthMiddleware } = require("../auth/authmiddleware");

router.get('/:surveyId', jwtAuthMiddleware, csvGenerationController.getCSV);

module.exports = router;