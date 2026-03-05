import mongoose from 'mongoose';
import 'dotenv/config';
import User from '../models/User';
import Vendor from '../models/Vendor';
import Supplier from '../models/Supplier';
import Order from '../models/Order';

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bazaarbandhu');
        console.log('Connected to DB');

        const users = await User.find({});
        console.log(`Total users: ${users.length}`);
        users.forEach(u => {
            console.log(`- ${u.email} (${u.userType}) - ${u.fullName}`);
        });

        const vendors = await Vendor.find({});
        console.log(`Total vendors: ${vendors.length}`);

        const suppliers = await Supplier.find({});
        console.log(`Total suppliers: ${suppliers.length}`);

        const orders = await Order.find({});
        console.log(`Total orders: ${orders.length}`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
