import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

// Import models (using ES module imports)
import User from '../models/User.js';
import Supplier from '../models/Supplier.js';

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bazaarbandhu');
        console.log('✅ Connected to MongoDB for adding suppliers');
    } catch (error) {
        console.error('❌ Connection error:', error);
        process.exit(1);
    }
}

const suppliersToAdd = [
    // --- VEGETABLES & FRUITS ---
    {
        fullName: 'Arjun Singh',
        email: 'arjun@greenharvest.com',
        businessName: 'Green Harvest Organics',
        phone: '9820012345',
        address: { street: 'Sabzi Mandi Yard 4', city: 'Mumbai', state: 'Maharashtra', pincode: '400037' },
        productCategories: ['Vegetables', 'Fruits'],
        products: [
            { name: 'Organic Spinach', category: 'Vegetables', unit: 'kg', pricePerUnit: 40, marketPrice: 55, inventory: 500 },
            { name: 'Kashmiri Apples', category: 'Fruits', unit: 'kg', pricePerUnit: 160, marketPrice: 200, inventory: 300 },
            { name: 'Fresh Carrots', category: 'Vegetables', unit: 'kg', pricePerUnit: 45, marketPrice: 60, inventory: 400 }
        ]
    },
    {
        fullName: 'Zoya Khan',
        email: 'zoya@khanfruit.com',
        businessName: 'Khan Premium Fruits',
        phone: '9820054321',
        address: { street: 'Fruit Market Road', city: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
        productCategories: ['Fruits'],
        products: [
            { name: 'Alphonso Mangoes', category: 'Fruits', unit: 'dozen', pricePerUnit: 600, marketPrice: 850, inventory: 100 },
            { name: 'Green Grapes', category: 'Fruits', unit: 'kg', pricePerUnit: 80, marketPrice: 110, inventory: 250 },
            { name: 'Pomegranates', category: 'Fruits', unit: 'kg', pricePerUnit: 140, marketPrice: 180, inventory: 150 }
        ]
    },
    // --- SPICES ---
    {
        fullName: 'Vikram Masala',
        email: 'vikram@masalaking.com',
        businessName: 'Masala King Industries',
        phone: '9811122233',
        address: { street: 'Spice Lane', city: 'Delhi', state: 'Delhi', pincode: '110006' },
        productCategories: ['Spices'],
        products: [
            { name: 'Red Chili Powder', category: 'Spices', unit: 'kg', pricePerUnit: 250, marketPrice: 320, inventory: 1000 },
            { name: 'Turmeric (Haldi)', category: 'Spices', unit: 'kg', pricePerUnit: 180, marketPrice: 240, inventory: 800 },
            { name: 'Garam Masala', category: 'Spices', unit: 'kg', pricePerUnit: 450, marketPrice: 600, inventory: 500 }
        ]
    },
    {
        fullName: 'Anjali Spices',
        email: 'anjali@pureflavor.com',
        businessName: 'Pure Flavor Spices',
        phone: '9988776655',
        address: { street: 'Old Town Square', city: 'Ahmedabad', state: 'Gujarat', pincode: '380001' },
        productCategories: ['Spices', 'Dry Goods'],
        products: [
            { name: 'Cumin Seeds (Jeera)', category: 'Spices', unit: 'kg', pricePerUnit: 350, marketPrice: 420, inventory: 600 },
            { name: 'Black Pepper', category: 'Spices', unit: 'kg', pricePerUnit: 700, marketPrice: 850, inventory: 200 }
        ]
    },
    // --- GRAINS ---
    {
        fullName: 'Balbir Singh',
        email: 'balbir@punjabgrains.com',
        businessName: 'Punjab Royal Grains',
        phone: '9123443210',
        address: { street: 'Grain Market Sector 2', city: 'Amritsar', state: 'Punjab', pincode: '143001' },
        productCategories: ['Grains'],
        products: [
            { name: 'Basmati Rice', category: 'Grains', unit: 'kg', pricePerUnit: 110, marketPrice: 150, inventory: 5000 },
            { name: 'Wheat Flour (Atta)', category: 'Grains', unit: 'kg', pricePerUnit: 40, marketPrice: 52, inventory: 10000 },
            { name: 'Toor Dal', category: 'Grains', unit: 'kg', pricePerUnit: 160, marketPrice: 190, inventory: 2000 }
        ]
    },
    // --- DAIRY ---
    {
        fullName: 'Meera Dairy',
        email: 'meera@shaktimilk.com',
        businessName: 'Shakti Milk Co-op',
        phone: '9888877777',
        address: { street: 'Dairy Colony', city: 'Anand', state: 'Gujarat', pincode: '388001' },
        productCategories: ['Dairy'],
        products: [
            { name: 'Full Cream Milk', category: 'Dairy', unit: 'litre', pricePerUnit: 64, marketPrice: 68, inventory: 1000 },
            { name: 'Fresh Paneer', category: 'Dairy', unit: 'kg', pricePerUnit: 380, marketPrice: 450, inventory: 200 },
            { name: 'Desi Ghee', category: 'Dairy', unit: 'kg', pricePerUnit: 550, marketPrice: 650, inventory: 500 }
        ]
    },
    // --- MEAT ---
    {
        fullName: 'Irfan Meat',
        email: 'irfan@qualitymeat.com',
        businessName: 'Quality Halal Meats',
        phone: '9877766655',
        address: { street: 'Abattoir Road', city: 'Mumbai', state: 'Maharashtra', pincode: '400043' },
        productCategories: ['Meat'],
        products: [
            { name: 'Chicken Breast', category: 'Meat', unit: 'kg', pricePerUnit: 240, marketPrice: 300, inventory: 100 },
            { name: 'Mutton Curry Cut', category: 'Meat', unit: 'kg', pricePerUnit: 750, marketPrice: 850, inventory: 50 }
        ]
    },
    // --- BEVERAGES ---
    {
        fullName: 'Kiran Beverages',
        email: 'kiran@refresh.com',
        businessName: 'Refresh Wholesale Beverages',
        phone: '9666655544',
        address: { street: 'Bottling Lane', city: 'Bangalore', state: 'Karnataka', pincode: '560001' },
        productCategories: ['Beverages'],
        products: [
            { name: 'Mineral Water (20L)', category: 'Beverages', unit: 'can', pricePerUnit: 50, marketPrice: 80, inventory: 200 },
            { name: 'Bulk Tea Dust', category: 'Beverages', unit: 'kg', pricePerUnit: 220, marketPrice: 300, inventory: 500 }
        ]
    },
    // --- DRY GOODS ---
    {
        fullName: 'Suresh Dry Fruits',
        email: 'suresh@dryfruitworld.com',
        businessName: 'Dry Fruit World',
        phone: '9555544433',
        address: { street: 'Nuts Corner', city: 'Navi Mumbai', state: 'Maharashtra', pincode: '400703' },
        productCategories: ['Dry Goods'],
        products: [
            { name: 'Almonds (Badam)', category: 'Dry Goods', unit: 'kg', pricePerUnit: 850, marketPrice: 1100, inventory: 300 },
            { name: 'Cashews (Kaju)', category: 'Dry Goods', unit: 'kg', pricePerUnit: 900, marketPrice: 1200, inventory: 250 }
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
                deliveryRadius: 30,
                minOrderAmount: 1000,
                paymentMethods: ['Cash', 'UPI', 'Bank Transfer'],
                workingHours: { from: '06:00', to: '19:00' },
                serviceAreas: [
                    { pincode: '400001', deliveryCharge: 0 },
                    { pincode: '400037', deliveryCharge: 0 },
                    { pincode: '110001', deliveryCharge: 0 },
                    { pincode: '110006', deliveryCharge: 0 }
                ],
                trustScore: 85 + Math.floor(Math.random() * 15)
            });

            await supplier.save();
            console.log(`✅ Added supplier: ${data.businessName} (${data.productCategories.join(', ')})`);
        } catch (err) {
            console.error(`❌ Error adding ${data.businessName}:`, err.message);
        }
    }

    mongoose.connection.close();
    console.log('🏁 Supplier seeding complete.');
}

addSuppliers();
