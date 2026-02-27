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
import { OpenAI } from "openai";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import Razorpay from "razorpay";
import crypto from "crypto";
import { createRequire } from "module";
import multer from "multer";
import { v2 } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
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
    await db.collection("users").createIndex({
      location: "2dsphere"
    });
    await db.collection("users").createIndex({
      userType: 1,
      isActive: 1,
      "rating.average": -1
    });
    await db.collection("users").createIndex({
      productCategories: 1,
      "serviceAreas.pincode": 1
    });
    await db.collection("orders").createIndex({
      vendor: 1,
      placedAt: -1
    });
    await db.collection("orders").createIndex({
      supplier: 1,
      status: 1
    });
    console.log("Database indexes created successfully");
  } catch (error) {
    console.error("Error creating indexes:", error);
  }
};
const router$3 = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
router$3.post("/", async (req, res) => {
  const { message, language = "hi" } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }
  try {
    const chatCompletion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are BazaarBandhu AI, a helpful assistant for Indian street food vendors and suppliers. 
          Help them with checking prices, matching with suppliers, managing stock, and placing orders. 
          Respond in ${language}. Keep responses concise, culturally relevant, and helpful.`
        },
        { role: "user", content: message }
      ],
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      max_tokens: 500
    });
    const reply = chatCompletion.choices[0].message.content?.trim();
    return res.json({ reply });
  } catch (error) {
    console.error("AI error:", error.message);
    const localizedErrors = {
      hi: "माफ़ कीजिए, मैं इस समय जवाब नहीं दे पा रहा हूं। कृपया थोड़ी देर बाद फिर से कोशिश करें।",
      en: "I'm sorry, I can't respond right now. The AI service is currently unavailable.",
      mr: "क्षमस्व, मी सध्या प्रतिसाद देऊ शकत नाही. AI सेवा सध्या उपलब्ध नाही.",
      gu: "માફ કરશો, હું અત્યારે જવાબ આપી શકતો નથી. AI સેવા હાલમાં ઉપલબ્ધ નથી."
    };
    let errorMessage = localizedErrors[language] || localizedErrors.en;
    if (error.message.includes("quota")) {
      errorMessage = language === "hi" ? "क्षमा करें, AI सेवा अपनी उपयोग सीमा तक पहुँच गई है। कृपया बाद में पुनः प्रयास करें।" : "I'm sorry, the AI service has reached its usage limit. Please try again later.";
    }
    return res.status(500).json({ reply: errorMessage });
  }
});
const __filename = fileURLToPath(import.meta.url);
const __dirname$1 = path.dirname(__filename);
const router$2 = express.Router();
const PYTHON_SCRIPT_PATH = path.join(__dirname$1, "..", "..", "deepseek_server.py");
router$2.post("/", async (req, res) => {
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
    ref: "Vendor",
    required: true
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Supplier",
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
orderSchema.statics.getAnalytics = function(vendorId, period = "month") {
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
createRequire(import.meta.url);
const router$1 = express.Router();
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_5yLzXw7fN4LwXj",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "secret_key_here"
});
router$1.post("/create-order", async (req, res) => {
  try {
    const { amount, currency = "INR", receipt } = req.body;
    const options = {
      amount: Math.round(amount * 100),
      // Razorpay expects amount in paise
      currency,
      receipt
    };
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error("Razorpay order creation failed:", error);
    res.status(500).json({ error: error.message });
  }
});
router$1.post("/verify", async (req, res) => {
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
  language: {
    type: String,
    enum: ["hi", "en", "mr", "gu", "ta", "te", "kn", "bn"],
    default: "hi"
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
    preferredLanguage: { type: String, default: "hi" },
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
const Vendor = mongoose.models.Vendor || User.discriminator("vendor", vendorSchema);
const supplierSchema = new mongoose.Schema({
  // Business Details
  productCategories: [{
    type: String,
    enum: ["Vegetables", "Fruits", "Spices", "Grains", "Dairy", "Meat", "Dry Goods", "Beverages"],
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
    currentStock: { type: Number, default: 0 },
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
supplierSchema.index({ productCategories: 1 });
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
supplierSchema.methods.getAvailableProducts = function() {
  return this.products.filter(
    (product) => product.isActive && product.currentStock > product.minStock
  );
};
supplierSchema.methods.updateStock = function(productId, quantity, operation = "subtract") {
  const product = this.products.id(productId);
  if (product) {
    if (operation === "subtract") {
      product.currentStock = Math.max(0, product.currentStock - quantity);
    } else {
      product.currentStock += quantity;
    }
    return this.save();
  }
  throw new Error("Product not found");
};
const Supplier = mongoose.models.Supplier || User.discriminator("supplier", supplierSchema);
const router = express.Router();
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
router.post("/upload/document", upload.single("document"), async (req, res) => {
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
router.post("/auth/register", async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      phone,
      userType,
      businessName,
      address,
      addressDetails,
      // street, city, state, pincode
      // Supplier specific fields
      productCategories,
      deliveryRadius,
      minOrderAmount,
      paymentMethods,
      workingHoursFrom,
      workingHoursTo,
      gstNumber,
      fssaiLicense,
      // Vendor specific fields
      businessCategory,
      stallName,
      // frontend alias
      stallType
      // frontend alias
    } = req.body;
    if (!fullName || !email || !password || !phone || !userType) {
      return res.status(400).json({
        error: "Missing required fields: fullName, email, password, phone, userType"
      });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        error: "User with this email already exists"
      });
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const finalAddress = addressDetails || address || {
      street: "Not specified",
      city: "Not specified",
      state: "Not specified",
      pincode: "000000"
    };
    const finalLocation = {
      type: "Point",
      coordinates: [72.8777, 19.076]
      // Mumbai coordinates
    };
    let newUser;
    if (userType === "vendor") {
      newUser = new Vendor({
        fullName,
        email,
        password: hashedPassword,
        phone,
        userType,
        businessName: businessName || stallName || "My Vendor Shop",
        address: finalAddress,
        location: finalLocation,
        businessCategory: businessCategory || stallType || "street_food"
      });
    } else if (userType === "supplier") {
      newUser = new Supplier({
        fullName,
        email,
        password: hashedPassword,
        phone,
        userType,
        businessName: businessName || "My Supplier Business",
        address: finalAddress,
        location: finalLocation,
        productCategories: productCategories || ["Vegetables"],
        deliveryRadius: deliveryRadius || 10,
        minOrderAmount: minOrderAmount || 500,
        paymentMethods: paymentMethods || ["Cash", "UPI"],
        workingHours: {
          from: workingHoursFrom || "06:00",
          to: workingHoursTo || "20:00"
        },
        gstNumber,
        fssaiLicense
      });
    } else {
      return res.status(400).json({
        error: "Invalid user type"
      });
    }
    try {
      await newUser.save();
    } catch (saveError) {
      console.error("[AUTH] Save error:", saveError);
      throw saveError;
    }
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email, userType: newUser.userType },
      process.env.JWT_SECRET || "bazaarbandhu_secret",
      { expiresIn: "7d" }
    );
    res.status(201).json({
      message: "User registered successfully",
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
    console.error("[AUTH] Registration error:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        error: "Validation failed",
        details: messages
      });
    }
    res.status(500).json({
      error: "Registration failed",
      details: error.message
    });
  }
});
router.get("/db-health", (req, res) => {
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
router.post("/auth/login", async (req, res) => {
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
router.get("/config/status-line", (req, res) => {
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
router.get("/suppliers", async (req, res) => {
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
router.get("/suppliers/:id", async (req, res) => {
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
router.get("/suppliers/profile", authenticateToken, async (req, res) => {
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
    res.json(supplier);
  } catch (error) {
    console.error("Get supplier profile error:", error);
    res.status(500).json({
      error: "Failed to fetch profile",
      details: error.message
    });
  }
});
router.put("/suppliers/profile", authenticateToken, async (req, res) => {
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
router.post("/suppliers/products", authenticateToken, async (req, res) => {
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
router.get("/suppliers/analytics", authenticateToken, async (req, res) => {
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
router.get("/vendors/profile", authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== "vendor") {
      return res.status(403).json({
        error: "Access denied. Vendors only."
      });
    }
    const vendor = await Vendor.findById(req.user.userId).select("-password").populate("preferredSuppliers.supplierId", "fullName businessName rating");
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
router.put("/vendors/profile", authenticateToken, async (req, res) => {
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
router.get("/vendors/analytics", authenticateToken, async (req, res) => {
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
router.patch("/vendors/inventory", authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== "vendor") {
      return res.status(403).json({ error: "Access denied. Vendors only." });
    }
    const { product } = req.body;
    const vendor = await Vendor.findById(req.user.userId);
    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found" });
    }
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
router.delete("/vendors/inventory/:productName", authenticateToken, async (req, res) => {
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
router.post("/orders", authenticateToken, async (req, res) => {
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
        pricePerUnit: priceToUse,
        totalPrice: total
      };
    });
    const deliveryCharge = supplier.serviceAreas.find(
      (area) => area.pincode === deliveryAddress.pincode
    )?.deliveryCharge || 0;
    const totalAmount = subtotal + deliveryCharge;
    const savedAmount = marketPriceTotal - subtotal;
    const order = new Order({
      vendor: req.user.userId,
      supplier: supplierId,
      items: processedItems,
      subtotal,
      deliveryCharge,
      totalAmount,
      marketPrice: marketPriceTotal,
      savedAmount,
      savingsPercentage: marketPriceTotal > 0 ? (savedAmount / marketPriceTotal * 100).toFixed(2) : 0,
      delivery: {
        address: deliveryAddress,
        scheduledDate: new Date(scheduledDate),
        timeSlot,
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
router.get("/orders", authenticateToken, async (req, res) => {
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
router.get("/orders/:id", authenticateToken, async (req, res) => {
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
router.patch("/orders/:id/status", authenticateToken, async (req, res) => {
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
router.post("/orders/:id/rating", authenticateToken, async (req, res) => {
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
router.get("/search/products", async (req, res) => {
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
router.get("/", (req, res) => {
  console.log("✅ /api route hit");
  res.json({ message: "Welcome to the BazaarBandhu API!" });
});
router.get("/test", (req, res) => {
  res.json({ message: "Test route is working!" });
});
router.use("/ai-chat", router$3);
router.use("/deepseek-chat", router$2);
router.use("/payments", router$1);
const app$1 = express();
connectDB();
app$1.use(helmet());
app$1.use(morgan("dev"));
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
  "http://localhost:8080",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174"
].filter(Boolean);
app$1.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const isLocalhost = origin.includes("localhost") || origin.includes("127.0.0.1");
    if (isLocalhost || allowedOrigins.indexOf(origin) !== -1) {
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
app$1.use("/api", router);
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
app$1.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl
  });
});
function createServer() {
  return app$1;
}
const app = createServer();
const port = process.env.PORT || 3e3;
const __dirname = import.meta.dirname;
const distPath = path.join(__dirname, "../spa");
app.use(express.static(distPath));
app.get("*", (req, res) => {
  if (req.path.startsWith("/api/") || req.path.startsWith("/health")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }
  res.sendFile(path.join(distPath, "index.html"));
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
