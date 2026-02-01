const express = require('express');
const router = express.Router();
const Quotation = require('../models/Quotation');
const Item = require('../models/Item');
const { authorize, checkOwnership } = require('../middleware/roleAuth');

// @route   POST /api/quotations
// @desc    Create new quotation
// @access  Private (Customer)
router.post('/', authorize('customer', 'vendor', 'admin'), async (req, res) => {
    try {
        const { items, delivery, notes, specialInstructions } = req.body;

        // Validate items and check availability
        for (let item of items) {
            const product = await Item.findById(item.product);
            if (!product) {
                return res.status(400).json({
                    success: false,
                    message: `Item ${item.product} not found`
                });
            }

            // if (!product.available) {
            //     return res.status(400).json({
            //         success: false,
            //         message: `Item ${product.title} is not available`
            //     });
            // }

            if (req.user.role !== 'vendor') {
                // Set unit price from item price (assuming daily rate)
                item.unitPrice = product.price;
            }
        }



        let vendorId;
        let customerId;

        // Determine vendor and customer based on role
        if (req.user.role === 'vendor') {
            vendorId = req.user._id;
            customerId = req.body.customer; // Vendor selects customer
            if (!customerId) {
                return res.status(400).json({ success: false, message: 'Customer is required' });
            }
        } else {
            // Customer creating quotation (e.g. request for quote)
            customerId = req.user._id;
            // Vendor must be derived from items (assuming single vendor per quote for now)
            // This logic might need refinement for multi-vendor carts
            const firstProduct = await Item.findById(items[0].product);
            vendorId = firstProduct.vendor;
        }

        const quotationData = {
            customer: customerId,
            vendor: vendorId,
            items: items.map(item => {
                // If vendor is creating, respect their price. If customer, use system price.
                let price = item.unitPrice;
                if (req.user.role !== 'vendor') {
                    // Logic to fetch price from product if needed, or validate it
                }
                return {
                    ...item,
                    unitPrice: price
                };
            }),
            delivery,
            notes,
            specialInstructions,
            ...req.body // Spread other fields like rentalPeriod, orderDate, pricing, etc.
        };

        const quotation = await Quotation.create(quotationData);

        // Calculate pricing
        await quotation.calculatePricing();
        await quotation.save();

        // Populate product details
        await quotation.populate('items.product');

        res.status(201).json({
            success: true,
            message: 'Quotation created successfully',
            data: quotation
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/quotations
// @desc    Get user's quotations
// @access  Private
router.get('/', authorize('customer', 'vendor', 'admin'), async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            status,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        let filter = {};

        // Filter by user role
        if (req.user.role === 'customer') {
            filter.customer = req.user._id;
        } else if (req.user.role === 'vendor') {
            // For vendors, get quotations for their products
            const vendorProducts = await Item.find({ vendor: req.user._id }).select('_id');
            const productIds = vendorProducts.map(p => p._id);
            filter['items.product'] = { $in: productIds };
        }

        if (status) filter.status = status;

        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const quotations = await Quotation.find(filter)
            .populate('customer', 'name email')
            .populate('items.product', 'name images')
            .sort(sort)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const total = await Quotation.countDocuments(filter);

        res.json({
            success: true,
            data: quotations,
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

// @route   GET /api/quotations/:id
// @desc    Get single quotation by ID
// @access  Private
router.get('/:id', authorize('customer', 'vendor', 'admin'), async (req, res) => {
    try {
        const quotation = await Quotation.findById(req.params.id)
            .populate('customer', 'name email phone')
            .populate('items.product', 'title description image');

        if (!quotation) {
            return res.status(404).json({
                success: false,
                message: 'Quotation not found'
            });
        }

        // Check access permissions
        if (req.user.role === 'customer' && quotation.customer._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        if (req.user.role === 'vendor') {
            // Check if vendor owns this quotation
            const isVendorOwner = quotation.vendor && quotation.vendor.toString() === req.user._id.toString();

            // Check if quotation contains vendor's products (fallback)
            const hasVendorProduct = quotation.items.some(item =>
                item.product && item.product.vendor && item.product.vendor.toString() === req.user._id.toString()
            );

            if (!isVendorOwner && !hasVendorProduct) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }
        }

        res.json({
            success: true,
            data: quotation
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   PUT /api/quotations/:id
// @desc    Update quotation
// @access  Private (Customer)
router.put('/:id', authorize('customer', 'vendor', 'admin'), checkOwnership(Quotation), async (req, res) => {
    try {
        const quotation = await Quotation.findById(req.params.id);

        // Only allow editing if status is draft
        if (quotation.status !== 'draft') {
            return res.status(400).json({
                success: false,
                message: 'Cannot edit quotation in current status'
            });
        }

        const updatedQuotation = await Quotation.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('items.product', 'name images');

        // Recalculate pricing
        await updatedQuotation.calculatePricing();
        await updatedQuotation.save();

        res.json({
            success: true,
            message: 'Quotation updated successfully',
            data: updatedQuotation
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/quotations/:id/confirm
// @desc    Confirm quotation and convert to order
// @access  Private (Customer)
router.post('/:id/confirm', authorize('customer', 'vendor', 'admin'), async (req, res) => {
    try {
        const quotation = await Quotation.findById(req.params.id)
            .populate('items.product');

        if (!quotation) {
            return res.status(404).json({
                success: false,
                message: 'Quotation not found'
            });
        }

        // Check ownership
        if (req.user.role === 'customer' && quotation.customer.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Confirm quotation
        await quotation.confirm();

        // Reserve stock for all items
        // Reserve stock for all items
        // NOTE: Stock reservation disabled as Item model doesn't support it yet
        // for (let item of quotation.items) {
        //     await item.product.reserveStock(
        //         item.rentalStartDate,
        //         item.rentalEndDate,
        //         item.quantity,
        //         quotation._id
        //     );
        // }

        // TODO: Create order from quotation
        // This would be implemented in the orders route

        res.json({
            success: true,
            message: 'Quotation confirmed successfully',
            data: quotation
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   DELETE /api/quotations/:id
// @desc    Delete quotation
// @access  Private (Customer)
router.delete('/:id', authorize('customer', 'vendor', 'admin'), checkOwnership(Quotation), async (req, res) => {
    try {
        const quotation = await Quotation.findById(req.params.id);

        // Only allow deletion if status is draft
        if (quotation.status !== 'draft') {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete quotation in current status'
            });
        }

        await Quotation.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Quotation deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/quotations/from-cart
// @desc    Create quotation from cart items
// @access  Private (Customer)
router.post('/from-cart', authorize('customer', 'vendor', 'admin'), async (req, res) => {
    try {
        const { cartItems, delivery, notes, specialInstructions } = req.body;

        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Cart is empty'
            });
        }

        // Transform cart items to quotation items
        const items = cartItems.map(cartItem => ({
            product: cartItem.productId,
            quantity: cartItem.quantity,
            rentalStartDate: new Date(cartItem.rentalStartDate),
            rentalEndDate: new Date(cartItem.rentalEndDate),
            pricingType: cartItem.pricingType,
            variant: cartItem.variant
        }));

        const quotationData = {
            customer: req.user._id,
            items,
            delivery,
            notes,
            specialInstructions
        };

        const quotation = await Quotation.create(quotationData);

        // Calculate pricing
        await quotation.calculatePricing();
        await quotation.save();

        // Populate product details
        await quotation.populate('items.product');

        res.status(201).json({
            success: true,
            message: 'Quotation created from cart successfully',
            data: quotation
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/quotations/:id/send
// @desc    Send quotation to customer via email
// @access  Private (Vendor, Admin)
router.post('/:id/send', authorize('vendor', 'admin'), async (req, res) => {
    try {
        const quotation = await Quotation.findById(req.params.id)
            .populate('customer', 'name email')
            .populate('vendor', 'name email')
            .populate('items.product', 'name');

        if (!quotation) {
            return res.status(404).json({
                success: false,
                message: 'Quotation not found'
            });
        }

        // Check if vendor owns this quotation
        if (req.user.role === 'vendor' && quotation.vendor._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Update status to sent
        quotation.status = 'quotation_sent';
        await quotation.save();

        // TODO: Send email to customer
        // This would integrate with emailService

        res.json({
            success: true,
            message: 'Quotation sent successfully',
            data: quotation
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/quotations/:id/print
// @desc    Generate and download quotation PDF
// @access  Private
router.get('/:id/print', authorize('customer', 'vendor', 'admin'), async (req, res) => {
    try {
        const quotation = await Quotation.findById(req.params.id)
            .populate('customer', 'name email phone')
            .populate('vendor', 'name email')
            .populate('items.product', 'name');

        if (!quotation) {
            return res.status(404).json({
                success: false,
                message: 'Quotation not found'
            });
        }

        // TODO: Generate PDF using PDFKit
        // For now, return JSON
        res.json({
            success: true,
            message: 'PDF generation not yet implemented',
            data: quotation
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/quotations/:id/create-invoice
// @desc    Create invoice from confirmed quotation
// @access  Private (Vendor, Admin)
router.post('/:id/create-invoice', authorize('vendor', 'admin'), async (req, res) => {
    try {
        const quotation = await Quotation.findById(req.params.id)
            .populate('customer', 'name email')
            .populate('vendor', 'name email')
            .populate('items.product', 'name');

        if (!quotation) {
            return res.status(404).json({
                success: false,
                message: 'Quotation not found'
            });
        }

        // Check if quotation is confirmed
        if (quotation.status !== 'sale_order') {
            return res.status(400).json({
                success: false,
                message: 'Quotation must be confirmed before creating invoice'
            });
        }

        // Check if vendor owns this quotation
        if (req.user.role === 'vendor' && quotation.vendor._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // TODO: Create invoice from quotation
        // This would integrate with the invoice generation system

        res.json({
            success: true,
            message: 'Invoice creation from quotation not yet fully implemented',
            quotationId: quotation._id
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
