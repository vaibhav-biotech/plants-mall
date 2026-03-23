import axios from 'axios';
import { useAuthStore } from './authStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const PORT_SCAN_RANGE = { start: 5000, end: 5020 };

let resolvedApiUrl: string | null = null;
let apiUrlPromise: Promise<string> | null = null;

const probeApiUrl = async (): Promise<string> => {
  if (typeof window === 'undefined') {
    return API_URL;
  }

  const protocol = window.location.protocol;
  const host = window.location.hostname;

  for (let port = PORT_SCAN_RANGE.start; port <= PORT_SCAN_RANGE.end; port += 1) {
    const baseUrl = `${protocol}//${host}:${port}/api`;
    try {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 500);
      
      const response = await fetch(`${baseUrl}/health`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      window.clearTimeout(timeoutId);

      if (response.ok || response.status === 200) {
        console.log(`✅ Found backend at ${baseUrl}`);
        return baseUrl;
      }
    } catch (err: any) {
      // Port not responding, try next one
      console.debug(`Port ${port}: ${err.message}`);
    }
  }

  console.warn(`⚠️ Could not find backend, using default: ${API_URL}`);
  return API_URL;
};

const getApiUrl = async (): Promise<string> => {
  if (resolvedApiUrl) {
    return resolvedApiUrl;
  }

  // Use existing promise if already probing
  if (apiUrlPromise) {
    return apiUrlPromise;
  }

  apiUrlPromise = probeApiUrl().then((url) => {
    resolvedApiUrl = url;
    return url;
  });

  return apiUrlPromise;
};

// Pre-resolve API URL on initialization
let apiUrlReady = getApiUrl();

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Update baseURL once resolved
apiUrlReady.then((url) => {
  api.defaults.baseURL = url;
});

// Add token to requests
api.interceptors.request.use((config) => {
  // Get token from Zustand store (works in browser)
  if (typeof window !== 'undefined') {
    const state = useAuthStore.getState();
    const token = state.token;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.debug('✅ Token added to request:', token.substring(0, 20) + '...');
    } else {
      console.debug('⚠️ No token found in store');
    }
  }
  return config;
});

export const productAPI = {
  getAll: (page = 1, limit = 12, category = '', search = '') =>
    api.get(`/products?page=${page}&limit=${limit}&category=${category}&search=${search}`),
  getById: (id: string) => api.get(`/products/${id}`),
  create: (data: any) => api.post('/products', data),
  update: (id: string, data: any) => api.put(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
  getNewArrivals: (limit = 6) => api.get(`/products/collections/new-arrivals?limit=${limit}`),
  getOfficeFriendly: (limit = 6) => api.get(`/products/collections/office-friendly?limit=${limit}`),
  getGiftProducts: (limit = 6) => api.get(`/products/collections/gifts?limit=${limit}`),
};

export const categoryAPI = {
  getAll: (search = '') => api.get(`/categories?search=${search}`),
  getById: (id: string) => api.get(`/categories/${id}`),
  create: (data: any) => api.post('/categories', data),
  update: (id: string, data: any) => api.put(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
  reorder: (categories: any[]) => api.post('/categories/reorder', { categories }),
};

export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) => api.post('/auth/reset-password', { token, password }),
};

export const customerAPI = {
  getProfile: () => api.get('/customers/profile'),
  updateProfile: (data: any) => api.put('/customers/profile', data),
  getAll: (page = 1, limit = 10, search = '') => api.get(`/customers?page=${page}&limit=${limit}&search=${search}`),
  getById: (id: string) => api.get(`/customers/${id}`),
  updateStatus: (id: string, isActive: boolean) => api.patch(`/customers/${id}/status`, { isActive }),
  delete: (id: string) => api.delete(`/customers/${id}`),
};

export const offerAPI = {
  getAll: () => api.get('/offers'),
  getActive: () => api.get('/offers/active'),
  getById: (id: string) => api.get(`/offers/${id}`),
  create: (data: any) => api.post('/offers', data),
  update: (id: string, data: any) => api.put(`/offers/${id}`, data),
  delete: (id: string) => api.delete(`/offers/${id}`),
  toggle: (id: string) => api.post(`/offers/${id}/toggle`),
  reorder: (offers: any[]) => api.post('/offers/reorder', { offers }),
};

export const orderAPI = {
  // For customers - get their own orders
  getMyOrders: (page = 1, limit = 10, status = '', search = '') =>
    api.get(`/orders/my-orders?page=${page}&limit=${limit}&status=${status}&search=${search}`),
  // For admin - get all orders
  getAll: (page = 1, limit = 10, status = '', search = '') =>
    api.get(`/orders?page=${page}&limit=${limit}&status=${status}&search=${search}`),
  getById: (id: string) => api.get(`/orders/${id}`),
  create: (data: any) => api.post('/orders', data),
  update: (id: string, data: any) => api.put(`/orders/${id}`, data),
  updateStatus: (id: string, status: string) => api.patch(`/orders/${id}/status`, { status }),
  updatePaymentStatus: (id: string, paymentStatus: string) => api.patch(`/orders/${id}/payment-status`, { paymentStatus }),
  confirm: (id: string) => api.post(`/orders/${id}/confirm`),
  cancel: (id: string) => api.post(`/orders/${id}/cancel`),
  delete: (id: string) => api.delete(`/orders/${id}`),
  getStats: () => api.get('/orders/stats'),
  getInvoice: (orderId: string) => api.get(`/orders/${orderId}/invoice`),
};

export const addressAPI = {
  create: (data: any) => api.post('/addresses', data),
  getAll: () => api.get('/addresses'),
  update: (id: string, data: any) => api.put(`/addresses/${id}`, data),
  delete: (id: string) => api.delete(`/addresses/${id}`),
  setDefault: (id: string) => api.patch(`/addresses/${id}/default`),
};

export const wishlistAPI = {
  add: (productId: string) => api.post('/wishlist', { productId }),
  getAll: () => api.get('/wishlist'),
  remove: (productId: string) => api.delete(`/wishlist/${productId}`),
  check: (productId: string) => api.get(`/wishlist/check/${productId}`),
};

export const analyticsAPI = {
  // Sales
  getSalesOverview: (startDate?: string, endDate?: string) =>
    api.get(`/analytics/sales/overview?${startDate ? `startDate=${startDate}` : ''}${endDate ? `&endDate=${endDate}` : ''}`),
  getSalesTrend: (months = 6) => api.get(`/analytics/sales/trend?months=${months}`),
  getTopProducts: (limit = 10, startDate?: string, endDate?: string) =>
    api.get(`/analytics/sales/top-products?limit=${limit}${startDate ? `&startDate=${startDate}` : ''}${endDate ? `&endDate=${endDate}` : ''}`),
  
  // Products
  getProductSummary: () => api.get('/analytics/products/summary'),
  getLowStockProducts: (threshold = 10) => api.get(`/analytics/products/low-stock?threshold=${threshold}`),
  getCategoryPerformance: (months = 1) => api.get(`/analytics/products/category-performance?months=${months}`),
  
  // Customers
  getCustomerSummary: () => api.get('/analytics/customers/summary'),
  getTopCustomers: (limit = 10) => api.get(`/analytics/customers/top-customers?limit=${limit}`),
  
  // Financial
  getFinancialSummary: (startDate?: string, endDate?: string) =>
    api.get(`/analytics/financial/summary?${startDate ? `startDate=${startDate}` : ''}${endDate ? `&endDate=${endDate}` : ''}`),
  
  // Inventory
  getInventorySummary: () => api.get('/analytics/inventory/summary'),
  
  // Orders
  getOrderSummary: () => api.get('/analytics/orders/summary'),
  getDailyOrderTrend: (days = 30) => api.get(`/analytics/orders/daily-trend?days=${days}`),
};

export const importAPI = {
  uploadCSV: (formData: FormData) =>
    api.post('/import/import-csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  getImportStatus: () => api.get('/import/import-status'),
};
export const bannerAPI = {
  getAll: () => api.get('/banners'),
  getById: (id: string) => api.get(`/banners/${id}`),
  create: (formData: FormData) =>
    api.post('/banners', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  update: (id: string, formData: FormData) =>
    api.put(`/banners/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  delete: (id: string) => api.delete(`/banners/${id}`),
  reorder: (bannerIds: string[]) =>
    api.post('/banners/reorder', { bannerIds }),
};

export const reviewAPI = {
  getProductReviews: (productId: string, page = 1, limit = 10, sort = 'recent') =>
    api.get(`/reviews/product/${productId}?page=${page}&limit=${limit}&sort=${sort}`),
  createReview: (data: any) => api.post('/reviews', data),
  updateReview: (reviewId: string, data: any) => api.put(`/reviews/${reviewId}`, data),
  deleteReview: (reviewId: string) => api.delete(`/reviews/${reviewId}`),
  getUserReviewableProducts: () => api.get('/reviews/my/reviewable'),
};