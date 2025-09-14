const express = require("express");
const router = express.Router();
const voucherController = require("../controller/vouchercontroller");


router.get('/vouchers', voucherController.getAllVouchers);
router.get('/voucher-usage', voucherController.getAllVoucherUsageInfo);
router.get('/vouchers/active', voucherController.getActiveVouchers);
router.get('/vouchers/public', voucherController.getPublicVouchers);

module.exports = router;
