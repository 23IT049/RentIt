const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema({
    // Registration Settings
    registration: {
        allowVendorRegistration: {
            type: Boolean,
            default: true
        },
        requireGstinForVendors: {
            type: Boolean,
            default: true
        },
        autoApproveVendors: {
            type: Boolean,
            default: false
        },
        requireEmailVerification: {
            type: Boolean,
            default: false
        }
    },

    // Rental Settings
    rental: {
        maxRentalDays: {
            type: Number,
            default: 30,
            min: 1,
            max: 365
        },
        lateFeePerHour: {
            type: Number,
            default: 5,
            min: 0
        },
        securityDepositRequired: {
            type: Boolean,
            default: true
        },
        minSecurityDepositPercent: {
            type: Number,
            default: 10,
            min: 0,
            max: 100
        }
    },

    // Payment Settings
    payment: {
        enableCouponCodes: {
            type: Boolean,
            default: true
        },
        currency: {
            type: String,
            default: 'USD',
            enum: ['USD', 'INR', 'EUR', 'GBP']
        },
        taxRate: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },
        allowPartialPayments: {
            type: Boolean,
            default: true
        }
    },

    // Notification Settings
    notifications: {
        emailNotifications: {
            type: Boolean,
            default: true
        },
        smsNotifications: {
            type: Boolean,
            default: false
        },
        notifyOnNewOrder: {
            type: Boolean,
            default: true
        },
        notifyOnVendorRegistration: {
            type: Boolean,
            default: true
        },
        notifyOnReturnDue: {
            type: Boolean,
            default: true
        }
    },

    // Business Settings
    business: {
        companyName: {
            type: String,
            default: 'RentIt'
        },
        supportEmail: {
            type: String,
            default: 'support@rentit.com'
        },
        supportPhone: {
            type: String,
            default: ''
        },
        address: {
            street: String,
            city: String,
            state: String,
            zipCode: String,
            country: String
        }
    },

    // Feature Flags
    features: {
        enableReviews: {
            type: Boolean,
            default: true
        },
        enableWishlist: {
            type: Boolean,
            default: true
        },
        enableChat: {
            type: Boolean,
            default: false
        },
        enableAnalytics: {
            type: Boolean,
            default: true
        }
    },

    // Metadata
    lastUpdatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Ensure only one settings document exists
systemSettingsSchema.statics.getSettings = async function () {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({});
    }
    return settings;
};

// Update settings
systemSettingsSchema.statics.updateSettings = async function (updates, userId) {
    let settings = await this.getSettings();
    Object.assign(settings, updates);
    settings.lastUpdatedBy = userId;
    await settings.save();
    return settings;
};

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);
