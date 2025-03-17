const express = require("express");
const router = express.Router();
const versionController = require("../controller/projectversioncontroller");

// ✅ Get project version history
router.get("/version-history/:projectId", versionController.getVersionHistory);

// ✅ Rollback to the latest version
router.post("/rollback/latest", versionController.rollbackToLatestVersion);

// ✅ Rollback to a specific version
router.post("/rollback/specific", versionController.rollbackToSpecificVersion);

module.exports = router;
