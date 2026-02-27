import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
const router = express.Router();
import aiChatRoutes from './ai-chat.js';
import deepSeekChatRoutes from './deepseek-chat.js';
import paymentRoutes from './payment.js';

// @ts-ignore
import User from '../models/User.js';
// @ts-ignore
import Vendor from '../models/Vendor.js';
// @ts-ignore
import Supplier from '../models/Supplier.js';
// @ts-ignore
import Order from '../models/Order.js';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

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
        // @ts-ignore
        folder: 'bazaarbandhu_documents',
        allowed_formats: ['jpg', 'png', 'pdf', 'jpeg'],
        public_id: (req: any, file: any) => `doc_${Date.now()}_${file.originalname.split('.')[0]}`
    }
});

const upload = multer({ storage: storage });

// Middleware for authentication
const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'bazaarbandhu_secret', (err: any, user: any) => {
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
router.post('/upload/document', upload.single('document'), async (req: any, res: any) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        res.json({
            message: 'Document uploaded successfully',
            url: req.file.path, // Cloudinary secure URL
            originalName: req.file.originalname
        });
    } catch (error: any) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload document', details: error.message });
    }
});

// Register new user (vendor or supplier)
router.post('/auth/register', async (req: any, res: any) => {
    try {
        const {
            fullName, email, password, phone, userType,
            businessName, address, stallName, stallType,
            location, addressDetails, businessCategory,
            gstNumber, deliveryRadius, minOrderAmount,
            productCategories, paymentMethods,
            workingHoursFrom, workingHoursTo
        } = req.body;

        console.log('[AUTH] Register Request:', { fullName, email, phone, userType });

        if (!fullName || !email || !password || !phone || !userType) {
            return res.status(400).json({ error: 'Missing required fields: fullName, email, password, phone, userType' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        let newUser;

        // Prepare common fields
        const finalAddress = {
            street: addressDetails?.street || address || 'Main Market',
            city: addressDetails?.city || 'Solapur',
            state: addressDetails?.state || 'Maharashtra',
            pincode: addressDetails?.pincode || '413001',
            country: 'India'
        };

        const finalLocation = {
            type: 'Point',
            coordinates: location?.coordinates || [75.9064, 17.6599] // Solapur coordinates
        };

        if (userType === 'vendor') {
            const isPaniPuri = (businessName || stallName || '').toLowerCase().includes('pani puri') ||
                (businessName || stallName || '').toLowerCase().includes('panipuri') ||
                (stallType === 'Street Food' || stallType === 'street_food' || stallType === 'पानी पूरी स्टॉल');

            const defaultInventory = isPaniPuri ? [
                { productName: 'आलू (Potatoes)', category: 'Vegetables', quantity: 20, unit: 'kg', costPrice: 25 },
                { productName: 'पूरी (Puris)', category: 'Grains', quantity: 1000, unit: 'pcs', costPrice: 0.5 },
                { productName: 'चना (Chickpeas)', category: 'Grains', quantity: 10, unit: 'kg', costPrice: 80 },
                { productName: 'इमली (Tamarind)', category: 'Spices', quantity: 5, unit: 'kg', costPrice: 120 },
                { productName: 'पुदीना (Mint)', category: 'Vegetables', quantity: 2, unit: 'kg', costPrice: 40 },
                { productName: 'मिर्च (Green Chilies)', category: 'Vegetables', quantity: 1, unit: 'kg', costPrice: 60 },
                { productName: 'तेल (Oil)', category: 'Oil', quantity: 15, unit: 'Litre', costPrice: 140 },
                { productName: 'मसाला (Chaat Masala)', category: 'Spices', quantity: 2, unit: 'kg', costPrice: 250 }
            ] : [];

            newUser = new Vendor({
                fullName,
                email,
                password: hashedPassword,
                phone,
                userType,
                businessName: businessName || stallName || 'My Vendor Shop',
                address: finalAddress,
                location: finalLocation,
                businessCategory: businessCategory || stallType || 'street_food',
                currentInventory: defaultInventory
            });
        } else if (userType === 'supplier') {
            newUser = new Supplier({
                fullName,
                email,
                password: hashedPassword,
                phone,
                userType,
                businessName: businessName || stallName || 'My Supplier Shop',
                address: finalAddress,
                location: finalLocation,
                gstNumber,
                deliveryRadius: deliveryRadius || 10,
                minOrderAmount: minOrderAmount || 500,
                productCategories: (productCategories && productCategories.length > 0) ? productCategories : ['Vegetables'],
                paymentMethods: (paymentMethods && paymentMethods.length > 0) ? paymentMethods : ['Cash', 'UPI'],
                workingHours: {
                    from: workingHoursFrom || '06:00',
                    to: workingHoursTo || '20:00'
                }
            });
        } else {
            newUser = new User({
                fullName,
                email,
                password: hashedPassword,
                phone,
                userType,
                businessName: businessName || 'My Bazaar App'
            });
        }

        try {
            await newUser.save();
            console.log(`[AUTH] Successfully registered ${userType}: ${email}`);
        } catch (saveError: any) {
            console.error('[AUTH] Save error:', saveError);
            if (saveError.name === 'ValidationError') {
                const messages = Object.values(saveError.errors).map((err: any) => err.message);
                return res.status(400).json({ error: `Validation Error: ${messages.join(', ')}` });
            }
            if (saveError.code === 11000) {
                const field = Object.keys(saveError.keyPattern)[0];
                return res.status(400).json({ error: `A user with this ${field} already exists.` });
            }
            throw saveError;
        }

        const token = jwt.sign(
            { userId: newUser._id, email: newUser.email, userType: newUser.userType },
            process.env.JWT_SECRET || 'bazaarbandhu_secret',
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'Registration successful',
            token,
            user: {
                id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                userType: newUser.userType,
                businessName: newUser.businessName
            }
        });

    } catch (error: any) {
        console.error('[AUTH] Critical Registration error:', error);
        if (!res.headersSent) {
            res.status(500).json({
                error: 'Registration failed due to server error',
                details: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    }
});

// Health check for DB
router.get('/db-health', (req: any, res: any) => {
    const status = mongoose.connection.readyState;
    const states: { [key: number]: string } = {
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
router.post('/auth/login', async (req: any, res: any) => {
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

    } catch (error: any) {
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
router.get('/config/status-line', (req: any, res: any) => {
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
router.get('/suppliers', async (req: any, res: any) => {
    try {
        const {
            category,
            pincode,
            radius,
            minRating,
            limit = 20,
            page = 1
        } = req.query;

        let query: any = { userType: 'supplier', isActive: true };

        // Filter by product category
        if (category) {
            query.productCategories = { $in: [category] };
        }

        // Filter by rating
        if (minRating) {
            query['rating.average'] = { $gte: parseFloat(minRating as string) };
        }

        const suppliers = await Supplier.find(query)
            .select('-password')
            .limit(parseInt(limit as string))
            .skip((parseInt(page as string) - 1) * parseInt(limit as string))
            .sort({ 'rating.average': -1, trustScore: -1 });

        res.json({
            suppliers,
            pagination: {
                page: parseInt(page as string),
                limit: parseInt(limit as string),
                total: await Supplier.countDocuments(query)
            }
        });

    } catch (error: any) {
        console.error('Get suppliers error:', error);
        res.status(500).json({
            error: 'Failed to fetch suppliers',
            details: error.message
        });
    }
});

// Get supplier by ID
router.get('/suppliers/:id', async (req: any, res: any) => {
    try {
        const supplier = await Supplier.findById(req.params.id)
            .select('-password')
            .populate('groupMembers', 'fullName businessName');

        if (!supplier) {
            return res.status(404).json({ error: 'Supplier not found' });
        }

        res.json(supplier);

    } catch (error: any) {
        console.error('Get supplier error:', error);
        res.status(500).json({
            error: 'Failed to fetch supplier',
            details: error.message
        });
    }
});

// Get products for a specific supplier (public - for vendor market view)
router.get('/suppliers/:id/products', async (req: any, res: any) => {
    try {
        const supplier = await Supplier.findById(req.params.id)
            .select('fullName businessName products rating');

        if (!supplier) {
            return res.status(404).json({ error: 'Supplier not found' });
        }

        // Only return active products with stock > 0
        const availableProducts = supplier.products.filter(
            (p: any) => p.isActive !== false && (p.currentStock === undefined || p.currentStock > 0 || p.inventory > 0)
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

    } catch (error: any) {
        console.error('Get supplier products error:', error);
        res.status(500).json({
            error: 'Failed to fetch supplier products',
            details: error.message
        });
    }
});

// Get supplier profile
router.get('/suppliers/profile', authenticateToken, async (req: any, res: any) => {
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

    } catch (error: any) {
        console.error('Get supplier profile error:', error);
        res.status(500).json({
            error: 'Failed to fetch profile',
            details: error.message
        });
    }
});

// Update supplier profile
router.put('/suppliers/profile', authenticateToken, async (req: any, res: any) => {
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

    } catch (error: any) {
        console.error('Update supplier error:', error);
        res.status(500).json({
            error: 'Failed to update profile',
            details: error.message
        });
    }
});

// Add/Update supplier products
router.post('/suppliers/products', authenticateToken, async (req: any, res: any) => {
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
        products.forEach((product: any) => {
            const existingIndex = supplier.products.findIndex(
                (p: any) => p.name === product.name && p.category === product.category
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

    } catch (error: any) {
        console.error('Update products error:', error);
        res.status(500).json({
            error: 'Failed to update products',
            details: error.message
        });
    }
});

// Get supplier analytics
router.get('/suppliers/analytics', authenticateToken, async (req: any, res: any) => {
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

    } catch (error: any) {
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
router.get('/vendors/profile', authenticateToken, async (req: any, res: any) => {
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

    } catch (error: any) {
        console.error('Get vendor profile error:', error);
        res.status(500).json({
            error: 'Failed to fetch profile',
            details: error.message
        });
    }
});

// Update vendor profile
router.put('/vendors/profile', authenticateToken, async (req: any, res: any) => {
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

    } catch (error: any) {
        console.error('Update vendor error:', error);
        res.status(500).json({
            error: 'Failed to update profile',
            details: error.message
        });
    }
});

// Get vendor analytics
router.get('/vendors/analytics', authenticateToken, async (req: any, res: any) => {
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

    } catch (error: any) {
        console.error('Get analytics error:', error);
        res.status(500).json({
            error: 'Failed to fetch analytics',
            details: error.message
        });
    }
});

// Update or add inventory items
router.patch('/vendors/inventory', authenticateToken, async (req: any, res: any) => {
    try {
        if (req.user.userType !== 'vendor') {
            return res.status(403).json({ error: 'Access denied. Vendors only.' });
        }

        const { product, currentInventory } = req.body;
        const vendor = await Vendor.findById(req.user.userId);

        if (!vendor) {
            return res.status(404).json({ error: 'Vendor not found' });
        }

        if (currentInventory && Array.isArray(currentInventory)) {
            // Support full inventory replacement (used by dedicated inventory page)
            vendor.currentInventory = currentInventory;
        } else if (product) {
            // Support singular product updates (used by quick-action modals)
            const itemIndex = vendor.currentInventory.findIndex(
                (item: any) => item.productName === product.productName
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
        } else {
            return res.status(400).json({ error: 'Either "product" or "currentInventory" must be provided' });
        }

        await vendor.save();
        res.json({
            message: 'Inventory updated successfully',
            inventory: vendor.currentInventory
        });
    } catch (error: any) {
        console.error('Update inventory error:', error);
        res.status(500).json({ error: 'Failed to update inventory', details: error.message });
    }
});

// Remove inventory item
router.delete('/vendors/inventory/:productName', authenticateToken, async (req: any, res: any) => {
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
            (item: any) => item.productName !== productName
        );

        await vendor.save();
        res.json({
            message: 'Item removed successfully',
            inventory: vendor.currentInventory
        });
    } catch (error: any) {
        console.error('Delete inventory item error:', error);
        res.status(500).json({ error: 'Failed to delete item', details: error.message });
    }
});

// ===============================
// ORDER ROUTES
// ===============================

// Create new order
router.post('/orders', authenticateToken, async (req: any, res: any) => {
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

        const processedItems = items.map((item: any) => {
            // Find the product in supplier's inventory to verify price
            const supplierProduct = supplier.products.find((p: any) => p.name === item.productName);
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
            (area: any) => area.pincode === deliveryAddress.pincode
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

        // Update vendor financial stats
        await Vendor.findByIdAndUpdate(req.user.userId, {
            $inc: {
                totalSpent: totalAmount,
                totalSavings: savedAmount,
                totalOrders: 1
            }
        });

        // Reduce supplier product stock for each ordered item
        const supplierDoc = await Supplier.findById(supplierId);
        if (supplierDoc) {
            let stockChanged = false;
            processedItems.forEach((item: any) => {
                const prodIdx = supplierDoc.products.findIndex(
                    (p: any) => p.name === item.productName || String(p._id) === String(item.productId)
                );
                if (prodIdx >= 0) {
                    const prod = supplierDoc.products[prodIdx];
                    // Decrement whichever stock field is set
                    if (prod.currentStock !== undefined) {
                        prod.currentStock = Math.max(0, (prod.currentStock || 0) - item.quantity);
                    }
                    if (prod.inventory !== undefined) {
                        prod.inventory = Math.max(0, (prod.inventory || 0) - item.quantity);
                    }
                    stockChanged = true;
                }
            });
            if (stockChanged) await supplierDoc.save();
        }

        // Add ordered items to vendor's currentInventory
        const vendorDoc = await Vendor.findById(req.user.userId);
        if (vendorDoc) {
            processedItems.forEach((item: any) => {
                const existingIdx = vendorDoc.currentInventory.findIndex(
                    (inv: any) => inv.productName === item.productName
                );
                if (existingIdx >= 0) {
                    // Increase existing stock
                    vendorDoc.currentInventory[existingIdx].quantity =
                        (vendorDoc.currentInventory[existingIdx].quantity || 0) + item.quantity;
                } else {
                    // Add new item
                    vendorDoc.currentInventory.push({
                        productName: item.productName,
                        category: item.category || 'General',
                        quantity: item.quantity,
                        unit: item.unit,
                        costPrice: item.pricePerUnit,
                        purchaseDate: new Date()
                    });
                }
            });
            await vendorDoc.save();
        }

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

    } catch (error: any) {
        console.error('Create order error:', error);
        res.status(500).json({
            error: 'Failed to create order',
            details: error.message
        });
    }
});

// Get orders for authenticated user
router.get('/orders', authenticateToken, async (req: any, res: any) => {
    try {
        const { status, limit = 20, page = 1 } = req.query;

        let query: any = {};

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
            .limit(parseInt(limit as string))
            .skip((parseInt(page as string) - 1) * parseInt(limit as string))
            .sort({ placedAt: -1 });

        res.json({
            orders,
            pagination: {
                page: parseInt(page as string),
                limit: parseInt(limit as string),
                total: await Order.countDocuments(query)
            }
        });

    } catch (error: any) {
        console.error('Get orders error:', error);
        res.status(500).json({
            error: 'Failed to fetch orders',
            details: error.message
        });
    }
});

// Get specific order
router.get('/orders/:id', authenticateToken, async (req: any, res: any) => {
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

    } catch (error: any) {
        console.error('Get order error:', error);
        res.status(500).json({
            error: 'Failed to fetch order',
            details: error.message
        });
    }
});

// Update order status (suppliers only)
router.patch('/orders/:id/status', authenticateToken, async (req: any, res: any) => {
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

    } catch (error: any) {
        console.error('Update order status error:', error);
        res.status(500).json({
            error: 'Failed to update order status',
            details: error.message
        });
    }
});

// Add order rating
router.post('/orders/:id/rating', authenticateToken, async (req: any, res: any) => {
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

    } catch (error: any) {
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
router.get('/search/products', async (req: any, res: any) => {
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

        let matchQuery: any = {
            userType: 'supplier',
            isActive: true,
            'products.isActive': true
        };

        if (category) {
            matchQuery['products.category'] = category;
        }

        if (maxPrice) {
            matchQuery['products.pricePerUnit'] = { $lte: parseFloat(maxPrice as string) };
        }

        if (minRating) {
            matchQuery['rating.average'] = { $gte: parseFloat(minRating as string) };
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
            { $skip: (parseInt(page as string) - 1) * parseInt(limit as string) },
            { $limit: parseInt(limit as string) }
        ]);

        res.json({
            products: results,
            pagination: {
                page: parseInt(page as string),
                limit: parseInt(limit as string)
            }
        });

    } catch (error: any) {
        console.error('Search products error:', error);
        res.status(500).json({
            error: 'Failed to search products',
            details: error.message
        });
    }
});
// Base API route
router.get('/', (req: any, res: any) => {
    console.log('✅ /api route hit');
    res.json({ message: 'Welcome to the BazaarBandhu API!' });
});

// Optional test route
router.get('/test', (req: any, res: any) => {
    res.json({ message: 'Test route is working!' });
});


router.use('/ai-chat', aiChatRoutes);

// DeepSeek-R1 local model chat route
router.use('/deepseek-chat', deepSeekChatRoutes);

// Razorpay Payment Routes
router.use('/payments', paymentRoutes);

export default router;
