import express from 'express';
import jwt from 'jsonwebtoken';
import {
  getMyOrders,
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  updateOrderStatus,
  updatePaymentStatus,
  confirmOrder,
  getInvoice,
  cancelOrder,
  deleteOrder,
  getOrderStats,
} from '../controllers/orderController';
import { authenticate, authorize } from '../middleware/auth';

// Optional auth middleware - tries to authenticate but doesn't fail if no token
const optionalAuth = (req: any, res: any, next: any) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      // If token exists, try to extract userId
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
        id: string;
        role: string;
      };
      req.userId = decoded.id;
      req.userRole = decoded.role;
    }
  } catch (error) {
    // Silently ignore auth errors for optional auth
  }
  next();
};

const router = express.Router();

// Public route - customers can create orders (with optional auth to capture userId if logged in)
router.post('/', optionalAuth, createOrder);

// Customer route - get their own orders
router.get('/my-orders', authenticate, getMyOrders);

// Customer route - cancel their own order
router.post('/:id/cancel', authenticate, cancelOrder);

// Admin routes
router.get('/stats', authenticate, authorize('admin'), getOrderStats);
router.get('/', authenticate, authorize('admin'), getAllOrders);
router.get('/:id', authenticate, authorize('admin'), getOrderById);
router.put('/:id', authenticate, authorize('admin'), updateOrder);
router.patch('/:id/status', authenticate, authorize('admin'), updateOrderStatus);
router.patch('/:id/payment-status', authenticate, authorize('admin'), updatePaymentStatus);
router.post('/:id/confirm', authenticate, authorize('admin'), confirmOrder);
router.get('/:orderId/invoice', authenticate, getInvoice);
router.delete('/:id', authenticate, authorize('admin'), deleteOrder);

export default router;
