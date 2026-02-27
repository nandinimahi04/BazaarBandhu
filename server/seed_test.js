const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const uri = 'mongodb://localhost:27017/bazaarbandhu';

const userSchema = new mongoose.Schema({
    fullName: String,
    email: { type: String, unique: true },
    password: String,
    phone: String,
    userType: String,
    businessName: String
}, { timestamps: true, discriminatorKey: 'userType' });

const User = mongoose.model('User', userSchema);

const supplierSchema = new mongoose.Schema({
    gstNumber: String,
    productCategories: [String],
    products: [{
        name: String,
        pricePerUnit: Number,
        unit: String,
        marketPrice: Number
    }],
    serviceAreas: [{ pincode: String, deliveryCharge: Number }]
});

const Supplier = User.discriminator('supplier', supplierSchema);

async function seed() {
    await mongoose.connect(uri);
    console.log('Connected to DB');

    // Create a Test Supplier
    const hashedPassword = await bcrypt.hash('password123', 10);

    const existingSupplier = await Supplier.findOne({ email: 'mandi@example.com' });
    if (!existingSupplier) {
        const supplier = new Supplier({
            fullName: 'Ravi Bhai Sharma',
            email: 'mandi@example.com',
            password: hashedPassword,
            phone: '9876543210',
            userType: 'supplier',
            businessName: 'Ravi Traders',
            gstNumber: '27AAAAA0000A1Z5',
            productCategories: ['Vegetables', 'Fruits'],
            products: [
                { name: 'Potatoes (आलू)', pricePerUnit: 25, unit: 'kg', marketPrice: 30 },
                { name: 'Onions (प्याज)', pricePerUnit: 35, unit: 'kg', marketPrice: 45 }
            ],
            serviceAreas: [{ pincode: '413001', deliveryCharge: 30 }]
        });
        await supplier.save();
        console.log('Seed Supplier created:', supplier._id);
    } else {
        console.log('Supplier already exists:', existingSupplier._id);
    }

    process.exit(0);
}

seed().catch(err => {
    console.error(err);
    process.exit(1);
});
