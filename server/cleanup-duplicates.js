const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function cleanupDuplicateUsers() {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find all users with duplicate emails
        const duplicates = await User.aggregate([
            {
                $group: {
                    _id: { $toLower: '$email' },
                    docs: { $push: '$$ROOT' },
                    count: { $sum: 1 }
                }
            },
            {
                $match: {
                    count: { $gt: 1 }
                }
            }
        ]);

        console.log(`Found ${duplicates.length} duplicate email groups`);

        for (const duplicate of duplicates) {
            console.log(`\nProcessing email: ${duplicate._id}`);
            
            // Sort by creation date, keep the oldest one
            duplicate.docs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            
            // Keep the first (oldest) document, delete the rest
            const toKeep = duplicate.docs[0];
            const toDelete = duplicate.docs.slice(1);
            
            console.log(`Keeping: ${toKeep.role} (${toKeep._id}) created on ${toKeep.createdAt}`);
            console.log(`Deleting ${toDelete.length} duplicates:`);
            
            for (const doc of toDelete) {
                console.log(`  - Deleting: ${doc.role} (${doc._id}) created on ${doc.createdAt}`);
                await User.findByIdAndDelete(doc._id);
            }
        }

        console.log('\nCleanup completed successfully');

    } catch (error) {
        console.error('Error during cleanup:', error);
    } finally {
        await mongoose.disconnect();
    }
}

cleanupDuplicateUsers();
