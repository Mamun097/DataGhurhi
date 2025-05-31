const express = require("express");
const router = express.Router();
const adminController = require("../controller/admincontroller");

router.get("/admin/stats", adminController.getStats);
router.get("/admin/get-all-packages", adminController.getAllPackages);
router.delete("/admin/delete-package/:id", adminController.deletePackage);
router.put("/admin/update-package/:id", adminController.updatePackage);
router.post("/admin/create-package", adminController.createPackage);
router.get("/admin/most-popular-package", adminController.getMostPopularPackageId);
router.get("/admin/user-growth-stats", adminController.getUserGrowthStats);
router.get("/admin/survey-growth-stats", adminController.getSurveyGrowthStats);
module.exports = router;