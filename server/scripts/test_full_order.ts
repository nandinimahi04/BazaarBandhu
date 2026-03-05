import axios from 'axios';

async function testOrder() {
    try {
        // 1. Login as vendor
        const loginRes = await axios.post('http://localhost:5005/api/auth/login', {
            email: 'test_success@test.com',
            password: 'password123'
        });
        const token = loginRes.data.token;

        // 2. Search for supplier
        const suppliersRes = await axios.get('http://localhost:5005/api/suppliers', {
            headers: { Authorization: `Bearer ${token}` }
        });

        // Correctly access the suppliers array
        const suppliers = suppliersRes.data.suppliers || [];
        const supplier = suppliers.find((s: any) => s.email === 'supplier@test.com');

        if (!supplier) {
            console.error('Supplier not found in API list');
            return;
        }

        // 3. Place order
        const orderPayload = {
            supplierId: supplier._id,
            items: [
                {
                    productName: 'Tomato',
                    quantity: 5,
                    unit: 'kg',
                    pricePerUnit: 40
                }
            ],
            deliveryAddress: {
                street: "Vendor Stall 1",
                city: "Solapur",
                state: "Maharashtra",
                pincode: "413001"
            },
            scheduledDate: new Date(Date.now() + 86400000).toISOString(),
            timeSlot: "09:00 - 12:00",
            paymentMethod: 'cash'
        };

        const orderRes = await axios.post('http://localhost:5005/api/orders', orderPayload, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Order Placement Success:', orderRes.data.message);
        console.log('Order ID:', orderRes.data.order._id);

    } catch (error: any) {
        if (error.response) {
            console.error('Order Placement Failed:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}

testOrder();
