import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  createAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from '../controllers/addressController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Address routes
router.post('/', createAddress);
router.get('/', getAddresses);
router.put('/:id', updateAddress);
router.delete('/:id', deleteAddress);
router.patch('/:id/default', setDefaultAddress);

export default router;
