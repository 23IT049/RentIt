const mongoose = require('mongoose');

const quotationSchema = new mongoose.Schema({
    quotationNumber: {
        type: String,
        unique: true,
        required: true
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        rentalStartDate: {
            type: Date,
            required: true
        },
        rentalEndDate: {
            type: Date,
            required: true
        },
        pricingType: {
            type: String,
            enum: ['hourly', 'daily', 'weekly', 'custom'],
            required: true
        },
        unitPrice: {
            type: Number,
            required: true,
            min: 0
        },
        totalPrice: {
            type: Number,
            required: true,
            min: 0
        },
        variant: {
            name: String,
            option: String
        }
    }],
    
    // Pricing summary
    pricing: {
        subtotal: {
            type: Number,
            required: true,
            min: 0
        },
        deliveryCharges: {
            type: Number,
            default: 0,
            min: 0
        },
        securityDeposit: {
            type: Number,
            default: 0,
            min: 0
        },
        totalAmount: {
            type: Number,
            required: true,
            min: 0
        }
    },
    
    // Delivery information
    delivery: {
        method: {
            type: String,
            enum: ['standard', 'pickup'],
            default: 'standard'
        },
        address: {
            name: String,
            street: String,
            city: String,
            state: String,
            zipCode: String
        },
        deliveryDate: Date,
        pickupDate: Date
    },
    
    // Status tracking
    status: {
        type: String,
        enum: ['draft', 'sent', 'confirmed', 'expired', 'cancelled'],
        default: 'draft'
    },
    
    // Validity period
    validUntil: {
        type: Date,
        required: true
    },
    
    // Coupon code if applied
    couponCode: {
        type: String
    },
    discountAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    
    // Notes and special instructions
    notes: {
        type: String
    },
    specialInstructions: {
        type: String
    },
    
    // Metadata
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    confirmedAt: Date,
    expiredAt: Date
}, {
    timestamps: true
});

// Indexes
quotationSchema.index({ customer: 1, status: 1 });
quotationSchema.index({ quotationNumber: 1 });
quotationSchema.index({ validUntil: 1 });
quotationSchema.index({ status: 1, validUntil: 1 });

// Pre-save middleware to generate quotation number
quotationSchema.pre('save', async function(next) {
    if (!this.quotationNumber) {
        const count = await this.constructor.countDocuments();
        this.quotationNumber = `QTN-${String(count + 1).padStart(6, '0')}`;
    }
    
    // Update validUntil to 7 days from creation if not set
    if (!this.validUntil) {
        this.validUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    }
    
    next();
});

// Method to calculate pricing
quotationSchema.methods.calculatePricing = function() {
    let subtotal = 0;
    let totalSecurityDeposit = 0;
    
    this.items.forEach(item => {
        // Calculate rental duration
        const duration = item.rentalEndDate - item.rentalStartDate;
        let hours = Math.ceil(duration / (1000 * 60 * 60));
        
        let unitPrice = item.unitPrice;
        let rentalCost = 0;
        
        switch (item.pricingType) {
            case 'hourly':
                rentalCost = hours * unitPrice;
                break;
            case 'daily':
                const days = Math.ceil(hours / 24);
                rentalCost = days * unitPrice;
                break;
            case 'weekly':
                const weeks = Math.ceil(hours / (24 * 7));
                rentalCost = weeks * unitPrice;
                break;
            case 'custom':
                rentalCost = unitPrice;
                break;
        }
        
        item.totalPrice = rentalCost * item.quantity;
        subtotal += item.totalPrice;
        
        // Add security deposit if applicable
        if (this.items[0].product && this.items[0].product.rentalSettings) {
            totalSecurityDeposit += (this.items[0].product.rentalSettings.securityDeposit || 0) * item.quantity;
        }
    });
    
    this.pricing.subtotal = subtotal;
    this.pricing.securityDeposit = totalSecurityDeposit;
    this.pricing.totalAmount = subtotal + this.pricing.deliveryCharges + this.pricing.securityDeposit - this.discountAmount;
    
    return this.pricing;
};

// Method to check if quotation is still valid
quotationSchema.methods.isValid = function() {
    return this.status === 'draft' || (this.status === 'sent' && new Date() < this.validUntil);
};

// Method to confirm quotation
quotationSchema.methods.confirm = function() {
    if (!this.isValid()) {
        throw new Error('Quotation is no longer valid');
    }
    
    this.status = 'confirmed';
    this.confirmedAt = new Date();
    return this.save();
};

// Static method to find expired quotations
quotationSchema.statics.findExpired = function() {
    return this.find({
        status: 'sent',
        validUntil: { $lt: new Date() }
    });
};

module.exports = mongoose.model('Quotation', quotationSchema);
