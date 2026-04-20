import mongoose from 'mongoose';
import 'dotenv/config';

async function check() {
    await mongoose.connect(process.env.MONGODB_URI!);
    const user = await mongoose.connection.db!.collection('users').findOne({ userType: { $in: ['supplier', 'Supplier'] } });
    console.log('USER_TYPE_IN_DB:', user?.userType);
    process.exit(0);
}

check();
