const express = require("express");
const router = express.Router();
const fetchSurveyUserController = require("../controller/fetchsurveyusercontroller");
const { jwtAuthMiddleware, optionalJwtAuthMiddleware } = require('../auth/authmiddleware');

//!Fetch survey user
router.get("/:slug", optionalJwtAuthMiddleware, fetchSurveyUserController.fetchSurveyUser);
module.exports = router;
