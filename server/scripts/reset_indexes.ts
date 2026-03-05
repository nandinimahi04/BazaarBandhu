import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function resetIndexes() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI!);
        console.log('✅ Connected');

        const usersCollection = mongoose.connection.db.collection('users');

        console.log('Dropping all indexes on the `users` collection...');
        try {
            await usersCollection.dropIndexes();
            console.log('✅ All indexes dropped successfully.');
        } catch (err: any) {
            console.warn('⚠️ Error dropping indexes (maybe none exist):', err.message);
        }

        // Migrate 'language' field to 'appLanguage' for any stray documents
        console.log('Migrating stray fields...');
        const migrateResult = await usersCollection.updateMany(
            { language: { $exists: true } },
            [
                { $set: { appLanguage: "$language" } },
                { $unset: ["language"] }
            ]
        );
        console.log(`✅ Migrated ${migrateResult.modifiedCount} documents.`);

        console.log('Done. Restart the server back to let Mongoose recreate indexes.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during reset:', error);
        process.exit(1);
    }
}

resetIndexes();
