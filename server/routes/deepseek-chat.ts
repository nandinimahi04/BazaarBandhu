import express from 'express';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

// Path to the Python script that will handle the DeepSeek model
const PYTHON_SCRIPT_PATH = path.join(__dirname, '..', '..', 'deepseek_server.py');

router.post('/', async (req: any, res: any) => {
    const { message, language = 'english' } = req.body;
    try {

        if (!message) {
            return res.status(400).json({
                error: 'Message is required'
            });
        }

        // Call the Python script to generate a response using DeepSeek-R1
        const response = await callDeepSeekModel(message, language);

        return res.json({ response });
    } catch (error: any) {
        console.error('DeepSeek chat error:', error.message);

        // Provide localized error messages
        const errorMessages: any = {
            english: "I'm sorry, there was an error processing your request. Please try again later.",
            hindi: "माफ़ कीजिए, आपके अनुरोध को संसाधित करने में एक त्रुटि हुई थी। कृपया बाद में पुनः प्रयास करें।",
            marathi: "क्षमस्व, आपल्या विनंतीवर प्रक्रिया करताना त्रुटी आली. कृपया नंतर पुन्हा प्रयत्न करा.",
            gujarati: "માફ કરશો, તમારી વિનંતી પર પ્રક્રિયા કરવામાં ભૂલ આવી. કૃપા કરીને પછીથી ફરી પ્રયાસ કરો."
        };

        const errorMessage = errorMessages[language.toLowerCase()] || errorMessages.english;
        return res.status(500).json({ error: errorMessage });
    }
});

async function callDeepSeekModel(message: string, language: string) {
    return new Promise((resolve, reject) => {
        // Spawn a Python process to run the model
        const pythonProcess = spawn('python', [
            PYTHON_SCRIPT_PATH,
            '--message', message,
            '--language', language
        ]);

        let responseData = '';
        let errorData = '';

        // Collect data from stdout
        pythonProcess.stdout.on('data', (data) => {
            responseData += data.toString();
        });

        // Collect error data from stderr
        pythonProcess.stderr.on('data', (data) => {
            errorData += data.toString();
        });

        // Handle process completion
        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`DeepSeek process exited with code ${code}`);
                console.error(`Error: ${errorData}`);
                reject(new Error(`DeepSeek process failed with code ${code}`));
                return;
            }

            try {
                // Parse the JSON response from the Python script
                const parsedResponse = JSON.parse(responseData.trim());
                resolve(parsedResponse.response);
            } catch (error) {
                console.error('Failed to parse DeepSeek response:', error);
                console.error('Raw response:', responseData);
                reject(new Error('Failed to parse model response'));
            }
        });

        // Handle process errors
        pythonProcess.on('error', (error) => {
            console.error('Failed to start DeepSeek process:', error);
            reject(error);
        });

        // Set a timeout to prevent hanging
        const timeout = setTimeout(() => {
            pythonProcess.kill();
            reject(new Error('DeepSeek process timed out'));
        }, 60000); // 60 second timeout

        // Clear the timeout when the process completes
        pythonProcess.on('close', () => {
            clearTimeout(timeout);
        });
    });
}

export default router;
