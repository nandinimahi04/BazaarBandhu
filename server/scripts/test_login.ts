import axios from 'axios';

async function testLogin() {
    try {
        const response = await axios.post('http://localhost:5005/api/auth/login', {
            email: 'vinay@gmail.com',
            password: 'password123'
        });
        console.log('Login Success:', response.data.message);
        console.log('User:', response.data.user.email);
    } catch (error: any) {
        if (error.response) {
            console.error('Login Failed:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}

testLogin();
