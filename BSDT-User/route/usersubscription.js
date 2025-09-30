const express = require("express");
const router = express.Router();
const userSubscription = require("../controller/usersubscription");
const { jwtAuthMiddleware } = require('../auth/authmiddleware');

router.get("/get-user-packages/", jwtAuthMiddleware, userSubscription.getUserPackages);
router.get("/reduce-question-count", jwtAuthMiddleware, userSubscription.reduceQuestionCount);
router.get("/reduce-survey-count", jwtAuthMiddleware, userSubscription.reduceSurveyCount);
router.get("/reduce-tag-count", jwtAuthMiddleware, userSubscription.reduceTagCount);
router.post("/subscription/create", userSubscription.createSubscription);
router.post("/voucher-used/create", userSubscription.createVoucherUsage);

module.exports = router;