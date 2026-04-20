import mongoose from 'mongoose';
import 'dotenv/config';
import User from './models/User.js';
import Supplier from './models/Supplier.js';

async function check() {
    await mongoose.connect(process.env.MONGODB_URI!);
    const suppliers = await Supplier.find({}).limit(10);
    console.log('SUPPLIERS_COUNT:', suppliers.length);
    console.log('SUPPLIERS_DATA:', JSON.stringify(suppliers.map(s => ({
        name: s.businessName || s.fullName,
        type: s.userType,
        active: s.isActive,
        categories: s.productCategories
    })), null, 2));
    process.exit(0);
}

check();
