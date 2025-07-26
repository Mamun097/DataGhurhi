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
router.get("/admin/get-package-items", adminController.getAllPackageItems);
router.get("/admin/get-validity-periods", adminController.getAllValidityPeriods);
router.get("/admin/get-unit-price", adminController.getUnitPrices);
router.get("/admin/get-validity-price-multiplier", adminController.getValidityPeriods);
router.post("/admin/update-unit-price/:id", adminController.updateUnitPrice);
router.post("/admin/update-validity/:id", adminController.updateValidityPeriod);
router.post("/admin/create-validity", adminController.createValidityPeriod);
router.delete("/admin/delete-validity/:id", adminController.deleteValidityPeriod);

module.exports = router;