// backend/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoSanitize from 'express-mongo-sanitize';
import helmet from 'helmet';

// Local imports
import connectDB from './src/config/db.js';
import authRoutes from './src/routes/authRoutes.js';
import transactionRoutes from './src/routes/transactionRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import aiRoutes from './src/routes/aiRoutes.js';
import authMiddleware from './src/middleware/auth.js';

dotenv.config();

const app = express();

/* -------------------- SECURITY MIDDLEWARE -------------------- */
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    crossOriginOpenerPolicy: false,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());

/* -------------------- CORS (FIXED) -------------------- */
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://spendwise-ai-front.vercel.app',
      'https://spend-wise-ai-front-yadnyesh-s-projects-b8cc2f46.vercel.app'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  })
);

/* -------------------- DATABASE -------------------- */
connectDB();

/* -------------------- ROUTES -------------------- */

// Test route
app.post('/test', (req, res) => {
  res.json({ success: true, received: req.body });
});

// Auth routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/transactions', authMiddleware, transactionRoutes);
app.use('/api/admin', authMiddleware, adminRoutes);
app.use('/api/ai', authMiddleware, aiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// Root
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Backend server is running 🚀' });
});

/* -------------------- ERROR HANDLING -------------------- */

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

/* -------------------- SERVER -------------------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
});

export default app;
