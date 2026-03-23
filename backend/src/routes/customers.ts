import express from 'express';
import { getProfile, updateProfile, getAllCustomers, getCustomerById, updateCustomerStatus, deleteCustomer } from '../controllers/customerController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Customer routes (protected)
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);

// Admin routes (protected and admin only)
router.get('/', authenticate, getAllCustomers);
router.get('/:id', authenticate, getCustomerById);
router.patch('/:id/status', authenticate, updateCustomerStatus);
router.delete('/:id', authenticate, deleteCustomer);

export default router;
