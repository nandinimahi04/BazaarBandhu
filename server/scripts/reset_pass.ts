import mongoose from 'mongoose';
import 'dotenv/config';
import User from '../models/User';
import bcrypt from 'bcryptjs';

async function reset() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bazaarbandhu');
        const hashedPassword = await bcrypt.hash('password123', 10);
        await User.updateOne({ email: 'vinay@gmail.com' }, { $set: { password: hashedPassword } });
        console.log('Password reset successfully for vinay@gmail.com');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

reset();
