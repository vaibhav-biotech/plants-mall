import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  getSalesOverview,
  getSalesTrend,
  getTopProducts,
  getProductSummary,
  getLowStockProducts,
  getCategoryPerformance,
  getCustomerSummary,
  getTopCustomers,
  getFinancialSummary,
  getInventorySummary,
  getOrderSummary,
  getDailyOrderTrend,
} from '../controllers/analyticsController.js';

const router = express.Router();

// All analytics routes require admin authentication
const adminOnly = [authenticate, authorize(['admin'])];

// Sales Analytics
router.get('/sales/overview', adminOnly, getSalesOverview);
router.get('/sales/trend', adminOnly, getSalesTrend);
router.get('/sales/top-products', adminOnly, getTopProducts);

// Product Analytics
router.get('/products/summary', adminOnly, getProductSummary);
router.get('/products/low-stock', adminOnly, getLowStockProducts);
router.get('/products/category-performance', adminOnly, getCategoryPerformance);

// Customer Analytics
router.get('/customers/summary', adminOnly, getCustomerSummary);
router.get('/customers/top-customers', adminOnly, getTopCustomers);

// Financial Analytics
router.get('/financial/summary', adminOnly, getFinancialSummary);

// Inventory Analytics
router.get('/inventory/summary', adminOnly, getInventorySummary);

// Order Analytics
router.get('/orders/summary', adminOnly, getOrderSummary);
router.get('/orders/daily-trend', adminOnly, getDailyOrderTrend);

export default router;
