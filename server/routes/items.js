const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const { protect, authorize } = require('../middleware/auth');
const { isVendor } = require('../middleware/roleAuth');

// @route   GET /api/items
// @desc    Get all items with search and filters
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { search, category, minPrice, maxPrice, page = 1, limit = 12 } = req.query;

        let query = { available: true };

        // Search
        if (search) {
            query.$text = { $search: search };
        }

        // Category filter
        if (category) {
            query.category = category;
        }

        // Price filter
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        const items = await Item.find(query)
            .populate('vendor', 'name email avatar')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await Item.countDocuments(query);

        res.json({
            success: true,
            items,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/items/:id
// @desc    Get single item
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const item = await Item.findById(req.params.id).populate('vendor', 'name email phone avatar');

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found'
            });
        }

        res.json({
            success: true,
            item
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/items
// @desc    Create new item
// @access  Private (Vendor/Admin)
router.post('/', protect, isVendor, async (req, res) => {
    try {
        const itemData = {
            ...req.body,
            vendor: req.user.id
        };

        const item = await Item.create(itemData);

        res.status(201).json({
            success: true,
            message: 'Item created successfully',
            item
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   PUT /api/items/:id
// @desc    Update item
// @access  Private (Owner only)
router.put('/:id', protect, async (req, res) => {
    try {
        let item = await Item.findById(req.params.id);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found'
            });
        }

        // Check ownership
        if (item.vendor.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this item'
            });
        }

        item = await Item.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.json({
            success: true,
            message: 'Item updated successfully',
            item
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   DELETE /api/items/:id
// @desc    Delete item
// @access  Private (Owner only)
router.delete('/:id', protect, async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found'
            });
        }

        // Check ownership
        if (item.vendor.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this item'
            });
        }

        await item.deleteOne();

        res.json({
            success: true,
            message: 'Item deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/items/owner/me
// @desc    Get current user's items
// @access  Private
router.get('/vendor/me', protect, async (req, res) => {
    try {
        const items = await Item.find({ vendor: req.user.id }).sort({ createdAt: -1 });

        res.json({
            success: true,
            items
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
