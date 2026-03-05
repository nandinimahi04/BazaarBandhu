import mongoose from 'mongoose';
import 'dotenv/config';
import User from '../models/User';

async function check() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bazaarbandhu');
    const user = await User.findOne({ email: 'vinay@gmail.com' });
    console.log('User password in DB:', user.password);
    process.exit(0);
}
check();
