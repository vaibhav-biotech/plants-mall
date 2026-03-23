'use client';

import { useState, useEffect } from 'react';
import { analyticsAPI } from '@/lib/api';
import Link from 'next/link';

export default function ProductsAnalyticsPage() {
  const [summary, setSummary] = useState<any>(null);
  const [lowStock, setLowStock] = useState<any>(null);
  const [categoryPerf, setCategoryPerf] = useState<any>(null);
  const [topProducts, setTopProducts] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [sum, low, cat, top] = await Promise.all([
          analyticsAPI.getProductSummary(),
          analyticsAPI.getLowStockProducts(10),
          analyticsAPI.getCategoryPerformance(1),
          analyticsAPI.getTopProducts(15),
        ]);

        setSummary(sum.data);
        setLowStock(low.data);
        setCategoryPerf(cat.data);
        setTopProducts(top.data);
      } catch (err: any) {
        console.error('Error fetching product data:', err);
        setError('Failed to load product analytics');
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
          <p className="text-gray-600">Loading product analytics...</p>
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
            <h1 className="text-4xl font-bold text-gray-800">📦 Product Analytics</h1>
            <p className="text-gray-600 mt-2">Inventory and product performance metrics</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <p className="text-gray-600 text-sm">Total Products</p>
            <h3 className="text-3xl font-bold text-gray-800 mt-2">{summary?.totalProducts}</h3>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <p className="text-gray-600 text-sm">Active Products</p>
            <h3 className="text-3xl font-bold text-gray-800 mt-2">{summary?.activeProducts}</h3>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
            <p className="text-gray-600 text-sm">Low Stock Items</p>
            <h3 className="text-3xl font-bold text-orange-600 mt-2">{summary?.outOfStockProducts}</h3>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <p className="text-gray-600 text-sm">Stock Value</p>
            <h3 className="text-3xl font-bold text-purple-600 mt-2">₹{summary?.inventoryValue?.toLocaleString()}</h3>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">⚠️ Low Stock Alert</h2>
          {lowStock?.products && lowStock.products.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 border-b-2">
                  <tr>
                    <th className="px-4 py-3 text-left text-gray-700 font-bold">Product Name</th>
                    <th className="px-4 py-3 text-right text-gray-700 font-bold">Current Stock</th>
                    <th className="px-4 py-3 text-right text-gray-700 font-bold">Min Required</th>
                    <th className="px-4 py-3 text-right text-gray-700 font-bold">Stock Value</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStock.products.map((product: any, idx: number) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-700 font-medium">{product.name}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-bold ${product.currentStock === 0 ? 'text-red-600' : 'text-orange-600'}`}>
                          {product.currentStock}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700">{product.minStock}</td>
                      <td className="px-4 py-3 text-right text-gray-700">₹{product.value?.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-green-600 font-bold">✅ All products have healthy stock levels!</p>
          )}
        </div>

        {/* Category Performance */}
        <div className="bg-white rounded-lg shadow-md p-6">
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

        {/* Best Performing Products */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">🏆 Best Performing Products</h2>
          {topProducts?.products && topProducts.products.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 border-b-2">
                  <tr>
                    <th className="px-4 py-3 text-left text-gray-700 font-bold">Rank</th>
                    <th className="px-4 py-3 text-left text-gray-700 font-bold">Product Name</th>
                    <th className="px-4 py-3 text-left text-gray-700 font-bold">SKU</th>
                    <th className="px-4 py-3 text-right text-gray-700 font-bold">Qty Sold</th>
                    <th className="px-4 py-3 text-right text-gray-700 font-bold">Revenue</th>
                    <th className="px-4 py-3 text-right text-gray-700 font-bold">Avg Price</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.products.map((product: any, idx: number) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-white ${
                          idx === 0 ? 'bg-yellow-500' : 
                          idx === 1 ? 'bg-gray-400' : 
                          idx === 2 ? 'bg-orange-600' : 
                          'bg-blue-500'
                        }`}>
                          {idx + 1}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700 font-medium">{product.name}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs font-mono">{product.sku}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-bold text-blue-600">{product.quantitySold || product.unitsSold || 0}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-green-600">₹{(product.revenue || product.totalRevenue || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-gray-700">₹{(product.averagePrice || product.price || 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600">No sales data available yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
