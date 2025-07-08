const express = require('express');
const router = express.Router();
const faqController = require('../controller/faqController');

// Matches GET /api/faq
router.get('/', faqController.getAllFaqs);

// Matches POST /api/faq
router.post('/', faqController.createFaq);

module.exports = router;
