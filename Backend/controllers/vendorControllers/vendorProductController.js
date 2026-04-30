const Brand = require('../../models/Brand');
const UserService = require('../../models/UserService');
const Category = require('../../models/Category');
const { validationResult } = require('express-validator');
const { SERVICE_STATUS } = require('../../utils/constants');

/**
 * Get all products (Brands) created by the vendor
 * GET /api/vendors/products
 */
const getVendorProducts = async (req, res) => {
  try {
    const products = await Brand.find({ vendorId: req.user.id })
      .populate('categoryIds', 'title')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: products.length,
      products: products.map(p => ({
        id: p._id,
        title: p.title,
        slug: p.slug,
        iconUrl: p.iconUrl || p.logo,
        basePrice: p.basePrice || 0,
        discountPrice: p.discountPrice || 0,
        status: p.status,
        category: p.categoryIds?.[0]?.title || 'Uncategorized',
        createdAt: p.createdAt
      }))
    });
  } catch (error) {
    console.error('Get vendor products error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch products.' });
  }
};

/**
 * Create a new product (Brand + Default Service)
 * POST /api/vendors/products
 */
const createVendorProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { title, description, basePrice, discountPrice, iconUrl, categoryId, type } = req.body;

    const slug = title.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
    const uniqueSlug = `${slug}-${Date.now().toString().slice(-4)}`; // ensure uniqueness

    // Create the Brand (Product Group)
    const brand = await Brand.create({
      title: title.trim(),
      slug: uniqueSlug,
      categoryIds: [categoryId],
      categoryId: categoryId,
      iconUrl: iconUrl || null,
      logo: iconUrl || null,
      imageUrl: iconUrl || null,
      basePrice: Number(basePrice) || 0,
      discountPrice: Number(discountPrice) || 0,
      status: SERVICE_STATUS.ACTIVE,
      vendorId: req.user.id,
      type: type || 'service'
    });

    // Create a default Service under this Brand so it can be booked
    const service = await UserService.create({
      brandId: brand._id,
      categoryId: categoryId,
      vendorId: req.user.id,
      title: title.trim(),
      description: description?.trim() || null,
      iconUrl: iconUrl || null,
      basePrice: Number(basePrice) || 0,
      status: SERVICE_STATUS.ACTIVE,
      type: type || 'service'
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: {
        id: brand._id,
        title: brand.title,
        status: brand.status
      }
    });
  } catch (error) {
    console.error('Create vendor product error:', error);
    const message = error.name === 'ValidationError' 
      ? Object.values(error.errors).map(val => val.message).join(', ')
      : 'Failed to create product.';
    res.status(400).json({ success: false, message });
  }
};

/**
 * Delete a vendor product
 * DELETE /api/vendors/products/:id
 */
const deleteVendorProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const vendorId = req.user.id;

    // Verify ownership and delete brand
    const brand = await Brand.findOneAndDelete({ _id: id, vendorId });
    if (!brand) {
      return res.status(404).json({ success: false, message: 'Product not found or not authorized' });
    }

    // Delete associated services
    await UserService.deleteMany({ brandId: id, vendorId });

    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete vendor product error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete product.' });
  }
};

module.exports = {
  getVendorProducts,
  createVendorProduct,
  deleteVendorProduct
};
