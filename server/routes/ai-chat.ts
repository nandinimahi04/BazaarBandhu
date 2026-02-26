import express from 'express';
import { OpenAI } from 'openai';
import 'dotenv/config';

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post('/', async (req: any, res: any) => {
    const { message, language = 'hi' } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    try {
        const chatCompletion = await openai.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `You are BazaarBandhu AI, a helpful assistant for Indian street food vendors and suppliers. 
          Help them with checking prices, matching with suppliers, managing stock, and placing orders. 
          Respond in ${language}. Keep responses concise, culturally relevant, and helpful.`
                },
                { role: 'user', content: message }
            ],
            model: 'gpt-3.5-turbo',
            temperature: 0.7,
            max_tokens: 500
        });

        const reply: any = chatCompletion.choices[0].message.content?.trim();
        return res.json({ reply });

    } catch (error: any) {
        console.error('AI error:', error.message);

        // Localized error messages
        const localizedErrors: any = {
            hi: "माफ़ कीजिए, मैं इस समय जवाब नहीं दे पा रहा हूं। कृपया थोड़ी देर बाद फिर से कोशिश करें।",
            en: "I'm sorry, I can't respond right now. The AI service is currently unavailable.",
            mr: "क्षमस्व, मी सध्या प्रतिसाद देऊ शकत नाही. AI सेवा सध्या उपलब्ध नाही.",
            gu: "માફ કરશો, હું અત્યારે જવાબ આપી શકતો નથી. AI સેવા હાલમાં ઉપલબ્ધ નથી."
        };

        let errorMessage = localizedErrors[language] || localizedErrors.en;

        if (error.message.includes('quota')) {
            errorMessage = language === 'hi'
                ? "क्षमा करें, AI सेवा अपनी उपयोग सीमा तक पहुँच गई है। कृपया बाद में पुनः प्रयास करें।"
                : "I'm sorry, the AI service has reached its usage limit. Please try again later.";
        }

        return res.status(500).json({ reply: errorMessage });
    }
});

export default router;
