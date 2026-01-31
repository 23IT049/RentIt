const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const { protect } = require('../middleware/auth');
const { isVendor } = require('../middleware/roleAuth');

// @route   GET /api/vendor/customers
// @desc    Get all customers who have ordered from this vendor
// @access  Private (Vendor only)
router.get('/customers', protect, isVendor, async (req, res) => {
    try {
        const { search = '', page = 1, limit = 12 } = req.query;
        const vendorId = req.user.id;

        // Build aggregation pipeline
        const pipeline = [
            // Match bookings for this vendor
            {
                $match: {
                    vendor: new mongoose.Types.ObjectId(vendorId)
                }
            },
            // Lookup customer details
            {
                $lookup: {
                    from: 'users',
                    localField: 'renter',
                    foreignField: '_id',
                    as: 'customer'
                }
            },
            { $unwind: '$customer' },
            // Group by customer to get unique customers with stats
            {
                $group: {
                    _id: '$customer._id',
                    name: { $first: '$customer.name' },
                    email: { $first: '$customer.email' },
                    phone: { $first: '$customer.phone' },
                    avatar: { $first: '$customer.avatar' },
                    totalOrders: { $sum: 1 },
                    totalSpent: { $sum: '$totalAmount' },
                    lastOrderDate: { $max: '$createdAt' }
                }
            },
            // Sort by last order date (most recent first)
            { $sort: { lastOrderDate: -1 } }
        ];

        // Add search filter if provided (after grouping)
        if (search && search.trim()) {
            // Escape special regex characters
            const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            pipeline.push({
                $match: {
                    $or: [
                        { name: { $regex: escapedSearch, $options: 'i' } },
                        { email: { $regex: escapedSearch, $options: 'i' } }
                    ]
                }
            });
        }

        // Execute aggregation
        const customers = await Booking.aggregate(pipeline);

        // Apply pagination
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const paginatedCustomers = customers.slice(startIndex, endIndex);

        res.json({
            success: true,
            customers: paginatedCustomers,
            pagination: {
                total: customers.length,
                page: parseInt(page),
                pages: Math.ceil(customers.length / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching vendor customers:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch customers',
            error: error.message
        });
    }
});

module.exports = router;
