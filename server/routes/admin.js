const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Quotation = require('../models/Quotation');
const SystemSettings = require('../models/SystemSettings');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleAuth');

// All routes require admin authentication
router.use(protect);
router.use(authorize('admin'));

// @route   GET /api/admin/stats
// @desc    Get dashboard statistics
// @access  Private/Admin
router.get('/stats', async (req, res) => {
    try {
        // Get user statistics
        const totalUsers = await User.countDocuments({ role: 'customer' });
        const totalVendors = await User.countDocuments({ role: 'vendor', isApproved: true });
        const pendingVendors = await User.countDocuments({ role: 'vendor', isApproved: false });

        // Get order statistics
        const totalOrders = await Order.countDocuments();
        const activeRentals = await Order.countDocuments({ status: 'renting' });

        // Calculate total revenue
        const revenueResult = await Order.aggregate([
            { $match: { status: { $in: ['completed', 'renting', 'returned'] } } },
            { $group: { _id: null, total: { $sum: '$pricing.paidAmount' } } }
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        // Get recent activity
        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('customer', 'name email')
            .populate('vendor', 'name companyName');

        const recentUsers = await User.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('name email role createdAt');

        res.json({
            success: true,
            stats: {
                totalUsers,
                totalVendors,
                totalOrders,
                totalRevenue,
                pendingVendors,
                activeRentals
            },
            recentActivity: {
                orders: recentOrders,
                users: recentUsers
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/admin/users
// @desc    Get all users with pagination and filters
// @access  Private/Admin
router.get('/users', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';
        const role = req.query.role;
        const status = req.query.status;

        // Build query
        const query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        if (role) query.role = role;
        if (status) query.status = status;

        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await User.countDocuments(query);

        // Get order statistics for each user
        const usersWithStats = await Promise.all(users.map(async (user) => {
            const userObj = user.toObject();

            if (user.role === 'customer') {
                const orders = await Order.find({ customer: user._id });
                userObj.totalOrders = orders.length;
                userObj.totalSpent = orders.reduce((sum, order) => sum + order.pricing.paidAmount, 0);
            } else if (user.role === 'vendor') {
                const products = await Product.countDocuments({ vendor: user._id });
                userObj.totalProducts = products;
            }

            return userObj;
        }));

        res.json({
            success: true,
            users: usersWithStats,
            pagination: {
                page,
                limit,
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

// @route   GET /api/admin/users/:id
// @desc    Get user details
// @access  Private/Admin
router.get('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const userObj = user.toObject();

        // Get additional statistics
        if (user.role === 'customer') {
            const orders = await Order.find({ customer: user._id })
                .populate('vendor', 'name companyName')
                .sort({ createdAt: -1 });
            userObj.orders = orders;
            userObj.totalOrders = orders.length;
            userObj.totalSpent = orders.reduce((sum, order) => sum + order.pricing.paidAmount, 0);
        } else if (user.role === 'vendor') {
            const products = await Product.find({ vendor: user._id });
            const orders = await Order.find({ vendor: user._id });
            userObj.products = products;
            userObj.orders = orders;
            userObj.totalProducts = products.length;
            userObj.totalRevenue = orders.reduce((sum, order) => sum + order.pricing.paidAmount, 0);
        }

        res.json({
            success: true,
            user: userObj
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user details
// @access  Private/Admin
router.put('/users/:id', async (req, res) => {
    try {
        const { name, email, phone, status, role, permissions } = req.body;

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update fields
        if (name) user.name = name;
        if (email) user.email = email;
        if (phone) user.phone = phone;
        if (status) user.status = status;
        if (role) user.role = role;
        if (permissions) user.permissions = { ...user.permissions, ...permissions };

        await user.save();

        res.json({
            success: true,
            message: 'User updated successfully',
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   PUT /api/admin/users/:id/status
// @desc    Toggle user status
// @access  Private/Admin
router.put('/users/:id/status', async (req, res) => {
    try {
        const { status } = req.body;

        if (!['active', 'inactive', 'suspended'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status value'
            });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.status = status;
        await user.save();

        res.json({
            success: true,
            message: `User ${status === 'active' ? 'activated' : status === 'suspended' ? 'suspended' : 'deactivated'} successfully`,
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user (soft delete by setting status to inactive)
// @access  Private/Admin
router.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Soft delete - set status to inactive
        user.status = 'inactive';
        await user.save();

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/admin/vendors
// @desc    Get all vendors
// @access  Private/Admin
router.get('/vendors', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const approvalStatus = req.query.approvalStatus;

        const query = { role: 'vendor' };
        if (approvalStatus === 'pending') {
            query.isApproved = false;
        } else if (approvalStatus === 'approved') {
            query.isApproved = true;
        }

        const vendors = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await User.countDocuments(query);

        // Get product count for each vendor
        const vendorsWithStats = await Promise.all(vendors.map(async (vendor) => {
            const vendorObj = vendor.toObject();
            const productCount = await Product.countDocuments({ vendor: vendor._id });
            vendorObj.totalProducts = productCount;
            return vendorObj;
        }));

        res.json({
            success: true,
            vendors: vendorsWithStats,
            pagination: {
                page,
                limit,
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

// @route   GET /api/admin/vendors/pending
// @desc    Get pending vendor approvals
// @access  Private/Admin
router.get('/vendors/pending', async (req, res) => {
    try {
        const pendingVendors = await User.find({
            role: 'vendor',
            isApproved: false
        }).select('-password').sort({ createdAt: -1 });

        res.json({
            success: true,
            vendors: pendingVendors,
            count: pendingVendors.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   PUT /api/admin/vendors/:id/approve
// @desc    Approve vendor registration
// @access  Private/Admin
router.put('/vendors/:id/approve', async (req, res) => {
    try {
        const vendor = await User.findById(req.params.id);

        if (!vendor) {
            return res.status(404).json({
                success: false,
                message: 'Vendor not found'
            });
        }

        if (vendor.role !== 'vendor') {
            return res.status(400).json({
                success: false,
                message: 'User is not a vendor'
            });
        }

        vendor.isApproved = true;
        vendor.status = 'active';
        await vendor.save();

        // TODO: Send approval email notification

        res.json({
            success: true,
            message: 'Vendor approved successfully',
            vendor
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   PUT /api/admin/vendors/:id/reject
// @desc    Reject vendor registration
// @access  Private/Admin
router.put('/vendors/:id/reject', async (req, res) => {
    try {
        const { reason } = req.body;

        const vendor = await User.findById(req.params.id);

        if (!vendor) {
            return res.status(404).json({
                success: false,
                message: 'Vendor not found'
            });
        }

        if (vendor.role !== 'vendor') {
            return res.status(400).json({
                success: false,
                message: 'User is not a vendor'
            });
        }

        vendor.status = 'inactive';
        vendor.isApproved = false;
        await vendor.save();

        // TODO: Send rejection email with reason

        res.json({
            success: true,
            message: 'Vendor rejected successfully',
            vendor
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/admin/orders
// @desc    Get all orders
// @access  Private/Admin
router.get('/orders', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const status = req.query.status;

        const query = {};
        if (status) query.status = status;

        const orders = await Order.find(query)
            .populate('customer', 'name email')
            .populate('vendor', 'name companyName')
            .populate('items.product', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Order.countDocuments(query);

        res.json({
            success: true,
            orders,
            pagination: {
                page,
                limit,
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

// @route   PUT /api/admin/orders/:id
// @desc    Update order (admin override)
// @access  Private/Admin
router.put('/orders/:id', async (req, res) => {
    try {
        const { status, notes } = req.body;

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        if (status) order.status = status;
        if (notes) order.internalNotes = notes;

        await order.save();

        res.json({
            success: true,
            message: 'Order updated successfully',
            order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/admin/settings
// @desc    Get system settings
// @access  Private/Admin
router.get('/settings', async (req, res) => {
    try {
        const settings = await SystemSettings.getSettings();

        res.json({
            success: true,
            settings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   PUT /api/admin/settings
// @desc    Update system settings
// @access  Private/Admin
router.put('/settings', async (req, res) => {
    try {
        const settings = await SystemSettings.updateSettings(req.body, req.user.id);

        res.json({
            success: true,
            message: 'Settings updated successfully',
            settings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/admin/reports/revenue
// @desc    Get revenue report
// @access  Private/Admin
router.get('/reports/revenue', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const matchQuery = {
            status: { $in: ['completed', 'renting', 'returned'] }
        };

        if (startDate || endDate) {
            matchQuery.createdAt = {};
            if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
            if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
        }

        const revenueByDate = await Order.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                        day: { $dayOfMonth: '$createdAt' }
                    },
                    totalRevenue: { $sum: '$pricing.paidAmount' },
                    orderCount: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
        ]);

        const totalRevenue = await Order.aggregate([
            { $match: matchQuery },
            { $group: { _id: null, total: { $sum: '$pricing.paidAmount' } } }
        ]);

        res.json({
            success: true,
            report: {
                revenueByDate,
                totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/admin/reports/users
// @desc    Get user activity report
// @access  Private/Admin
router.get('/reports/users', async (req, res) => {
    try {
        const usersByRole = await User.aggregate([
            {
                $group: {
                    _id: '$role',
                    count: { $sum: 1 }
                }
            }
        ]);

        const usersByStatus = await User.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const recentRegistrations = await User.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                        day: { $dayOfMonth: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 } },
            { $limit: 30 }
        ]);

        res.json({
            success: true,
            report: {
                usersByRole,
                usersByStatus,
                recentRegistrations
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/admin/export/users
// @desc    Export users to CSV
// @access  Private/Admin
router.get('/export/users', async (req, res) => {
    try {
        const users = await User.find().select('-password');

        // Create CSV header
        let csv = 'ID,Name,Email,Role,Status,Approved,Created At,Last Login\n';

        // Add user data
        users.forEach(user => {
            csv += `${user._id},${user.name},${user.email},${user.role},${user.status},${user.isApproved},${user.createdAt},${user.lastLogin || 'Never'}\n`;
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
        res.send(csv);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/admin/export/orders
// @desc    Export orders to CSV
// @access  Private/Admin
router.get('/export/orders', async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('customer', 'name email')
            .populate('vendor', 'name companyName');

        // Create CSV header
        let csv = 'Order Number,Customer,Vendor,Status,Total Amount,Paid Amount,Created At\n';

        // Add order data
        orders.forEach(order => {
            csv += `${order.orderNumber},${order.customer?.name || 'N/A'},${order.vendor?.companyName || order.vendor?.name || 'N/A'},${order.status},${order.pricing.totalAmount},${order.pricing.paidAmount},${order.createdAt}\n`;
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=orders.csv');
        res.send(csv);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
