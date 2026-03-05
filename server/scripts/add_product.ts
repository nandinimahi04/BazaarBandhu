import mongoose from 'mongoose';
import 'dotenv/config';
import Supplier from '../models/Supplier';

async function addProduct() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bazaarbandhu');
        const supplier = await Supplier.findOne({ email: 'supplier@test.com' });
        if (supplier) {
            supplier.products.push({
                name: 'Tomato',
                category: 'Vegetables',
                unit: 'kg',
                pricePerUnit: 40,
                marketPrice: 50,
                currentStock: 100,
                isActive: true
            });
            await supplier.save();
            console.log('Product added to supplier:', supplier._id);
        } else {
            console.log('Supplier not found');
        }
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}
addProduct();
