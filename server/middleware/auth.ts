import jwt from 'jsonwebtoken';
import 'dotenv/config';

export const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    const envSecret = process.env.JWT_SECRET;
    const secret = envSecret || 'bazaarbandhu_secret';
    
    console.log(`[AUTH] Verifying token. Secret source: ${envSecret ? 'ENV' : 'FALLBACK'}. Secret prefix: ${secret.substring(0, 4)}`);

    jwt.verify(token, secret, (err: any, user: any) => {
        if (err) {
            console.error(`[AUTH] Verification FAILED (${err.name}):`, err.message);
            return res.status(403).json({ 
                error: 'Invalid token', 
                details: err.message,
                type: err.name
            });
        }
        req.user = user;
        next();
    });
};
