'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import MetricCard from '@/components/MetricCard';
import SimpleChart from '@/components/SimpleChart';
import { FiShoppingBag, FiDollarSign, FiUsers, FiTrendingUp } from 'react-icons/fi';

interface AnalyticsData {
  sales: {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    trend: { date: string; revenue: number; orders: number }[];
  };
  products: {
    topProducts: { name: string; sales: number; revenue: number }[];
  };
  customers: {
    activeCustomers: number;
    totalRevenue: number;
    repeatRate: number;
  };
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [salesRes, productsRes, customersRes] = await Promise.all([
          fetch('/api/analytics/sales/overview'),
          fetch('/api/analytics/products/summary?limit=5'),
          fetch('/api/analytics/customers/summary'),
        ]);

        const salesData = await salesRes.json();
        const productsData = await productsRes.json();
        const customersData = await customersRes.json();

        setData({
          sales: salesData.data || salesData,
          products: productsData.data || productsData,
          customers: customersData.data || customersData,
        });
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const revenueTrend = data?.sales.trend?.slice(-6) || [];
  const topProductsData = data?.products.topProducts?.slice(0, 5) || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Business performance overview</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/analytics/sales"
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Sales Report
          </Link>
          <Link
            href="/admin/analytics/products"
            className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
          >
            Products
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Orders"
          value={data?.sales.totalOrders || 0}
          icon={<FiShoppingBag />}
          color="blue"
          loading={loading}
          trend={8}
        />
        <MetricCard
          label="Total Revenue"
          value={`₹${(data?.sales.totalRevenue || 0).toLocaleString('en-IN')}`}
          icon={<FiDollarSign />}
          color="green"
          loading={loading}
          trend={12}
        />
        <MetricCard
          label="Active Customers"
          value={data?.customers.activeCustomers || 0}
          icon={<FiUsers />}
          color="purple"
          loading={loading}
          trend={6}
        />
        <MetricCard
          label="Avg Order Value"
          value={`₹${(data?.sales.averageOrderValue || 0).toLocaleString('en-IN')}`}
          icon={<FiTrendingUp />}
          color="orange"
          loading={loading}
          trend={5}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleChart
          type="line"
          data={revenueTrend}
          dataKey="revenue"
          xAxisKey="date"
          title="Revenue Trend (Last 6 Months)"
          height={300}
          loading={loading}
        />
        <SimpleChart
          type="bar"
          data={topProductsData}
          dataKey="revenue"
          xAxisKey="name"
          title="Top 5 Products by Revenue"
          height={300}
          loading={loading}
        />
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/admin/analytics/sales"
          className="p-6 rounded-lg border border-gray-200 bg-white hover:shadow-lg transition"
        >
          <h3 className="text-lg font-semibold text-gray-900">Sales Analytics</h3>
          <p className="text-gray-600 mt-1">Orders, revenue, and trends</p>
        </Link>
        <Link
          href="/admin/analytics/products"
          className="p-6 rounded-lg border border-gray-200 bg-white hover:shadow-lg transition"
        >
          <h3 className="text-lg font-semibold text-gray-900">Product Performance</h3>
          <p className="text-gray-600 mt-1">Best sellers and inventory</p>
        </Link>
        <Link
          href="/admin/analytics/customers"
          className="p-6 rounded-lg border border-gray-200 bg-white hover:shadow-lg transition"
        >
          <h3 className="text-lg font-semibold text-gray-900">Customer Insights</h3>
          <p className="text-gray-600 mt-1">Top customers and retention</p>
        </Link>
      </div>
    </div>
  );
}
