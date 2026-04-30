const express = require('express');
const router = express.Router();
const {
  getActivePlans,
  createOrder,
  verifyPayment
} = require('../../controllers/vendorControllers/subscriptionController');

// These routes don't necessarily need full auth if they are reached during the setup flow,
// but it's better to keep them protected if possible.
// For now, let's keep them open as they are handled during the registration/setup redirection.

router.get('/plans', getActivePlans);
router.post('/create-order', createOrder);
router.post('/verify-payment', verifyPayment);

module.exports = router;
