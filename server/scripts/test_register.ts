import axios from 'axios';

async function testRegister() {
    try {
        const response = await axios.post('http://localhost:5005/api/auth/register', {
            fullName: "Test User " + Date.now(),
            email: "test" + Date.now() + "@test.com",
            password: "password123",
            phone: "1234567890",
            userType: "vendor",
            businessName: "Test Shop"
        });
        console.log('Success:', response.data);
    } catch (error: any) {
        if (error.response) {
            console.error('Error Status:', error.response.status);
            console.error('Error Data:', error.response.data);
        } else {
            console.error('Error Message:', error.message);
        }
    }
}

testRegister();
