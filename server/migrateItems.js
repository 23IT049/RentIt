const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Item = require('./models/Item');

// Load environment variables
dotenv.config();

const migrateItems = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Find all items that don't have approvalStatus field
        const itemsToUpdate = await Item.find({
            $or: [
                { approvalStatus: { $exists: false } },
                { approvalStatus: null }
            ]
        });

        console.log(`Found ${itemsToUpdate.length} items to update`);

        if (itemsToUpdate.length === 0) {
            console.log('No items need migration');

            // Show current stats
            const total = await Item.countDocuments();
            const approved = await Item.countDocuments({ approvalStatus: 'approved' });
            const pending = await Item.countDocuments({ approvalStatus: 'pending' });
            const rejected = await Item.countDocuments({ approvalStatus: 'rejected' });

            console.log(`\nCurrent Stats:`);
            console.log(`- Total Items: ${total}`);
            console.log(`- Approved: ${approved}`);
            console.log(`- Pending: ${pending}`);
            console.log(`- Rejected: ${rejected}`);

            process.exit(0);
        }

        // Update each item - set to pending by default
        for (const item of itemsToUpdate) {
            item.approvalStatus = 'pending';
            console.log(`📝 Set pending status for: ${item.title}`);
            await item.save();
        }

        console.log(`\n✅ Successfully migrated ${itemsToUpdate.length} items to pending status`);

        const approved = await Item.countDocuments({ approvalStatus: 'approved' });
        const pending = await Item.countDocuments({ approvalStatus: 'pending' });
        const rejected = await Item.countDocuments({ approvalStatus: 'rejected' });

        console.log('\nFinal Summary:');
        console.log(`- Approved: ${approved}`);
        console.log(`- Pending: ${pending}`);
        console.log(`- Rejected: ${rejected}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
};

migrateItems();
