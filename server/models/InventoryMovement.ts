import mongoose from 'mongoose';

const inventoryMovementSchema = new mongoose.Schema({
    inventoryItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Inventory',
        required: true,
        index: true
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['IN', 'OUT', 'ADJUSTMENT', 'WASTAGE', 'RETURN'],
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    previousQuantity: {
        type: Number,
        required: true
    },
    newQuantity: {
        type: Number,
        required: true
    },
    reason: {
        type: String,
        required: true,
        enum: ['purchase', 'sale', 'spoilage', 'damaged', 'stock_count', 'return_to_supplier']
    },
    referenceOrder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    },
    notes: {
        type: String
    },
    performedBy: {
        type: String, // name or ID of the staff/system
        default: 'System'
    }
}, {
    timestamps: true
});

const InventoryMovement = mongoose.models.InventoryMovement || mongoose.model('InventoryMovement', inventoryMovementSchema);

export default InventoryMovement;
