const express = require("express");
const router = express.Router();
const adminController = require("../controller/usersubscription");
const { jwtAuthMiddleware } = require('../auth/authmiddleware');

router.get("/get-user-packages/", jwtAuthMiddleware, adminController.getUserPackages);

module.exports = router;