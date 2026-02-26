import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { createRequire } from 'module';
import 'dotenv/config';

const require = createRequire(import.meta.url);
const router = express.Router();
// Use require for models to avoid deep conversion if not needed, or use import
// @ts-ignore
import Order from '../models/Order.js';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_5yLzXw7fN4LwXj',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_key_here'
});

// Create Razorpay Order
router.post('/create-order', async (req: any, res: any) => {
    try {
        const { amount, currency = 'INR', receipt } = req.body;

        const options = {
            amount: Math.round(amount * 100), // Razorpay expects amount in paise
            currency,
            receipt,
        };

        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error: any) {
        console.error('Razorpay order creation failed:', error);
        res.status(500).json({ error: error.message });
    }
});

// Verify Payment Signature
router.post('/verify', async (req: any, res: any) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderId // MongoDB Order ID
        } = req.body;

        const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'secret_key_here');
        shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
        const digest = shasum.digest('hex');

        if (digest === razorpay_signature) {
            // Payment is verified
            if (orderId) {
                await Order.findByIdAndUpdate(orderId, {
                    'payment.status': 'completed',
                    'payment.transactionId': razorpay_payment_id,
                    'payment.gatewayTransactionId': razorpay_order_id,
                    'status': 'confirmed'
                });
            }
            res.json({ status: 'success' });
        } else {
            res.status(400).json({ status: 'failure', message: 'Signature verification failed' });
        }
    } catch (error: any) {
        console.error('Razorpay verification failed:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
