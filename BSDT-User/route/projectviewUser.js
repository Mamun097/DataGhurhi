const express = require('express');
const router = express.Router();
const profileController = require('../controller/projectcontroller');
const { jwtAuthMiddleware } = require('../auth/authmiddleware');

router.get('/', jwtAuthMiddleware, profileController.allprojectviewUser);
router.get('/:projectID', jwtAuthMiddleware, profileController.projectData);
router.put( '/:projectID/update-project', jwtAuthMiddleware, profileController.updateProject);
router.post('/create-project', jwtAuthMiddleware, profileController.createProject);
router.delete('/:projectID/delete-project', jwtAuthMiddleware, profileController.deleteProject);
module.exports = router;