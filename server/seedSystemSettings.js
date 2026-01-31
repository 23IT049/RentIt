const mongoose = require('mongoose');
const dotenv = require('dotenv');
const SystemSettings = require('./models/SystemSettings');

// Load environment variables
dotenv.config();

const seedSystemSettings = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB connected successfully');

        // Check if settings already exist
        const existingSettings = await SystemSettings.findOne();

        if (existingSettings) {
            console.log('⚠️  System settings already exist. Skipping seed.');
            console.log('Current settings:', existingSettings);
        } else {
            // Create default settings
            const settings = await SystemSettings.create({
                registration: {
                    allowVendorRegistration: true,
                    requireGstinForVendors: true,
                    autoApproveVendors: false,
                    requireEmailVerification: false
                },
                rental: {
                    maxRentalDays: 30,
                    lateFeePerHour: 5,
                    securityDepositRequired: true,
                    minSecurityDepositPercent: 10
                },
                payment: {
                    enableCouponCodes: true,
                    currency: 'USD',
                    taxRate: 0,
                    allowPartialPayments: true
                },
                notifications: {
                    emailNotifications: true,
                    smsNotifications: false,
                    notifyOnNewOrder: true,
                    notifyOnVendorRegistration: true,
                    notifyOnReturnDue: true
                },
                business: {
                    companyName: 'RentIt',
                    supportEmail: 'support@rentit.com',
                    supportPhone: '',
                    address: {
                        street: '',
                        city: '',
                        state: '',
                        zipCode: '',
                        country: ''
                    }
                },
                features: {
                    enableReviews: true,
                    enableWishlist: true,
                    enableChat: false,
                    enableAnalytics: true
                }
            });

            console.log('✅ System settings created successfully');
            console.log(settings);
        }

        // Close connection
        await mongoose.connection.close();
        console.log('✅ Database connection closed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding system settings:', error);
        process.exit(1);
    }
};

seedSystemSettings();
