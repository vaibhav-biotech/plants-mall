'use client';

import { useState, useEffect } from 'react';
import { analyticsAPI } from '@/lib/api';
import { FiTrendingUp, FiArrowUp, FiDownload } from 'react-icons/fi';
import Link from 'next/link';

export default function SalesAnalyticsPage() {
  const [overview, setOverview] = useState<any>(null);
  const [trend, setTrend] = useState<any>(null);
  const [topProducts, setTopProducts] = useState<any>(null);
  const [categoryPerf, setCategoryPerf] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [months, setMonths] = useState(6);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [over, tr, top, cat] = await Promise.all([
          analyticsAPI.getSalesOverview(),
          analyticsAPI.getSalesTrend(months),
          analyticsAPI.getTopProducts(10),
          analyticsAPI.getCategoryPerformance(1),
        ]);

        setOverview(over.data);
        setTrend(tr.data);
        setTopProducts(top.data);
        setCategoryPerf(cat.data);
      } catch (err: any) {
        console.error('Error fetching sales data:', err);
        setError('Failed to load sales analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [months]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading sales analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">📈 Sales Analytics</h1>
            <p className="text-gray-600 mt-2">Revenue, orders, and customer metrics</p>
          </div>
          <Link href="/admin/analytics" className="text-blue-600 hover:text-blue-800">
            ← Back to Dashboard
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <p className="text-gray-600 text-sm">Total Orders</p>
            <h3 className="text-3xl font-bold text-gray-800 mt-2">{overview?.totalOrders}</h3>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <p className="text-gray-600 text-sm">Total Revenue</p>
            <h3 className="text-3xl font-bold text-gray-800 mt-2">₹{overview?.totalRevenue?.toLocaleString()}</h3>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <p className="text-gray-600 text-sm">Avg Order Value</p>
            <h3 className="text-3xl font-bold text-gray-800 mt-2">₹{overview?.avgOrderValue?.toLocaleString()}</h3>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
            <p className="text-gray-600 text-sm">Payment Success</p>
            <h3 className="text-3xl font-bold text-gray-800 mt-2">
              {overview?.ordersByPaymentStatus?.completed 
                ? Math.round((overview.ordersByPaymentStatus.completed / overview.totalOrders) * 100)
                : 0}%
            </h3>
          </div>
        </div>

        {/* Trend & Time Period Selection */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Revenue Trend</h2>
            <select
              value={months}
              onChange={(e) => setMonths(parseInt(e.target.value))}
              className="px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={3}>Last 3 Months</option>
              <option value={6}>Last 6 Months</option>
              <option value={12}>Last 12 Months</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b-2">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-700 font-bold">Month</th>
                  <th className="px-4 py-3 text-right text-gray-700 font-bold">Orders</th>
                  <th className="px-4 py-3 text-right text-gray-700 font-bold">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {trend?.trend?.map((item: any, idx: number) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700">{item.month}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{item.orders}</td>
                    <td className="px-4 py-3 text-right font-bold text-green-600">₹{item.revenue?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">🏆 Top 10 Products</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b-2">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-700 font-bold">Product Name</th>
                  <th className="px-4 py-3 text-right text-gray-700 font-bold">Units Sold</th>
                  <th className="px-4 py-3 text-right text-gray-700 font-bold">Revenue</th>
                  <th className="px-4 py-3 text-right text-gray-700 font-bold">Discount</th>
                </tr>
              </thead>
              <tbody>
                {topProducts?.products?.map((product: any, idx: number) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700 font-medium">{product.name}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{product.unitsSold}</td>
                    <td className="px-4 py-3 text-right font-bold text-green-600">₹{product.revenue?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-orange-600">-₹{product.discount?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Category Performance */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">📂 Category Performance</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b-2">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-700 font-bold">Category</th>
                  <th className="px-4 py-3 text-right text-gray-700 font-bold">Products</th>
                  <th className="px-4 py-3 text-right text-gray-700 font-bold">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {categoryPerf?.categories?.map((cat: any, idx: number) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700 font-medium">{cat.name}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{cat.productCount}</td>
                    <td className="px-4 py-3 text-right font-bold text-green-600">₹{cat.revenue?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Status Breakdown */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 Order Status Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-gray-600 text-sm">Pending</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{overview?.ordersByStatus?.pending}</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-gray-600 text-sm">Confirmed</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{overview?.ordersByStatus?.confirmed}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-gray-600 text-sm">Processing</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{overview?.ordersByStatus?.processing}</p>
            </div>
            <div className="p-4 bg-indigo-50 rounded-lg">
              <p className="text-gray-600 text-sm">Shipped</p>
              <p className="text-3xl font-bold text-indigo-600 mt-2">{overview?.ordersByStatus?.shipped}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-gray-600 text-sm">Delivered</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{overview?.ordersByStatus?.delivered}</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-gray-600 text-sm">Cancelled</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{overview?.ordersByStatus?.cancelled}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
