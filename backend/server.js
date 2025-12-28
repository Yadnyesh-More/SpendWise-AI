// backend/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoSanitize from 'express-mongo-sanitize';
import helmet from 'helmet';

// Local imports (all from src/)
import connectDB from './src/config/db.js';
import simpleCache from './src/middleware/simpleCache.js';
import authRoutes from './src/routes/authRoutes.js';
import transactionRoutes from './src/routes/transactionRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import aiRoutes from './src/routes/aiRoutes.js';
import authMiddleware from './src/middleware/auth.js';

dotenv.config();

const app = express();

// Core middleware (ONCE)
app.use(helmet({
    crossOriginResourcePolicy: false,
    crossOriginOpenerPolicy: false,
  }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [
  'http://localhost:3000',
  'https://spendwise-ai-frontend.vercel.app'
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(mongoSanitize());

// DB connect
connectDB();

// Test route to verify body parsing
app.post('/test', (req, res) => {
  console.log('✅ TEST body:', req.body);
  res.json({ success: true, received: req.body });
});

// Public auth routes
// Hit these from frontend: POST http://localhost:5000/auth/register, /auth/login
app.use('/api/auth', authRoutes);

// Cached public transactions (if you want unauth summary list)
app.use('/transactions', transactionRoutes);

// Protected routes (all start with /api/...)
app.use('/api/transactions', authMiddleware, transactionRoutes);
app.use('/api/admin', authMiddleware, adminRoutes);
app.use('/api/ai', authMiddleware, aiRoutes);

// Health
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Backend server is running 🚀'
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0',() => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

export default app;
