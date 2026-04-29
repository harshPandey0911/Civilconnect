const express = require('express');
const router = express.Router();
const verificationController = require('../../controllers/vendorControllers/vendorVerificationController');
const { protect } = require('../../middleware/authMiddleware'); // Assuming this exists or using simple route

// Vendor endpoints
router.post('/choice', verificationController.saveVerificationChoice);
router.post('/upload', verificationController.uploadPCCDocument);

// Admin endpoints
router.get('/pending', verificationController.getPendingVerifications);
router.post('/update-status', verificationController.updateVerificationStatus);

module.exports = router;
