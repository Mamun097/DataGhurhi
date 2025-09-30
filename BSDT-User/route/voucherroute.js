const express = require("express");
const router = express.Router();
const voucherController = require("../controller/vouchercontroller");
const { jwtAuthMiddleware } = require('../auth/authmiddleware');


router.get('/vouchers', voucherController.getAllVouchers);
router.get('/voucher-usage', voucherController.getAllVoucherUsageInfo);
router.get('/vouchers/active', voucherController.getActiveVouchers);
router.get('/vouchers/public', jwtAuthMiddleware, voucherController.getPublicVouchers);

router.post('/vouchers/validate', jwtAuthMiddleware, voucherController.validateVoucher);

module.exports = router;