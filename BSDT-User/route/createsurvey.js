const express = require('express');
const router = express.Router();
const createSurveyController = require('../controller/createsurveycontroller');

// Route to get saved templates
router.get('/', createSurveyController.getsavedtemplate);

module.exports = router;