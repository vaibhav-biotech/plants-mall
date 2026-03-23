'use client';

import { useState, useEffect } from 'react';
import { analyticsAPI } from '@/lib/api';
import Link from 'next/link';

export default function CustomersAnalyticsPage() {
  const [summary, setSummary] = useState<any>(null);
  const [topCustomers, setTopCustomers] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [sum, top] = await Promise.all([
          analyticsAPI.getCustomerSummary(),
          analyticsAPI.getTopCustomers(10),
        ]);

        setSummary(sum.data);
        setTopCustomers(top.data);
      } catch (err: any) {
        console.error('Error fetching customer data:', err);
        setError('Failed to load customer analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading customer analytics...</p>
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
            <h1 className="text-4xl font-bold text-gray-800">👥 Customer Analytics</h1>
            <p className="text-gray-600 mt-2">Customer insights and behavior metrics</p>
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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <p className="text-gray-600 text-sm">Total Customers</p>
            <h3 className="text-3xl font-bold text-gray-800 mt-2">{summary?.totalCustomers}</h3>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <p className="text-gray-600 text-sm">Active Customers</p>
            <h3 className="text-3xl font-bold text-gray-800 mt-2">{summary?.activeCustomers}</h3>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
            <p className="text-gray-600 text-sm">New (This Month)</p>
            <h3 className="text-3xl font-bold text-orange-600 mt-2">{summary?.newCustomers}</h3>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <p className="text-gray-600 text-sm">Repeat Customers</p>
            <h3 className="text-3xl font-bold text-purple-600 mt-2">{summary?.repeatingCustomers}</h3>
          </div>
        </div>

        {/* Customer Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">📊 Customer Metrics</h2>
            <div className="space-y-3">
              <div className="flex justify-between pb-2 border-b">
                <span className="text-gray-600">Total Customers</span>
                <span className="font-bold text-gray-800">{summary?.totalCustomers}</span>
              </div>
              <div className="flex justify-between pb-2 border-b">
                <span className="text-gray-600">Repeat Purchase Rate</span>
                <span className="font-bold text-blue-600">{summary?.repeatPurchaseRate}%</span>
              </div>
              <div className="flex justify-between pb-2 border-b">
                <span className="text-gray-600">Avg Lifetime Value</span>
                <span className="font-bold text-green-600">₹{summary?.avgCustomerLifetimeValue?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">👥 Customer Segments</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-gray-600">One-time Buyers</span>
                <span className="font-bold">{(summary?.totalCustomers - summary?.repeatingCustomers) || 0}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-gray-600">Repeat Buyers</span>
                <span className="font-bold text-green-600">{summary?.repeatingCustomers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Inactive Customers</span>
                <span className="font-bold text-orange-600">{summary?.totalCustomers - summary?.activeCustomers}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Customers */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">🏆 Top 10 Valuable Customers</h2>
          {topCustomers?.customers && topCustomers.customers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 border-b-2">
                  <tr>
                    <th className="px-4 py-3 text-left text-gray-700 font-bold">Customer ID</th>
                    <th className="px-4 py-3 text-left text-gray-700 font-bold">Name</th>
                    <th className="px-4 py-3 text-left text-gray-700 font-bold">Email</th>
                    <th className="px-4 py-3 text-right text-gray-700 font-bold">Total Spent</th>
                    <th className="px-4 py-3 text-right text-gray-700 font-bold">Orders</th>
                    <th className="px-4 py-3 text-right text-gray-700 font-bold">Last Order</th>
                  </tr>
                </thead>
                <tbody>
                  {topCustomers.customers.map((customer: any, idx: number) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-700 font-mono">{customer.customerId}</td>
                      <td className="px-4 py-3 text-gray-700 font-medium">{customer.name}</td>
                      <td className="px-4 py-3 text-gray-600">{customer.email}</td>
                      <td className="px-4 py-3 text-right font-bold text-green-600">₹{customer.totalSpent?.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{customer.orderCount}</td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        {customer.lastOrder ? new Date(customer.lastOrder).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600">No customer data available yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
