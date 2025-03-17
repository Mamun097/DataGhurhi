const express = require('express');
const router = express.Router();
const loginController = require('../controller/logincontroller');

router.post('/', loginController.login);

module.exports = router;