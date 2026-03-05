import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function fixMongoIssues() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI!);
        console.log('✅ Connected');

        const usersCollection = mongoose.connection.db.collection('users');

        console.log('Inspecting indexes...');
        const indexes = await usersCollection.indexes();
        console.log('Current indexes:', indexes.map(idx => idx.name));

        // 1. Drop the problematic text index if it exists
        const textIndex = indexes.find(idx => idx.name.includes('_text_'));
        if (textIndex) {
            console.log(`Dropping index: ${textIndex.name}`);
            await usersCollection.dropIndex(textIndex.name);
            console.log('✅ Dropped text index');
        }

        // 2. Clear any other potentially conflicting indexes
        // Specifically look for language related issues
        for (const idx of indexes) {
            if (idx.language_override || idx.name.includes('language')) {
                console.log(`Dropping suspicious index: ${idx.name}`);
                await usersCollection.dropIndex(idx.name);
            }
        }

        // 3. Migrate 'language' field to 'appLanguage' for any stray documents
        console.log('Migrating fields...');
        const migrateResult = await usersCollection.updateMany(
            { language: { $exists: true } },
            [
                { $set: { appLanguage: "$language" } },
                { $unset: ["language"] }
            ]
        );
        console.log(`✅ Migrated ${migrateResult.modifiedCount} documents.`);

        console.log('Cleanup complete. Re-creating indexes via mongoose in the next run.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during fix:', error);
        process.exit(1);
    }
}

fixMongoIssues();
