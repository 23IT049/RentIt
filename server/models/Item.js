const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['Electronics', 'Vehicles', 'Equipment', 'Sports', 'Tools', 'Other'],
        default: 'Other'
    },
    price: {
        type: Number,
        required: [true, 'Price per 24 hours is required'],
        min: 0
    },
    deposit: {
        type: Number,
        default: 0,
        min: 0
    },
    image: {
        type: String,
        default: 'https://via.placeholder.com/400x300'
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    location: {
        type: String,
        required: [true, 'Location is required']
    },
    available: {
        type: Boolean,
        default: true
    },
    features: [{
        type: String
    }],
    condition: {
        type: String,
        enum: ['New', 'Like New', 'Good', 'Fair'],
        default: 'Good'
    },
    approvalStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    rejectionReason: {
        type: String
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedAt: {
        type: Date
    },
    terms: {
        type: String,
        default: 'Standard rental terms apply'
    }
}, {
    timestamps: true
});

// Index for search
itemSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Item', itemSchema);
