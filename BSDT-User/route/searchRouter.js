const express = require('express');
const router = express.Router();
const searchController = require('../controller/searchController');

// Matches GET /api/search?query=...&filter=...
router.get('/', searchController.performSearch);

module.exports = router;
