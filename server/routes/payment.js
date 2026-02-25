const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
require('dotenv').config();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_5yLzXw7fN4LwXj',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_key_here'
});

// Create Razorpay Order
router.post('/create-order', async (req, res) => {
    try {
        const { amount, currency = 'INR', receipt } = req.body;

        const options = {
            amount: Math.round(amount * 100), // Razorpay expects amount in paise
            currency,
            receipt,
        };

        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        console.error('Razorpay order creation failed:', error);
        res.status(500).json({ error: error.message });
    }
});

// Verify Payment Signature
router.post('/verify', async (req, res) => {
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
    } catch (error) {
        console.error('Razorpay verification failed:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
