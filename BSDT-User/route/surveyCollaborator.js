const express = require('express');
const router = express.Router();
const collaboratorController = require('../controller/surveyCollabController');
const { jwtAuthMiddlewareSurvey} = require('../auth/authmiddleware');
const { jwtAuthMiddleware } = require('../auth/authmiddleware');


// accept invitation
router.post('/:surveyID/accept-invitation', jwtAuthMiddleware, collaboratorController.acceptInvitation);
// reject invitation
router.post('/:surveyID/decline-invitation', jwtAuthMiddleware, collaboratorController.rejectInvitation);

// get all invitations for a collaborator
router.get('/all-invitations', jwtAuthMiddleware, collaboratorController.getallInvitations);
// get all survey for a collaborator
router.get('/all-collaborated-surveys', jwtAuthMiddleware, collaboratorController.allSurveyCollaborator);
// send collaboration request
router.post('/send-survey-collaboration-request', jwtAuthMiddleware, collaboratorController.sendSurveyCollaborationRequest);
// get all survey collaborators
router.get('/get-survey-collaborators/:surveyId', jwtAuthMiddleware, collaboratorController.getSurveyCollaborators);
// remove collaborator
router.delete('/:surveyId/remove-collaborator/:collaboratorId', jwtAuthMiddleware, collaboratorController.removeCollaborator);
module.exports = router;