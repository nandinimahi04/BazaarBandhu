import express from 'express';
import Inventory from '../models/Inventory.js';
import InventoryMovement from '../models/InventoryMovement.js';
import Vendor from '../models/Vendor.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET all inventory for the logged-in vendor
router.get('/', authenticateToken, async (req: any, res: any) => {
    try {
        const inventory = await Inventory.find({ vendor: req.user.userId })
            .sort({ status: 1, productName: 1 });
        res.json(inventory);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch inventory', details: error.message });
    }
});

// POST new inventory item
router.post('/', authenticateToken, async (req: any, res: any) => {
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

        // Log initial movement
        const movement = new InventoryMovement({
            inventoryItem: savedItem._id,
            vendor: req.user.userId,
            type: 'IN',
            quantity: currentQuantity,
            previousQuantity: 0,
            newQuantity: currentQuantity,
            reason: 'purchase',
            notes: 'Initial stock addition'
        });
        await movement.save();

        res.status(201).json(savedItem);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to add inventory item', details: error.message });
    }
});

// PATCH update stock level (Manual adjustment/Sale/Wastage)
router.patch('/:id', authenticateToken, async (req: any, res: any) => {
    try {
        const { quantityChange, type, reason, notes } = req.body;
        const item = await Inventory.findOne({ _id: req.params.id, vendor: req.user.userId });

        if (!item) {
            return res.status(404).json({ error: 'Inventory item not found' });
        }

        const previousQuantity = item.currentQuantity;
        let newQuantity = previousQuantity;

        if (type === 'IN' || type === 'RETURN') {
            newQuantity += quantityChange;
        } else if (type === 'OUT' || type === 'WASTAGE') {
            newQuantity -= quantityChange;
        } else if (type === 'ADJUSTMENT') {
            newQuantity = quantityChange; // In adjustment, we set the absolute value
        }

        item.currentQuantity = newQuantity;
        item.lastRestockDate = (type === 'IN') ? new Date() : item.lastRestockDate;
        await item.save();

        // Record movement
        const movement = new InventoryMovement({
            inventoryItem: item._id,
            vendor: req.user.userId,
            type,
            quantity: (type === 'ADJUSTMENT') ? Math.abs(newQuantity - previousQuantity) : quantityChange,
            previousQuantity,
            newQuantity,
            reason,
            notes
        });
        await movement.save();

        res.json({ item, movement });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to update stock', details: error.message });
    }
});

// GET movement history for an item
router.get('/:id/history', authenticateToken, async (req: any, res: any) => {
    try {
        const history = await InventoryMovement.find({ 
            inventoryItem: req.params.id,
            vendor: req.user.userId 
        }).sort({ createdAt: -1 });
        res.json(history);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch history', details: error.message });
    }
});

// DELETE inventory item
router.delete('/:id', authenticateToken, async (req: any, res: any) => {
    try {
        const result = await Inventory.deleteOne({ _id: req.params.id, vendor: req.user.userId });
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Item not found' });
        }
        // Also clean up history
        await InventoryMovement.deleteMany({ inventoryItem: req.params.id });
        res.json({ message: 'Item and its history deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to delete item', details: error.message });
    }
});

export default router;
