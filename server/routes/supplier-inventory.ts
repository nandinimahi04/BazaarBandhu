import express from 'express';
// @ts-ignore
import Supplier from '../models/Supplier.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Middleware: only suppliers
const supplierOnly = (req: any, res: any, next: any) => {
    if (req.user?.userType !== 'supplier') {
        return res.status(403).json({ error: 'Access denied. Suppliers only.' });
    }
    next();
};

// ─── GET /api/supplier-inventory ─── list all products in this supplier's catalog
router.get('/', authenticateToken, supplierOnly, async (req: any, res: any) => {
    try {
        const supplier = await Supplier.findById(req.user.userId).select('products');
        if (!supplier) return res.status(404).json({ error: 'Supplier not found' });
        res.json({ products: supplier.products || [] });
    } catch (err: any) {
        res.status(500).json({ error: 'Failed to fetch inventory', details: err.message });
    }
});

// ─── POST /api/supplier-inventory ─── add a new product
router.post('/', authenticateToken, supplierOnly, async (req: any, res: any) => {
    try {
        const { name, category, unit, pricePerUnit, marketPrice, inventory, minStock, maxStock, quality, description } = req.body;

        if (!name || !category || !unit || !pricePerUnit) {
            return res.status(400).json({ error: 'name, category, unit and pricePerUnit are required' });
        }

        const supplier = await Supplier.findById(req.user.userId);
        if (!supplier) return res.status(404).json({ error: 'Supplier not found' });

        // Check for duplicate name in same category
        const exists = supplier.products.find(
            (p: any) => p.name.toLowerCase() === name.toLowerCase() && p.category === category
        );
        if (exists) {
            return res.status(409).json({ error: 'A product with this name & category already exists. Use PUT to update it.' });
        }

        supplier.products.push({
            name, category, unit,
            pricePerUnit: parseFloat(pricePerUnit),
            marketPrice: marketPrice ? parseFloat(marketPrice) : undefined,
            inventory: inventory ? parseFloat(inventory) : 0,
            minStock: minStock ? parseFloat(minStock) : 10,
            maxStock: maxStock ? parseFloat(maxStock) : 1000,
            quality: quality || 'A',
            description: description || '',
            isActive: true
        });

        supplier.markModified('products');
        await supplier.save();

        const added = supplier.products[supplier.products.length - 1];
        res.status(201).json({ message: 'Product added', product: added, products: supplier.products });
    } catch (err: any) {
        res.status(500).json({ error: 'Failed to add product', details: err.message });
    }
});

// ─── PUT /api/supplier-inventory/:productId ─── update a product
router.put('/:productId', authenticateToken, supplierOnly, async (req: any, res: any) => {
    try {
        const supplier = await Supplier.findById(req.user.userId);
        if (!supplier) return res.status(404).json({ error: 'Supplier not found' });

        const product = supplier.products.id(req.params.productId);
        if (!product) return res.status(404).json({ error: 'Product not found' });

        const fields = ['name', 'category', 'unit', 'pricePerUnit', 'marketPrice', 'inventory', 'minStock', 'maxStock', 'quality', 'description', 'isActive'];
        fields.forEach(f => {
            if (req.body[f] !== undefined) {
                product[f] = req.body[f];
            }
        });

        supplier.markModified('products');
        await supplier.save();
        res.json({ message: 'Product updated', product, products: supplier.products });
    } catch (err: any) {
        res.status(500).json({ error: 'Failed to update product', details: err.message });
    }
});

// ─── PATCH /api/supplier-inventory/:productId/stock ─── update just the stock level
router.patch('/:productId/stock', authenticateToken, supplierOnly, async (req: any, res: any) => {
    try {
        const { inventory } = req.body;
        if (inventory === undefined || isNaN(parseFloat(inventory))) {
            return res.status(400).json({ error: 'inventory (number) is required' });
        }

        const supplier = await Supplier.findById(req.user.userId);
        if (!supplier) return res.status(404).json({ error: 'Supplier not found' });

        const product = supplier.products.id(req.params.productId);
        if (!product) return res.status(404).json({ error: 'Product not found' });

        product.inventory = parseFloat(inventory);
        supplier.markModified('products');
        await supplier.save();
        res.json({ message: 'Stock updated', product, products: supplier.products });
    } catch (err: any) {
        res.status(500).json({ error: 'Failed to update stock', details: err.message });
    }
});

// ─── DELETE /api/supplier-inventory/:productId ─── remove a product
router.delete('/:productId', authenticateToken, supplierOnly, async (req: any, res: any) => {
    try {
        const supplier = await Supplier.findById(req.user.userId);
        if (!supplier) return res.status(404).json({ error: 'Supplier not found' });

        const beforeLen = supplier.products.length;
        supplier.products = supplier.products.filter(
            (p: any) => p._id.toString() !== req.params.productId
        );

        if (supplier.products.length === beforeLen) {
            return res.status(404).json({ error: 'Product not found' });
        }

        supplier.markModified('products');
        await supplier.save();
        res.json({ message: 'Product removed', products: supplier.products });
    } catch (err: any) {
        res.status(500).json({ error: 'Failed to delete product', details: err.message });
    }
});

export default router;
