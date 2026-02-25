const mongoose = require('mongoose');

// Address Schema
const addressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  country: { type: String, default: 'India' }
});

// Working Hours Schema
const workingHoursSchema = new mongoose.Schema({
  from: { type: String, required: true }, // Format: "06:00"
  to: { type: String, required: true }    // Format: "20:00"
});

// Location Schema for geographic features
const locationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point']
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: true,
    default: undefined
  }
});

// Base User Schema
const userSchema = new mongoose.Schema({
  // Basic Information
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  userType: {
    type: String,
    required: true,
    enum: ['vendor', 'supplier', 'admin']
  },

  // Business Information
  businessName: { type: String, required: true },
  businessType: { type: String },

  // Address
  address: addressSchema,
  location: {
    type: locationSchema,
    index: '2dsphere'
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
    enum: ['hi', 'en', 'mr', 'gu', 'ta', 'te', 'kn', 'bn'],
    default: 'hi'
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
    ref: 'User'
  }],

  // Timestamps
  lastLogin: { type: Date },
  registrationDate: { type: Date, default: Date.now }
}, {
  timestamps: true,
  discriminatorKey: 'userType'
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ userType: 1 });
userSchema.index({ 'location': '2dsphere' });
userSchema.index({ businessName: 'text', fullName: 'text' });

const User = mongoose.model('User', userSchema);

module.exports = User;
