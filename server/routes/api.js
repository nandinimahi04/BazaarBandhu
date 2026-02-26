const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Supplier = require('../models/Supplier');
const Order = require('../models/Order');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'bazaarbandhu_documents',
    allowed_formats: ['jpg', 'png', 'pdf', 'jpeg'],
    public_id: (req, file) => `doc_${Date.now()}_${file.originalname.split('.')[0]}`
  }
});

const upload = multer({ storage: storage });

// Middleware for authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'bazaarbandhu_secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// ===============================
// AUTHENTICATION ROUTES
// ===============================

// Upload shop verification document
router.post('/upload/document', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    res.json({
      message: 'Document uploaded successfully',
      url: req.file.path, // Cloudinary secure URL
      originalName: req.file.originalname
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload document', details: error.message });
  }
});

// Register new user (vendor or supplier)
router.post('/auth/register', async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      phone,
      userType,
      businessName,
      address,
      addressDetails, // street, city, state, pincode
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
      stallName, // frontend alias
      stallType  // frontend alias
    } = req.body;

    // Validate required fields
    if (!fullName || !email || !password || !phone || !userType) {
      return res.status(400).json({
        error: 'Missing required fields: fullName, email, password, phone, userType'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        error: 'User with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Prepare address object
    const finalAddress = addressDetails || address || {
      street: 'Not specified',
      city: 'Not specified',
      state: 'Not specified',
      pincode: '000000'
    };

    // Prepare default location
    const finalLocation = {
      type: 'Point',
      coordinates: [72.8777, 19.0760] // Mumbai coordinates
    };

    // Create user based on type
    let newUser;

    if (userType === 'vendor') {
      newUser = new Vendor({
        fullName,
        email,
        password: hashedPassword,
        phone,
        userType,
        businessName: businessName || stallName || 'My Vendor Shop',
        address: finalAddress,
        location: finalLocation,
        businessCategory: businessCategory || stallType || 'street_food'
      });
    } else if (userType === 'supplier') {
      newUser = new Supplier({
        fullName,
        email,
        password: hashedPassword,
        phone,
        userType,
        businessName: businessName || 'My Supplier Business',
        address: finalAddress,
        location: finalLocation,
        productCategories: productCategories || ['Vegetables'],
        deliveryRadius: deliveryRadius || 10,
        minOrderAmount: minOrderAmount || 500,
        paymentMethods: paymentMethods || ['Cash', 'UPI'],
        workingHours: {
          from: workingHoursFrom || '06:00',
          to: workingHoursTo || '20:00'
        },
        gstNumber,
        fssaiLicense
      });
    } else {
      return res.status(400).json({
        error: 'Invalid user type'
      });
    }

    try {
      await newUser.save();
    } catch (saveError) {
      console.error('[AUTH] Save error:', saveError);
      throw saveError;
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email, userType: newUser.userType },
      process.env.JWT_SECRET || 'bazaarbandhu_secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
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
    console.error('[AUTH] Registration error:', error);

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        error: 'Validation failed',
        details: messages
      });
    }

    res.status(500).json({
      error: 'Registration failed',
      details: error.message
    });
  }
});

// Health check for DB
router.get('/db-health', (req, res) => {
  const status = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  res.json({
    status: states[status] || 'unknown',
    mongodb_uri: process.env.MONGODB_URI ? 'Defined' : 'Missing',
    database: mongoose.connection.name
  });
});

// Login user
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password required'
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials. User not found.'
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid credentials. Incorrect password.'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        userType: user.userType
      },
      process.env.JWT_SECRET || 'bazaarbandhu_secret',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
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
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      details: error.message
    });
  }
});

// ===============================
// CONFIG & SYSTEM ROUTES
// ===============================

// Get dynamic header status line
router.get('/config/status-line', (req, res) => {
  // In a real app, this could depend on market hours, user level, or special events
  const hour = new Date().getHours();
  let statusKey = 'market_open';

  if (hour < 6 || hour > 21) {
    statusKey = 'market_closed';
  } else if (hour >= 6 && hour < 9) {
    statusKey = 'early_morning';
  } else if (hour >= 18 && hour < 21) {
    statusKey = 'evening_rush';
  }

  res.json({
    statusKey,
    lastUpdate: new Date(),
    marketStatus: hour >= 6 && hour <= 21 ? 'active' : 'inactive'
  });
});

// ===============================
// SUPPLIER ROUTES
// ===============================

// Get all suppliers
router.get('/suppliers', async (req, res) => {
  try {
    const {
      category,
      pincode,
      radius,
      minRating,
      limit = 20,
      page = 1
    } = req.query;

    let query = { userType: 'supplier', isActive: true };

    // Filter by product category
    if (category) {
      query.productCategories = { $in: [category] };
    }

    // Filter by rating
    if (minRating) {
      query['rating.average'] = { $gte: parseFloat(minRating) };
    }

    const suppliers = await Supplier.find(query)
      .select('-password')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ 'rating.average': -1, trustScore: -1 });

    res.json({
      suppliers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: await Supplier.countDocuments(query)
      }
    });

  } catch (error) {
    console.error('Get suppliers error:', error);
    res.status(500).json({
      error: 'Failed to fetch suppliers',
      details: error.message
    });
  }
});

// Get supplier by ID
router.get('/suppliers/:id', async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id)
      .select('-password')
      .populate('groupMembers', 'fullName businessName');

    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    res.json(supplier);

  } catch (error) {
    console.error('Get supplier error:', error);
    res.status(500).json({
      error: 'Failed to fetch supplier',
      details: error.message
    });
  }
});

// Get supplier profile
router.get('/suppliers/profile', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'supplier') {
      return res.status(403).json({
        error: 'Access denied. Suppliers only.'
      });
    }

    const supplier = await Supplier.findById(req.user.userId)
      .select('-password');

    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    res.json(supplier);

  } catch (error) {
    console.error('Get supplier profile error:', error);
    res.status(500).json({
      error: 'Failed to fetch profile',
      details: error.message
    });
  }
});

// Update supplier profile
router.put('/suppliers/profile', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'supplier') {
      return res.status(403).json({
        error: 'Access denied. Suppliers only.'
      });
    }

    const updates = req.body;
    delete updates.password; // Prevent password updates through this route

    const supplier = await Supplier.findByIdAndUpdate(
      req.user.userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      supplier
    });

  } catch (error) {
    console.error('Update supplier error:', error);
    res.status(500).json({
      error: 'Failed to update profile',
      details: error.message
    });
  }
});

// Add/Update supplier products
router.post('/suppliers/products', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'supplier') {
      return res.status(403).json({
        error: 'Access denied. Suppliers only.'
      });
    }

    const { products } = req.body;

    const supplier = await Supplier.findById(req.user.userId);
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    // Add or update products
    products.forEach(product => {
      const existingIndex = supplier.products.findIndex(
        p => p.name === product.name && p.category === product.category
      );

      if (existingIndex >= 0) {
        supplier.products[existingIndex] = { ...supplier.products[existingIndex], ...product };
      } else {
        supplier.products.push(product);
      }
    });

    await supplier.save();

    res.json({
      message: 'Products updated successfully',
      products: supplier.products
    });

  } catch (error) {
    console.error('Update products error:', error);
    res.status(500).json({
      error: 'Failed to update products',
      details: error.message
    });
  }
});

// Get supplier analytics
router.get('/suppliers/analytics', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'supplier') {
      return res.status(403).json({
        error: 'Access denied. Suppliers only.'
      });
    }

    const { period = 'month' } = req.query;
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
    console.error('Get supplier analytics error:', error);
    res.status(500).json({
      error: 'Failed to fetch analytics',
      details: error.message
    });
  }
});

// ===============================
// VENDOR ROUTES
// ===============================

// Get vendor profile
router.get('/vendors/profile', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'vendor') {
      return res.status(403).json({
        error: 'Access denied. Vendors only.'
      });
    }

    const vendor = await Vendor.findById(req.user.userId)
      .select('-password')
      .populate('preferredSuppliers.supplierId', 'fullName businessName rating');

    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    res.json(vendor);

  } catch (error) {
    console.error('Get vendor profile error:', error);
    res.status(500).json({
      error: 'Failed to fetch profile',
      details: error.message
    });
  }
});

// Update vendor profile
router.put('/vendors/profile', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'vendor') {
      return res.status(403).json({
        error: 'Access denied. Vendors only.'
      });
    }

    const updates = req.body;
    delete updates.password; // Prevent password updates

    const vendor = await Vendor.findByIdAndUpdate(
      req.user.userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      vendor
    });

  } catch (error) {
    console.error('Update vendor error:', error);
    res.status(500).json({
      error: 'Failed to update profile',
      details: error.message
    });
  }
});

// Get vendor analytics
router.get('/vendors/analytics', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'vendor') {
      return res.status(403).json({
        error: 'Access denied. Vendors only.'
      });
    }

    const { period = 'month' } = req.query;

    const analytics = await Order.getAnalytics(req.user.userId, period);
    const vendor = await Vendor.findById(req.user.userId).select('purchaseAnalytics savings');

    res.json({
      period,
      analytics: analytics[0] || {},
      vendorMetrics: vendor ? {
        purchaseAnalytics: vendor.purchaseAnalytics,
        savings: vendor.savings
      } : {}
    });

  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      error: 'Failed to fetch analytics',
      details: error.message
    });
  }
});

// Update or add inventory items
router.patch('/vendors/inventory', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'vendor') {
      return res.status(403).json({ error: 'Access denied. Vendors only.' });
    }

    const { product } = req.body; // { productName, category, quantity, unit, costPrice }
    const vendor = await Vendor.findById(req.user.userId);

    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    const itemIndex = vendor.currentInventory.findIndex(
      item => item.productName === product.productName
    );

    if (itemIndex >= 0) {
      // Update existing
      vendor.currentInventory[itemIndex] = {
        ...vendor.currentInventory[itemIndex].toObject(),
        ...product,
        purchaseDate: new Date()
      };
    } else {
      // Add new
      vendor.currentInventory.push({
        ...product,
        purchaseDate: new Date()
      });
    }

    await vendor.save();
    res.json({
      message: 'Inventory updated successfully',
      inventory: vendor.currentInventory
    });
  } catch (error) {
    console.error('Update inventory error:', error);
    res.status(500).json({ error: 'Failed to update inventory', details: error.message });
  }
});

// Remove inventory item
router.delete('/vendors/inventory/:productName', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'vendor') {
      return res.status(403).json({ error: 'Access denied. Vendors only.' });
    }

    const { productName } = req.params;
    const vendor = await Vendor.findById(req.user.userId);

    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    vendor.currentInventory = vendor.currentInventory.filter(
      item => item.productName !== productName
    );

    await vendor.save();
    res.json({
      message: 'Item removed successfully',
      inventory: vendor.currentInventory
    });
  } catch (error) {
    console.error('Delete inventory item error:', error);
    res.status(500).json({ error: 'Failed to delete item', details: error.message });
  }
});

// ===============================
// ORDER ROUTES
// ===============================

// Create new order
router.post('/orders', authenticateToken, async (req, res) => {
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

    // Validate supplier exists
    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    // Calculate totals and verify prices
    let subtotal = 0;
    let marketPriceTotal = 0;

    const processedItems = items.map(item => {
      // Find the product in supplier's inventory to verify price
      const supplierProduct = supplier.products.find(p => p.name === item.productName);
      const priceToUse = supplierProduct ? supplierProduct.pricePerUnit : item.pricePerUnit;

      const total = item.quantity * priceToUse;
      subtotal += total;

      // Calculate market price for savings calculation
      const marketPrice = supplierProduct?.marketPrice || priceToUse * 1.2; // fallback
      marketPriceTotal += (item.quantity * marketPrice);

      return {
        ...item,
        productId: supplierProduct?._id || item.productId,
        pricePerUnit: priceToUse,
        totalPrice: total
      };
    });

    // Determine delivery charge
    const deliveryCharge = supplier.serviceAreas.find(
      area => area.pincode === deliveryAddress.pincode
    )?.deliveryCharge || 0;

    const totalAmount = subtotal + deliveryCharge;
    const savedAmount = marketPriceTotal - subtotal;

    // Create order
    const order = new Order({
      vendor: req.user.userId,
      supplier: supplierId,
      items: processedItems,
      subtotal,
      deliveryCharge,
      totalAmount,
      marketPrice: marketPriceTotal,
      savedAmount,
      savingsPercentage: marketPriceTotal > 0 ? ((savedAmount / marketPriceTotal) * 100).toFixed(2) : 0,
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
        status: paymentMethod === 'cash' ? 'pending' : 'completed' // Simple simulation
      },
      specialInstructions,
      aiAssistant: {
        wasOrderedByAI: req.body.isAIOrder || false
      }
    });

    await order.save();

    // Add initial tracking step
    await order.addTrackingStep('pending', 'Order received', 'Order has been placed and is awaiting confirmation');

    // Populate order details
    const populatedOrder = await Order.findById(order._id)
      .populate('vendor', 'fullName businessName phone')
      .populate('supplier', 'fullName businessName phone address');

    res.status(201).json({
      message: 'Order created successfully',
      order: populatedOrder
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      error: 'Failed to create order',
      details: error.message
    });
  }
});

// Get orders for authenticated user
router.get('/orders', authenticateToken, async (req, res) => {
  try {
    const { status, limit = 20, page = 1 } = req.query;

    let query = {};

    if (req.user.userType === 'vendor') {
      query.vendor = req.user.userId;
    } else if (req.user.userType === 'supplier') {
      query.supplier = req.user.userId;
    } else {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('vendor', 'fullName businessName phone')
      .populate('supplier', 'fullName businessName phone')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ placedAt: -1 });

    res.json({
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: await Order.countDocuments(query)
      }
    });

  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      error: 'Failed to fetch orders',
      details: error.message
    });
  }
});

// Get specific order
router.get('/orders/:id', authenticateToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('vendor', 'fullName businessName phone address')
      .populate('supplier', 'fullName businessName phone address');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if user has access to this order
    if (req.user.userType === 'vendor' && order.vendor._id.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    if (req.user.userType === 'supplier' && order.supplier._id.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(order);

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      error: 'Failed to fetch order',
      details: error.message
    });
  }
});

// Update order status (suppliers only)
router.patch('/orders/:id/status', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'supplier') {
      return res.status(403).json({
        error: 'Access denied. Suppliers only.'
      });
    }

    const { status, location, description } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.supplier.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await order.addTrackingStep(status, location, description);

    res.json({
      message: 'Order status updated successfully',
      order
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      error: 'Failed to update order status',
      details: error.message
    });
  }
});

// Add order rating
router.post('/orders/:id/rating', authenticateToken, async (req, res) => {
  try {
    const { rating, review } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check access
    if (req.user.userType === 'vendor' && order.vendor.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update rating based on user type
    if (req.user.userType === 'vendor') {
      order.rating.vendor = {
        ...rating,
        overall: rating.overall,
        review,
        ratedAt: new Date()
      };
    }

    await order.save();

    res.json({
      message: 'Rating added successfully',
      order
    });

  } catch (error) {
    console.error('Add rating error:', error);
    res.status(500).json({
      error: 'Failed to add rating',
      details: error.message
    });
  }
});

// ===============================
// SEARCH & DISCOVERY ROUTES
// ===============================

// Search products across suppliers
router.get('/search/products', async (req, res) => {
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
      userType: 'supplier',
      isActive: true,
      'products.isActive': true
    };

    if (category) {
      matchQuery['products.category'] = category;
    }

    if (maxPrice) {
      matchQuery['products.pricePerUnit'] = { $lte: parseFloat(maxPrice) };
    }

    if (minRating) {
      matchQuery['rating.average'] = { $gte: parseFloat(minRating) };
    }

    if (pincode) {
      matchQuery['serviceAreas.pincode'] = pincode;
    }

    if (query) {
      matchQuery.$or = [
        { 'products.name': { $regex: query, $options: 'i' } },
        { 'products.category': { $regex: query, $options: 'i' } },
        { 'businessName': { $regex: query, $options: 'i' } }
      ];
    }

    const results = await Supplier.aggregate([
      { $match: matchQuery },
      { $unwind: '$products' },
      { $match: { 'products.isActive': true } },
      {
        $project: {
          supplierName: '$fullName',
          businessName: '$businessName',
          rating: '$rating',
          trustScore: '$trustScore',
          product: '$products',
          deliveryRadius: '$deliveryRadius',
          workingHours: '$workingHours'
        }
      },
      { $sort: { 'rating.average': -1, 'product.pricePerUnit': 1 } },
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
    console.error('Search products error:', error);
    res.status(500).json({
      error: 'Failed to search products',
      details: error.message
    });
  }
});
// Base API route
router.get('/', (req, res) => {
  console.log('✅ /api route hit');
  res.json({ message: 'Welcome to the BazaarBandhu API!' });
});

// Optional test route
router.get('/test', (req, res) => {
  res.json({ message: 'Test route is working!' });
});


router.use('/ai-chat', require('./ai-chat'));

// DeepSeek-R1 local model chat route
router.use('/deepseek-chat', require('./deepseek-chat'));

// Razorpay Payment Routes
router.use('/payments', require('./payment'));

module.exports = router;
