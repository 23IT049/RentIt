const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Product description is required']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['electronics', 'furniture', 'vehicles', 'tools', 'clothing', 'books', 'sports', 'other']
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isRentable: {
        type: Boolean,
        default: true
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    
    // Pricing
    pricing: {
        hourly: {
            type: Number,
            min: 0
        },
        daily: {
            type: Number,
            min: 0
        },
        weekly: {
            type: Number,
            min: 0
        },
        custom: {
            type: Number,
            min: 0
        }
    },
    
    // Inventory
    inventory: {
        quantityOnHand: {
            type: Number,
            required: true,
            min: 0
        },
        quantityReserved: {
            type: Number,
            default: 0,
            min: 0
        },
        quantityWithCustomer: {
            type: Number,
            default: 0,
            min: 0
        },
        costPrice: {
            type: Number,
            required: true,
            min: 0
        },
        salesPrice: {
            type: Number,
            required: true,
            min: 0
        }
    },
    
    // Product attributes and variants
    attributes: [{
        name: {
            type: String,
            required: true
        },
        value: {
            type: String,
            required: true
        }
    }],
    
    variants: [{
        name: {
            type: String,
            required: true
        },
        options: [{
            name: {
                type: String,
                required: true
            },
            priceAdjustment: {
                type: Number,
                default: 0
            },
            quantity: {
                type: Number,
                required: true,
                min: 0
            }
        }]
    }],
    
    // Media
    images: [{
        url: {
            type: String,
            required: true
        },
        alt: {
            type: String
        },
        isMain: {
            type: Boolean,
            default: false
        }
    }],
    
    // Rental settings
    rentalSettings: {
        minRentalPeriod: {
            type: Number,
            default: 1 // in hours
        },
        maxRentalPeriod: {
            type: Number,
            default: 720 // 30 days in hours
        },
        lateFeePerHour: {
            type: Number,
            default: 0
        },
        securityDeposit: {
            type: Number,
            default: 0
        }
    },
    
    // Metadata
    tags: [String],
    sku: {
        type: String,
        unique: true,
        required: true
    },
    
    // Availability tracking
    availability: [{
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 0
        },
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order'
        }
    }]
}, {
    timestamps: true
});

// Indexes for better performance
productSchema.index({ vendor: 1, isPublished: 1 });
productSchema.index({ category: 1, isPublished: 1 });
productSchema.index({ sku: 1 });
productSchema.index({ 'availability.startDate': 1, 'availability.endDate': 1 });

// Virtual for available quantity
productSchema.virtual('availableQuantity').get(function() {
    return this.inventory.quantityOnHand - this.inventory.quantityReserved - this.inventory.quantityWithCustomer;
});

// Method to check availability for a given period
productSchema.methods.checkAvailability = function(startDate, endDate, quantity = 1) {
    const conflictingBookings = this.availability.filter(booking => {
        return (startDate < booking.endDate && endDate > booking.startDate);
    });
    
    const totalReserved = conflictingBookings.reduce((sum, booking) => sum + booking.quantity, 0);
    return this.availableQuantity - totalReserved >= quantity;
};

// Method to reserve stock
productSchema.methods.reserveStock = function(startDate, endDate, quantity, orderId) {
    if (!this.checkAvailability(startDate, endDate, quantity)) {
        throw new Error('Insufficient stock for the requested period');
    }
    
    this.availability.push({
        startDate,
        endDate,
        quantity,
        orderId
    });
    
    this.inventory.quantityReserved += quantity;
    return this.save();
};

// Method to release reserved stock
productSchema.methods.releaseStock = function(orderId) {
    const bookingIndex = this.availability.findIndex(booking => 
        booking.orderId.toString() === orderId.toString()
    );
    
    if (bookingIndex !== -1) {
        const booking = this.availability[bookingIndex];
        this.inventory.quantityReserved -= booking.quantity;
        this.availability.splice(bookingIndex, 1);
        return this.save();
    }
    
    throw new Error('Booking not found');
};

// Pre-save middleware to generate SKU if not provided
productSchema.pre('save', async function(next) {
    if (!this.sku) {
        const count = await this.constructor.countDocuments();
        this.sku = `PRD-${String(count + 1).padStart(6, '0')}`;
    }
    next();
});

module.exports = mongoose.model('Product', productSchema);
