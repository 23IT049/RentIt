const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

// Load environment variables
dotenv.config();

const debugProducts = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Get all products
        const allProducts = await Product.find().populate('vendor', 'name email companyName');

        console.log(`\n📦 Total products in database: ${allProducts.length}\n`);

        if (allProducts.length === 0) {
            console.log('❌ No products found in database!');
            process.exit(0);
        }

        // Display each product
        allProducts.forEach((product, index) => {
            console.log(`\n--- Product ${index + 1} ---`);
            console.log(`Name: ${product.name}`);
            console.log(`SKU: ${product.sku}`);
            console.log(`Vendor: ${product.vendor?.name || product.vendor?.companyName || 'N/A'}`);
            console.log(`Category: ${product.category}`);
            console.log(`Approval Status: ${product.approvalStatus || 'NOT SET'}`);
            console.log(`Is Published: ${product.isPublished}`);
            console.log(`Created: ${product.createdAt}`);
        });

        // Count by status
        console.log('\n\n📊 Product Statistics:');
        const pending = await Product.countDocuments({ approvalStatus: 'pending' });
        const approved = await Product.countDocuments({ approvalStatus: 'approved' });
        const rejected = await Product.countDocuments({ approvalStatus: 'rejected' });
        const noStatus = await Product.countDocuments({
            $or: [
                { approvalStatus: { $exists: false } },
                { approvalStatus: null }
            ]
        });

        console.log(`- Pending: ${pending}`);
        console.log(`- Approved: ${approved}`);
        console.log(`- Rejected: ${rejected}`);
        console.log(`- No Status: ${noStatus}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Debug failed:', error);
        process.exit(1);
    }
};

debugProducts();
