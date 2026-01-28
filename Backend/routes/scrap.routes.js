const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { isUser, isVendor, isAdmin } = require('../middleware/roleMiddleware');
const {
  createScrap,
  getMyScrap,
  getAvailableScrap,
  getMyAcceptedScrap,
  acceptScrap,
  completeScrap,
  getAllScrapAdmin,
  getScrapById
} = require('../controllers/scrapController');

// User Routes
router.post('/', authenticate, isUser, createScrap);
router.get('/my', authenticate, isUser, getMyScrap);

// Vendor/Admin Actions
router.put('/:id/accept', authenticate, isAdmin, acceptScrap);
router.put('/:id/complete', authenticate, isAdmin, completeScrap);
// Admin Routes
router.get('/all', authenticate, isAdmin, getAllScrapAdmin);

// Shared/Specific ID Route
router.get('/:id', authenticate, getScrapById);

module.exports = router;
