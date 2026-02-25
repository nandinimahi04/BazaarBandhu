const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Supplier = require('../models/Supplier');
const Order = require('../models/Order');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bazaarbandhu');
    console.log('MongoDB Connected for seeding');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Sample data
const sampleSuppliers = [
  {
    fullName: 'Ravi Kumar',
    email: 'ravi@ravitraders.com',
    password: 'password123',
    phone: '+91-9876543210',
    businessName: 'Ravi Traders & Sons',
    address: {
      street: '123 Market Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001'
    },
    productCategories: ['Vegetables', 'Fruits'],
    deliveryRadius: 15,
    minOrderAmount: 500,
    paymentMethods: ['Cash', 'UPI', 'Bank Transfer'],
    workingHours: { from: '06:00', to: '20:00' },
    gstNumber: '27AABCU9603R1ZX',
    fssaiLicense: '11016033000513',
    products: [
      {
        name: 'Onions',
        category: 'Vegetables',
        unit: 'kg',
        pricePerUnit: 88,
        currentStock: 150,
        quality: 'A+',
        description: 'Fresh red onions from local farms',
        isActive: true
      },
      {
        name: 'Tomatoes',
        category: 'Vegetables',
        unit: 'kg',
        pricePerUnit: 92,
        currentStock: 80,
        quality: 'A',
        description: 'Ripe red tomatoes',
        isActive: true
      },
      {
        name: 'Potatoes',
        category: 'Vegetables',
        unit: 'kg',
        pricePerUnit: 65,
        currentStock: 200,
        quality: 'A+',
        description: 'Fresh potatoes from Punjab',
        isActive: true
      }
    ],
    serviceAreas: [
      { pincode: '400001', deliveryCharge: 0, minimumOrderForFreeDelivery: 500 },
      { pincode: '400002', deliveryCharge: 30, minimumOrderForFreeDelivery: 800 },
      { pincode: '400003', deliveryCharge: 50, minimumOrderForFreeDelivery: 1000 }
    ],
    rating: { average: 4.8, count: 156 },
    trustScore: 92
  },
  {
    fullName: 'Sunita Sharma',
    email: 'sunita@freshfarms.com',
    password: 'password123',
    phone: '+91-9876543211',
    businessName: 'Fresh Farms Direct',
    address: {
      street: '456 Farm Road',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411001'
    },
    productCategories: ['Vegetables', 'Fruits', 'Dairy'],
    deliveryRadius: 20,
    minOrderAmount: 300,
    paymentMethods: ['Cash', 'UPI', 'Credit'],
    workingHours: { from: '05:00', to: '21:00' },
    gstNumber: '27BBFCU9603R1ZY',
    products: [
      {
        name: 'Milk',
        category: 'Dairy',
        unit: 'litre',
        pricePerUnit: 60,
        currentStock: 100,
        quality: 'A+',
        description: 'Fresh cow milk',
        isActive: true
      },
      {
        name: 'Spinach',
        category: 'Vegetables',
        unit: 'kg',
        pricePerUnit: 45,
        currentStock: 50,
        quality: 'A',
        description: 'Organic spinach leaves',
        isActive: true
      }
    ],
    serviceAreas: [
      { pincode: '411001', deliveryCharge: 0, minimumOrderForFreeDelivery: 300 },
      { pincode: '411002', deliveryCharge: 25, minimumOrderForFreeDelivery: 500 }
    ],
    rating: { average: 4.6, count: 89 },
    trustScore: 88
  },
  {
    fullName: 'Mohammad Ali',
    email: 'ali@oilexpress.com',
    password: 'password123',
    phone: '+91-9876543212',
    businessName: 'Oil Express',
    address: {
      street: '789 Industrial Area',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110001'
    },
    productCategories: ['Dry Goods', 'Spices'],
    deliveryRadius: 25,
    minOrderAmount: 1000,
    paymentMethods: ['UPI', 'Bank Transfer', 'Cheque'],
    workingHours: { from: '07:00', to: '19:00' },
    gstNumber: '07CCFCU9603R1ZZ',
    products: [
      {
        name: 'Cooking Oil',
        category: 'Dry Goods',
        unit: 'litre',
        pricePerUnit: 115,
        currentStock: 45,
        quality: 'Premium',
        description: 'Refined sunflower oil',
        isActive: true
      },
      {
        name: 'Turmeric Powder',
        category: 'Spices',
        unit: 'kg',
        pricePerUnit: 180,
        currentStock: 30,
        quality: 'A+',
        description: 'Pure turmeric powder',
        isActive: true
      }
    ],
    serviceAreas: [
      { pincode: '110001', deliveryCharge: 0, minimumOrderForFreeDelivery: 1000 },
      { pincode: '110002', deliveryCharge: 40, minimumOrderForFreeDelivery: 1200 }
    ],
    rating: { average: 4.7, count: 123 },
    trustScore: 85
  }
];

const sampleVendors = [
  {
    fullName: 'Rajesh Gupta',
    email: 'rajesh@streetfood.com',
    password: 'password123',
    phone: '+91-9876543220',
    businessName: 'Rajesh Street Food Corner',
    address: {
      street: '12 Food Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001'
    },
    businessCategory: 'street_food',
    creditLimit: 10000,
    currentCredit: 2500,
    preferredPaymentMethod: 'UPI',
    currentInventory: [
      {
        productName: 'Onions',
        category: 'Vegetables',
        quantity: 25,
        unit: 'kg',
        purchaseDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        costPrice: 88
      },
      {
        productName: 'Potatoes',
        category: 'Vegetables',
        quantity: 15,
        unit: 'kg',
        purchaseDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        costPrice: 65
      }
    ],
    recurringOrders: [
      {
        productName: 'Onions',
        quantity: 20,
        unit: 'kg',
        frequency: 'weekly',
        nextDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        isActive: true
      }
    ],
    purchaseAnalytics: {
      totalPurchases: 45,
      totalAmount: 125000,
      averageOrderValue: 2780,
      mostOrderedCategory: 'Vegetables'
    },
    savings: {
      totalSaved: 8500,
      lastMonthSavings: 1200
    },
    loyaltyPoints: 450,
    rating: { average: 4.5, count: 23 },
    trustScore: 78
  },
  {
    fullName: 'Priya Patel',
    email: 'priya@cafedelight.com',
    password: 'password123',
    phone: '+91-9876543221',
    businessName: 'Cafe Delight',
    address: {
      street: '34 College Road',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411001'
    },
    businessCategory: 'cafe',
    creditLimit: 15000,
    currentCredit: 3200,
    preferredPaymentMethod: 'Bank Transfer',
    currentInventory: [
      {
        productName: 'Milk',
        category: 'Dairy',
        quantity: 20,
        unit: 'litre',
        purchaseDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        costPrice: 60
      }
    ],
    recurringOrders: [
      {
        productName: 'Milk',
        quantity: 30,
        unit: 'litre',
        frequency: 'daily',
        nextDeliveryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        isActive: true
      }
    ],
    purchaseAnalytics: {
      totalPurchases: 67,
      totalAmount: 89000,
      averageOrderValue: 1328,
      mostOrderedCategory: 'Dairy'
    },
    savings: {
      totalSaved: 6200,
      lastMonthSavings: 980
    },
    loyaltyPoints: 320,
    rating: { average: 4.2, count: 18 },
    trustScore: 82
  }
];

// Seed function
const seedDatabase = async () => {
  try {
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Order.deleteMany({});

    console.log('🌱 Seeding suppliers...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    for (let supplierData of sampleSuppliers) {
      supplierData.password = hashedPassword;
      supplierData.userType = 'supplier';
      const supplier = new Supplier(supplierData);
      await supplier.save();
      console.log(`✅ Created supplier: ${supplier.businessName}`);
    }

    console.log('🌱 Seeding vendors...');
    for (let vendorData of sampleVendors) {
      vendorData.password = hashedPassword;
      vendorData.userType = 'vendor';
      const vendor = new Vendor(vendorData);
      await vendor.save();
      console.log(`✅ Created vendor: ${vendor.businessName}`);
    }

    console.log('🌱 Creating sample orders...');
    
    // Get created suppliers and vendors
    const suppliers = await Supplier.find({});
    const vendors = await Vendor.find({});

    if (suppliers.length > 0 && vendors.length > 0) {
      const sampleOrder = new Order({
        vendor: vendors[0]._id,
        supplier: suppliers[0]._id,
        items: [
          {
            productId: suppliers[0].products[0]._id,
            productName: 'Onions',
            category: 'Vegetables',
            quantity: 5,
            unit: 'kg',
            pricePerUnit: 88,
            totalPrice: 440
          }
        ],
        subtotal: 440,
        totalAmount: 440,
        delivery: {
          address: vendors[0].address,
          scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          timeSlot: { from: '10:00', to: '12:00' }
        },
        payment: {
          method: 'upi',
          amount: 440,
          finalAmount: 440,
          status: 'completed'
        },
        status: 'delivered',
        deliveredAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      });

      await sampleOrder.save();
      console.log('✅ Created sample order');
    }

    console.log('🎉 Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Suppliers: ${await Supplier.countDocuments()}`);
    console.log(`   Vendors: ${await Vendor.countDocuments()}`);
    console.log(`   Orders: ${await Order.countDocuments()}`);
    
    console.log('\n🔐 Test Credentials:');
    console.log('   Supplier: ravi@ravitraders.com / password123');
    console.log('   Vendor: rajesh@streetfood.com / password123');

  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n👋 Database connection closed');
  }
};

// Run seeding
connectDB().then(seedDatabase);

module.exports = { seedDatabase };
