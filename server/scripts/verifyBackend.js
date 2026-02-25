const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const API_URL = `http://localhost:${process.env.PORT || 5001}/api`;

async function verifyBackend() {
    console.log('🔍 Starting backend verification...');

    try {
        // 1. Check Health
        console.log('\n--- 1. Health Check ---');
        const health = await axios.get(`http://localhost:${process.env.PORT || 5001}/health`);
        console.log('✅ Health check passed:', health.data);

        // 2. Check Database via API (Suppliers)
        console.log('\n--- 2. Database Content (Suppliers) ---');
        const suppliers = await axios.get(`${API_URL}/suppliers`);
        console.log(`✅ Found ${suppliers.data.suppliers.length} suppliers in the database.`);
        if (suppliers.data.suppliers.length > 0) {
            console.log('Sample Supplier:', suppliers.data.suppliers[0].businessName);
        }

        // 3. Check AI Chat (Optional, if key is valid)
        console.log('\n--- 3. AI Chat Verification ---');
        try {
            const aiResponse = await axios.post(`${API_URL}/ai-chat`, {
                message: "Hello, what are today's onion rates?",
                language: "en"
            });
            console.log('✅ AI Response received:', aiResponse.data.reply);
        } catch (err) {
            console.warn('⚠️ AI Chat failed (possibly invalid API key):', err.message);
        }

        console.log('\n✅ Verification complete!');
    } catch (error) {
        console.error('\n❌ Verification failed:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

verifyBackend();
