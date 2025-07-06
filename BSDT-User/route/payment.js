const express = require('express');
const router = express.Router();
const PaymentController = require('../controller/paymentcontroller');
const { jwtAuthMiddleware } = require('../auth/authmiddleware');

// Initiate payment
router.post('/initiate', jwtAuthMiddleware, PaymentController.initiatePayment);

// SSLCommerz success callback
router.post('/success', PaymentController.paymentSuccess);

// SSLCommerz fail callback
router.post('/fail', PaymentController.paymentFail);

// SSLCommerz cancel callback
router.post('/cancel', PaymentController.paymentCancel);

// IPN (Instant Payment Notification) callback
router.post('/ipn', PaymentController.paymentIPN);

// Get payment history (protected route)
router.get('/history', jwtAuthMiddleware, PaymentController.getPaymentHistory);

// Get transaction details (protected route)
router.get('/transaction/:transaction_id', jwtAuthMiddleware, PaymentController.getTransactionDetails);

module.exports = router;