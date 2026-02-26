const mongoose = require('mongoose');

// Order Item Schema
const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, required: true },
  productName: { type: String, required: true },
  category: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unit: { type: String, required: true },
  pricePerUnit: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  quality: { type: String, enum: ['A+', 'A', 'B+', 'B'], default: 'A' },
  specifications: { type: String }, // special requirements
  images: [{ type: String }] // product images at time of order
});

// Delivery Schema
const deliverySchema = new mongoose.Schema({
  method: {
    type: String,
    enum: ['self_pickup', 'supplier_delivery', 'third_party'],
    default: 'supplier_delivery'
  },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    landmark: { type: String },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    }
  },
  scheduledDate: { type: Date, required: true },
  timeSlot: {
    from: { type: String, required: true }, // "09:00"
    to: { type: String, required: true }     // "12:00"
  },
  deliveryCharge: { type: Number, default: 0 },
  estimatedTime: { type: Number }, // in minutes
  actualDeliveryTime: { type: Date },
  deliveryPerson: {
    name: { type: String },
    phone: { type: String },
    vehicleNumber: { type: String },
    photo: { type: String }
  },
  trackingSteps: [{
    status: {
      type: String,
      enum: ['confirmed', 'packed', 'dispatched', 'in_transit', 'out_for_delivery', 'delivered', 'failed'],
      required: true
    },
    timestamp: { type: Date, default: Date.now },
    location: { type: String },
    description: { type: String },
    photo: { type: String }
  }],
  deliveryInstructions: { type: String }
});

// Payment Schema
const paymentSchema = new mongoose.Schema({
  method: {
    type: String,
    enum: ['cash', 'upi', 'card', 'bank_transfer', 'credit', 'wallet'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  transactionId: { type: String },
  upiId: { type: String },
  cardLast4: { type: String },
  bankReference: { type: String },
  amount: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  serviceCharge: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  finalAmount: { type: Number, required: true },
  paidAt: { type: Date },
  refundAmount: { type: Number, default: 0 },
  refundDate: { type: Date },
  paymentGateway: { type: String },
  gatewayTransactionId: { type: String }
});

// Main Order Schema
const orderSchema = new mongoose.Schema({
  // Order Identification
  orderNumber: {
    type: String,
    unique: true,
    required: true,
    default: function () {
      return 'BB-' + new Date().getFullYear() + '-' +
        Math.random().toString(36).substr(2, 6).toUpperCase();
    }
  },

  // Parties Involved
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },

  // Order Details
  items: [orderItemSchema],

  // Pricing
  subtotal: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  deliveryCharge: { type: Number, default: 0 },
  serviceCharge: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },

  // Savings Information
  marketPrice: { type: Number }, // total if bought at market rates
  savedAmount: { type: Number, default: 0 },
  savingsPercentage: { type: Number, default: 0 },

  // Order Status
  status: {
    type: String,
    enum: [
      'pending', 'confirmed', 'processing', 'packed',
      'dispatched', 'in_transit', 'delivered',
      'cancelled', 'returned', 'refunded'
    ],
    default: 'pending'
  },

  // Timing
  placedAt: { type: Date, default: Date.now },
  confirmedAt: { type: Date },
  packedAt: { type: Date },
  dispatchedAt: { type: Date },
  deliveredAt: { type: Date },
  cancelledAt: { type: Date },

  // Order Type
  orderType: {
    type: String,
    enum: ['instant', 'scheduled', 'recurring', 'group'],
    default: 'instant'
  },

  // Group Order Details (if applicable)
  groupOrder: {
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
    isGroupCoordinator: { type: Boolean, default: false },
    groupDiscount: { type: Number, default: 0 }
  },

  // Recurring Order Details (if applicable)
  recurringOrder: {
    parentOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    frequency: { type: String, enum: ['daily', 'weekly', 'bi-weekly', 'monthly'] },
    nextOrderDate: { type: Date },
    isAutoGenerated: { type: Boolean, default: false }
  },

  // Delivery Information
  delivery: deliverySchema,

  // Payment Information
  payment: paymentSchema,

  // Special Instructions
  specialInstructions: { type: String },
  vendorNotes: { type: String },
  supplierNotes: { type: String },

  // Quality & Rating
  rating: {
    vendor: {
      productQuality: { type: Number, min: 1, max: 5 },
      deliverySpeed: { type: Number, min: 1, max: 5 },
      packaging: { type: Number, min: 1, max: 5 },
      overall: { type: Number, min: 1, max: 5 },
      review: { type: String },
      ratedAt: { type: Date }
    },
    supplier: {
      productQuality: { type: Number, min: 1, max: 5 },
      serviceQuality: { type: Number, min: 1, max: 5 },
      pricing: { type: Number, min: 1, max: 5 },
      overall: { type: Number, min: 1, max: 5 },
      review: { type: String },
      ratedAt: { type: Date }
    }
  },

  // Issues & Support
  issues: [{
    type: {
      type: String,
      enum: ['quality', 'quantity', 'delivery', 'payment', 'other']
    },
    description: { type: String, required: true },
    reportedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['open', 'investigating', 'resolved', 'closed'],
      default: 'open'
    },
    resolution: { type: String },
    resolvedAt: { type: Date }
  }],

  // Cancellation
  cancellation: {
    reason: { type: String },
    cancelledBy: {
      type: String,
      enum: ['vendor', 'supplier', 'system', 'admin']
    },
    refundAmount: { type: Number, default: 0 },
    cancellationCharge: { type: Number, default: 0 }
  },

  // AI Assistant Interaction
  aiAssistant: {
    wasOrderedByAI: { type: Boolean, default: false },
    voiceCommand: { type: String },
    confidence: { type: Number, min: 0, max: 1 },
    suggestedByAI: { type: Boolean, default: false }
  },

  // Notifications
  notifications: [{
    type: {
      type: String,
      enum: ['sms', 'email', 'push', 'whatsapp']
    },
    message: { type: String },
    sentAt: { type: Date },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'failed']
    }
  }]
}, {
  timestamps: true
});

// Indexes
orderSchema.index({ vendor: 1, placedAt: -1 });
orderSchema.index({ supplier: 1, placedAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'delivery.scheduledDate': 1 });
orderSchema.index({ 'payment.status': 1 });
orderSchema.index({ orderType: 1 });

// Virtual for delivery status
orderSchema.virtual('deliveryStatus').get(function () {
  if (!this.delivery.trackingSteps.length) return 'pending';
  return this.delivery.trackingSteps[this.delivery.trackingSteps.length - 1].status;
});

// Virtual for estimated delivery time
orderSchema.virtual('estimatedDelivery').get(function () {
  if (this.delivery.scheduledDate && this.delivery.estimatedTime) {
    return new Date(this.delivery.scheduledDate.getTime() + this.delivery.estimatedTime * 60000);
  }
  return null;
});

// Method to add tracking step
orderSchema.methods.addTrackingStep = function (status, location, description, photo) {
  this.delivery.trackingSteps.push({
    status,
    location,
    description,
    photo,
    timestamp: new Date()
  });

  // Update order status
  this.status = status;

  // Set specific timestamps
  const now = new Date();
  switch (status) {
    case 'confirmed':
      this.confirmedAt = now;
      break;
    case 'packed':
      this.packedAt = now;
      break;
    case 'dispatched':
      this.dispatchedAt = now;
      break;
    case 'delivered':
      this.deliveredAt = now;
      break;
  }

  return this.save();
};

// Method to calculate total savings
orderSchema.methods.calculateSavings = function () {
  if (this.marketPrice && this.totalAmount) {
    this.savedAmount = this.marketPrice - this.totalAmount;
    this.savingsPercentage = ((this.savedAmount / this.marketPrice) * 100).toFixed(2);
  }
  return this.save();
};

// Method to send notification
orderSchema.methods.sendNotification = function (type, message) {
  this.notifications.push({
    type,
    message,
    sentAt: new Date(),
    status: 'sent'
  });
  return this.save();
};

// Static method to get orders in date range
orderSchema.statics.getOrdersInRange = function (startDate, endDate, filters = {}) {
  const query = {
    placedAt: { $gte: startDate, $lte: endDate },
    ...filters
  };
  return this.find(query).populate('vendor supplier');
};

// Static method to get analytics
orderSchema.statics.getAnalytics = function (vendorId, period = 'month') {
  const now = new Date();
  let startDate;

  switch (period) {
    case 'day':
      startDate = new Date(now.setDate(now.getDate() - 1));
      break;
    case 'week':
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case 'month':
      startDate = new Date(now.setMonth(now.getMonth() - 1));
      break;
    case 'year':
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
      break;
    default:
      startDate = new Date(now.setMonth(now.getMonth() - 1));
  }

  return this.aggregate([
    { $match: { vendor: vendorId, placedAt: { $gte: startDate } } },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' },
        totalSavings: { $sum: '$savedAmount' },
        averageOrderValue: { $avg: '$totalAmount' },
        deliveredOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
        }
      }
    }
  ]);
};

// Static method to get supplier analytics
orderSchema.statics.getSupplierAnalytics = function (supplierId, period = 'month') {
  const now = new Date();
  let startDate;

  switch (period) {
    case 'day':
      startDate = new Date(now.setDate(now.getDate() - 1));
      break;
    case 'week':
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case 'month':
      startDate = new Date(now.setMonth(now.getMonth() - 1));
      break;
    case 'year':
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
      break;
    default:
      startDate = new Date(now.setMonth(now.getMonth() - 1));
  }

  return this.aggregate([
    { $match: { supplier: supplierId, placedAt: { $gte: startDate } } },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalSales: { $sum: '$totalAmount' },
        totalItemsSold: { $sum: { $size: '$items' } },
        averageOrderValue: { $avg: '$totalAmount' },
        pendingOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        deliveredOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
        }
      }
    }
  ]);
};

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
