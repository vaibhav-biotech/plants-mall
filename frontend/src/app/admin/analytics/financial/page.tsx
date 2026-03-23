'use client';

import { useState, useEffect } from 'react';
import { analyticsAPI } from '@/lib/api';
import Link from 'next/link';

export default function FinancialAnalyticsPage() {
  const [financial, setFinancial] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await analyticsAPI.getFinancialSummary();
        setFinancial(data.data);
      } catch (err: any) {
        console.error('Error fetching financial data:', err);
        setError('Failed to load financial analytics');
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
          <p className="text-gray-600">Loading financial analytics...</p>
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
            <h1 className="text-4xl font-bold text-gray-800">💰 Financial Analytics</h1>
            <p className="text-gray-600 mt-2">Revenue, payment status, and financial metrics</p>
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

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <p className="text-gray-600 text-sm">Total Revenue</p>
            <h3 className="text-3xl font-bold text-green-600 mt-2">₹{financial?.totalRevenue?.toLocaleString()}</h3>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
            <p className="text-gray-600 text-sm">Total Discount</p>
            <h3 className="text-3xl font-bold text-orange-600 mt-2">-₹{financial?.totalDiscount?.toLocaleString()}</h3>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <p className="text-gray-600 text-sm">Net Revenue</p>
            <h3 className="text-3xl font-bold text-blue-600 mt-2">₹{financial?.netRevenue?.toLocaleString()}</h3>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <p className="text-gray-600 text-sm">Avg Order Value</p>
            <h3 className="text-3xl font-bold text-purple-600 mt-2">₹{financial?.avgOrderValue?.toLocaleString()}</h3>
          </div>
        </div>

        {/* Financial Summary Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 Financial Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div>
              <h3 className="text-lg font-bold text-gray-700 mb-4">Revenue Breakdown</h3>
              <div className="space-y-3 border-b pb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Gross Revenue</span>
                  <span className="font-bold text-gray-800">₹{financial?.totalRevenue?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Discounts</span>
                  <span className="font-bold text-orange-600">-₹{financial?.totalDiscount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-3 border-t">
                  <span className="text-gray-700 font-bold">Net Revenue</span>
                  <span className="font-bold text-green-600">₹{financial?.netRevenue?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div>
              <h3 className="text-lg font-bold text-gray-700 mb-4">Other Metrics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Order Value</span>
                  <span className="font-bold text-gray-800">₹{financial?.avgOrderValue?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Discount Rate</span>
                  <span className="font-bold text-orange-600">
                    {financial?.totalRevenue > 0 
                      ? Math.round((financial.totalDiscount / financial.totalRevenue) * 100)
                      : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Status Breakdown */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">💳 Payment Status Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Completed */}
            <div className="p-6 bg-green-50 rounded-lg border-l-4 border-green-500">
              <p className="text-gray-600 text-sm font-bold">COMPLETED ✅</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{financial?.paymentStatus?.completed?.count}</p>
              <p className="text-gray-600 text-sm mt-2">₹{financial?.paymentStatus?.completed?.amount?.toLocaleString()}</p>
              <div className="mt-3 pt-3 border-t">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{
                      width: `${
                        financial?.paymentStatus?.completed?.count > 0
                          ? (financial.paymentStatus.completed.count /
                              (financial.paymentStatus.completed.count +
                                financial.paymentStatus.pending.count +
                                financial.paymentStatus.failed.count +
                                financial.paymentStatus.refunded.count)) *
                            100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Pending */}
            <div className="p-6 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
              <p className="text-gray-600 text-sm font-bold">PENDING ⏳</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{financial?.paymentStatus?.pending?.count}</p>
              <p className="text-gray-600 text-sm mt-2">₹{financial?.paymentStatus?.pending?.amount?.toLocaleString()}</p>
            </div>

            {/* Failed */}
            <div className="p-6 bg-red-50 rounded-lg border-l-4 border-red-500">
              <p className="text-gray-600 text-sm font-bold">FAILED ❌</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{financial?.paymentStatus?.failed?.count}</p>
              <p className="text-gray-600 text-sm mt-2">₹{financial?.paymentStatus?.failed?.amount?.toLocaleString()}</p>
            </div>

            {/* Refunded */}
            <div className="p-6 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <p className="text-gray-600 text-sm font-bold">REFUNDED 🔄</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{financial?.paymentStatus?.refunded?.count}</p>
              <p className="text-gray-600 text-sm mt-2">₹{financial?.paymentStatus?.refunded?.amount?.toLocaleString()}</p>
            </div>
          </div>

          {/* Payment Success Rate */}
          <div className="mt-8 p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Payment Collection Status</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 text-sm">Success Rate</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {financial?.paymentStatus?.completed?.count > 0
                    ? Math.round(
                        (financial.paymentStatus.completed.count /
                          (financial.paymentStatus.completed.count +
                            financial.paymentStatus.pending.count +
                            financial.paymentStatus.failed.count +
                            financial.paymentStatus.refunded.count)) *
                          100
                      )
                    : 0}%
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Pending Collection</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">
                  ₹{financial?.paymentStatus?.pending?.amount?.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
