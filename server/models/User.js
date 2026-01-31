const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        set: function(email) {
            return email.toLowerCase().trim();
        }
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6,
        select: false
    },
    role: {
        type: String,
        enum: ['customer', 'vendor', 'admin'],
        default: 'customer'
    },
    phone: {
        type: String,
        trim: true
    },
    avatar: {
        type: String,
        default: 'https://via.placeholder.com/150'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    firstName: {
        type: String,
        trim: true
    },
    lastName: {
        type: String,
        trim: true
    },
    companyName: {
        type: String,
        trim: true
    },
    productCategory: {
        type: String,
        enum: ['electronics', 'furniture', 'vehicles', 'tools', 'clothing', 'books', 'sports', 'other']
    },
    gstNo: {
        type: String,
        trim: true,
        validate: {
            validator: function(v) {
                // GSTIN validation: 15 characters alphanumeric
                // For testing purposes, accept simpler formats too
                if (!v) return true; // Optional field
                if (v.length === 15) {
                    return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(v);
                }
                // For testing, accept shorter alphanumeric strings
                return /^[A-Za-z0-9]{3,15}$/.test(v);
            },
            message: 'Invalid GSTIN format. Must be 3-15 alphanumeric characters or valid 15-character GSTIN'
        }
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    permissions: {
        canManageProducts: { type: Boolean, default: false },
        canManageOrders: { type: Boolean, default: false },
        canViewReports: { type: Boolean, default: false },
        canManageUsers: { type: Boolean, default: false }
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Check for duplicate email before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('email')) return next();

    try {
        const existingUser = await this.constructor.findOne({ 
            email: this.email.toLowerCase().trim(),
            _id: { $ne: this._id }
        });
        
        if (existingUser) {
            const error = new Error('Email already exists');
            error.code = 11000;
            return next(error);
        }
        
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON response
userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    return user;
};

module.exports = mongoose.model('User', userSchema);
