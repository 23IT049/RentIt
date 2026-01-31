const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Role-based access control middleware
const authorize = (...roles) => {
    return async (req, res, next) => {
        try {
            // Get token from header
            const token = req.header('Authorization')?.replace('Bearer ', '');
            
            if (!token) {
                return res.status(401).json({
                    success: false,
                    message: 'Access denied. No token provided.'
                });
            }

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Get user with permissions
            const user = await User.findById(decoded.id).select('-password');
            
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid token. User not found.'
                });
            }

            // Check if user is approved (for vendors)
            if (user.role === 'vendor' && !user.isApproved) {
                return res.status(403).json({
                    success: false,
                    message: 'Account pending approval. Please contact administrator.'
                });
            }

            // Check role-based access
            if (roles.length && !roles.includes(user.role)) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. Insufficient permissions.'
                });
            }

            // Add user to request object
            req.user = user;
            next();
        } catch (error) {
            console.error('Authorization error:', error);
            res.status(401).json({
                success: false,
                message: 'Invalid token.'
            });
        }
    };
};

// Permission-based access control
const checkPermission = (permission) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. User not authenticated.'
            });
        }

        // Admin has all permissions
        if (req.user.role === 'admin') {
            return next();
        }

        // Check specific permission
        if (!req.user.permissions[permission]) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Missing permission: ${permission}`
            });
        }

        next();
    };
};

// Resource ownership check
const checkOwnership = (resourceModel, resourceIdParam = 'id') => {
    return async (req, res, next) => {
        try {
            const resourceId = req.params[resourceIdParam];
            const resource = await resourceModel.findById(resourceId);

            if (!resource) {
                return res.status(404).json({
                    success: false,
                    message: 'Resource not found.'
                });
            }

            // Admin can access all resources
            if (req.user.role === 'admin') {
                req.resource = resource;
                return next();
            }

            // Check if user owns the resource
            const userId = req.user._id.toString();
            const resourceUserId = resource.vendor?.toString() || resource.customer?.toString() || resource.user?.toString();

            if (userId !== resourceUserId) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. You do not own this resource.'
                });
            }

            req.resource = resource;
            next();
        } catch (error) {
            console.error('Ownership check error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error during ownership verification.'
            });
        }
    };
};

// Vendor-specific middleware
const isVendor = authorize('vendor', 'admin');

// Customer-specific middleware
const isCustomer = authorize('customer', 'admin');

// Admin-only middleware
const isAdmin = authorize('admin');

module.exports = {
    authorize,
    checkPermission,
    checkOwnership,
    isVendor,
    isCustomer,
    isAdmin
};
