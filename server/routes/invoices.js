const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Booking = require('../models/Booking'); // Add Booking model
const SystemSettings = require('../models/SystemSettings');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleAuth');
const { generateInvoicePDF, calculateGST } = require('../utils/invoiceGenerator');
const { prepareOrderForInvoice } = require('../utils/orderAdapter'); // Add adapter
const emailService = require('../utils/emailService');
const path = require('path');
const fs = require('fs');

// @route   POST /api/invoices/generate/:orderId
// @desc    Generate invoice for an order or booking
// @access  Private (Customer, Vendor, Admin)
router.post('/generate/:orderId', protect, async (req, res) => {
    try {
        const { orderId } = req.params;
        const { sendEmail } = req.body; // Optional: whether to send email

        // Try to find as Order first, then as Booking
        let order = await Order.findById(orderId)
            .populate('customer', 'name email companyName gstNo')
            .populate('vendor', 'name email')
            .populate('items.product', 'name');

        let isBooking = false;

        if (!order) {
            // Try finding as a Booking
            const booking = await Booking.findById(orderId)
                .populate('renter', 'name email')
                .populate('vendor', 'name email')
                .populate('item', 'title price deposit');

            if (booking) {
                isBooking = true;
                // Adapt booking to order format
                order = await prepareOrderForInvoice(booking);
            }
        }

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order or booking not found'
            });
        }

        // Check authorization
        const customer = order.customer || order.renter;
        const isCustomer = customer && customer._id && customer._id.toString() === req.user._id.toString();
        const isVendor = order.vendor && order.vendor._id && order.vendor._id.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isCustomer && !isVendor && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to generate invoice for this order'
            });
        }

        // Check if order is confirmed (skip for bookings as they might have different statuses)
        if (!isBooking && (order.status === 'draft' || order.status === 'cancelled')) {
            return res.status(400).json({
                success: false,
                message: 'Cannot generate invoice for draft or cancelled orders'
            });
        }

        // Get system settings for company details
        const settings = await SystemSettings.findOne();

        // Calculate GST
        const baseAmount = (order.pricing?.subtotal || 0) +
            (order.pricing?.deliveryCharges || 0) +
            (order.pricing?.securityDeposit || 0) -
            (order.pricing?.discountAmount || 0);

        const gstCalculation = calculateGST(baseAmount, settings?.payment?.taxRate || 18);

        // Update order with GST and total amount
        if (!order.pricing) order.pricing = {};
        order.pricing.totalAmount = gstCalculation.totalAmount;
        order.pricing.balanceAmount = gstCalculation.totalAmount - (order.pricing.paidAmount || 0);

        // Generate invoice number if not exists
        if (!order.invoice) order.invoice = {};
        if (!order.invoice.generated) {
            const invoiceCount = await Order.countDocuments({ 'invoice.generated': true });
            order.invoice.invoiceNumber = `INV-${String(invoiceCount + 1).padStart(6, '0')}`;
            order.invoice.generatedAt = new Date();
            order.invoice.dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
            order.invoice.generated = true;
        }

        // Populate product names for invoice
        if (order.items && Array.isArray(order.items)) {
            order.items.forEach(item => {
                if (item.product && item.product.name) {
                    item.productName = item.product.name;
                }
            });
        }

        // Generate PDF
        const pdfResult = await generateInvoicePDF(order, settings);

        // Update order/booking with invoice URL
        order.invoice.invoiceUrl = `/invoices/${pdfResult.fileName}`;

        // Save to database if it's a real Order (not adapted Booking)
        if (!isBooking) {
            await order.save();
        } else {
            // For bookings, we'll store invoice info separately or in memory
            // You might want to add invoice fields to Booking model later
            console.log('Invoice generated for booking:', orderId);
        }

        // Send email if requested
        let emailSent = false;
        if (sendEmail !== false && emailService.isConfigured()) {
            try {
                await emailService.sendInvoiceEmail(order, pdfResult.filePath);
                emailSent = true;
            } catch (emailError) {
                console.error('Email sending failed:', emailError);
                // Don't fail the request if email fails
            }
        }

        res.json({
            success: true,
            message: 'Invoice generated successfully',
            invoice: {
                invoiceNumber: order.invoice.invoiceNumber,
                invoiceUrl: order.invoice.invoiceUrl,
                generatedAt: order.invoice.generatedAt,
                dueDate: order.invoice.dueDate,
                totalAmount: gstCalculation.totalAmount,
                gstBreakdown: {
                    baseAmount: gstCalculation.baseAmount,
                    cgst: gstCalculation.cgst,
                    sgst: gstCalculation.sgst,
                    totalGST: gstCalculation.totalGST
                },
                paidAmount: order.pricing.paidAmount || 0,
                balanceAmount: order.pricing.balanceAmount,
                emailSent
            }
        });

    } catch (error) {
        console.error('Invoice generation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate invoice',
            error: error.message
        });
    }
});

// @route   GET /api/invoices/download/:orderId
// @desc    Download invoice PDF
// @access  Private (Customer, Vendor, Admin)
router.get('/download/:orderId', protect, async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findById(orderId)
            .populate('customer', '_id')
            .populate('vendor', '_id');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check authorization
        const isCustomer = order.customer._id.toString() === req.user._id.toString();
        const isVendor = order.vendor._id.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isCustomer && !isVendor && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to download this invoice'
            });
        }

        // Check if invoice exists
        if (!order.invoice.generated || !order.invoice.invoiceUrl) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not generated for this order'
            });
        }

        // Get file path
        const fileName = path.basename(order.invoice.invoiceUrl);
        const filePath = path.join(__dirname, '..', 'invoices', fileName);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'Invoice file not found'
            });
        }

        // Send file
        res.download(filePath, fileName, (err) => {
            if (err) {
                console.error('File download error:', err);
                res.status(500).json({
                    success: false,
                    message: 'Failed to download invoice'
                });
            }
        });

    } catch (error) {
        console.error('Invoice download error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to download invoice',
            error: error.message
        });
    }
});

// @route   GET /api/invoices/view/:orderId
// @desc    View invoice PDF in browser
// @access  Private (Customer, Vendor, Admin)
router.get('/view/:orderId', protect, async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findById(orderId)
            .populate('customer', '_id')
            .populate('vendor', '_id');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check authorization
        const isCustomer = order.customer._id.toString() === req.user._id.toString();
        const isVendor = order.vendor._id.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isCustomer && !isVendor && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this invoice'
            });
        }

        // Check if invoice exists
        if (!order.invoice.generated || !order.invoice.invoiceUrl) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not generated for this order'
            });
        }

        // Get file path
        const fileName = path.basename(order.invoice.invoiceUrl);
        const filePath = path.join(__dirname, '..', 'invoices', fileName);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'Invoice file not found'
            });
        }

        // Set headers for PDF viewing
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);

        // Stream file
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);

    } catch (error) {
        console.error('Invoice view error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to view invoice',
            error: error.message
        });
    }
});

// @route   GET /api/invoices/order/:orderId
// @desc    Get invoice details for an order
// @access  Private (Customer, Vendor, Admin)
router.get('/order/:orderId', protect, async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findById(orderId)
            .populate('customer', 'name email companyName gstNo')
            .populate('vendor', 'name email')
            .select('invoice orderNumber pricing status');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check authorization
        const isCustomer = order.customer._id.toString() === req.user._id.toString();
        const isVendor = order.vendor._id.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isCustomer && !isVendor && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this invoice'
            });
        }

        res.json({
            success: true,
            invoice: {
                generated: order.invoice.generated,
                invoiceNumber: order.invoice.invoiceNumber,
                invoiceUrl: order.invoice.invoiceUrl,
                generatedAt: order.invoice.generatedAt,
                dueDate: order.invoice.dueDate,
                orderNumber: order.orderNumber,
                totalAmount: order.pricing.totalAmount,
                paidAmount: order.pricing.paidAmount,
                balanceAmount: order.pricing.balanceAmount,
                paymentStatus: order.paymentStatus,
                orderStatus: order.status
            }
        });

    } catch (error) {
        console.error('Invoice details error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get invoice details',
            error: error.message
        });
    }
});

// @route   POST /api/invoices/resend/:orderId
// @desc    Resend invoice email
// @access  Private (Vendor, Admin)
router.post('/resend/:orderId', authorize('vendor', 'admin'), async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findById(orderId)
            .populate('customer', 'name email companyName gstNo')
            .populate('vendor', 'name email')
            .populate('items.product', 'name');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if invoice exists
        if (!order.invoice.generated) {
            return res.status(400).json({
                success: false,
                message: 'Invoice not generated yet'
            });
        }

        // Check if email service is configured
        if (!emailService.isConfigured()) {
            return res.status(503).json({
                success: false,
                message: 'Email service not configured'
            });
        }

        // Get invoice file path
        const fileName = path.basename(order.invoice.invoiceUrl);
        const filePath = path.join(__dirname, '..', 'invoices', fileName);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'Invoice file not found'
            });
        }

        // Send email
        await emailService.sendInvoiceEmail(order, filePath);

        res.json({
            success: true,
            message: 'Invoice email sent successfully'
        });

    } catch (error) {
        console.error('Invoice resend error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to resend invoice',
            error: error.message
        });
    }
});

module.exports = router;
