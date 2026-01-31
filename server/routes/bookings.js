const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Item = require('../models/Item');
const { protect } = require('../middleware/auth');

// @route   POST /api/bookings
// @desc    Create new booking
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { item: itemId, startDate, pickupLocation, returnLocation, notes } = req.body;

        // Get item details
        const item = await Item.findById(itemId).populate('vendor');

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found'
            });
        }

        if (!item.available) {
            return res.status(400).json({
                success: false,
                message: 'Item is not available for booking'
            });
        }

        // Calculate end date (24 hours from start)
        const start = new Date(startDate);
        const end = new Date(start.getTime() + (24 * 60 * 60 * 1000));

        // Calculate total amount
        const rentalPrice = item.price;
        const deposit = item.deposit || 0;
        const totalAmount = rentalPrice + deposit;

        // Create booking
        const booking = await Booking.create({
            item: itemId,
            renter: req.user.id,
            vendor: item.vendor._id,
            startDate: start,
            endDate: end,
            totalHours: 24,
            rentalPrice,
            deposit,
            totalAmount,
            pickupLocation: pickupLocation || item.location,
            returnLocation: returnLocation || item.location,
            notes
        });

        // Populate booking details
        await booking.populate([
            { path: 'item', select: 'title image price' },
            { path: 'renter', select: 'name email phone' },
            { path: 'vendor', select: 'name email phone' }
        ]);

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/bookings
// @desc    Get user's bookings
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const { status, role } = req.query;

        let query = {};

        // Get bookings based on user role
        if (req.user.role === 'vendor') {
            query.vendor = req.user.id;
        } else {
            query.renter = req.user.id;
        }

        // Filter by status
        if (status) {
            query.status = status;
        }

        const bookings = await Booking.find(query)
            .populate('item', 'title image price category')
            .populate('renter', 'name email phone avatar')
            .populate('vendor', 'name email phone avatar')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            bookings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/bookings/:id
// @desc    Get single booking
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('item')
            .populate('renter', 'name email phone avatar')
            .populate('vendor', 'name email phone avatar');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check authorization
        if (booking.renter._id.toString() !== req.user.id &&
            booking.vendor._id.toString() !== req.user.id &&
            req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this booking'
            });
        }

        res.json({
            success: true,
            booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   PUT /api/bookings/:id/confirm
// @desc    Confirm booking (owner)
// @access  Private
router.put('/:id/confirm', protect, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check if user is vendor
        if (booking.vendor.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Only the vendor can confirm bookings'
            });
        }

        booking.status = 'confirmed';
        await booking.save();

        res.json({
            success: true,
            message: 'Booking confirmed successfully',
            booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   PUT /api/bookings/:id/cancel
// @desc    Cancel booking
// @access  Private
router.put('/:id/cancel', protect, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check authorization
        if (booking.renter.toString() !== req.user.id &&
            booking.vendor.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to cancel this booking'
            });
        }

        booking.status = 'cancelled';
        await booking.save();

        res.json({
            success: true,
            message: 'Booking cancelled successfully',
            booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   PUT /api/bookings/:id/complete
// @desc    Complete booking
// @access  Private
router.put('/:id/complete', protect, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check if user is vendor
        if (booking.vendor.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Only the vendor can complete bookings'
            });
        }

        booking.status = 'completed';
        await booking.save();

        res.json({
            success: true,
            message: 'Booking completed successfully',
            booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
