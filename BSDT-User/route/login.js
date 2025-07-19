const express = require('express');
const router = express.Router();
const loginController = require('../controller/logincontroller');

router.post('/', loginController.login);
router.post('/reset-password', loginController.resetPassword);

module.exports = router;