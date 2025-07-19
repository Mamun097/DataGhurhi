const express = require('express');
const router = express.Router();
const registerController = require('../controller/registercontroller');


router.post("/check-email", registerController.checkEmail);

router.post('/', registerController.register);
module.exports = router;
