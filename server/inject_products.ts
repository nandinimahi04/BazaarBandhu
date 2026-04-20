import mongoose from 'mongoose';
import 'dotenv/config';
// @ts-ignore
import Supplier from './models/Supplier.js';
// @ts-ignore
import User from './models/User.js';

async function inject() {
    try {
        await mongoose.connect(process.env.MONGODB_URI!);
        console.log('Connected to DB');

        const suppliers = await Supplier.find({});
        console.log(`Found ${suppliers.length} suppliers`);

        const sampleProducts = [
            { name: 'Red Apples', category: 'Fruits', unit: 'kg', pricePerUnit: 120, marketPrice: 150, inventory: 100, image: '🍎' },
            { name: 'Fresh Bananas', category: 'Fruits', unit: 'dozen', pricePerUnit: 60, marketPrice: 80, inventory: 50, image: '🍌' },
            { name: 'Mangoes', category: 'Fruits', unit: 'kg', pricePerUnit: 250, marketPrice: 300, inventory: 200, image: '🥭' },
            { name: 'Onions', category: 'Vegetables', unit: 'kg', pricePerUnit: 35, marketPrice: 45, inventory: 500, image: '🧅' },
            { name: 'Potatoes', category: 'Vegetables', unit: 'kg', pricePerUnit: 25, marketPrice: 30, inventory: 300, image: '🥔' },
            { name: 'Mustard Oil', category: 'Oils', unit: 'Litre', pricePerUnit: 180, marketPrice: 200, inventory: 50, image: '🛢️' }
        ];

        for (const supplier of suppliers) {
            if (!supplier.products || supplier.products.length === 0) {
                console.log(`Injecting products for ${supplier.businessName || supplier.fullName}`);
                // Select 3 random products
                const shuffled = sampleProducts.sort(() => 0.5 - Math.random());
                supplier.products = shuffled.slice(0, 3);
                await supplier.save();
            } else {
                console.log(`${supplier.businessName || supplier.fullName} already has products`);
            }
        }

        console.log('Finished injection');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

inject();
