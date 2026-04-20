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

        // Helper: create index only if no existing index covers the same key(s)
        const safeCreateIndex = async (collection: string, keySpec: Record<string, any>, options: Record<string, any> = {}) => {
            try {
                const existing = await db.collection(collection).indexes();
                const keyFields = Object.keys(keySpec);
                const alreadyExists = existing.some((idx: any) =>
                    idx.key && keyFields.every(k => idx.key[k] !== undefined)
                );
                if (!alreadyExists) {
                    await db.collection(collection).createIndex(keySpec, options);
                }
            } catch (e: any) {
                // If conflict still happens (e.g. name clash), just log and continue
                console.warn(`⚠️  Skipped index on "${collection}" (${JSON.stringify(keySpec)}): ${e.message}`);
            }
        };

        // Drop old problematic compound index on two array fields (parallel arrays)
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

        // users collection indexes
        await safeCreateIndex('users', { location: '2dsphere' });
        await safeCreateIndex('users', { userType: 1, isActive: 1, 'rating.average': -1 });
        await safeCreateIndex('users', { productCategories: 1 });
        await safeCreateIndex('users', { 'serviceAreas.pincode': 1 });

        // orders collection indexes
        await safeCreateIndex('orders', { vendor: 1, placedAt: -1 });
        await safeCreateIndex('orders', { supplier: 1, status: 1 });

        console.log('✅ Database indexes checked/created successfully');

    } catch (error) {
        console.error('Error creating indexes:', error);
    }
};


export default connectDB;
