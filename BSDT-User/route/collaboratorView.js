const express = require('express');
const router = express.Router();
const collaboratorController = require('../controller/collabController');
const { jwtAuthMiddleware } = require('../auth/authmiddleware');

// accept invitation
router.post('/:projectID/accept-invitation', jwtAuthMiddleware, collaboratorController.acceptInvitation);
// reject invitation
router.post('/:projectID/decline-invitation', jwtAuthMiddleware, collaboratorController.rejectInvitation);
// get all invitations for a collaborator
router.get('/all-invitations', jwtAuthMiddleware, collaboratorController.getAllInvitations);
// get all projects for a collaborator
router.get('/all-projects', jwtAuthMiddleware, collaboratorController.allprojectviewCollaborator);

module.exports = router;
