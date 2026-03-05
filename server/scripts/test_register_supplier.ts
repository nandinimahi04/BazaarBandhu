import axios from 'axios';

async function testRegisterSupplier() {
    try {
        const response = await axios.post('http://localhost:5005/api/auth/register', {
            fullName: "Test Supplier",
            email: "supplier@test.com",
            password: "password123",
            phone: "0987654321",
            userType: "supplier",
            businessName: "Fresh Veggie Supplier",
            gstNumber: "27AAAAA0000A1Z5",
            deliveryRadius: 20,
            minOrderAmount: 200,
            productCategories: ['Vegetables', 'Fruits'],
            paymentMethods: ['Cash', 'UPI']
        });
        console.log('Success:', response.data.message);
    } catch (error: any) {
        if (error.response) {
            console.error('Error Data:', error.response.data);
        } else {
            console.error('Error Message:', error.message);
        }
    }
}

testRegisterSupplier();
