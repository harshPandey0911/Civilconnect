const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/authMiddleware');
const { submitBid, getBidsForBooking, acceptBid, rejectBid } = require('../../controllers/bookingControllers/bidController');

// Vendor routes
router.post('/submit', authenticate, submitBid);

// User routes
router.get('/:bookingId', authenticate, getBidsForBooking);
router.post('/accept/:bidId', authenticate, acceptBid);
router.post('/reject/:bidId', authenticate, rejectBid);

module.exports = router;
