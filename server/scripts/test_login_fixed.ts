import axios from 'axios';

async function testLogin() {
    try {
        const response = await axios.post('http://localhost:5005/api/auth/login', {
            email: 'test_success@test.com',
            password: 'password123'
        });
        console.log('Login Success:', response.data.message);
        console.log('Token:', response.data.token.substring(0, 10) + '...');
    } catch (error: any) {
        if (error.response) {
            console.error('Login Failed:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}

testLogin();
