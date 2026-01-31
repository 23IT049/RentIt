const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { authorize, checkPermission, checkOwnership } = require('../middleware/roleAuth');

// @route   GET /api/products
// @desc    Get all published products
// @access  Public
router.get('/', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            category,
            minPrice,
            maxPrice,
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build filter
        const filter = { isPublished: true, isRentable: true };
        
        if (category) filter.category = category;
        if (minPrice || maxPrice) {
            filter['pricing.daily'] = {};
            if (minPrice) filter['pricing.daily'].$gte = parseFloat(minPrice);
            if (maxPrice) filter['pricing.daily'].$lte = parseFloat(maxPrice);
        }
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        // Build sort
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const products = await Product.find(filter)
            .populate('vendor', 'companyName email')
            .sort(sort)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const total = await Product.countDocuments(filter);

        res.json({
            success: true,
            data: products,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/products/:id
// @desc    Get single product by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('vendor', 'companyName email phone');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Only return published products for public access
        if (!product.isPublished) {
            return res.status(404).json({
                success: false,
                message: 'Product not available'
            });
        }

        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/products
// @desc    Create new product
// @access  Private (Vendor/Admin)
router.post('/', authorize('vendor', 'admin'), checkPermission('canManageProducts'), async (req, res) => {
    try {
        const productData = {
            ...req.body,
            vendor: req.user._id
        };

        const product = await Product.create(productData);
        
        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private (Vendor/Admin)
router.put('/:id', authorize('vendor', 'admin'), checkOwnership(Product), async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Product updated successfully',
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Private (Vendor/Admin)
router.delete('/:id', authorize('vendor', 'admin'), checkOwnership(Product), async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/products/:id/check-availability
// @desc    Check product availability for rental period
// @access  Public
router.post('/:id/check-availability', async (req, res) => {
    try {
        const { startDate, endDate, quantity = 1 } = req.body;

        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        const isAvailable = product.checkAvailability(
            new Date(startDate),
            new Date(endDate),
            quantity
        );

        const availableQuantity = product.availableQuantity;

        res.json({
            success: true,
            data: {
                isAvailable,
                availableQuantity,
                requestedQuantity: quantity
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/products/vendor/my-products
// @desc    Get vendor's products
// @access  Private (Vendor)
router.get('/vendor/my-products', authorize('vendor', 'admin'), async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            status = 'all'
        } = req.query;

        let filter = { vendor: req.user._id };
        
        if (status === 'published') {
            filter.isPublished = true;
        } else if (status === 'draft') {
            filter.isPublished = false;
        }

        const products = await Product.find(filter)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const total = await Product.countDocuments(filter);

        res.json({
            success: true,
            data: products,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   PUT /api/products/:id/publish
// @desc    Publish/unpublish product
// @access  Private (Vendor/Admin)
router.put('/:id/publish', authorize('vendor', 'admin'), checkOwnership(Product), async (req, res) => {
    try {
        const { isPublished } = req.body;

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { isPublished },
            { new: true }
        );

        res.json({
            success: true,
            message: `Product ${isPublished ? 'published' : 'unpublished'} successfully`,
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/products/categories
// @desc    Get all product categories
// @access  Public
router.get('/meta/categories', async (req, res) => {
    try {
        const categories = [
            'electronics',
            'furniture', 
            'vehicles',
            'tools',
            'clothing',
            'books',
            'sports',
            'other'
        ];

        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
