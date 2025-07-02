const express = require('express');
const router = express.Router();
const collaboratorController = require('../controller/surveyCollabController');
const { jwtAuthMiddlewareSurvey} = require('../auth/authmiddleware');
const { jwtAuthMiddleware } = require('../auth/authmiddleware');


// accept invitation
router.post('/:surveyID/accept-invitation', jwtAuthMiddlewareSurvey, collaboratorController.acceptInvitation);
// reject invitation
router.post('/:surveyID/decline-invitation', jwtAuthMiddlewareSurvey, collaboratorController.rejectInvitation);

// get all invitations for a collaborator
router.get('/all-invitations', jwtAuthMiddlewareSurvey, collaboratorController.getallInvitations);
// get all projects for a collaborator
router.get('/all-survey-collaborators', jwtAuthMiddlewareSurvey, collaboratorController.allSurveyCollaborator);
// send collaboration request
router.post('/send-survey-collaboration-request', jwtAuthMiddleware, collaboratorController.sendSurveyCollaborationRequest);
module.exports = router;