//profile route for user

const express = require('express');
const router = express.Router();
const profileController = require('../controller/profilecontroller');
const { jwtAuthMiddleware } = require('../auth/authmiddleware');

router.get('/', jwtAuthMiddleware, profileController.profile);
router.put('/update-profile-image', jwtAuthMiddleware, profileController.updateProfileImage);
module.exports = router;