const express = require('express');
const router = express.Router();
const projectController = require('../controller/projectcontroller');
const { jwtAuthMiddleware } = require('../auth/authmiddleware');
// role checking middl
router.get('/', jwtAuthMiddleware, projectController.allprojectviewUser);
router.get('/:projectID', jwtAuthMiddleware, projectController.projectData);
router.put( '/:projectID/update-project', jwtAuthMiddleware, projectController.updateProject);
router.post('/create-project', jwtAuthMiddleware, projectController.createProject);
router.delete('/:projectID/delete-project', jwtAuthMiddleware, projectController.deleteProject);
router.get('/:projectID/surveys', jwtAuthMiddleware, projectController.getAllSurveys);
router.post('/:projectID/create-survey', jwtAuthMiddleware, projectController.createSurvey);
//collaborator
router.post('/:projectID/invite-collaborator', jwtAuthMiddleware, projectController.inviteCollaborator);
router.get('/:projectID/collaborators', jwtAuthMiddleware, projectController.getCollaborators);
router.delete('/:projectID/collaborators/:collaboratorId', jwtAuthMiddleware, projectController.removeCollaborator);

module.exports = router;