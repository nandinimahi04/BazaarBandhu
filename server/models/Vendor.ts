import mongoose from 'mongoose';
// @ts-ignore
import User from './User.js';

// Vendor-specific schema using discriminator
const vendorSchema = new mongoose.Schema({
    // Business Type & Category
    businessCategory: {
        type: String,
        enum: ['street_food', 'restaurant', 'cafe', 'catering', 'retail', 'wholesale'],
        required: true
    },
    businessSize: {
        type: String,
        enum: ['small', 'medium', 'large'],
        default: 'small'
    },

    // Purchasing Patterns
    averageMonthlyPurchase: { type: Number, default: 0 },
    preferredPaymentMethod: {
        type: String,
        enum: ['Cash', 'UPI', 'Credit', 'Bank Transfer'],
        default: 'UPI'
    },

    // Credit Information
    creditLimit: { type: Number, default: 5000 },
    currentCredit: { type: Number, default: 0 },
    creditScore: { type: Number, default: 100, min: 0, max: 1000 },

    // Preferred Suppliers
    preferredSuppliers: [{
        supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
        preferenceScore: { type: Number, min: 1, max: 10, default: 5 },
        lastOrderDate: { type: Date },
        totalOrderValue: { type: Number, default: 0 }
    }],

    // Inventory Management
    currentInventory: [{
        productName: { type: String, required: true },
        category: { type: String, required: true },
        quantity: { type: Number, required: true },
        unit: { type: String, required: true },
        purchaseDate: { type: Date, default: Date.now },
        expiryDate: { type: Date },
        costPrice: { type: Number },
        supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' }
    }],

    // Regular Orders & Subscriptions
    recurringOrders: [{
        productName: { type: String, required: true },
        quantity: { type: Number, required: true },
        unit: { type: String, required: true },
        frequency: {
            type: String,
            enum: ['daily', 'weekly', 'bi-weekly', 'monthly'],
            required: true
        },
        nextDeliveryDate: { type: Date },
        preferredSupplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
        isActive: { type: Boolean, default: true },
        maxPrice: { type: Number } // auto-cancel if price exceeds this
    }],

    // Purchase History & Analytics
    purchaseAnalytics: {
        totalPurchases: { type: Number, default: 0 },
        totalAmount: { type: Number, default: 0 },
        averageOrderValue: { type: Number, default: 0 },
        mostOrderedCategory: { type: String },
        peakOrderingHours: [{ type: Number, min: 0, max: 23 }],
        seasonalTrends: [{
            month: { type: Number, min: 1, max: 12 },
            averageSpending: { type: Number }
        }]
    },

    // Group Buying
    groupBuying: {
        isParticipating: { type: Boolean, default: false },
        groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
        role: { type: String, enum: ['member', 'coordinator'], default: 'member' },
        contributionScore: { type: Number, default: 0 }
    },

    // Preferences & Settings
    preferences: {
        preferredDeliveryTime: {
            from: { type: String, default: '09:00' },
            to: { type: String, default: '18:00' }
        },
        qualityPreference: { type: String, enum: ['A+', 'A', 'B+', 'B'], default: 'A' },
        priceVsQuality: { type: String, enum: ['price', 'quality', 'balanced'], default: 'balanced' },
        notificationPreferences: {
            sms: { type: Boolean, default: true },
            email: { type: Boolean, default: true },
            whatsapp: { type: Boolean, default: false },
            push: { type: Boolean, default: true }
        },
        autoReorderSettings: {
            enabled: { type: Boolean, default: false },
            thresholdDays: { type: Number, default: 3 }
        }
    },

    // Financial Metrics
    savings: {
        totalSaved: { type: Number, default: 0 },
        lastMonthSavings: { type: Number, default: 0 },
        savingsBreakdown: [{
            category: { type: String },
            amount: { type: Number },
            percentage: { type: Number }
        }]
    },

    // Loyalty & Rewards
    loyaltyPoints: { type: Number, default: 0 },
    rewardsEarned: [{
        type: { type: String },
        points: { type: Number },
        date: { type: Date, default: Date.now },
        description: { type: String }
    }],

    // AI Assistant Preferences
    aiAssistant: {
        isEnabled: { type: Boolean, default: true },
        preferredLanguage: { type: String, default: 'hi' },
        autoSuggestions: { type: Boolean, default: true },
        voiceCommands: { type: Boolean, default: true },
        learningFromHistory: { type: Boolean, default: true }
    },

    // Emergency Contacts
    emergencyContacts: [{
        name: { type: String, required: true },
        phone: { type: String, required: true },
        relationship: { type: String, required: true }
    }],

    // Compliance & Documentation
    documents: [{
        type: { type: String, enum: ['license', 'permit', 'certificate', 'registration'] },
        name: { type: String, required: true },
        documentNumber: { type: String },
        issueDate: { type: Date },
        expiryDate: { type: Date },
        fileUrl: { type: String },
        isVerified: { type: Boolean, default: false }
    }]
});

// Indexes for vendors
vendorSchema.index({ businessCategory: 1 });
vendorSchema.index({ creditScore: 1 });
vendorSchema.index({ 'preferredSuppliers.supplierId': 1 });
vendorSchema.index({ 'currentInventory.category': 1 });
vendorSchema.index({ 'recurringOrders.nextDeliveryDate': 1 });

// Virtual for available credit
vendorSchema.virtual('availableCredit').get(function (this: any) {
    return this.creditLimit - this.currentCredit;
});

// Virtual for inventory value
vendorSchema.virtual('totalInventoryValue').get(function (this: any) {
    return this.currentInventory.reduce((total: number, item: any) => {
        return total + ((item.costPrice || 0) * item.quantity);
    }, 0);
});

// Method to check low stock items
vendorSchema.methods.getLowStockItems = function (this: any) {
    // Define minimum thresholds based on business category
    const thresholds: any = {
        street_food: 2,
        restaurant: 5,
        cafe: 3,
        catering: 10,
        retail: 20,
        wholesale: 50
    };

    const threshold = thresholds[this.businessCategory] || 5;

    return this.currentInventory.filter((item: any) => item.quantity < threshold);
};

// Method to calculate monthly spending
vendorSchema.methods.getMonthlySpending = function (this: any, month: number) {
    return this.purchaseAnalytics.seasonalTrends.find(
        (trend: any) => trend.month === month
    )?.averageSpending || 0;
};

// Method to update loyalty points
vendorSchema.methods.addLoyaltyPoints = function (this: any, points: number, description: string) {
    this.loyaltyPoints += points;
    this.rewardsEarned.push({
        type: 'points',
        points: points,
        description: description
    });
    return this.save();
};

// Method to get purchase recommendations
vendorSchema.methods.getPurchaseRecommendations = function (this: any) {
    const recommendations: any[] = [];

    // Based on low stock
    const lowStock = this.getLowStockItems();
    lowStock.forEach((item: any) => {
        recommendations.push({
            type: 'restock',
            product: item.productName,
            urgency: 'high',
            reason: 'Low stock'
        });
    });

    // Based on recurring orders
    const upcomingOrders = this.recurringOrders.filter((order: any) =>
        order.isActive &&
        order.nextDeliveryDate <= new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days
    );

    upcomingOrders.forEach((order: any) => {
        recommendations.push({
            type: 'recurring',
            product: order.productName,
            quantity: order.quantity,
            urgency: 'medium',
            reason: 'Scheduled recurring order'
        });
    });

    return recommendations;
};

const Vendor = mongoose.models.Vendor || User.discriminator('vendor', vendorSchema);

export default Vendor;
