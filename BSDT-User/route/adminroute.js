const express = require("express");
const router = express.Router();
const adminController = require("../controller/admincontroller");
const couponController = require("../controller/admincouponmanagecontroller");

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
router.get("/get-items-lower-limit/:validityId", adminController.getItemsLowerLimit);
router.get("/admin/revenue", adminController.getRevenueGrowthStats);

//Coupon Routes
// Add these to your routes file
router.get("/admin/coupons", couponController.getAllCoupons);
router.get("/admin/coupons/:id", couponController.getCouponById);
router.post("/admin/coupons", couponController.createCoupon);
router.put("/admin/coupons/:id", couponController.updateCoupon);
router.delete("/admin/coupons/:id", couponController.deleteCoupon);
router.patch("/admin/coupons/:id/status", couponController.toggleCouponStatus);
router.get("/admin/coupons-stats", couponController.getCouponStats);
router.get("/validate-coupon/:code", couponController.validateCoupon);

module.exports = router;