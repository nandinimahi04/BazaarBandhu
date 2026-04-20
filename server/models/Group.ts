import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true }, // e.g., 'Onions', 'Potatoes', 'Oil'
    coordinator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{
        vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        quantity: { type: Number, required: true },
        unit: { type: String, required: true },
        status: { type: String, enum: ['joined', 'confirmed', 'paid'], default: 'joined' }
    }],
    targetQuantity: { type: Number, required: true },
    currentQuantity: { type: Number, default: 0 },
    deadline: { type: Date, required: true },
    status: { 
        type: String, 
        enum: ['open', 'completed', 'ordered', 'delivered', 'cancelled'], 
        default: 'open' 
    },
    bulkPricePerUnit: { type: Number },
    marketPricePerUnit: { type: Number },
    estimatedSavings: { type: Number },
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' }
}, {
    timestamps: true
});

groupSchema.index({ category: 1, status: 1 });
groupSchema.index({ location: '2dsphere' }); // If we add group location

const Group = mongoose.models.Group || mongoose.model('Group', groupSchema);

export default Group;
