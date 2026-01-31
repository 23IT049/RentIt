const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
        required: true
    },
    renter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required']
    },
    endDate: {
        type: Date,
        required: [true, 'End date is required']
    },
    totalHours: {
        type: Number,
        default: 24
    },
    rentalPrice: {
        type: Number,
        required: true
    },
    deposit: {
        type: Number,
        default: 0
    },
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'refunded'],
        default: 'pending'
    },
    paymentIntentId: {
        type: String
    },
    pickupLocation: {
        type: String
    },
    returnLocation: {
        type: String
    },
    notes: {
        type: String
    }
}, {
    timestamps: true
});

// Calculate end date (24 hours from start)
bookingSchema.pre('save', function (next) {
    if (this.isNew && !this.endDate) {
        this.endDate = new Date(this.startDate.getTime() + (24 * 60 * 60 * 1000));
    }
    next();
});

module.exports = mongoose.model('Booking', bookingSchema);
