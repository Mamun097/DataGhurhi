const express = require("express");
const router = express.Router();
const fetchSurveyUserController = require("../controller/fetchsurveyusercontroller");
const { jwtAuthMiddleware } = require("../auth/authmiddleware");

//!Fetch survey user
router.get("/:slug", jwtAuthMiddleware, fetchSurveyUserController.fetchSurveyUser);
module.exports = router;
