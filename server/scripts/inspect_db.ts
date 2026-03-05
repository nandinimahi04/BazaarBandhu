import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function inspectIndexes() {
    try {
        console.log('Connecting to:', process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI!);
        console.log('✅ Connected to MongoDB');

        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));

        const usersCollection = mongoose.connection.db.collection('users');
        const indexes = await usersCollection.indexes();
        console.log('\n--- Indexes on USERS collection ---');
        console.log(JSON.stringify(indexes, null, 2));

        // Check for duplicates in email
        const emailDuplicates = await usersCollection.aggregate([
            { $group: { _id: "$email", count: { $sum: 1 } } },
            { $match: { count: { $gt: 1 } } }
        ]).toArray();

        if (emailDuplicates.length > 0) {
            console.log('\n❌ Found duplicate emails:', emailDuplicates);
        } else {
            console.log('\n✅ No duplicate emails found.');
        }

        // Check for duplicates in phone (if unique was intended)
        const phoneDuplicates = await usersCollection.aggregate([
            { $group: { _id: "$phone", count: { $sum: 1 } } },
            { $match: { count: { $gt: 1 } } }
        ]).toArray();
        console.log('\nPhone counts (first few):', phoneDuplicates.slice(0, 5));

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

inspectIndexes();
