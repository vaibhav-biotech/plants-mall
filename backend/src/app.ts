import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'dotenv/config';
import connectDB from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import categoryRoutes from './routes/categories.js';
import offerRoutes from './routes/offers.js';
import orderRoutes from './routes/orders.js';
import customerRoutes from './routes/customers.js';
import addressRoutes from './routes/addresses.js';
import wishlistRoutes from './routes/wishlist.js';
import analyticsRoutes from './routes/analytics.js';
import importRoutes from './routes/import.js';
import bannerRoutes from './routes/banners.js';
import reviewRoutes from './routes/reviews.js';

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/import', importRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/reviews', reviewRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running' });
});

// Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const MAX_PORT_TRIES = 20;

const startServer = (port: number, attempts = 0) => {
  const server = app.listen(port, () => {
    console.log(`✅ Server running on port ${port}`);
  });

  server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE' && attempts < MAX_PORT_TRIES) {
      const nextPort = port + 1;
      console.warn(`⚠️ Port ${port} is in use. Trying ${nextPort}...`);
      startServer(nextPort, attempts + 1);
      return;
    }

    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  });
};

startServer(Number(PORT));

export default app;
