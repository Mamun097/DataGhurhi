//profile route for user

const express = require('express');
const router = express.Router();
const profileController = require('../controller/profilecontroller');
const { jwtAuthMiddleware } = require('../auth/authmiddleware');

router.get('/', jwtAuthMiddleware, profileController.profile);
router.put('/update-profile-image', jwtAuthMiddleware, profileController.updateProfileImage);
router.put('/update-profile', jwtAuthMiddleware, profileController.updateProfile);
router.delete('/delete-profile', jwtAuthMiddleware, profileController.deleteProfile);
router.put('/update-password', jwtAuthMiddleware, profileController.updatePassword);

module.exports = router;