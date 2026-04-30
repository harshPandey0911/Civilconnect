const Vendor = require('../../models/Vendor');
const cloudinaryService = require('../../services/cloudinaryService');

/**
 * Save vendor's choice for police verification method
 */
exports.saveVerificationChoice = async (req, res) => {
  try {
    const { vendorId, method } = req.body;

    if (!['self', 'admin'].includes(method)) {
      return res.status(400).json({ success: false, message: 'Invalid verification method' });
    }

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    const requestedAt = new Date();
    const expiryDate = method === 'self' ? new Date(requestedAt.getTime() + 10 * 24 * 60 * 60 * 1000) : null;

    vendor.policeVerification = {
      ...vendor.policeVerification,
      method,
      status: 'pending',
      requestedAt,
      expiryDate
    };

    await vendor.save();

    res.status(200).json({
      success: true,
      message: `Verification method ${method} saved successfully`,
      data: vendor.policeVerification
    });
  } catch (error) {
    console.error('Error saving verification choice:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Upload PCC document for self-verification
 */
exports.uploadPCCDocument = async (req, res) => {
  try {
    const { vendorId, documentBase64 } = req.body;

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    if (vendor.policeVerification.method !== 'self') {
      return res.status(400).json({ success: false, message: 'You have not selected self-verification method' });
    }

    // Check if 10 days have passed
    if (vendor.policeVerification.expiryDate && new Date() > vendor.policeVerification.expiryDate) {
      vendor.policeVerification.status = 'expired';
      await vendor.save();
      return res.status(400).json({ success: false, message: 'Verification period has expired (10 days limit)' });
    }

    const uploadRes = await cloudinaryService.uploadFile(documentBase64, { folder: 'vendors/pcc' });
    if (!uploadRes.success) {
      return res.status(500).json({ success: false, message: 'Failed to upload document' });
    }

    vendor.policeVerification.documentUrl = uploadRes.url;
    vendor.policeVerification.status = 'submitted';
    vendor.policeVerification.submissionDate = new Date();

    await vendor.save();

    // Notify Admin (Non-blocking)
    (async () => {
      try {
        const { createNotification } = require('../notificationControllers/notificationController');
        const Admin = require('../../models/Admin');
        const admins = await Admin.find({ role: 'super_admin' });
        
        const notificationData = {
          type: 'vendor_pcc_upload',
          title: 'New Police Verification Upload',
          message: `Vendor ${vendor.name} has uploaded their PCC document for review.`,
          relatedId: vendor._id,
          relatedType: 'vendor'
        };

        await Promise.all(admins.map(admin => 
          createNotification({ ...notificationData, adminId: admin._id })
        ));
      } catch (e) {
        console.error('Admin notification error (PCC Upload):', e);
      }
    })();

    res.status(200).json({
      success: true,
      message: 'PCC document uploaded successfully',
      data: vendor.policeVerification
    });
  } catch (error) {
    console.error('Error uploading PCC document:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Get all vendors pending police verification (Admin only)
 */
exports.getPendingVerifications = async (req, res) => {
  try {
    const vendors = await Vendor.find({
      'policeVerification.method': { $ne: null }
    }).select('name businessName phone email policeVerification aadhar pan experience createdAt');

    res.status(200).json({ success: true, data: vendors });
  } catch (error) {
    console.error('Error fetching pending verifications:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Update verification status (Admin only)
 */
exports.updateVerificationStatus = async (req, res) => {
  try {
    const { vendorId, status, adminNote } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    vendor.policeVerification.status = status;
    if (adminNote) vendor.policeVerification.adminNote = adminNote;

    await vendor.save();

    res.status(200).json({
      success: true,
      message: `Police verification ${status} successfully`,
      data: vendor.policeVerification
    });
  } catch (error) {
    console.error('Error updating verification status:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
