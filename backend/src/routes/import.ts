import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { uploadMiddleware } from '../middleware/upload.js';
import { importProductsCSV, getImportStatus } from '../controllers/importController.js';

const router = express.Router();

// POST: Import products from CSV
router.post('/import-csv', authenticate, authorize('admin', 'staff'), uploadMiddleware.single('file') as any, importProductsCSV);

// GET: Import status
router.get('/import-status', authenticate, authorize('admin', 'staff'), getImportStatus);

export default router;
