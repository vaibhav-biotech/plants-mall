import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
} from '../controllers/categoryController.js';

const router = express.Router();

router.get('/', getAllCategories);
router.get('/:id', getCategoryById);
router.post('/', authenticate, authorize(['admin']), createCategory);
router.put('/:id', authenticate, authorize(['admin']), updateCategory);
router.delete('/:id', authenticate, authorize(['admin']), deleteCategory);
router.post('/reorder', authenticate, authorize(['admin']), reorderCategories);

export default router;
