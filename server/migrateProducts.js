const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

// Load environment variables
dotenv.config();

const migrateProducts = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Find all products that don't have approvalStatus field
        const productsToUpdate = await Product.find({
            $or: [
                { approvalStatus: { $exists: false } },
                { approvalStatus: null }
            ]
        });

        console.log(`Found ${productsToUpdate.length} products to update`);

        if (productsToUpdate.length === 0) {
            console.log('No products need migration');
            process.exit(0);
        }

        // Update each product
        for (const product of productsToUpdate) {
            product.approvalStatus = 'pending';

            // If product was already published, approve it automatically
            if (product.isPublished) {
                product.approvalStatus = 'approved';
                console.log(`✅ Auto-approved published product: ${product.name}`);
            } else {
                console.log(`📝 Set pending status for: ${product.name}`);
            }

            await product.save();
        }

        console.log(`\n✅ Successfully migrated ${productsToUpdate.length} products`);
        console.log('\nSummary:');

        const approved = await Product.countDocuments({ approvalStatus: 'approved' });
        const pending = await Product.countDocuments({ approvalStatus: 'pending' });
        const rejected = await Product.countDocuments({ approvalStatus: 'rejected' });

        console.log(`- Approved: ${approved}`);
        console.log(`- Pending: ${pending}`);
        console.log(`- Rejected: ${rejected}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
};

migrateProducts();
