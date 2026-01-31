const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        unique: true,
        required: true
    },
    quotation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quotation',
        required: true
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    // Order items (copied from quotation for historical accuracy)
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        productName: String, // Store for historical reference
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
    
    // Financial information
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
        discountAmount: {
            type: Number,
            default: 0,
            min: 0
        },
        totalAmount: {
            type: Number,
            required: true,
            min: 0
        },
        paidAmount: {
            type: Number,
            default: 0,
            min: 0
        },
        balanceAmount: {
            type: Number,
            required: true
        }
    },
    
    // Order status
    status: {
        type: String,
        enum: ['draft', 'sent', 'confirmed', 'processing', 'shipped', 'delivered', 'renting', 'returned', 'completed', 'cancelled'],
        default: 'draft'
    },
    
    // Payment status
    paymentStatus: {
        type: String,
        enum: ['pending', 'partial', 'paid', 'refunded'],
        default: 'pending'
    },
    
    // Delivery information
    delivery: {
        method: {
            type: String,
            enum: ['standard', 'pickup'],
            required: true
        },
        address: {
            name: String,
            street: String,
            city: String,
            state: String,
            zipCode: String
        },
        scheduledDate: Date,
        actualDate: Date,
        trackingNumber: String,
        pickupInstructions: String,
        returnInstructions: String
    },
    
    // Pickup and return tracking
    pickup: {
        documentGenerated: {
            type: Boolean,
            default: false
        },
        documentUrl: String,
        pickupDate: Date,
        pickupTime: String,
        pickedUpBy: String,
        conditionNotes: String,
        photos: [String]
    },
    
    return: {
        documentGenerated: {
            type: Boolean,
            default: false
        },
        documentUrl: String,
        expectedDate: Date,
        actualDate: Date,
        returnedBy: String,
        conditionNotes: String,
        photos: [String],
        lateFeeApplied: {
            type: Number,
            default: 0
        },
        damageCharges: {
            type: Number,
            default: 0
        }
    },
    
    // Invoice information
    invoice: {
        generated: {
            type: Boolean,
            default: false
        },
        invoiceNumber: String,
        invoiceUrl: String,
        generatedAt: Date,
        dueDate: Date
    },
    
    // Communication logs
    communications: [{
        type: {
            type: String,
            enum: ['email', 'sms', 'notification'],
            required: true
        },
        recipient: String,
        subject: String,
        message: String,
        sentAt: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: ['sent', 'delivered', 'failed'],
            default: 'sent'
        }
    }],
    
    // Notes and metadata
    notes: String,
    specialInstructions: String,
    internalNotes: String,
    
    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    confirmedAt: Date,
    shippedAt: Date,
    deliveredAt: Date,
    returnedAt: Date,
    completedAt: Date
}, {
    timestamps: true
});

// Indexes
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ customer: 1, status: 1 });
orderSchema.index({ vendor: 1, status: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'delivery.scheduledDate': 1 });
orderSchema.index({ 'return.expectedDate': 1 });

// Pre-save middleware to generate order number
orderSchema.pre('save', async function(next) {
    if (!this.orderNumber) {
        const count = await this.constructor.countDocuments();
        this.orderNumber = `ORD-${String(count + 1).padStart(6, '0')}`;
    }
    
    // Calculate balance amount
    this.pricing.balanceAmount = this.pricing.totalAmount - this.pricing.paidAmount;
    
    next();
});

// Method to generate pickup document
orderSchema.methods.generatePickupDocument = function() {
    this.pickup.documentGenerated = true;
    this.pickup.documentUrl = `/documents/pickup/${this.orderNumber}.pdf`;
    return this.save();
};

// Method to generate return document
orderSchema.methods.generateReturnDocument = function() {
    this.return.documentGenerated = true;
    this.return.documentUrl = `/documents/return/${this.orderNumber}.pdf`;
    return this.save();
};

// Method to calculate late fees
orderSchema.methods.calculateLateFees = function() {
    if (this.status !== 'renting') return 0;
    
    const now = new Date();
    const expectedReturn = new Date(this.return.expectedDate);
    
    if (now > expectedReturn) {
        const hoursLate = Math.ceil((now - expectedReturn) / (1000 * 60 * 60));
        
        // Calculate late fee based on first item's late fee rate
        let lateFeePerHour = 0;
        if (this.items[0] && this.items[0].product) {
            lateFeePerHour = this.items[0].product.rentalSettings?.lateFeePerHour || 0;
        }
        
        this.return.lateFeeApplied = hoursLate * lateFeePerHour;
        return this.return.lateFeeApplied;
    }
    
    return 0;
};

// Method to process return
orderSchema.methods.processReturn = function(returnData) {
    this.status = 'returned';
    this.return.actualDate = new Date();
    this.return.returnedBy = returnData.returnedBy;
    this.return.conditionNotes = returnData.conditionNotes;
    this.return.photos = returnData.photos || [];
    
    // Calculate late fees
    this.calculateLateFees();
    
    // Add damage charges if any
    if (returnData.damageCharges) {
        this.return.damageCharges = returnData.damageCharges;
    }
    
    // Update total amount if there are additional charges
    if (this.return.lateFeeApplied > 0 || this.return.damageCharges > 0) {
        this.pricing.totalAmount += this.return.lateFeeApplied + this.return.damageCharges;
        this.pricing.balanceAmount = this.pricing.totalAmount - this.pricing.paidAmount;
    }
    
    return this.save();
};

// Method to generate invoice
orderSchema.methods.generateInvoice = function() {
    const count = mongoose.model('Order').countDocuments({ 'invoice.generated': true });
    this.invoice.generated = true;
    this.invoice.invoiceNumber = `INV-${String(count + 1).padStart(6, '0')}`;
    this.invoice.invoiceUrl = `/invoices/${this.invoice.invoiceNumber}.pdf`;
    this.invoice.generatedAt = new Date();
    this.invoice.dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    
    return this.save();
};

// Static method to find orders due for return
orderSchema.statics.findDueForReturn = function(daysAhead = 1) {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysAhead);
    
    return this.find({
        status: 'renting',
        'return.expectedDate': { $lte: targetDate }
    }).populate('customer items.product');
};

// Static method to find overdue returns
orderSchema.statics.findOverdueReturns = function() {
    return this.find({
        status: 'renting',
        'return.expectedDate': { $lt: new Date() }
    }).populate('customer items.product');
};

module.exports = mongoose.model('Order', orderSchema);
