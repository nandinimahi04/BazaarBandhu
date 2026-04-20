import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

// Import models
import User from '../models/User.js';
import Supplier from '../models/Supplier.js';

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bazaarbandhu');
        console.log('✅ Connected to MongoDB for adding more suppliers');
    } catch (error) {
        console.error('❌ Connection error:', error);
        process.exit(1);
    }
}

const suppliersToAdd = [
    {
        fullName: 'Rajesh Packaging',
        email: 'rajesh@ecopack.com',
        businessName: 'EcoPack Solutions',
        phone: '9821122334',
        address: { street: 'Industrial Estate Plot 12', city: 'Mumbai', state: 'Maharashtra', pincode: '400013' },
        productCategories: ['Packaging', 'Dry Goods'],
        products: [
            { name: 'Biodegradable Plates', category: 'Packaging', unit: 'pack', pricePerUnit: 120, marketPrice: 150, inventory: 1000 },
            { name: 'Paper Cups (200ml)', category: 'Packaging', unit: 'pack', pricePerUnit: 80, marketPrice: 100, inventory: 2000 },
            { name: 'Bamboo Spoons', category: 'Supplies', unit: 'pack', pricePerUnit: 50, marketPrice: 70, inventory: 1500 }
        ]
    },
    {
        fullName: 'Sunil Gupta',
        email: 'sunil@guptaoils.com',
        businessName: 'Gupta Edible Oils',
        phone: '9833344455',
        address: { street: 'Oil Mill Compound', city: 'Surat', state: 'Gujarat', pincode: '395003' },
        productCategories: ['Oils', 'Grains'],
        products: [
            { name: 'Refined Sunflower Oil (15L)', category: 'Oils', unit: 'tin', pricePerUnit: 1650, marketPrice: 1800, inventory: 500 },
            { name: 'Mustard Oil (5L)', category: 'Oils', unit: 'can', pricePerUnit: 750, marketPrice: 850, inventory: 300 },
            { name: 'Soybean Oil (1L)', category: 'Oils', unit: 'pouch', pricePerUnit: 110, marketPrice: 130, inventory: 1000 }
        ]
    },
    {
        fullName: 'Laxmi Flour Mill',
        email: 'laxmi@flourmill.com',
        businessName: 'Laxmi Premium Flour',
        phone: '9766655544',
        address: { street: 'Chakki Gali', city: 'Indore', state: 'Madhya Pradesh', pincode: '452001' },
        productCategories: ['Grains', 'Flour'],
        products: [
            { name: 'Premium Maida', category: 'Flour', unit: '50kg Bag', pricePerUnit: 1450, marketPrice: 1600, inventory: 200 },
            { name: 'Gram Flour (Besan)', category: 'Flour', unit: 'kg', pricePerUnit: 85, marketPrice: 105, inventory: 500 },
            { name: 'Semolina (Sooji)', category: 'Flour', unit: 'kg', pricePerUnit: 45, marketPrice: 60, inventory: 400 }
        ]
    },
    {
        fullName: 'City Frozen Foods',
        email: 'contact@cityfrozen.com',
        businessName: 'City Cold Chain',
        phone: '9122233344',
        address: { street: 'Cold Storage Road', city: 'Pune', state: 'Maharashtra', pincode: '411001' },
        productCategories: ['Frozen', 'Vegetables'],
        products: [
            { name: 'Frozen Sweet Corn', category: 'Frozen', unit: 'kg', pricePerUnit: 120, marketPrice: 160, inventory: 200 },
            { name: 'Frozen Green Peas', category: 'Frozen', unit: 'kg', pricePerUnit: 90, marketPrice: 130, inventory: 300 },
            { name: 'French Fries', category: 'Frozen', unit: 'packet', pricePerUnit: 180, marketPrice: 240, inventory: 150 }
        ]
    },
    {
        fullName: 'Bansi Lal',
        email: 'bansi@localfarms.com',
        businessName: 'Village Direct Farm',
        phone: '9444455566',
        address: { street: 'Krishi Mandi', city: 'Nashik', state: 'Maharashtra', pincode: '422001' },
        productCategories: ['Vegetables'],
        products: [
            { name: 'Red Onions (Nashik)', category: 'Vegetables', unit: '50kg Bag', pricePerUnit: 950, marketPrice: 1200, inventory: 100 },
            { name: 'Fresh Potatoes', category: 'Vegetables', unit: '50kg Bag', pricePerUnit: 700, marketPrice: 900, inventory: 150 },
            { name: 'Green Chilies (Bulk)', category: 'Vegetables', unit: 'kg', pricePerUnit: 55, marketPrice: 80, inventory: 200 }
        ]
    }
];

async function addSuppliers() {
    await connectDB();
    const hashedPassword = await bcrypt.hash('password123', 10);

    for (const data of suppliersToAdd) {
        try {
            const existing = await User.findOne({ email: data.email });
            if (existing) {
                console.log(`⚠️  Supplier with email ${data.email} already exists. Skipping.`);
                continue;
            }

            const supplier = new Supplier({
                ...data,
                password: hashedPassword,
                userType: 'supplier',
                deliveryRadius: 50,
                minOrderAmount: 500,
                paymentMethods: ['Cash', 'UPI', 'Bank Transfer', 'Credit'],
                workingHours: { from: '05:00', to: '20:00' },
                serviceAreas: [
                    { pincode: '400001', deliveryCharge: 0 },
                    { pincode: '400013', deliveryCharge: 0 },
                    { pincode: '411001', deliveryCharge: 20 },
                    { pincode: '422001', deliveryCharge: 50 }
                ],
                trustScore: 90 + Math.floor(Math.random() * 10)
            });

            await supplier.save();
            console.log(`✅ Added supplier: ${data.businessName} (${data.productCategories.join(', ')})`);
        } catch (err: any) {
            console.error(`❌ Error adding ${data.businessName}:`, err.message);
        }
    }

    mongoose.connection.close();
    console.log('🏁 Additional Supplier seeding complete.');
}

addSuppliers();
