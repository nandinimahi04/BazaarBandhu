import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    productName: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Vegetables', 'Fruits', 'Spices', 'Grains', 'Dairy', 'Meat', 'Dry Goods', 'Beverages', 'Packaging', 'Oils', 'Flour', 'Frozen'],
        index: true
    },
    currentQuantity: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    unit: {
        type: String,
        required: true,
        enum: ['kg', 'g', 'litre', 'ml', 'pcs', 'pack', 'bottle', 'bundle']
    },
    minThreshold: {
        type: Number,
        default: 5,
        required: true
    },
    reorderQuantity: {
        type: Number,
        default: 10
    },
    costPrice: {
        type: Number,
        default: 0
    },
    lastPurchasePrice: {
        type: Number
    },
    location: {
        type: String,
        default: 'Main Shelf'
    },
    lastRestockDate: {
        type: Date,
        default: Date.now
    },
    expiryDate: {
        type: Date
    },
    status: {
        type: String,
        enum: ['in_stock', 'low_stock', 'out_of_stock', 'expired'],
        default: 'in_stock'
    },
    autoReorder: {
        type: Boolean,
        default: false
    },
    preferredSupplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier'
    }
}, {
    timestamps: true
});

// Middleware to update status before saving
inventorySchema.pre('save', function(next) {
    if (this.currentQuantity <= 0) {
        this.status = 'out_of_stock';
    } else if (this.currentQuantity <= this.minThreshold) {
        this.status = 'low_stock';
    } else {
        this.status = 'in_stock';
    }
    
    if (this.expiryDate && this.expiryDate < new Date()) {
        this.status = 'expired';
    }
    next();
});

// Virtual for valuation
inventorySchema.virtual('totalValue').get(function() {
    return this.currentQuantity * this.costPrice;
});

const Inventory = mongoose.models.Inventory || mongoose.model('Inventory', inventorySchema);

export default Inventory;
