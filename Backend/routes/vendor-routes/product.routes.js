const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticate } = require('../../middleware/authMiddleware');
const { isVendor } = require('../../middleware/roleMiddleware');
const {
  getVendorProducts,
  createVendorProduct,
  deleteVendorProduct
} = require('../../controllers/vendorControllers/vendorProductController');

const createProductValidation = [
  body('title').trim().notEmpty().withMessage('Product title is required'),
  body('categoryId').notEmpty().withMessage('Category ID is required'),
  body('basePrice').optional({ checkFalsy: true }).isNumeric().withMessage('Base price must be a number')
];

router.get('/', authenticate, isVendor, getVendorProducts);
router.post('/', authenticate, isVendor, createProductValidation, createVendorProduct);
router.delete('/:id', authenticate, isVendor, deleteVendorProduct);

module.exports = router;
