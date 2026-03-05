import Razorpay from 'razorpay';
import 'dotenv/config';

async function testRazorpay() {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    console.log('Testing with Key ID:', key_id);

    const razorpay = new Razorpay({
        key_id: key_id || '',
        key_secret: key_secret || ''
    });

    try {
        const order = await razorpay.orders.create({
            amount: 100, // 1 INR
            currency: 'INR',
            receipt: 'test_receipt_' + Date.now()
        });
        console.log('✅ Order created successfully:', order.id);
    } catch (error: any) {
        console.error('❌ Order creation failed');
        console.error('Error:', error);
    }
}

testRazorpay();
