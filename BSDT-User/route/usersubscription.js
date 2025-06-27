const express = require("express");
const router = express.Router();
const adminController = require("../controller/usersubscription");
const { jwtAuthMiddleware } = require('../auth/authmiddleware');

router.get("/get-user-packages/", jwtAuthMiddleware, adminController.getUserPackages);
router.get("/reduce-question-count", jwtAuthMiddleware, adminController.reduceQuestionCount);
router.get("/reduce-survey-count", jwtAuthMiddleware, adminController.reduceSurveyCount);
router.get("/reduce-tag-count", jwtAuthMiddleware, adminController.reduceTagCount);

module.exports = router;