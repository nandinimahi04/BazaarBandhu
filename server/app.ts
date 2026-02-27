import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import morgan from 'morgan';
// @ts-ignore
import connectDB from './config/database.js';
import 'dotenv/config';
import './models/User.js';
import './models/Vendor.js';
import './models/Supplier.js';
import './models/Order.js';

// @ts-ignore
import apiRoutes from './routes/api.js';

const app = express();

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());
app.use(morgan('dev'));

const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:3000',
    'http://localhost:8080',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174'
].filter(Boolean);

app.use(cors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // In development, be more permissive with localhost
        const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1');

        if (isLocalhost || allowedOrigins.indexOf(origin) !== -1) {
            return callback(null, true);
        } else {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
    },
    credentials: true
}));

console.log('✅ Loaded Origins:', allowedOrigins);
console.log('🔌 Configured PORT:', process.env.PORT);

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: {
        error: 'Too many requests from this IP, please try again later.'
    }
});
app.use('/api/', limiter);

// API routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req: any, res: any) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'BazaarBandhu API'
    });
});

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
    console.error('Error:', err);

    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});




export default app;
