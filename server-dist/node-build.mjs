import path from "path";
import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";
import morgan from "morgan";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import OpenAI from "openai";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import Razorpay from "razorpay";
import crypto from "crypto";
import { createRequire } from "module";
import multer from "multer";
import { v2 } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import fs from "fs";
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/bazaarbandhu");
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    await createIndexes();
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};
const createIndexes = async () => {
  try {
    const db = mongoose.connection.db;
    if (!db) return;
    const safeCreateIndex = async (collection, keySpec, options = {}) => {
      try {
        const existing = await db.collection(collection).indexes();
        const keyFields = Object.keys(keySpec);
        const alreadyExists = existing.some(
          (idx) => idx.key && keyFields.every((k) => idx.key[k] !== void 0)
        );
        if (!alreadyExists) {
          await db.collection(collection).createIndex(keySpec, options);
        }
      } catch (e) {
        console.warn(`⚠️  Skipped index on "${collection}" (${JSON.stringify(keySpec)}): ${e.message}`);
      }
    };
    try {
      const existingIndexes = await db.collection("users").indexes();
      const badIndex = existingIndexes.find(
        (idx) => idx.key && idx.key.productCategories !== void 0 && idx.key["serviceAreas.pincode"] !== void 0
      );
      if (badIndex) {
        await db.collection("users").dropIndex(badIndex.name);
        console.log("⚠️  Dropped legacy parallel-array index on users collection.");
      }
    } catch (_) {
    }
    await safeCreateIndex("users", { location: "2dsphere" });
    await safeCreateIndex("users", { userType: 1, isActive: 1, "rating.average": -1 });
    await safeCreateIndex("users", { productCategories: 1 });
    await safeCreateIndex("users", { "serviceAreas.pincode": 1 });
    await safeCreateIndex("orders", { vendor: 1, placedAt: -1 });
    await safeCreateIndex("orders", { supplier: 1, status: 1 });
    console.log("✅ Database indexes checked/created successfully");
  } catch (error) {
    console.error("Error creating indexes:", error);
  }
};
const addressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  country: { type: String, default: "India" }
});
new mongoose.Schema({
  from: { type: String, required: true },
  // Format: "06:00"
  to: { type: String, required: true }
  // Format: "20:00"
});
const locationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["Point"]
  },
  coordinates: {
    type: [Number],
    // [longitude, latitude]
    required: true,
    default: void 0
  }
});
const userSchema = new mongoose.Schema({
  // Basic Information
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  userType: {
    type: String,
    required: true,
    enum: ["vendor", "supplier", "admin"]
  },
  // Business Information
  businessName: { type: String, required: true },
  businessType: { type: String },
  // Address
  address: addressSchema,
  location: {
    type: locationSchema,
    index: "2dsphere"
  },
  // Account Status
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  emailVerified: { type: Boolean, default: false },
  phoneVerified: { type: Boolean, default: false },
  // Profile
  profileImage: { type: String },
  appLanguage: {
    type: String,
    enum: ["hi", "en", "mr", "gu", "ta", "te", "kn", "bn"],
    default: "en"
  },
  // Ratings and Reviews
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  // Trust Score
  trustScore: { type: Number, default: 0, min: 0, max: 100 },
  // Financial
  totalSavings: { type: Number, default: 0 },
  totalOrders: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  // Group/Network
  groupMembers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  // Timestamps
  lastLogin: { type: Date },
  registrationDate: { type: Date, default: Date.now }
}, {
  timestamps: true,
  discriminatorKey: "userType"
});
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ userType: 1 });
userSchema.index({ "location": "2dsphere" });
userSchema.index({ businessName: "text", fullName: "text" });
const User = mongoose.models.User || mongoose.model("User", userSchema);
Promise.resolve().then(() => Vendor$1);
Promise.resolve().then(() => Supplier$1);
const vendorSchema = new mongoose.Schema({
  // Business Type & Category
  businessCategory: {
    type: String,
    enum: ["street_food", "restaurant", "cafe", "catering", "retail", "wholesale"],
    required: true
  },
  businessSize: {
    type: String,
    enum: ["small", "medium", "large"],
    default: "small"
  },
  // Purchasing Patterns
  averageMonthlyPurchase: { type: Number, default: 0 },
  preferredPaymentMethod: {
    type: String,
    enum: ["Cash", "UPI", "Credit", "Bank Transfer"],
    default: "UPI"
  },
  // Credit Information
  creditLimit: { type: Number, default: 5e3 },
  currentCredit: { type: Number, default: 0 },
  creditScore: { type: Number, default: 100, min: 0, max: 1e3 },
  // Preferred Suppliers
  preferredSuppliers: [{
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" },
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
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" }
  }],
  // Regular Orders & Subscriptions
  recurringOrders: [{
    productName: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
    frequency: {
      type: String,
      enum: ["daily", "weekly", "bi-weekly", "monthly"],
      required: true
    },
    nextDeliveryDate: { type: Date },
    preferredSupplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" },
    isActive: { type: Boolean, default: true },
    maxPrice: { type: Number }
    // auto-cancel if price exceeds this
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
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group" },
    role: { type: String, enum: ["member", "coordinator"], default: "member" },
    contributionScore: { type: Number, default: 0 }
  },
  // Preferences & Settings
  preferences: {
    preferredDeliveryTime: {
      from: { type: String, default: "09:00" },
      to: { type: String, default: "18:00" }
    },
    qualityPreference: { type: String, enum: ["A+", "A", "B+", "B"], default: "A" },
    priceVsQuality: { type: String, enum: ["price", "quality", "balanced"], default: "balanced" },
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
    preferredLanguage: { type: String, default: "en" },
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
    type: { type: String, enum: ["license", "permit", "certificate", "registration"] },
    name: { type: String, required: true },
    documentNumber: { type: String },
    issueDate: { type: Date },
    expiryDate: { type: Date },
    fileUrl: { type: String },
    isVerified: { type: Boolean, default: false }
  }]
});
vendorSchema.index({ businessCategory: 1 });
vendorSchema.index({ creditScore: 1 });
vendorSchema.index({ "preferredSuppliers.supplierId": 1 });
vendorSchema.index({ "currentInventory.category": 1 });
vendorSchema.index({ "recurringOrders.nextDeliveryDate": 1 });
vendorSchema.virtual("availableCredit").get(function() {
  return this.creditLimit - this.currentCredit;
});
vendorSchema.virtual("totalInventoryValue").get(function() {
  return this.currentInventory.reduce((total, item) => {
    return total + (item.costPrice || 0) * item.quantity;
  }, 0);
});
vendorSchema.methods.getLowStockItems = function() {
  const thresholds = {
    street_food: 2,
    restaurant: 5,
    cafe: 3,
    catering: 10,
    retail: 20,
    wholesale: 50
  };
  const threshold = thresholds[this.businessCategory] || 5;
  return this.currentInventory.filter((item) => item.quantity < threshold);
};
vendorSchema.methods.getMonthlySpending = function(month) {
  return this.purchaseAnalytics.seasonalTrends.find(
    (trend) => trend.month === month
  )?.averageSpending || 0;
};
vendorSchema.methods.addLoyaltyPoints = function(points, description) {
  this.loyaltyPoints += points;
  this.rewardsEarned.push({
    type: "points",
    points,
    description
  });
  return this.save();
};
vendorSchema.methods.getPurchaseRecommendations = function() {
  const recommendations = [];
  const lowStock = this.getLowStockItems();
  lowStock.forEach((item) => {
    recommendations.push({
      type: "restock",
      product: item.productName,
      urgency: "high",
      reason: "Low stock"
    });
  });
  const upcomingOrders = this.recurringOrders.filter(
    (order) => order.isActive && order.nextDeliveryDate <= new Date(Date.now() + 2 * 24 * 60 * 60 * 1e3)
    // 2 days
  );
  upcomingOrders.forEach((order) => {
    recommendations.push({
      type: "recurring",
      product: order.productName,
      quantity: order.quantity,
      urgency: "medium",
      reason: "Scheduled recurring order"
    });
  });
  return recommendations;
};
const Vendor = mongoose.models.Vendor || User.discriminator("Vendor", vendorSchema, "vendor");
const Vendor$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Vendor
}, Symbol.toStringTag, { value: "Module" }));
const supplierSchema = new mongoose.Schema({
  // Business Details
  productCategories: [{
    type: String,
    enum: ["Vegetables", "Fruits", "Spices", "Grains", "Dairy", "Meat", "Dry Goods", "Beverages", "Packaging", "Oils", "Flour", "Frozen"],
    required: true
  }],
  // Delivery & Service
  deliveryRadius: { type: Number, required: true, min: 1, max: 100 },
  // in km
  minOrderAmount: { type: Number, required: true, min: 0 },
  maxOrderCapacity: { type: Number, default: 1e4 },
  // daily capacity in units
  // Payment Methods
  paymentMethods: [{
    type: String,
    enum: ["Cash", "UPI", "Credit", "Bank Transfer", "Cheque"],
    required: true
  }],
  // Working Schedule
  workingHours: {
    from: { type: String, required: true },
    to: { type: String, required: true }
  },
  workingDays: [{
    type: String,
    enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    default: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  }],
  // Legal & Compliance
  gstNumber: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(v);
      },
      message: "Invalid GST number format"
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
    unit: { type: String, required: true },
    // kg, litre, piece, etc.
    pricePerUnit: { type: Number, required: true },
    marketPrice: { type: Number },
    // For savings calculation
    inventory: { type: Number, default: 0 },
    minStock: { type: Number, default: 10 },
    maxStock: { type: Number, default: 1e3 },
    quality: { type: String, enum: ["A+", "A", "B+", "B"], default: "A" },
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
    type: { type: String, enum: ["basic", "premium", "enterprise"], default: "basic" },
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
supplierSchema.index({ deliveryRadius: 1 });
supplierSchema.index({ "products.category": 1 });
supplierSchema.index({ "products.pricePerUnit": 1 });
supplierSchema.index({ "serviceAreas.pincode": 1 });
supplierSchema.index({ "verificationStatus.documents": 1 });
supplierSchema.virtual("deliverySuccessRate").get(function() {
  if (this.metrics.totalDeliveries === 0) return 0;
  return (this.metrics.onTimeDeliveries / this.metrics.totalDeliveries * 100).toFixed(1);
});
supplierSchema.methods.servesArea = function(pincode) {
  return this.serviceAreas.some((area) => area.pincode === pincode);
};
supplierSchema.methods.checkProductAvailability = function(productName, quantity) {
  const product = this.products.find((p) => p.name === productName);
  return product && product.isActive && product.inventory >= quantity && product.inventory > product.minStock;
};
supplierSchema.methods.updateStock = function(productName, quantity, type) {
  const product = this.products.find((p) => p.name === productName);
  if (product) {
    if (type === "out") {
      product.inventory = Math.max(0, product.inventory - quantity);
    } else {
      product.inventory += quantity;
    }
    return this.save();
  }
  throw new Error("Product not found");
};
const Supplier = mongoose.models.Supplier || User.discriminator("Supplier", supplierSchema, "supplier");
const Supplier$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Supplier
}, Symbol.toStringTag, { value: "Module" }));
const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, required: true },
  productName: { type: String, required: true },
  category: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unit: { type: String, required: true },
  pricePerUnit: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  quality: { type: String, enum: ["A+", "A", "B+", "B"], default: "A" },
  specifications: { type: String },
  // special requirements
  images: [{ type: String }]
  // product images at time of order
});
const deliverySchema = new mongoose.Schema({
  method: {
    type: String,
    enum: ["self_pickup", "supplier_delivery", "third_party"],
    default: "supplier_delivery"
  },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    landmark: { type: String },
    coordinates: {
      type: [Number],
      // [longitude, latitude]
      index: "2dsphere"
    }
  },
  scheduledDate: { type: Date, required: true },
  timeSlot: {
    from: { type: String, required: true },
    // "09:00"
    to: { type: String, required: true }
    // "12:00"
  },
  deliveryCharge: { type: Number, default: 0 },
  estimatedTime: { type: Number },
  // in minutes
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
      enum: ["pending", "confirmed", "packed", "dispatched", "in_transit", "out_for_delivery", "delivered", "failed"],
      required: true
    },
    timestamp: { type: Date, default: Date.now },
    location: { type: String },
    description: { type: String },
    photo: { type: String }
  }],
  deliveryInstructions: { type: String }
});
const paymentSchema = new mongoose.Schema({
  method: {
    type: String,
    enum: ["cash", "upi", "card", "bank_transfer", "credit", "wallet"],
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "processing", "completed", "failed", "refunded"],
    default: "pending"
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
const orderSchema = new mongoose.Schema({
  // Order Identification
  orderNumber: {
    type: String,
    unique: true,
    required: true,
    default: function() {
      return "BB-" + (/* @__PURE__ */ new Date()).getFullYear() + "-" + Math.random().toString(36).substr(2, 6).toUpperCase();
    }
  },
  // Parties Involved
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
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
  marketPrice: { type: Number },
  // total if bought at market rates
  savedAmount: { type: Number, default: 0 },
  savingsPercentage: { type: Number, default: 0 },
  // Order Status
  status: {
    type: String,
    enum: [
      "pending",
      "confirmed",
      "processing",
      "packed",
      "dispatched",
      "in_transit",
      "delivered",
      "cancelled",
      "returned",
      "refunded"
    ],
    default: "pending"
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
    enum: ["instant", "scheduled", "recurring", "group"],
    default: "instant"
  },
  // Group Order Details (if applicable)
  groupOrder: {
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group" },
    isGroupCoordinator: { type: Boolean, default: false },
    groupDiscount: { type: Number, default: 0 }
  },
  // Recurring Order Details (if applicable)
  recurringOrder: {
    parentOrderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    frequency: { type: String, enum: ["daily", "weekly", "bi-weekly", "monthly"] },
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
      enum: ["quality", "quantity", "delivery", "payment", "other"]
    },
    description: { type: String, required: true },
    reportedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["open", "investigating", "resolved", "closed"],
      default: "open"
    },
    resolution: { type: String },
    resolvedAt: { type: Date }
  }],
  // Cancellation
  cancellation: {
    reason: { type: String },
    cancelledBy: {
      type: String,
      enum: ["vendor", "supplier", "system", "admin"]
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
      enum: ["sms", "email", "push", "whatsapp"]
    },
    message: { type: String },
    sentAt: { type: Date },
    status: {
      type: String,
      enum: ["sent", "delivered", "failed"]
    }
  }]
}, {
  timestamps: true
});
orderSchema.index({ vendor: 1, placedAt: -1 });
orderSchema.index({ supplier: 1, placedAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ "delivery.scheduledDate": 1 });
orderSchema.index({ "payment.status": 1 });
orderSchema.index({ orderType: 1 });
orderSchema.virtual("deliveryStatus").get(function() {
  if (!this.delivery.trackingSteps.length) return "pending";
  return this.delivery.trackingSteps[this.delivery.trackingSteps.length - 1].status;
});
orderSchema.virtual("estimatedDelivery").get(function() {
  if (this.delivery.scheduledDate && this.delivery.estimatedTime) {
    return new Date(this.delivery.scheduledDate.getTime() + this.delivery.estimatedTime * 6e4);
  }
  return null;
});
orderSchema.methods.addTrackingStep = function(status, location, description, photo) {
  this.delivery.trackingSteps.push({
    status,
    location,
    description,
    photo,
    timestamp: /* @__PURE__ */ new Date()
  });
  this.status = status;
  const now = /* @__PURE__ */ new Date();
  switch (status) {
    case "confirmed":
      this.confirmedAt = now;
      break;
    case "packed":
      this.packedAt = now;
      break;
    case "dispatched":
      this.dispatchedAt = now;
      break;
    case "delivered":
      this.deliveredAt = now;
      break;
  }
  return this.save();
};
orderSchema.methods.calculateSavings = function() {
  if (this.marketPrice && this.totalAmount) {
    this.savedAmount = this.marketPrice - this.totalAmount;
    this.savingsPercentage = (this.savedAmount / this.marketPrice * 100).toFixed(2);
  }
  return this.save();
};
orderSchema.methods.sendNotification = function(type, message) {
  this.notifications.push({
    type,
    message,
    sentAt: /* @__PURE__ */ new Date(),
    status: "sent"
  });
  return this.save();
};
orderSchema.statics.getOrdersInRange = function(startDate, endDate, filters = {}) {
  const query = {
    placedAt: { $gte: startDate, $lte: endDate },
    ...filters
  };
  return this.find(query).populate("vendor supplier");
};
orderSchema.statics.getAnalytics = async function(vendorId, period = "month") {
  const now = /* @__PURE__ */ new Date();
  let startDate;
  switch (period) {
    case "day":
      startDate = new Date(now.setDate(now.getDate() - 1));
      break;
    case "week":
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case "month":
      startDate = new Date(now.setMonth(now.getMonth() - 1));
      break;
    case "year":
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
      break;
    default:
      startDate = new Date(now.setMonth(now.getMonth() - 1));
  }
  const dailyData = await this.aggregate([
    { $match: { vendor: new mongoose.Types.ObjectId(vendorId), placedAt: { $gte: startDate } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$placedAt" } },
        spending: { $sum: "$totalAmount" },
        savings: { $sum: "$savedAmount" }
      }
    },
    { $sort: { _id: 1 } }
  ]);
  const stats = await this.aggregate([
    { $match: { vendor: new mongoose.Types.ObjectId(vendorId), placedAt: { $gte: startDate } } },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalAmount: { $sum: "$totalAmount" },
        totalSavings: { $sum: "$savedAmount" },
        averageOrderValue: { $avg: "$totalAmount" },
        deliveredOrders: {
          $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] }
        }
      }
    }
  ]);
  return {
    stats: stats[0] || {
      totalOrders: 0,
      totalAmount: 0,
      totalSavings: 0,
      averageOrderValue: 0,
      deliveredOrders: 0
    },
    dailyData
  };
};
orderSchema.statics.getSupplierAnalytics = function(supplierId, period = "month") {
  const now = /* @__PURE__ */ new Date();
  let startDate;
  switch (period) {
    case "day":
      startDate = new Date(now.setDate(now.getDate() - 1));
      break;
    case "week":
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case "month":
      startDate = new Date(now.setMonth(now.getMonth() - 1));
      break;
    case "year":
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
      break;
    default:
      startDate = new Date(now.setMonth(now.getMonth() - 1));
  }
  return this.aggregate([
    { $match: { supplier: new mongoose.Types.ObjectId(supplierId), placedAt: { $gte: startDate } } },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalSales: { $sum: "$totalAmount" },
        totalItemsSold: { $sum: { $size: "$items" } },
        averageOrderValue: { $avg: "$totalAmount" },
        pendingOrders: {
          $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] }
        },
        deliveredOrders: {
          $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] }
        }
      }
    }
  ]);
};
const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
const router$6 = express.Router();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});
const solveIntelligently = (message, context) => {
  const text = (message || "").toLowerCase();
  const inventory = context?.inventory?.currentInventory || [];
  const products = context?.products || [];
  const deliveries = context?.activeDeliveries || [];
  if (text.includes("buy") || text.includes("order") || text.includes("खरीद") || text.includes("लेना")) {
    const targetProduct = products.find((p) => text.includes(p.name.toLowerCase()));
    if (targetProduct) {
      const qtyMatch = text.match(/\d+/);
      const qty = qtyMatch ? parseInt(qtyMatch[0]) : 10;
      const total = targetProduct.price * qty;
      const savings = (targetProduct.marketPrice - targetProduct.price) * qty;
      return {
        reply: `Jaroor! I found ${targetProduct.name} from ${targetProduct.supplier} at ₹${targetProduct.price}/${targetProduct.unit}. Total for ${qty}${targetProduct.unit} will be ₹${total}. You save ₹${savings} compared to market! Should I place this order?`,
        action: {
          type: "buy",
          product: targetProduct.name,
          quantity: `${qty}${targetProduct.unit}`,
          supplier: targetProduct.supplier,
          price: total,
          savings
        }
      };
    }
  }
  if (text.includes("supplier") || text.includes("best") || text.includes("mandi") || text.includes("विक्रेता") || text.includes("rates") || text.includes("price") || text.includes("bhav") || text.includes("dam")) {
    const topSuppliers = products.sort((a, b) => a.price - b.price).slice(0, 3).map((p) => `${p.supplier} (₹${p.price}/${p.unit} for ${p.name})`);
    if (topSuppliers.length > 0) {
      return {
        reply: `Based on today's Mandi rates, here are the top deals for you:

1. ${topSuppliers[0]}
2. ${topSuppliers[1] || ""}

All these suppliers have 90%+ trust scores. Which one would you like to explore?`,
        action: { type: "navigate", tab: "bazaar" }
      };
    }
  }
  if (text.includes("stock") || text.includes("inventory") || text.includes("स्टॉक") || text.includes("माल")) {
    const lowStock = inventory.filter((item) => (item.quantity || 0) <= (item.threshold || 5));
    if (lowStock.length > 0) {
      return {
        reply: `Caution: You are running low on ${lowStock.map((i) => i.productName).join(", ")}. Your ${lowStock[0].productName} is at ${lowStock[0].quantity}${lowStock[0].unit}. Should I find a supplier to restock?`,
        action: { type: "navigate", tab: "inventory" }
      };
    }
    return {
      reply: "Your inventory looks healthy! All items are above safety thresholds. Anything else you'd like to check?",
      action: { type: "navigate", tab: "inventory" }
    };
  }
  if (text.includes("track") || text.includes("delivery") || text.includes("order status") || text.includes("कहाँ")) {
    if (deliveries.length > 0) {
      const d = deliveries[0];
      return {
        reply: `Your order #${d.orderId} is currently "${d.status}". It should reach you in about ${d.eta}. I can keep you posted!`,
        action: { type: "navigate", tab: "delivery" }
      };
    }
    return {
      reply: "No active deliveries right now. You can check your previous orders in the delivery tab.",
      action: { type: "navigate", tab: "delivery" }
    };
  }
  if (text === "hi" || text === "hello" || text === "hey" || text === "नमस्ते" || text === "नमस्कार") {
    const name = context?.user?.fullName?.split(" ")[0] || "Dost";
    return {
      reply: `Namaste ${name} ji! I am Saarthi, your business assistant. I can help you order stock, check prices, or track deliveries. Bolye, kaise madad karoon?`,
      action: null
    };
  }
  if (text.includes("who are you") || text.includes("identity") || text.includes("tera naam") || text.includes("apka naam")) {
    return {
      reply: "I am Saarthi (BazaarBandhu AI). I am trained specifically to help Indian street food vendors like you grow their business and save money in the Mandi!",
      action: null
    };
  }
  if (text.includes("thanks") || text.includes("thank you") || text.includes("shukriya") || text.includes("dhanyavad")) {
    return {
      reply: "Aapka swagat hai ji! It's my duty to help your business grow. Kuch aur chahiye toh zaroor bataiye.",
      action: null
    };
  }
  if (text.includes("help") || text.includes("madad") || text.includes("kya kar sakte ho") || text === "?") {
    return {
      reply: "I can help you with:\n1. 🛒 Ordering Stock (e.g. 'Buy 10kg onions')\n2. 💰 Mandi Rates (e.g. 'Current price of potatoes')\n3. 📦 Stock Check (e.g. 'Check my inventory')\n4. 🚚 Tracking (e.g. 'Track my order')\n\nJust type or speak your request!",
      action: null
    };
  }
  return null;
};
router$6.post("/", async (req, res) => {
  const { message, language = "en", context } = req.body;
  console.log(`[AI Agent] New Query: "${message}" (${language})`);
  const localIntelligence = solveIntelligently(message, context);
  if (localIntelligence) {
    return res.json(localIntelligence);
  }
  try {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "your_openai_key_here") {
      throw new Error("API Key Missing");
    }
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are "Saarthi", the BazaarBandhu AI Assistant for Indian street food vendors. 
                    Persona: Respectful (uses "ji", "aap"), knowledgeable, helping the small business owner grow.
                    Context: ${context?.user?.businessName || "Street food shop"}.
                    Current stats: ${JSON.stringify(context?.shopStats || {})}
                    Instructions: Respond in ${language}. Keep it brief (1-2 sentences).`
        },
        { role: "user", content: message }
      ],
      max_tokens: 150,
      temperature: 0.7
    });
    const reply = completion.choices[0].message.content || "Main aapki kaise madad kar sakta hoon?";
    return res.json({ reply, action: null });
  } catch (error) {
    console.error("[AI Agent] LLM Error:", error.message);
    const isQuotaError = error.message?.includes("quota") || error.message?.includes("429");
    return res.json({
      reply: language === "hi" ? isQuotaError ? "माफ़ कीजिए! मेरा एडवांस सर्वर अभी बहुत बिजी है (Quota Exceeded)। पर मैं आपके ऑर्डर और स्टॉक में अभी भी मदद कर सकता हूँ। क्या आप कुछ ऑर्डर करना चाहते हैं?" : "नमस्ते! मैं आपका साार्थी हूँ। अभी मेरा सिस्टम थोड़ा अपडेट हो रहा है, पर मैं आपके सवालों का जवाब स्थानीय बुद्धि से दे सकता हूँ। आप क्या पूछना चाहते हैं?" : isQuotaError ? "Oops! My advanced brain is resting right now (OpenAI Quota Exceeded). However, my local business switch is still ON! I can still help you with orders and stock. What would you like to do?" : "Namaste! I am your Saarthi. My connection is a bit unstable, but I can still answer basic business questions. How can I help you today?",
      action: null
    });
  }
});
const __filename$1 = fileURLToPath(import.meta.url);
const __dirname$1 = path.dirname(__filename$1);
const router$5 = express.Router();
const PYTHON_SCRIPT_PATH = path.join(__dirname$1, "..", "..", "deepseek_server.py");
router$5.post("/", async (req, res) => {
  const { message, language = "english" } = req.body;
  try {
    if (!message) {
      return res.status(400).json({
        error: "Message is required"
      });
    }
    const response = await callDeepSeekModel(message, language);
    return res.json({ response });
  } catch (error) {
    console.error("DeepSeek chat error:", error.message);
    const errorMessages = {
      english: "I'm sorry, there was an error processing your request. Please try again later.",
      hindi: "माफ़ कीजिए, आपके अनुरोध को संसाधित करने में एक त्रुटि हुई थी। कृपया बाद में पुनः प्रयास करें।",
      marathi: "क्षमस्व, आपल्या विनंतीवर प्रक्रिया करताना त्रुटी आली. कृपया नंतर पुन्हा प्रयत्न करा.",
      gujarati: "માફ કરશો, તમારી વિનંતી પર પ્રક્રિયા કરવામાં ભૂલ આવી. કૃપા કરીને પછીથી ફરી પ્રયાસ કરો."
    };
    const errorMessage = errorMessages[language.toLowerCase()] || errorMessages.english;
    return res.status(500).json({ error: errorMessage });
  }
});
async function callDeepSeekModel(message, language) {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn("python", [
      PYTHON_SCRIPT_PATH,
      "--message",
      message,
      "--language",
      language
    ]);
    let responseData = "";
    let errorData = "";
    pythonProcess.stdout.on("data", (data) => {
      responseData += data.toString();
    });
    pythonProcess.stderr.on("data", (data) => {
      errorData += data.toString();
    });
    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        console.error(`DeepSeek process exited with code ${code}`);
        console.error(`Error: ${errorData}`);
        reject(new Error(`DeepSeek process failed with code ${code}`));
        return;
      }
      try {
        const parsedResponse = JSON.parse(responseData.trim());
        resolve(parsedResponse.response);
      } catch (error) {
        console.error("Failed to parse DeepSeek response:", error);
        console.error("Raw response:", responseData);
        reject(new Error("Failed to parse model response"));
      }
    });
    pythonProcess.on("error", (error) => {
      console.error("Failed to start DeepSeek process:", error);
      reject(error);
    });
    const timeout = setTimeout(() => {
      pythonProcess.kill();
      reject(new Error("DeepSeek process timed out"));
    }, 6e4);
    pythonProcess.on("close", () => {
      clearTimeout(timeout);
    });
  });
}
createRequire(import.meta.url);
const router$4 = express.Router();
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || ""
});
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.warn("⚠️ Razorpay Keys are missing from environment variables!");
} else {
  console.log("✅ Razorpay initialized with Key ID:", `${process.env.RAZORPAY_KEY_ID.substring(0, 9)}...`);
}
router$4.post("/create-order", async (req, res) => {
  try {
    const { amount, currency = "INR", receipt } = req.body;
    const options = {
      amount: Math.round(amount * 100),
      // Razorpay expects amount in paise
      currency,
      receipt
    };
    const order = await razorpay.orders.create(options);
    console.log("✅ Razorpay order created:", order.id);
    res.json(order);
  } catch (error) {
    console.error("❌ Razorpay order creation failed!");
    console.error("Error Name:", error.name);
    console.error("Error Code:", error.code);
    console.error("Error Description:", error.description);
    console.error("Full Error:", JSON.stringify(error, null, 2));
    res.status(500).json({
      error: error.message,
      description: error.description,
      code: error.code
    });
  }
});
router$4.post("/verify", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId
      // MongoDB Order ID
    } = req.body;
    const shasum = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "secret_key_here");
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest("hex");
    if (digest === razorpay_signature) {
      if (orderId) {
        await Order.findByIdAndUpdate(orderId, {
          "payment.status": "completed",
          "payment.transactionId": razorpay_payment_id,
          "payment.gatewayTransactionId": razorpay_order_id,
          "status": "confirmed"
        });
      }
      res.json({ status: "success" });
    } else {
      res.status(400).json({ status: "failure", message: "Signature verification failed" });
    }
  } catch (error) {
    console.error("Razorpay verification failed:", error);
    res.status(500).json({ error: error.message });
  }
});
const authenticateToken$1 = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }
  const envSecret = process.env.JWT_SECRET;
  const secret = envSecret || "bazaarbandhu_secret";
  console.log(`[AUTH] Verifying token. Secret source: ${envSecret ? "ENV" : "FALLBACK"}. Secret prefix: ${secret.substring(0, 4)}`);
  jwt.verify(token, secret, (err, user) => {
    if (err) {
      console.error(`[AUTH] Verification FAILED (${err.name}):`, err.message);
      return res.status(403).json({
        error: "Invalid token",
        details: err.message,
        type: err.name
      });
    }
    req.user = user;
    next();
  });
};
const router$3 = express.Router();
v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
const storage = new CloudinaryStorage({
  cloudinary: v2,
  params: {
    // @ts-ignore
    folder: "bazaarbandhu_documents",
    allowed_formats: ["jpg", "png", "pdf", "jpeg"],
    public_id: (req, file) => `doc_${Date.now()}_${file.originalname.split(".")[0]}`
  }
});
const upload = multer({ storage });
router$3.post("/upload/document", upload.single("document"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    res.json({
      message: "Document uploaded successfully",
      url: req.file.path,
      // Cloudinary secure URL
      originalName: req.file.originalname
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to upload document", details: error.message });
  }
});
router$3.post("/auth/register", async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      phone,
      userType,
      businessName,
      address,
      stallName,
      stallType,
      location,
      addressDetails,
      businessCategory,
      appLanguage,
      gstNumber,
      deliveryRadius,
      minOrderAmount,
      productCategories,
      paymentMethods,
      workingHoursFrom,
      workingHoursTo
    } = req.body;
    console.log("[AUTH] Register Request:", { fullName, email, phone, userType });
    if (!fullName || !email || !password || !phone || !userType) {
      return res.status(400).json({ error: "Missing required fields: fullName, email, password, phone, userType" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User with this email already exists" });
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    let newUser;
    const finalAddress = {
      street: addressDetails?.street || address || "Main Market",
      city: addressDetails?.city || "Solapur",
      state: addressDetails?.state || "Maharashtra",
      pincode: addressDetails?.pincode || "413001",
      country: "India"
    };
    const finalLocation = {
      type: "Point",
      coordinates: location?.coordinates || [75.9064, 17.6599]
      // Solapur coordinates
    };
    if (userType === "vendor") {
      const isPaniPuri = (businessName || stallName || "").toLowerCase().includes("pani puri") || (businessName || stallName || "").toLowerCase().includes("panipuri") || (stallType === "Street Food" || stallType === "street_food" || stallType === "पानी पूरी स्टॉल");
      const defaultInventory = isPaniPuri ? [
        { productName: "Potatoes", category: "Vegetables", quantity: 20, unit: "kg", costPrice: 25 },
        { productName: "Puris", category: "Grains", quantity: 1e3, unit: "pcs", costPrice: 0.5 },
        { productName: "Chickpeas", category: "Grains", quantity: 10, unit: "kg", costPrice: 80 },
        { productName: "Tamarind", category: "Spices", quantity: 5, unit: "kg", costPrice: 120 },
        { productName: "Mint", category: "Vegetables", quantity: 2, unit: "kg", costPrice: 40 },
        { productName: "Green Chilies", category: "Vegetables", quantity: 1, unit: "kg", costPrice: 60 },
        { productName: "Oil", category: "Oil", quantity: 15, unit: "Litre", costPrice: 140 },
        { productName: "Chaat Masala", category: "Spices", quantity: 2, unit: "kg", costPrice: 250 }
      ] : [];
      newUser = new Vendor({
        fullName,
        email,
        password: hashedPassword,
        phone,
        userType,
        businessName: businessName || stallName || "My Vendor Shop",
        appLanguage,
        address: finalAddress,
        location: finalLocation,
        businessCategory: businessCategory || stallType || "street_food",
        currentInventory: defaultInventory
      });
    } else if (userType === "supplier") {
      newUser = new Supplier({
        fullName,
        email,
        password: hashedPassword,
        phone,
        userType,
        businessName: businessName || stallName || "My Supplier Shop",
        appLanguage,
        address: finalAddress,
        location: finalLocation,
        gstNumber,
        deliveryRadius: deliveryRadius || 10,
        minOrderAmount: minOrderAmount || 500,
        productCategories: productCategories && productCategories.length > 0 ? productCategories : ["Vegetables"],
        paymentMethods: paymentMethods && paymentMethods.length > 0 ? paymentMethods : ["Cash", "UPI"],
        workingHours: {
          from: workingHoursFrom || "06:00",
          to: workingHoursTo || "20:00"
        }
      });
    } else {
      newUser = new User({
        fullName,
        email,
        password: hashedPassword,
        phone,
        userType,
        businessName: businessName || "My Bazaar App",
        appLanguage
      });
    }
    try {
      await newUser.save();
      console.log(`[AUTH] Successfully registered ${userType}: ${email}`);
    } catch (saveError) {
      console.error("[AUTH] Save error:", saveError);
      if (saveError.name === "ValidationError") {
        const messages = Object.values(saveError.errors).map((err) => err.message);
        return res.status(400).json({ error: `Validation Error: ${messages.join(", ")}` });
      }
      if (saveError.code === 11e3) {
        const field = Object.keys(saveError.keyPattern)[0];
        return res.status(400).json({ error: `A user with this ${field} already exists.` });
      }
      throw saveError;
    }
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email, userType: newUser.userType },
      process.env.JWT_SECRET || "bazaarbandhu_secret",
      { expiresIn: "7d" }
    );
    res.status(201).json({
      message: "Registration successful",
      token,
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        userType: newUser.userType,
        businessName: newUser.businessName
      }
    });
  } catch (error) {
    console.error("[AUTH] Critical Registration error:", error);
    if (!res.headersSent) {
      res.status(500).json({
        error: "Registration failed due to server error",
        details: error.message,
        stack: void 0
      });
    }
  }
});
router$3.get("/db-health", (req, res) => {
  const status = mongoose.connection.readyState;
  const states = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting"
  };
  res.json({
    status: states[status] || "unknown",
    mongodb_uri: process.env.MONGODB_URI ? "Defined" : "Missing",
    database: mongoose.connection.name
  });
});
router$3.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password required"
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        error: "Invalid credentials. User not found."
      });
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: "Invalid credentials. Incorrect password."
      });
    }
    user.lastLogin = /* @__PURE__ */ new Date();
    await user.save();
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        userType: user.userType
      },
      process.env.JWT_SECRET || "bazaarbandhu_secret",
      { expiresIn: "7d" }
    );
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        userType: user.userType,
        businessName: user.businessName
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      error: "Login failed",
      details: error.message
    });
  }
});
router$3.get("/config/status-line", (req, res) => {
  const hour = (/* @__PURE__ */ new Date()).getHours();
  let statusKey = "market_open";
  if (hour < 6 || hour > 21) {
    statusKey = "market_closed";
  } else if (hour >= 6 && hour < 9) {
    statusKey = "early_morning";
  } else if (hour >= 18 && hour < 21) {
    statusKey = "evening_rush";
  }
  res.json({
    statusKey,
    lastUpdate: /* @__PURE__ */ new Date(),
    marketStatus: hour >= 6 && hour <= 21 ? "active" : "inactive"
  });
});
router$3.get("/suppliers", async (req, res) => {
  try {
    const {
      category,
      pincode,
      radius,
      minRating,
      limit = 20,
      page = 1
    } = req.query;
    let query = { userType: "supplier", isActive: true };
    if (category) {
      query.productCategories = { $in: [category] };
    }
    if (minRating) {
      query["rating.average"] = { $gte: parseFloat(minRating) };
    }
    const suppliers = await Supplier.find(query).select("-password").limit(parseInt(limit)).skip((parseInt(page) - 1) * parseInt(limit)).sort({ "rating.average": -1, trustScore: -1 });
    res.json({
      suppliers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: await Supplier.countDocuments(query)
      }
    });
  } catch (error) {
    console.error("Get suppliers error:", error);
    res.status(500).json({
      error: "Failed to fetch suppliers",
      details: error.message
    });
  }
});
router$3.get("/suppliers/profile", authenticateToken$1, async (req, res) => {
  try {
    if (req.user.userType !== "supplier") {
      return res.status(403).json({
        error: "Access denied. Suppliers only."
      });
    }
    const supplier = await Supplier.findById(req.user.userId).select("-password");
    if (!supplier) {
      return res.status(404).json({ error: "Supplier not found" });
    }
    console.log(`[PROFILE] Returning profile for supplier: ${supplier.businessName} (ID: ${supplier._id})`);
    res.json(supplier);
  } catch (error) {
    console.error("Get supplier profile error:", error);
    res.status(500).json({
      error: "Failed to fetch profile",
      details: error.message
    });
  }
});
router$3.get("/suppliers/analytics", authenticateToken$1, async (req, res) => {
  try {
    if (req.user.userType !== "supplier") {
      return res.status(403).json({
        error: "Access denied. Suppliers only."
      });
    }
    const { period = "month" } = req.query;
    const analytics = await Order.getSupplierAnalytics(req.user.userId, period);
    res.json({
      period,
      analytics: analytics[0] || {
        totalOrders: 0,
        totalSales: 0,
        totalItemsSold: 0,
        averageOrderValue: 0,
        pendingOrders: 0,
        deliveredOrders: 0
      }
    });
  } catch (error) {
    console.error("Get supplier analytics error:", error);
    res.status(500).json({
      error: "Failed to fetch analytics",
      details: error.message
    });
  }
});
router$3.get("/suppliers/:id", async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id).select("-password").populate("groupMembers", "fullName businessName");
    if (!supplier) {
      return res.status(404).json({ error: "Supplier not found" });
    }
    res.json(supplier);
  } catch (error) {
    console.error("Get supplier error:", error);
    res.status(500).json({
      error: "Failed to fetch supplier",
      details: error.message
    });
  }
});
router$3.get("/suppliers/:id/products", async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id).select("fullName businessName products rating");
    if (!supplier) {
      return res.status(404).json({ error: "Supplier not found" });
    }
    const availableProducts = supplier.products.filter(
      (p) => p.isActive !== false && (p.inventory === void 0 || p.inventory > 0)
    );
    res.json({
      supplier: {
        _id: supplier._id,
        fullName: supplier.fullName,
        businessName: supplier.businessName,
        rating: supplier.rating
      },
      products: availableProducts
    });
  } catch (error) {
    console.error("Get supplier products error:", error);
    res.status(500).json({
      error: "Failed to fetch supplier products",
      details: error.message
    });
  }
});
router$3.get("/suppliers/profile", authenticateToken$1, async (req, res) => {
  try {
    if (req.user.userType !== "supplier") {
      return res.status(403).json({
        error: "Access denied. Suppliers only."
      });
    }
    const supplier = await Supplier.findById(req.user.userId).select("-password");
    if (!supplier) {
      return res.status(404).json({ error: "Supplier not found" });
    }
    console.log(`[PROFILE] Returning profile for supplier: ${supplier.businessName} (ID: ${supplier._id})`);
    res.json(supplier);
  } catch (error) {
    console.error("Get supplier profile error:", error);
    res.status(500).json({
      error: "Failed to fetch profile",
      details: error.message
    });
  }
});
router$3.put("/suppliers/profile", authenticateToken$1, async (req, res) => {
  try {
    if (req.user.userType !== "supplier") {
      return res.status(403).json({
        error: "Access denied. Suppliers only."
      });
    }
    const updates = req.body;
    delete updates.password;
    const supplier = await Supplier.findByIdAndUpdate(
      req.user.userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");
    if (!supplier) {
      return res.status(404).json({ error: "Supplier not found" });
    }
    res.json({
      message: "Profile updated successfully",
      supplier
    });
  } catch (error) {
    console.error("Update supplier error:", error);
    res.status(500).json({
      error: "Failed to update profile",
      details: error.message
    });
  }
});
router$3.post("/suppliers/products", authenticateToken$1, async (req, res) => {
  try {
    if (req.user.userType !== "supplier") {
      return res.status(403).json({
        error: "Access denied. Suppliers only."
      });
    }
    const { products } = req.body;
    const supplier = await Supplier.findById(req.user.userId);
    if (!supplier) {
      return res.status(404).json({ error: "Supplier not found" });
    }
    products.forEach((product) => {
      const existingIndex = supplier.products.findIndex(
        (p) => p.name === product.name && p.category === product.category
      );
      if (existingIndex >= 0) {
        supplier.products[existingIndex] = { ...supplier.products[existingIndex], ...product };
      } else {
        supplier.products.push(product);
      }
    });
    await supplier.save();
    res.json({
      message: "Products updated successfully",
      products: supplier.products
    });
  } catch (error) {
    console.error("Update products error:", error);
    res.status(500).json({
      error: "Failed to update products",
      details: error.message
    });
  }
});
router$3.get("/suppliers/analytics", authenticateToken$1, async (req, res) => {
  try {
    if (req.user.userType !== "supplier") {
      return res.status(403).json({
        error: "Access denied. Suppliers only."
      });
    }
    const { period = "month" } = req.query;
    const analytics = await Order.getSupplierAnalytics(req.user.userId, period);
    res.json({
      period,
      analytics: analytics[0] || {
        totalOrders: 0,
        totalSales: 0,
        totalItemsSold: 0,
        averageOrderValue: 0,
        pendingOrders: 0,
        deliveredOrders: 0
      }
    });
  } catch (error) {
    console.error("Get supplier analytics error:", error);
    res.status(500).json({
      error: "Failed to fetch analytics",
      details: error.message
    });
  }
});
router$3.get("/vendors/profile", authenticateToken$1, async (req, res) => {
  try {
    if (req.user.userType !== "vendor") {
      return res.status(403).json({
        error: "Access denied. Vendors only."
      });
    }
    let vendor = await Vendor.findById(req.user.userId).select("-password").populate("preferredSuppliers.supplierId", "fullName businessName rating");
    if (!vendor) {
      vendor = await User.findById(req.user.userId).select("-password");
    }
    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found" });
    }
    res.json(vendor);
  } catch (error) {
    console.error("Get vendor profile error:", error);
    res.status(500).json({
      error: "Failed to fetch profile",
      details: error.message
    });
  }
});
router$3.put("/vendors/profile", authenticateToken$1, async (req, res) => {
  try {
    if (req.user.userType !== "vendor") {
      return res.status(403).json({
        error: "Access denied. Vendors only."
      });
    }
    const updates = req.body;
    delete updates.password;
    const vendor = await Vendor.findByIdAndUpdate(
      req.user.userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");
    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found" });
    }
    res.json({
      message: "Profile updated successfully",
      vendor
    });
  } catch (error) {
    console.error("Update vendor error:", error);
    res.status(500).json({
      error: "Failed to update profile",
      details: error.message
    });
  }
});
router$3.get("/vendors/analytics", authenticateToken$1, async (req, res) => {
  try {
    if (req.user.userType !== "vendor") {
      return res.status(403).json({
        error: "Access denied. Vendors only."
      });
    }
    const { period = "month" } = req.query;
    const analytics = await Order.getAnalytics(req.user.userId, period);
    const vendor = await Vendor.findById(req.user.userId).select("purchaseAnalytics savings");
    res.json({
      period,
      analytics: analytics[0] || {},
      vendorMetrics: vendor ? {
        purchaseAnalytics: vendor.purchaseAnalytics,
        savings: vendor.savings
      } : {}
    });
  } catch (error) {
    console.error("Get analytics error:", error);
    res.status(500).json({
      error: "Failed to fetch analytics",
      details: error.message
    });
  }
});
router$3.patch("/vendors/inventory", authenticateToken$1, async (req, res) => {
  try {
    if (req.user.userType !== "vendor") {
      return res.status(403).json({ error: "Access denied. Vendors only." });
    }
    const { product, currentInventory } = req.body;
    let vendor = await Vendor.findById(req.user.userId);
    if (!vendor) {
      vendor = await User.findById(req.user.userId);
    }
    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found" });
    }
    if (currentInventory && Array.isArray(currentInventory)) {
      vendor.currentInventory = currentInventory;
    } else if (product) {
      if (!vendor.currentInventory) vendor.currentInventory = [];
      const itemIndex = vendor.currentInventory.findIndex(
        (item) => item.productName === product.productName
      );
      if (itemIndex >= 0) {
        vendor.currentInventory[itemIndex] = {
          ...vendor.currentInventory[itemIndex].toObject(),
          ...product,
          purchaseDate: /* @__PURE__ */ new Date()
        };
      } else {
        vendor.currentInventory.push({
          ...product,
          purchaseDate: /* @__PURE__ */ new Date()
        });
      }
    } else {
      return res.status(400).json({ error: 'Either "product" or "currentInventory" must be provided' });
    }
    vendor.markModified("currentInventory");
    await vendor.save();
    res.json({
      message: "Inventory updated successfully",
      inventory: vendor.currentInventory
    });
  } catch (error) {
    console.error("Update inventory error:", error);
    res.status(500).json({ error: "Failed to update inventory", details: error.message });
  }
});
router$3.delete("/vendors/inventory/:productName", authenticateToken$1, async (req, res) => {
  try {
    if (req.user.userType !== "vendor") {
      return res.status(403).json({ error: "Access denied. Vendors only." });
    }
    const { productName } = req.params;
    const vendor = await Vendor.findById(req.user.userId);
    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found" });
    }
    vendor.currentInventory = vendor.currentInventory.filter(
      (item) => item.productName !== productName
    );
    await vendor.save();
    res.json({
      message: "Item removed successfully",
      inventory: vendor.currentInventory
    });
  } catch (error) {
    console.error("Delete inventory item error:", error);
    res.status(500).json({ error: "Failed to delete item", details: error.message });
  }
});
router$3.post("/orders", authenticateToken$1, async (req, res) => {
  try {
    const {
      supplierId,
      items,
      deliveryAddress,
      scheduledDate,
      timeSlot,
      paymentMethod,
      specialInstructions
    } = req.body;
    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      return res.status(404).json({ error: "Supplier not found" });
    }
    let subtotal = 0;
    let marketPriceTotal = 0;
    const processedItems = items.map((item) => {
      const supplierProduct = supplier.products.find((p) => p.name === item.productName);
      const priceToUse = supplierProduct ? supplierProduct.pricePerUnit : item.pricePerUnit;
      const total = item.quantity * priceToUse;
      subtotal += total;
      const marketPrice = supplierProduct?.marketPrice || priceToUse * 1.2;
      marketPriceTotal += item.quantity * marketPrice;
      return {
        ...item,
        productId: supplierProduct?._id || item.productId,
        category: item.category || supplierProduct?.category || "General",
        pricePerUnit: priceToUse,
        totalPrice: total
      };
    });
    const deliveryCharge = supplier.serviceAreas.find(
      (area) => area.pincode === deliveryAddress.pincode
    )?.deliveryCharge || 0;
    const totalAmount = subtotal + deliveryCharge;
    const savedAmount = marketPriceTotal - subtotal;
    let finalTimeSlot = timeSlot;
    if (typeof timeSlot === "string") {
      const parts = timeSlot.split("-").map((s) => s.trim());
      finalTimeSlot = {
        from: parts[0] || "09:00",
        to: parts[1] || "18:00"
      };
    } else if (!timeSlot || !timeSlot.from) {
      finalTimeSlot = { from: "09:00", to: "18:00" };
    }
    console.log("[ORDER] Final TimeSlot:", finalTimeSlot);
    console.log("[ORDER] Processed Items Sample:", processedItems[0]);
    const order = new Order({
      vendor: req.user.userId,
      supplier: supplierId,
      items: processedItems,
      subtotal,
      deliveryCharge,
      totalAmount,
      marketPrice: marketPriceTotal,
      savedAmount,
      savingsPercentage: marketPriceTotal > 0 ? parseFloat((savedAmount / marketPriceTotal * 100).toFixed(2)) : 0,
      delivery: {
        address: deliveryAddress,
        scheduledDate: new Date(scheduledDate),
        timeSlot: finalTimeSlot,
        deliveryCharge
      },
      payment: {
        method: paymentMethod,
        amount: totalAmount,
        finalAmount: totalAmount,
        status: paymentMethod === "cash" ? "pending" : "completed"
        // Simple simulation
      },
      specialInstructions,
      aiAssistant: {
        wasOrderedByAI: req.body.isAIOrder || false
      }
    });
    await order.save();
    await Vendor.findByIdAndUpdate(req.user.userId, {
      $inc: {
        totalSpent: totalAmount,
        totalSavings: savedAmount,
        totalOrders: 1
      }
    });
    const supplierDoc = await Supplier.findById(supplierId);
    if (supplierDoc) {
      let stockChanged = false;
      processedItems.forEach((item) => {
        const prodIdx = supplierDoc.products.findIndex(
          (p) => p.name === item.productName || String(p._id) === String(item.productId)
        );
        if (prodIdx >= 0) {
          const prod = supplierDoc.products[prodIdx];
          if (prod.inventory !== void 0) {
            prod.inventory = Math.max(0, (prod.inventory || 0) - item.quantity);
          }
          stockChanged = true;
        }
      });
      if (stockChanged) await supplierDoc.save();
    }
    const vendorDoc = await Vendor.findById(req.user.userId);
    if (vendorDoc) {
      processedItems.forEach((item) => {
        const existingIdx = vendorDoc.currentInventory.findIndex(
          (inv) => inv.productName === item.productName
        );
        if (existingIdx >= 0) {
          vendorDoc.currentInventory[existingIdx].quantity = (vendorDoc.currentInventory[existingIdx].quantity || 0) + item.quantity;
        } else {
          vendorDoc.currentInventory.push({
            productName: item.productName,
            category: item.category || "General",
            quantity: item.quantity,
            unit: item.unit,
            costPrice: item.pricePerUnit,
            purchaseDate: /* @__PURE__ */ new Date()
          });
        }
      });
      await vendorDoc.save();
    }
    await order.addTrackingStep("pending", "Order received", "Order has been placed and is awaiting confirmation");
    const populatedOrder = await Order.findById(order._id).populate("vendor", "fullName businessName phone").populate("supplier", "fullName businessName phone address");
    res.status(201).json({
      message: "Order created successfully",
      order: populatedOrder
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({
      error: "Failed to create order",
      details: error.message
    });
  }
});
router$3.get("/orders", authenticateToken$1, async (req, res) => {
  try {
    const { status, limit = 20, page = 1 } = req.query;
    let query = {};
    if (req.user.userType === "vendor") {
      query.vendor = req.user.userId;
    } else if (req.user.userType === "supplier") {
      query.supplier = req.user.userId;
    } else {
      return res.status(403).json({ error: "Access denied" });
    }
    if (status) {
      query.status = status;
    }
    const orders = await Order.find(query).populate("vendor", "fullName businessName phone").populate("supplier", "fullName businessName phone").limit(parseInt(limit)).skip((parseInt(page) - 1) * parseInt(limit)).sort({ placedAt: -1 });
    res.json({
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: await Order.countDocuments(query)
      }
    });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({
      error: "Failed to fetch orders",
      details: error.message
    });
  }
});
router$3.get("/orders/:id", authenticateToken$1, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("vendor", "fullName businessName phone address").populate("supplier", "fullName businessName phone address");
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    if (req.user.userType === "vendor" && order.vendor._id.toString() !== req.user.userId) {
      return res.status(403).json({ error: "Access denied" });
    }
    if (req.user.userType === "supplier" && order.supplier._id.toString() !== req.user.userId) {
      return res.status(403).json({ error: "Access denied" });
    }
    res.json(order);
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({
      error: "Failed to fetch order",
      details: error.message
    });
  }
});
router$3.patch("/orders/:id/status", authenticateToken$1, async (req, res) => {
  try {
    if (req.user.userType !== "supplier") {
      return res.status(403).json({
        error: "Access denied. Suppliers only."
      });
    }
    const { status, location, description } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    if (order.supplier.toString() !== req.user.userId) {
      return res.status(403).json({ error: "Access denied" });
    }
    await order.addTrackingStep(status, location, description);
    res.json({
      message: "Order status updated successfully",
      order
    });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({
      error: "Failed to update order status",
      details: error.message
    });
  }
});
router$3.post("/orders/:id/rating", authenticateToken$1, async (req, res) => {
  try {
    const { rating, review } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    if (req.user.userType === "vendor" && order.vendor.toString() !== req.user.userId) {
      return res.status(403).json({ error: "Access denied" });
    }
    if (req.user.userType === "vendor") {
      order.rating.vendor = {
        ...rating,
        overall: rating.overall,
        review,
        ratedAt: /* @__PURE__ */ new Date()
      };
    }
    await order.save();
    res.json({
      message: "Rating added successfully",
      order
    });
  } catch (error) {
    console.error("Add rating error:", error);
    res.status(500).json({
      error: "Failed to add rating",
      details: error.message
    });
  }
});
router$3.get("/search/products", async (req, res) => {
  try {
    const {
      query,
      category,
      maxPrice,
      minRating,
      pincode,
      limit = 20,
      page = 1
    } = req.query;
    let matchQuery = {
      userType: "supplier",
      isActive: true,
      "products.isActive": true
    };
    if (category) {
      matchQuery["products.category"] = category;
    }
    if (maxPrice) {
      matchQuery["products.pricePerUnit"] = { $lte: parseFloat(maxPrice) };
    }
    if (minRating) {
      matchQuery["rating.average"] = { $gte: parseFloat(minRating) };
    }
    if (pincode) {
      matchQuery["serviceAreas.pincode"] = pincode;
    }
    if (query) {
      matchQuery.$or = [
        { "products.name": { $regex: query, $options: "i" } },
        { "products.category": { $regex: query, $options: "i" } },
        { "businessName": { $regex: query, $options: "i" } }
      ];
    }
    const results = await Supplier.aggregate([
      { $match: matchQuery },
      { $unwind: "$products" },
      { $match: { "products.isActive": true } },
      {
        $project: {
          supplierName: "$fullName",
          businessName: "$businessName",
          rating: "$rating",
          trustScore: "$trustScore",
          product: "$products",
          deliveryRadius: "$deliveryRadius",
          workingHours: "$workingHours"
        }
      },
      { $sort: { "rating.average": -1, "product.pricePerUnit": 1 } },
      { $skip: (parseInt(page) - 1) * parseInt(limit) },
      { $limit: parseInt(limit) }
    ]);
    res.json({
      products: results,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error("Search products error:", error);
    res.status(500).json({
      error: "Failed to search products",
      details: error.message
    });
  }
});
router$3.get("/", (req, res) => {
  console.log("✅ /api route hit");
  res.json({ message: "Welcome to the BazaarBandhu API!" });
});
router$3.get("/test", (req, res) => {
  res.json({ message: "Test route is working!" });
});
router$3.use("/ai-chat", router$6);
router$3.use("/deepseek-chat", router$5);
router$3.use("/payments", router$4);
const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  // e.g., 'Onions', 'Potatoes', 'Oil'
  coordinator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  members: [{
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
    status: { type: String, enum: ["joined", "confirmed", "paid"], default: "joined" }
  }],
  targetQuantity: { type: Number, required: true },
  currentQuantity: { type: Number, default: 0 },
  deadline: { type: Date, required: true },
  status: {
    type: String,
    enum: ["open", "completed", "ordered", "delivered", "cancelled"],
    default: "open"
  },
  bulkPricePerUnit: { type: Number },
  marketPricePerUnit: { type: Number },
  estimatedSavings: { type: Number },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" }
}, {
  timestamps: true
});
groupSchema.index({ category: 1, status: 1 });
groupSchema.index({ location: "2dsphere" });
const Group = mongoose.models.Group || mongoose.model("Group", groupSchema);
const router$2 = express.Router();
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }
  jwt.verify(token, process.env.JWT_SECRET || "bazaarbandhu_secret", (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid token" });
    }
    req.user = user;
    next();
  });
};
router$2.post("/voice-process", authenticateToken, async (req, res) => {
  try {
    const { transcript } = req.body;
    const userId = req.user.userId;
    if (!transcript) return res.status(400).json({ error: "No transcript provided" });
    const text = transcript.toLowerCase();
    const units = ["kilo", "kg", "packet", "box", "ltr", "litre", "doz", "piece", "pcs", "nugget", "gram", "gm"];
    const productMap = {
      "aloo": "Potatoes",
      "potato": "Potatoes",
      "pyaj": "Onions",
      "pyaz": "Onions",
      "onion": "Onions",
      "tamatar": "Tomatoes",
      "tomato": "Tomatoes",
      "dudh": "Milk",
      "milk": "Milk",
      "tel": "Oil",
      "oil": "Oil",
      "bread": "Bread",
      "pav": "Bread",
      "paneer": "Paneer",
      "mirch": "Chilli",
      "chilly": "Chilli",
      "namak": "Salt"
    };
    const result = { intent: "update_inventory", entities: {} };
    const qMatch = text.match(/(\d+\.?\d*)/);
    if (qMatch) result.entities.quantity = parseFloat(qMatch[1]);
    const uMatch = units.find((u) => text.includes(u));
    if (uMatch) result.entities.unit = uMatch;
    const pKey = Object.keys(productMap).find((k) => text.includes(k));
    if (pKey) result.entities.product = productMap[pKey];
    const prMatch = text.match(/(?:rs|rupaye|price|cost|mein|for|at)\s*(\d+)/i);
    if (prMatch) result.entities.price = parseInt(prMatch[1]);
    if (result.entities.product && result.entities.quantity) {
      const vendor = await Vendor.findById(userId);
      if (vendor) {
        const itemIndex = vendor.currentInventory.findIndex(
          (item) => item.productName === result.entities.product
        );
        if (itemIndex >= 0) {
          vendor.currentInventory[itemIndex].quantity += result.entities.quantity;
          if (result.entities.price) vendor.currentInventory[itemIndex].costPrice = result.entities.price;
        } else {
          vendor.currentInventory.push({
            productName: result.entities.product,
            quantity: result.entities.quantity,
            unit: result.entities.unit || "kg",
            costPrice: result.entities.price || 0,
            category: "General",
            purchaseDate: /* @__PURE__ */ new Date()
          });
        }
        await vendor.save();
        result.status = "SUCCESS";
        result.message = `Successfully added ${result.entities.quantity} ${result.entities.unit || ""} of ${result.entities.product} to your inventory.`;
      }
    } else {
      result.status = "PARTIAL";
      result.message = "I couldn't quite catch the product or quantity. Try: 'Aloo 5 kilo'";
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Voice processing failed" });
  }
});
router$2.get("/group-buying/nearby", authenticateToken, async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.user.userId);
    if (!vendor) return res.status(404).json({ error: "Vendor not found" });
    const openGroups = await Group.find({ status: "open" }).limit(5);
    const simulations = [
      { id: "g1", name: "Solapur Onion Bulk", category: "Onions", currentQuantity: 450, targetQuantity: 1e3, savings: "18%", deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1e3) },
      { id: "g2", name: "Oil Traders Club", category: "Oil", currentQuantity: 80, targetQuantity: 200, savings: "12%", deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1e3) }
    ];
    res.json({
      groups: openGroups.length > 0 ? openGroups : simulations,
      nearbyVendorsReady: 12
    });
  } catch (error) {
    res.status(500).json({ error: "Group fetch failed" });
  }
});
router$2.post("/group-buying/join", authenticateToken, async (req, res) => {
  try {
    const { groupId, quantity } = req.body;
    const vendor = await Vendor.findById(req.user.userId);
    if (vendor) {
      vendor.groupBuying.isParticipating = true;
      await vendor.save();
    }
    res.json({ status: "SUCCESS", message: "You have successfully joined the group buying pool!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to join group" });
  }
});
router$2.post("/whatsapp-webhook", async (req, res) => {
  try {
    const { From, Body } = req.body;
    const cmd = Body.toLowerCase();
    let responseMessage = "Welcome to BazaarBandhu WhatsApp. Try: 'Stock', 'Hisaab', or 'Orders'.";
    if (cmd.includes("stock")) {
      responseMessage = "🔄 *Stock Update*:\n- Potatoes: 25kg (Low!)\n- Onions: 120kg\n- Oil: 15L\n\nReply 'Order' to top up.";
    } else if (cmd.includes("hisaab")) {
      responseMessage = "💰 *Aaj Ka Hisaab*:\n- Sales: ₹4,850\n- Udhaar: ₹1,200\n- Market Savings: ₹640\n\nSystem updated ✅";
    }
    res.json({ message: responseMessage });
  } catch (error) {
    res.status(500).json({ error: "Webhook failed" });
  }
});
router$2.get("/recovery-status", authenticateToken, async (req, res) => {
  try {
    const credits = await Order.find({
      vendor: req.user.userId,
      "payment.method": "credit",
      "payment.status": { $ne: "completed" }
    }).populate("supplier", "businessName phone");
    res.json({
      totalPending: 1200,
      // Simulation or real sum
      debtorsCount: 3,
      records: [
        { id: "1", party: "Shukla Sweets", amount: 450, tone: "FRIENDLY", days: 2 },
        { id: "2", party: "Chai Point", amount: 800, tone: "STRICT", days: 12 }
      ]
    });
  } catch (error) {
    res.status(500).json({ error: "Recovery fetch failed" });
  }
});
router$2.post("/recovery/remind", authenticateToken, async (req, res) => {
  res.json({ status: "SUCCESS", message: "Smart Reminder sent via WhatsApp" });
});
router$2.get("/predictions", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const recentOrders = await Order.find({ vendor: userId }).limit(20);
    const itemStats = {};
    recentOrders.forEach((order) => {
      order.items.forEach((item) => {
        if (!itemStats[item.productName]) {
          itemStats[item.productName] = { totalQty: 0, count: 0, daysAppeared: /* @__PURE__ */ new Set() };
        }
        itemStats[item.productName].totalQty += item.quantity;
        itemStats[item.productName].count += 1;
        const dayKey = order.placedAt.toISOString().split("T")[0];
        itemStats[item.productName].daysAppeared.add(dayKey);
      });
    });
    const predictions = Object.keys(itemStats).map((itemName) => {
      const stats = itemStats[itemName];
      const sma = stats.totalQty / (stats.count || 1);
      let demand = "Normal";
      let confidence = "80%";
      let reason = "Consistent daily orders";
      if (sma > 50 || stats.count > 10) {
        demand = "High";
        confidence = "90%";
        reason = "High volume and frequency detected";
      } else if (sma < 5) {
        demand = "Low";
        confidence = "75%";
        reason = "Slow turnover recently";
      }
      return {
        item: itemName,
        demand,
        confidence,
        reason,
        sma: Math.round(sma * 10) / 10
        // Provide actual calculated SMA
      };
    });
    if (predictions.length === 0) {
      predictions.push(
        { item: "Potatoes", demand: "High", confidence: "92%", reason: "Historical weekend peak (Fallback)", sma: 18 },
        { item: "Onions", demand: "Normal", confidence: "85%", reason: "Consistent restaurant daily orders (Fallback)", sma: 9 },
        { item: "Cooking Oil", demand: "Low", confidence: "78%", reason: "Slow turnover this week (Fallback)", sma: 3 }
      );
    }
    res.json(predictions.slice(0, 5));
  } catch (error) {
    res.status(500).json({ error: "Prediction failed" });
  }
});
const inventorySchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
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
    enum: ["Vegetables", "Fruits", "Spices", "Grains", "Dairy", "Meat", "Dry Goods", "Beverages", "Packaging", "Oils", "Flour", "Frozen"],
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
    enum: ["kg", "g", "litre", "ml", "pcs", "pack", "bottle", "bundle"]
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
    default: "Main Shelf"
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
    enum: ["in_stock", "low_stock", "out_of_stock", "expired"],
    default: "in_stock"
  },
  autoReorder: {
    type: Boolean,
    default: false
  },
  preferredSupplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Supplier"
  }
}, {
  timestamps: true
});
inventorySchema.pre("save", function(next) {
  if (this.currentQuantity <= 0) {
    this.status = "out_of_stock";
  } else if (this.currentQuantity <= this.minThreshold) {
    this.status = "low_stock";
  } else {
    this.status = "in_stock";
  }
  if (this.expiryDate && this.expiryDate < /* @__PURE__ */ new Date()) {
    this.status = "expired";
  }
  next();
});
inventorySchema.virtual("totalValue").get(function() {
  return this.currentQuantity * this.costPrice;
});
const Inventory = mongoose.models.Inventory || mongoose.model("Inventory", inventorySchema);
const inventoryMovementSchema = new mongoose.Schema({
  inventoryItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Inventory",
    required: true,
    index: true
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ["IN", "OUT", "ADJUSTMENT", "WASTAGE", "RETURN"],
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
    enum: ["purchase", "sale", "spoilage", "damaged", "stock_count", "return_to_supplier"]
  },
  referenceOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order"
  },
  notes: {
    type: String
  },
  performedBy: {
    type: String,
    // name or ID of the staff/system
    default: "System"
  }
}, {
  timestamps: true
});
const InventoryMovement = mongoose.models.InventoryMovement || mongoose.model("InventoryMovement", inventoryMovementSchema);
const router$1 = express.Router();
router$1.get("/", authenticateToken$1, async (req, res) => {
  try {
    const inventory = await Inventory.find({ vendor: req.user.userId }).sort({ status: 1, productName: 1 });
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch inventory", details: error.message });
  }
});
router$1.post("/", authenticateToken$1, async (req, res) => {
  try {
    const { productName, category, currentQuantity, unit, minThreshold, costPrice, expiryDate, location } = req.body;
    const newItem = new Inventory({
      vendor: req.user.userId,
      productName,
      category,
      currentQuantity,
      unit,
      minThreshold,
      costPrice,
      expiryDate,
      location
    });
    const savedItem = await newItem.save();
    const movement = new InventoryMovement({
      inventoryItem: savedItem._id,
      vendor: req.user.userId,
      type: "IN",
      quantity: currentQuantity,
      previousQuantity: 0,
      newQuantity: currentQuantity,
      reason: "purchase",
      notes: "Initial stock addition"
    });
    await movement.save();
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(500).json({ error: "Failed to add inventory item", details: error.message });
  }
});
router$1.patch("/:id", authenticateToken$1, async (req, res) => {
  try {
    const { quantityChange, type, reason, notes } = req.body;
    const item = await Inventory.findOne({ _id: req.params.id, vendor: req.user.userId });
    if (!item) {
      return res.status(404).json({ error: "Inventory item not found" });
    }
    const previousQuantity = item.currentQuantity;
    let newQuantity = previousQuantity;
    if (type === "IN" || type === "RETURN") {
      newQuantity += quantityChange;
    } else if (type === "OUT" || type === "WASTAGE") {
      newQuantity -= quantityChange;
    } else if (type === "ADJUSTMENT") {
      newQuantity = quantityChange;
    }
    item.currentQuantity = newQuantity;
    item.lastRestockDate = type === "IN" ? /* @__PURE__ */ new Date() : item.lastRestockDate;
    await item.save();
    const movement = new InventoryMovement({
      inventoryItem: item._id,
      vendor: req.user.userId,
      type,
      quantity: type === "ADJUSTMENT" ? Math.abs(newQuantity - previousQuantity) : quantityChange,
      previousQuantity,
      newQuantity,
      reason,
      notes
    });
    await movement.save();
    res.json({ item, movement });
  } catch (error) {
    res.status(500).json({ error: "Failed to update stock", details: error.message });
  }
});
router$1.get("/:id/history", authenticateToken$1, async (req, res) => {
  try {
    const history = await InventoryMovement.find({
      inventoryItem: req.params.id,
      vendor: req.user.userId
    }).sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch history", details: error.message });
  }
});
router$1.delete("/:id", authenticateToken$1, async (req, res) => {
  try {
    const result = await Inventory.deleteOne({ _id: req.params.id, vendor: req.user.userId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Item not found" });
    }
    await InventoryMovement.deleteMany({ inventoryItem: req.params.id });
    res.json({ message: "Item and its history deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete item", details: error.message });
  }
});
const router = express.Router();
const supplierOnly = (req, res, next) => {
  if (req.user?.userType !== "supplier") {
    return res.status(403).json({ error: "Access denied. Suppliers only." });
  }
  next();
};
router.get("/", authenticateToken$1, supplierOnly, async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.user.userId).select("products");
    if (!supplier) return res.status(404).json({ error: "Supplier not found" });
    res.json({ products: supplier.products || [] });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch inventory", details: err.message });
  }
});
router.post("/", authenticateToken$1, supplierOnly, async (req, res) => {
  try {
    const { name, category, unit, pricePerUnit, marketPrice, inventory, minStock, maxStock, quality, description } = req.body;
    if (!name || !category || !unit || !pricePerUnit) {
      return res.status(400).json({ error: "name, category, unit and pricePerUnit are required" });
    }
    const supplier = await Supplier.findById(req.user.userId);
    if (!supplier) return res.status(404).json({ error: "Supplier not found" });
    const exists = supplier.products.find(
      (p) => p.name.toLowerCase() === name.toLowerCase() && p.category === category
    );
    if (exists) {
      return res.status(409).json({ error: "A product with this name & category already exists. Use PUT to update it." });
    }
    supplier.products.push({
      name,
      category,
      unit,
      pricePerUnit: parseFloat(pricePerUnit),
      marketPrice: marketPrice ? parseFloat(marketPrice) : void 0,
      inventory: inventory ? parseFloat(inventory) : 0,
      minStock: minStock ? parseFloat(minStock) : 10,
      maxStock: maxStock ? parseFloat(maxStock) : 1e3,
      quality: quality || "A",
      description: description || "",
      isActive: true
    });
    supplier.markModified("products");
    await supplier.save();
    const added = supplier.products[supplier.products.length - 1];
    res.status(201).json({ message: "Product added", product: added, products: supplier.products });
  } catch (err) {
    res.status(500).json({ error: "Failed to add product", details: err.message });
  }
});
router.put("/:productId", authenticateToken$1, supplierOnly, async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.user.userId);
    if (!supplier) return res.status(404).json({ error: "Supplier not found" });
    const product = supplier.products.id(req.params.productId);
    if (!product) return res.status(404).json({ error: "Product not found" });
    const fields = ["name", "category", "unit", "pricePerUnit", "marketPrice", "inventory", "minStock", "maxStock", "quality", "description", "isActive"];
    fields.forEach((f) => {
      if (req.body[f] !== void 0) {
        product[f] = req.body[f];
      }
    });
    supplier.markModified("products");
    await supplier.save();
    res.json({ message: "Product updated", product, products: supplier.products });
  } catch (err) {
    res.status(500).json({ error: "Failed to update product", details: err.message });
  }
});
router.patch("/:productId/stock", authenticateToken$1, supplierOnly, async (req, res) => {
  try {
    const { inventory } = req.body;
    if (inventory === void 0 || isNaN(parseFloat(inventory))) {
      return res.status(400).json({ error: "inventory (number) is required" });
    }
    const supplier = await Supplier.findById(req.user.userId);
    if (!supplier) return res.status(404).json({ error: "Supplier not found" });
    const product = supplier.products.id(req.params.productId);
    if (!product) return res.status(404).json({ error: "Product not found" });
    product.inventory = parseFloat(inventory);
    supplier.markModified("products");
    await supplier.save();
    res.json({ message: "Stock updated", product, products: supplier.products });
  } catch (err) {
    res.status(500).json({ error: "Failed to update stock", details: err.message });
  }
});
router.delete("/:productId", authenticateToken$1, supplierOnly, async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.user.userId);
    if (!supplier) return res.status(404).json({ error: "Supplier not found" });
    const beforeLen = supplier.products.length;
    supplier.products = supplier.products.filter(
      (p) => p._id.toString() !== req.params.productId
    );
    if (supplier.products.length === beforeLen) {
      return res.status(404).json({ error: "Product not found" });
    }
    supplier.markModified("products");
    await supplier.save();
    res.json({ message: "Product removed", products: supplier.products });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete product", details: err.message });
  }
});
const app$1 = express();
connectDB();
app$1.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "img-src": ["'self'", "data:", "https://res.cloudinary.com", "https://cdn-icons-png.flaticon.com", "https://images.unsplash.com", "https://*.google.com", "https://*.googleapis.com", "https://*.razorpay.com"],
      "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://checkout.razorpay.com"],
      "connect-src": ["'self'", "https://*.onrender.com", "https://api.openai.com", "https://api.razorpay.com", "https://cdn-icons-png.flaticon.com", "https://checkout.razorpay.com"],
      "frame-src": ["'self'", "https://api.razorpay.com", "https://checkout.razorpay.com"]
    }
  },
  crossOriginResourcePolicy: false
}));
app$1.use(morgan("dev"));
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:8080",
  "http://127.0.0.1:8080",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
  "http://localhost:5175",
  "http://127.0.0.1:5175"
].filter(Boolean);
app$1.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const isLocalhost = origin.includes("localhost") || origin.includes("127.0.0.1");
    const isRender = origin.includes("onrender.com");
    if (isLocalhost || isRender || allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      const msg = "The CORS policy for this site does not allow access from the specified Origin.";
      return callback(new Error(msg), false);
    }
  },
  credentials: true
}));
console.log("✅ Loaded Origins:", allowedOrigins);
console.log("🔌 Configured PORT:", process.env.PORT);
app$1.use(compression());
app$1.use(express.json({ limit: "10mb" }));
app$1.use(express.urlencoded({ extended: true, limit: "10mb" }));
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1e3,
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: "Too many requests from this IP, please try again later."
  }
});
app$1.use("/api/", limiter);
app$1.use("/api", router$3);
app$1.use("/api/ai-chat", router$6);
app$1.use("/api/features", router$2);
app$1.use("/api/inventory", router$1);
app$1.use("/api/supplier-inventory", router);
app$1.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    service: "BazaarBandhu API"
  });
});
app$1.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
    ...false
  });
});
function createServer() {
  return app$1;
}
const app = createServer();
const port = process.env.PORT || 3e3;
const getDistPath = () => {
  const cwd = process.cwd();
  const paths = [
    path.join(cwd, "dist"),
    path.join(cwd, "client/dist"),
    path.join(cwd, "new_hack/dist")
  ];
  for (const p of paths) {
    if (fs.existsSync(p) && fs.existsSync(path.join(p, "index.html"))) {
      return p;
    }
  }
  return paths[0];
};
const distPath = getDistPath();
console.log(`🚀 BAZAAR-BANDHU PRODUCTION SERVER`);
console.log(`📍 Current Directory: ${process.cwd()}`);
console.log(`📂 Using static folder: ${distPath}`);
if (fs.existsSync(distPath)) {
  console.log(`✅ Folder exists. Files found: ${fs.readdirSync(distPath).slice(0, 5).join(", ")}...`);
} else {
  console.log(`❌ ERROR: Static folder not found!`);
}
app.use(express.static(distPath));
app.get("*", (req, res) => {
  if (req.path.startsWith("/api/") || req.path.startsWith("/health")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }
  if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|tsx|ts)$/)) {
    console.log(`🚫 Asset not found or blocked: ${req.path}`);
    return res.status(404).send("Asset not found");
  }
  const indexHtml = path.join(distPath, "index.html");
  if (fs.existsSync(indexHtml)) {
    res.sendFile(indexHtml);
  } else {
    console.log(`❌ CRITICAL: index.html not found at ${indexHtml}`);
    res.status(500).send("Application Error: Build files missing");
  }
});
app.listen(port, () => {
  console.log(`🚀 Fusion Starter server running on port ${port}`);
  console.log(`📱 Frontend: http://localhost:${port}`);
  console.log(`🔧 API: http://localhost:${port}/api`);
});
process.on("SIGTERM", () => {
  console.log("🛑 Received SIGTERM, shutting down gracefully");
  process.exit(0);
});
process.on("SIGINT", () => {
  console.log("🛑 Received SIGINT, shutting down gracefully");
  process.exit(0);
});
//# sourceMappingURL=node-build.mjs.map
