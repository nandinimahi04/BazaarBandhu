import axios from 'axios';

async function test() {
    try {
        const res = await axios.get('http://localhost:5004/api/suppliers');
        console.log('API_STATUS:', res.status);
        console.log('SUPPLIERS_ARRAY:', Array.isArray(res.data.suppliers));
        console.log('SUPPLIERS_LENGTH:', res.data.suppliers.length);
    } catch (e: any) {
        console.log('API_ERROR:', e.message);
    }
    process.exit(0);
}

test();
