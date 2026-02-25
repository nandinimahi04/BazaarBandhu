const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
const User = require('../models/User');
const Vendor = require('../models/Vendor');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function seedVijay() {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) throw new Error('MONGODB_URI not found in .env');

        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        const email = 'vijay.pani@puri.com';
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            console.log('User already exists, updating password...');
            const hashedPassword = await bcrypt.hash('password123', 10);
            existingUser.password = hashedPassword;
            await existingUser.save();
            console.log('Vijay Shukla updated successfully');
        } else {
            console.log('Creating Vijay Shukla...');
            const hashedPassword = await bcrypt.hash('password123', 10);

            const vijay = new Vendor({
                fullName: 'Vijay Shukla',
                email: email,
                password: hashedPassword,
                phone: '+91 99999 88888',
                userType: 'vendor',
                businessName: 'Vijay Pani Puri Center',
                businessCategory: 'street_food',
                address: {
                    street: 'Main Street, Sector 5',
                    city: 'Mumbai',
                    state: 'Maharashtra',
                    pincode: '400001'
                },
                location: {
                    type: 'Point',
                    coordinates: [72.8777, 19.0760]
                }
            });

            await vijay.save();
            console.log('Vijay Shukla registered successfully');
        }

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Error seeding Vijay:', error);
        process.exit(1);
    }
}

seedVijay();
