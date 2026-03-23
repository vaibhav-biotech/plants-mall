'use client';

import { useState, useEffect } from 'react';
import { analyticsAPI } from '@/lib/api';
import { FiTrendingUp, FiShoppingCart, FiUsers, FiDollarSign, FiPackage, FiBarChart2 } from 'react-icons/fi';
import Link from 'next/link';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  color: string;
}

function MetricCard({ title, value, icon, trend, color }: MetricCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderColor: color }}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-2">{value}</h3>
          {trend !== undefined && (
            <p className={`text-sm mt-2 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
            </p>
          )}
        </div>
        <div className="text-3xl" style={{ color }}>{icon}</div>
      </div>
    </div>
  );
}

function SimpleChart({ title, data }: { title: string; data: any[] }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">{title}</h3>
      <div className="space-y-3">
        {data.map((item, idx) => (
          <div key={idx}>
            <div className="flex justify-between mb-1">
              <span className="text-sm text-gray-600">{item.label}</span>
              <span className="text-sm font-bold text-gray-800">{item.value}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AnalyticsDashboard() {
  const [salesData, setSalesData] = useState<any>(null);
  const [productData, setProductData] = useState<any>(null);
  const [customerData, setCustomerData] = useState<any>(null);
  const [financialData, setFinancialData] = useState<any>(null);
  const [inventoryData, setInventoryData] = useState<any>(null);
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError('');

        const [sales, product, customer, financial, inventory, order] = await Promise.all([
          analyticsAPI.getSalesOverview(),
          analyticsAPI.getProductSummary(),
          analyticsAPI.getCustomerSummary(),
          analyticsAPI.getFinancialSummary(),
          analyticsAPI.getInventorySummary(),
          analyticsAPI.getOrderSummary(),
        ]);

        setSalesData(sales.data);
        setProductData(product.data);
        setCustomerData(customer.data);
        setFinancialData(financial.data);
        setInventoryData(inventory.data);
        setOrderData(order.data);
      } catch (err: any) {
        console.error('Error fetching analytics:', err);
        setError(err.response?.data?.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Helper function to calculate percentages dynamically
  const calculatePercentages = (dataArray: number[]) => {
    const total = dataArray.reduce((sum, val) => sum + val, 0);
    if (total === 0) return dataArray.map(() => 0);
    return dataArray.map((val) => Math.round((val / total) * 100));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  // Calculate percentages for order status (updated with new status names)
  const orderStatusValues = salesData ? [
    salesData.ordersByStatus?.placed || 0,
    salesData.ordersByStatus?.confirmed || 0,
    salesData.ordersByStatus?.processing || 0,
    salesData.ordersByStatus?.shipping || 0,
    salesData.ordersByStatus?.transit || 0,
    salesData.ordersByStatus?.delivered || 0,
    salesData.ordersByStatus?.cancelled || 0,
  ] : [];
  const orderStatusPercentages = calculatePercentages(orderStatusValues);

  // Calculate percentages for payment status
  const paymentStatusValues = salesData ? [
    salesData.ordersByPaymentStatus?.completed || 0,
    salesData.ordersByPaymentStatus?.pending || 0,
    salesData.ordersByPaymentStatus?.failed || 0,
  ] : [];
  const paymentStatusPercentages = calculatePercentages(paymentStatusValues);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">📊 Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">Business insights and performance metrics</p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <MetricCard
            title="Total Revenue"
            value={`₹${financialData?.totalRevenue?.toLocaleString() || 0}`}
            icon={<FiDollarSign />}
            color="#10b981"
          />
          <MetricCard
            title="Total Orders"
            value={salesData?.totalOrders || 0}
            icon={<FiShoppingCart />}
            color="#3b82f6"
          />
          <MetricCard
            title="Active Customers"
            value={customerData?.activeCustomers || 0}
            icon={<FiUsers />}
            color="#8b5cf6"
          />
          <MetricCard
            title="Average Order Value"
            value={`₹${salesData?.avgOrderValue?.toLocaleString() || 0}`}
            icon={<FiTrendingUp />}
            color="#f59e0b"
          />
          <MetricCard
            title="Total Products"
            value={productData?.activeProducts || 0}
            icon={<FiPackage />}
            color="#ec4899"
          />
          <MetricCard
            title="Stock Value"
            value={`₹${inventoryData?.totalStockValue?.toLocaleString() || 0}`}
            icon={<FiBarChart2 />}
            color="#14b8a6"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Orders by Status */}
          <SimpleChart
            title="Orders by Status"
            data={[
              { label: 'Placed', value: salesData?.ordersByStatus?.placed || 0, percentage: orderStatusPercentages[0] || 0 },
              { label: 'Confirmed', value: salesData?.ordersByStatus?.confirmed || 0, percentage: orderStatusPercentages[1] || 0 },
              { label: 'Processing', value: salesData?.ordersByStatus?.processing || 0, percentage: orderStatusPercentages[2] || 0 },
              { label: 'Shipping', value: salesData?.ordersByStatus?.shipping || 0, percentage: orderStatusPercentages[3] || 0 },
              { label: 'Transit', value: salesData?.ordersByStatus?.transit || 0, percentage: orderStatusPercentages[4] || 0 },
              { label: 'Delivered', value: salesData?.ordersByStatus?.delivered || 0, percentage: orderStatusPercentages[5] || 0 },
              { label: 'Cancelled', value: salesData?.ordersByStatus?.cancelled || 0, percentage: orderStatusPercentages[6] || 0 },
            ]}
          />

          {/* Payment Status */}
          <SimpleChart
            title="Payment Status"
            data={[
              { label: 'Completed', value: salesData?.ordersByPaymentStatus?.completed || 0, percentage: paymentStatusPercentages[0] || 0 },
              { label: 'Pending', value: salesData?.ordersByPaymentStatus?.pending || 0, percentage: paymentStatusPercentages[1] || 0 },
              { label: 'Failed', value: salesData?.ordersByPaymentStatus?.failed || 0, percentage: paymentStatusPercentages[2] || 0 },
            ]}
          />
        </div>

        {/* Detailed Info Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Customer Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">👥 Customer Insights</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Customers:</span>
                <span className="font-bold">{customerData?.totalCustomers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">New (This Month):</span>
                <span className="font-bold">{customerData?.newCustomers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Repeat Customers:</span>
                <span className="font-bold">{customerData?.repeatingCustomers}</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="text-gray-600">Avg Lifetime Value:</span>
                <span className="font-bold">₹{customerData?.avgCustomerLifetimeValue?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Financial Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">💰 Financial Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Gross Revenue:</span>
                <span className="font-bold">₹{financialData?.totalRevenue?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Discounts Given:</span>
                <span className="font-bold">-₹{financialData?.totalDiscount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="text-gray-600">Net Revenue:</span>
                <span className="font-bold text-green-600">₹{financialData?.netRevenue?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Inventory Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">📦 Inventory Status</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Stock Value:</span>
                <span className="font-bold">₹{inventoryData?.totalStockValue?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Low Stock Items:</span>
                <span className="font-bold text-orange-600">{inventoryData?.lowStockItems}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Out of Stock:</span>
                <span className="font-bold text-red-600">{inventoryData?.outOfStockItems}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation to Detailed Pages */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">View Detailed Reports</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/admin/analytics/sales"
              className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-center transition"
            >
              <div className="text-2xl mb-2">📈</div>
              <div className="font-bold text-blue-700">Sales Report</div>
            </Link>
            <Link
              href="/admin/analytics/products"
              className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-center transition"
            >
              <div className="text-2xl mb-2">📦</div>
              <div className="font-bold text-green-700">Products</div>
            </Link>
            <Link
              href="/admin/analytics/customers"
              className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-center transition"
            >
              <div className="text-2xl mb-2">👥</div>
              <div className="font-bold text-purple-700">Customers</div>
            </Link>
            <Link
              href="/admin/analytics/financial"
              className="p-4 bg-amber-50 hover:bg-amber-100 rounded-lg text-center transition"
            >
              <div className="text-2xl mb-2">💰</div>
              <div className="font-bold text-amber-700">Financial</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
