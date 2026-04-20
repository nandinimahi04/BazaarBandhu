import mongoose from 'mongoose';
// @ts-ignore
import User from './User.js';

// Supplier-specific schema using discriminator
const supplierSchema = new mongoose.Schema({
    // Business Details
    productCategories: [{
        type: String,
        enum: ['Vegetables', 'Fruits', 'Spices', 'Grains', 'Dairy', 'Meat', 'Dry Goods', 'Beverages', 'Packaging', 'Oils', 'Flour', 'Frozen'],
        required: true
    }],

    // Delivery & Service
    deliveryRadius: { type: Number, required: true, min: 1, max: 100 }, // in km
    minOrderAmount: { type: Number, required: true, min: 0 },
    maxOrderCapacity: { type: Number, default: 10000 }, // daily capacity in units

    // Payment Methods
    paymentMethods: [{
        type: String,
        enum: ['Cash', 'UPI', 'Credit', 'Bank Transfer', 'Cheque'],
        required: true
    }],

    // Working Schedule
    workingHours: {
        from: { type: String, required: true },
        to: { type: String, required: true }
    },
    workingDays: [{
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    }],

    // Legal & Compliance
    gstNumber: {
        type: String,
        validate: {
            validator: function (v: string) {
                return !v || /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(v);
            },
            message: 'Invalid GST number format'
        }
    },
    fssaiLicense: { type: String },
    panNumber: { type: String },

    // Bank Details
    bankDetails: {
        accountNumber: { type: String },
        ifscCode: { type: String },
        bankName: { type: String },
        accountHolderName: { type: String }
    },

    // Inventory & Products
    products: [{
        name: { type: String, required: true },
        category: { type: String, required: true },
        unit: { type: String, required: true }, // kg, litre, piece, etc.
        pricePerUnit: { type: Number, required: true },
        marketPrice: { type: Number }, // For savings calculation
        inventory: { type: Number, default: 0 },
        minStock: { type: Number, default: 10 },
        maxStock: { type: Number, default: 1000 },
        quality: { type: String, enum: ['A+', 'A', 'B+', 'B'], default: 'A' },
        description: { type: String },
        images: [{ type: String }],
        isActive: { type: Boolean, default: true }
    }],

    // Performance Metrics
    metrics: {
        totalDeliveries: { type: Number, default: 0 },
        onTimeDeliveries: { type: Number, default: 0 },
        totalRevenue: { type: Number, default: 0 },
        averageOrderValue: { type: Number, default: 0 },
        cancellationRate: { type: Number, default: 0 },
        returnRate: { type: Number, default: 0 }
    },

    // Verification Status
    verificationStatus: {
        documents: { type: Boolean, default: false },
        address: { type: Boolean, default: false },
        bank: { type: Boolean, default: false },
        quality: { type: Boolean, default: false }
    },

    // Service Areas
    serviceAreas: [{
        pincode: { type: String, required: true },
        deliveryCharge: { type: Number, default: 0 },
        minimumOrderForFreeDelivery: { type: Number, default: 500 }
    }],

    // Subscription & Plans
    subscriptionPlan: {
        type: { type: String, enum: ['basic', 'premium', 'enterprise'], default: 'basic' },
        startDate: { type: Date },
        endDate: { type: Date },
        features: [{ type: String }]
    },

    // Special Offerings
    specialOffers: [{
        title: { type: String },
        description: { type: String },
        discountPercentage: { type: Number, min: 0, max: 100 },
        validFrom: { type: Date },
        validTo: { type: Date },
        isActive: { type: Boolean, default: true }
    }],

    // Seasonal Availability
    seasonalProducts: [{
        productName: { type: String },
        availableMonths: [{ type: Number, min: 1, max: 12 }],
        peakMonths: [{ type: Number, min: 1, max: 12 }]
    }]
});

// Indexes for suppliers
// Note: productCategories index already exists in DB with a partialFilterExpression
// Redefining it without the filter causes an IndexKeySpecsConflict — so we skip it here.
supplierSchema.index({ deliveryRadius: 1 });
supplierSchema.index({ 'products.category': 1 });
supplierSchema.index({ 'products.pricePerUnit': 1 });
supplierSchema.index({ 'serviceAreas.pincode': 1 });
supplierSchema.index({ 'verificationStatus.documents': 1 });


// Virtual for delivery success rate
supplierSchema.virtual('deliverySuccessRate').get(function (this: any) {
    if (this.metrics.totalDeliveries === 0) return 0;
    return ((this.metrics.onTimeDeliveries / this.metrics.totalDeliveries) * 100).toFixed(1);
});

// Method to check if supplier serves a particular area
supplierSchema.methods.servesArea = function (this: any, pincode: string) {
    return this.serviceAreas.some((area: any) => area.pincode === pincode);
};

// Helper method to check availability
supplierSchema.methods.checkProductAvailability = function (productName: string, quantity: number) {
    const product = this.products.find((p: any) => p.name === productName);
    return product &&
        product.isActive && product.inventory >= quantity && product.inventory > product.minStock
};

// Helper to update stock
supplierSchema.methods.updateStock = function (productName: string, quantity: number, type: 'in' | 'out') {
    const product = this.products.find((p: any) => p.name === productName);
    if (product) {
        if (type === 'out') {
            product.inventory = Math.max(0, product.inventory - quantity);
        } else {
            product.inventory += quantity;
        }
        return this.save();
    }
    throw new Error('Product not found');
};

const Supplier = mongoose.models.Supplier || User.discriminator('Supplier', supplierSchema, 'supplier');

export default Supplier;
