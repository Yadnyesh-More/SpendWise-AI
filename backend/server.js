// import express from 'express';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import mongoSanitize from 'express-mongo-sanitize';
// import helmet from 'helmet';
// import simpleCache from "./src/middleware/simpleCache.js";

// // Load environment variables FIRST
// dotenv.config();

// // Import Database
// import connectDB from './src/config/db.js';

// // Import Routes
// import authRoutes from './src/routes/authRoutes.js';
// import transactionRoutes from './src/routes/transactionRoutes.js';
// import adminRoutes from './src/routes/adminRoutes.js';
// import aiRoutes from './src/routes/aiRoutes.js';
// import authMiddleware from './src/middleware/auth.js';

// // Initialize App FIRST
// const app = express();

// // ============ MIDDLEWARE ============
// app.use(helmet());
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true }));
// app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:5173'] }));
// app.use(mongoSanitize());

// // Connect Database
// connectDB();

// // Test endpoint
// app.post('/test', (req, res) => {
//   console.log('✅ TEST body:', req.body);
//   res.json({ success: true, received: req.body });
// });

// // Routes
// app.use('/auth', authRoutes);
// app.use('/api/auth', authRoutes);
// app.use('/transactions', simpleCache, transactionRoutes);
// app.use('/api/transactions', authMiddleware, transactionRoutes);
// app.use('/api/admin', authMiddleware, adminRoutes);
// app.use('/api/ai', authMiddleware, aiRoutes);

// app.get('/health', (req, res) => res.json({ success: true }));

// // Error handlers
// app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
// app.use((err, req, res) => {
//   console.error('ERROR:', err);
//   res.status(500).json({ success: false, message: err.message });
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`✅ Server: http://localhost:${PORT}`);
// });


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
app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
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
app.use('/auth', authRoutes);

// Cached public transactions (if you want unauth summary list)
app.use('/transactions', transactionRoutes);

// Protected routes (all start with /api/...)
app.use('/api/transactions', authMiddleware, transactionRoutes);
app.use('/api/admin', authMiddleware, adminRoutes);
app.use('/api/ai', authMiddleware, aiRoutes);

// Health
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
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
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

export default app;
