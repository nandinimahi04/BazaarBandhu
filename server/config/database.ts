import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bazaarbandhu');

        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Create indexes
        await createIndexes();

    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

const createIndexes = async () => {
    try {
        const db = mongoose.connection.db;
        if (!db) return;

        // Drop old problematic compound index on two array fields (parallel arrays).
        // This index causes "cannot index parallel arrays" errors during inserts/updates.
        try {
            const existingIndexes = await db.collection('users').indexes();
            const badIndex = existingIndexes.find((idx: any) =>
                idx.key &&
                idx.key.productCategories !== undefined &&
                idx.key['serviceAreas.pincode'] !== undefined
            );
            if (badIndex) {
                await db.collection('users').dropIndex(badIndex.name);
                console.log('⚠️  Dropped legacy parallel-array index on users collection.');
            }
        } catch (_) {
            // Ignore if not found
        }

        // Create compound indexes for better query performance
        await db.collection('users').createIndex({
            location: '2dsphere'
        });

        await db.collection('users').createIndex({
            userType: 1,
            isActive: 1,
            'rating.average': -1
        });

        // Two separate indexes (replacing the old broken compound parallel-array index)
        await db.collection('users').createIndex({
            productCategories: 1
        });

        await db.collection('users').createIndex({
            'serviceAreas.pincode': 1
        });

        await db.collection('orders').createIndex({
            vendor: 1,
            placedAt: -1
        });

        await db.collection('orders').createIndex({
            supplier: 1,
            status: 1
        });

        console.log('Database indexes created successfully');

    } catch (error) {
        console.error('Error creating indexes:', error);
    }
};

export default connectDB;
