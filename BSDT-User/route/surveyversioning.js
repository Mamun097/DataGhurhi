const express = require("express");
const router = express.Router();
const versionController = require("../controller/surveyversioncontroller");

// ✅ Get project version history
router.get("/survey-version-history/:surveyId", versionController.getVersionHistory);

// ✅ Rollback to the latest version
router.post("/survey-rollback/latest", versionController.rollbackToLatestVersion);

// ✅ Rollback to a specific version
router.post("/survey-rollback/specific", versionController.rollbackToSpecificVersion);

module.exports = router;
