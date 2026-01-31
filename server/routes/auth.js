const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, phone, firstName, lastName, companyName, productCategory, gstNo, couponCode } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ email: email.toLowerCase().trim() });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Validate GSTIN for vendors
        if (role === 'vendor' && !gstNo) {
            return res.status(400).json({
                success: false,
                message: 'GSTIN is required for vendor registration'
            });
        }

        // Validate company name for vendors
        if (role === 'vendor' && !companyName) {
            return res.status(400).json({
                success: false,
                message: 'Company name is required for vendor registration'
            });
        }

        // Set default permissions based on role
        let permissions = {};
        if (role === 'vendor') {
            permissions = {
                canManageProducts: true,
                canManageOrders: true,
                canViewReports: true,
                canManageUsers: false
            };
        } else if (role === 'admin') {
            permissions = {
                canManageProducts: true,
                canManageOrders: true,
                canViewReports: true,
                canManageUsers: true
            };
        }

        // Apply coupon code discount if provided
        let discountApplied = false;
        if (couponCode) {
            // TODO: Implement coupon validation logic
            console.log(`Coupon code applied: ${couponCode}`);
            discountApplied = true;
        }

        // Create user
        const user = await User.create({
            name,
            email: email.toLowerCase().trim(),
            password,
            role: role || 'customer',
            phone,
            firstName,
            lastName,
            companyName,
            productCategory,
            gstNo,
            permissions,
            isApproved: role === 'vendor' ? false : true // Vendors need approval
        });

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: role === 'vendor' ? 'Registration submitted. Awaiting admin approval.' : 'User registered successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isApproved: user.isApproved,
                permissions: user.permissions
            },
            discountApplied
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find user (include password for comparison)
        const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if user is approved (for vendors)
        if (user.role === 'vendor' && !user.isApproved) {
            return res.status(401).json({
                success: false,
                message: 'Your vendor account is pending approval'
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate token
        const token = generateToken(user._id);

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        res.json({
            success: true,
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
