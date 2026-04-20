import express from 'express';
import OpenAI from 'openai';
import 'dotenv/config';

const router = express.Router();

// Initialize OpenAI with your API Key
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// --- SAARTHI INTELLIGENCE ENGINE ---
const solveIntelligently = (message: string, context: any) => {
    const text = (message || '').toLowerCase();
    const inventory = context?.inventory?.currentInventory || [];
    const products = context?.products || [];
    const deliveries = context?.activeDeliveries || [];
    
    // 1. Direct Purchase Intent (e.g., "Buy 5kg potatoes")
    if (text.includes('buy') || text.includes('order') || text.includes('खरीद') || text.includes('लेना')) {
        // Extract product name - simple matching
        const targetProduct = products.find((p: any) => text.includes(p.name.toLowerCase()));
        if (targetProduct) {
            // Extract quantity if possible (defaults to 10)
            const qtyMatch = text.match(/\d+/);
            const qty = qtyMatch ? parseInt(qtyMatch[0]) : 10;
            const total = targetProduct.price * qty;
            const savings = (targetProduct.marketPrice - targetProduct.price) * qty;

            return {
                reply: `Jaroor! I found ${targetProduct.name} from ${targetProduct.supplier} at ₹${targetProduct.price}/${targetProduct.unit}. Total for ${qty}${targetProduct.unit} will be ₹${total}. You save ₹${savings} compared to market! Should I place this order?`,
                action: { 
                    type: 'buy', 
                    product: targetProduct.name, 
                    quantity: `${qty}${targetProduct.unit}`, 
                    supplier: targetProduct.supplier, 
                    price: total, 
                    savings: savings 
                }
            };
        }
    }

    // 2. Supplier Discovery (e.g., "Find best supplier")
    if (text.includes('supplier') || text.includes('best') || text.includes('mandi') || text.includes('विक्रेता') || text.includes('rates') || text.includes('price') || text.includes('bhav') || text.includes('dam')) {
        const topSuppliers = products
            .sort((a: any, b: any) => a.price - b.price)
            .slice(0, 3)
            .map((p: any) => `${p.supplier} (₹${p.price}/${p.unit} for ${p.name})`);
            
        if (topSuppliers.length > 0) {
            return {
                reply: `Based on today's Mandi rates, here are the top deals for you:\n\n1. ${topSuppliers[0]}\n2. ${topSuppliers[1] || ''}\n\nAll these suppliers have 90%+ trust scores. Which one would you like to explore?`,
                action: { type: 'navigate', tab: 'bazaar' }
            };
        }
    }

    // 3. Stock Check (e.g., "Check my stock")
    if (text.includes('stock') || text.includes('inventory') || text.includes('स्टॉक') || text.includes('माल')) {
        const lowStock = inventory.filter((item: any) => (item.quantity || 0) <= (item.threshold || 5));
        if (lowStock.length > 0) {
            return {
                reply: `Caution: You are running low on ${lowStock.map((i: any) => i.productName).join(', ')}. Your ${lowStock[0].productName} is at ${lowStock[0].quantity}${lowStock[0].unit}. Should I find a supplier to restock?`,
                action: { type: 'navigate', tab: 'inventory' }
            };
        }
        return {
            reply: "Your inventory looks healthy! All items are above safety thresholds. Anything else you'd like to check?",
            action: { type: 'navigate', tab: 'inventory' }
        };
    }

    // 4. Delivery Tracking
    if (text.includes('track') || text.includes('delivery') || text.includes('order status') || text.includes('कहाँ')) {
        if (deliveries.length > 0) {
            const d = deliveries[0];
            return {
                reply: `Your order #${d.orderId} is currently "${d.status}". It should reach you in about ${d.eta}. I can keep you posted!`,
                action: { type: 'navigate', tab: 'delivery' }
            };
        }
        return {
            reply: "No active deliveries right now. You can check your previous orders in the delivery tab.",
            action: { type: 'navigate', tab: 'delivery' }
        };
    }

    // 5. Basic Greetings & Identity
    if (text === 'hi' || text === 'hello' || text === 'hey' || text === 'नमस्ते' || text === 'नमस्कार') {
        const name = context?.user?.fullName?.split(' ')[0] || 'Dost';
        return {
            reply: `Namaste ${name} ji! I am Saarthi, your business assistant. I can help you order stock, check prices, or track deliveries. Bolye, kaise madad karoon?`,
            action: null
        };
    }

    if (text.includes('who are you') || text.includes('identity') || text.includes('tera naam') || text.includes('apka naam')) {
        return {
            reply: "I am Saarthi (BazaarBandhu AI). I am trained specifically to help Indian street food vendors like you grow their business and save money in the Mandi!",
            action: null
        };
    }

    if (text.includes('thanks') || text.includes('thank you') || text.includes('shukriya') || text.includes('dhanyavad')) {
        return {
            reply: "Aapka swagat hai ji! It's my duty to help your business grow. Kuch aur chahiye toh zaroor bataiye.",
            action: null
        };
    }

    if (text.includes('help') || text.includes('madad') || text.includes('kya kar sakte ho') || text === '?') {
        return {
            reply: "I can help you with:\n1. 🛒 Ordering Stock (e.g. 'Buy 10kg onions')\n2. 💰 Mandi Rates (e.g. 'Current price of potatoes')\n3. 📦 Stock Check (e.g. 'Check my inventory')\n4. 🚚 Tracking (e.g. 'Track my order')\n\nJust type or speak your request!",
            action: null
        };
    }

    return null;
};

router.post('/', async (req: any, res: any) => {
    const { message, language = 'en', context } = req.body;
    
    console.log(`[AI Agent] New Query: "${message}" (${language})`);

    // Try Local Intelligence First (Free & Fast & Handles Actions)
    const localIntelligence = solveIntelligently(message, context);
    if (localIntelligence) {
        return res.json(localIntelligence);
    }

    try {
        // Fallback to OpenAI for Natural Conversation
        if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_key_here') {
             throw new Error('API Key Missing');
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: `You are "Saarthi", the BazaarBandhu AI Assistant for Indian street food vendors. 
                    Persona: Respectful (uses "ji", "aap"), knowledgeable, helping the small business owner grow.
                    Context: ${context?.user?.businessName || 'Street food shop'}.
                    Current stats: ${JSON.stringify(context?.shopStats || {})}
                    Instructions: Respond in ${language}. Keep it brief (1-2 sentences).`
                },
                { role: "user", content: message }
            ],
            max_tokens: 150,
            temperature: 0.7,
        });

        const reply = completion.choices[0].message.content || "Main aapki kaise madad kar sakta hoon?";
        return res.json({ reply, action: null });

    } catch (error: any) {
        console.error('[AI Agent] LLM Error:', error.message);
        
        // Smarter Fallback: If it's a quota issue, inform the user gently
        const isQuotaError = error.message?.includes('quota') || error.message?.includes('429');
        
        return res.json({ 
            reply: language === 'hi' 
                ? (isQuotaError 
                    ? "माफ़ कीजिए! मेरा एडवांस सर्वर अभी बहुत बिजी है (Quota Exceeded)। पर मैं आपके ऑर्डर और स्टॉक में अभी भी मदद कर सकता हूँ। क्या आप कुछ ऑर्डर करना चाहते हैं?"
                    : "नमस्ते! मैं आपका साार्थी हूँ। अभी मेरा सिस्टम थोड़ा अपडेट हो रहा है, पर मैं आपके सवालों का जवाब स्थानीय बुद्धि से दे सकता हूँ। आप क्या पूछना चाहते हैं?")
                : (isQuotaError
                    ? "Oops! My advanced brain is resting right now (OpenAI Quota Exceeded). However, my local business switch is still ON! I can still help you with orders and stock. What would you like to do?"
                    : "Namaste! I am your Saarthi. My connection is a bit unstable, but I can still answer basic business questions. How can I help you today?"),
            action: null 
        });
    }
});

export default router;
