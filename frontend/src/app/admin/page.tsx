'use client';

import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';
import { MdPeople, MdCheckCircle, MdCancel } from 'react-icons/md';
import { customerAPI, analyticsAPI, orderAPI, productAPI } from '@/lib/api';

// Example Dashboard Page
export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [bestSellers, setBestSellers] = useState<any[]>([]);
  
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    monthlyRevenue: 0,
    totalCustomers: 0,
    activeCustomers: 0,
    inactiveCustomers: 0,
  });

  // Fetch all dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch analytics summaries in parallel
        const [
          productSummary,
          orderSummary,
          customerSummary,
          salesOverview,
          topProducts,
          customersList,
          ordersList,
        ] = await Promise.all([
          productAPI.getAll(1, 1000, '', '').catch(() => ({ data: { products: [] } })),
          analyticsAPI.getOrderSummary().catch(() => ({})),
          analyticsAPI.getCustomerSummary().catch(() => ({})),
          analyticsAPI.getSalesOverview().catch(() => ({})),
          analyticsAPI.getTopProducts(5).catch(() => ({ data: { products: [] } })),
          customerAPI.getAll(1, 5, '').catch(() => ({ customers: [] })),
          orderAPI.getAll(1, 5, '', '').catch(() => ({ data: { orders: [] } })),
        ]);

        // Process products
        const allProducts = productSummary.data?.products || [];
        setStats((prev) => ({
          ...prev,
          totalProducts: allProducts.length,
        }));

        // Process orders
        if (orderSummary && typeof orderSummary === 'object' && 'data' in orderSummary && orderSummary.data) {
          setStats((prev) => ({
            ...prev,
            totalOrders: (orderSummary as any).data.totalOrders || 0,
          }));
        }

        // Process customers
        if (customerSummary && typeof customerSummary === 'object' && 'data' in customerSummary && customerSummary.data) {
          const total = (customerSummary as any).data.totalCustomers || 0;
          const active = (customerSummary as any).data.activeCustomers || 0;
          setStats((prev) => ({
            ...prev,
            totalCustomers: total,
            activeCustomers: active,
            inactiveCustomers: total - active,
          }));
        }

        // Process sales overview
        if (salesOverview && typeof salesOverview === 'object' && 'data' in salesOverview && salesOverview.data) {
          setStats((prev) => ({
            ...prev,
            monthlyRevenue: (salesOverview as any).data.totalRevenue || 0,
          }));
        }

        // Process top products
        if (topProducts?.data?.products && topProducts.data.products.length > 0) {
          const formatted = topProducts.data.products.map((p: any) => ({
            id: p._id,
            name: p.name,
            sales: p.totalSold || 0,
            revenue: `₹${(p.totalRevenue || 0).toLocaleString('en-IN')}`,
          }));
          setBestSellers(formatted);
        } else if (allProducts.length > 0) {
          // Fallback: show top 5 products by price if no sales data
          const formatted = allProducts.slice(0, 5).map((p: any) => ({
            id: p._id,
            name: p.name,
            sales: 0,
            revenue: `₹${(p.price || 0).toLocaleString('en-IN')}`,
          }));
          setBestSellers(formatted);
        }

        // Process customers list
        if (customersList && typeof customersList === 'object' && 'customers' in customersList && customersList.customers) {
          setCustomers((customersList as any).customers);
        }

        // Process orders list
        if (ordersList && typeof ordersList === 'object' && 'data' in ordersList && (ordersList as any).data?.orders && (ordersList as any).data.orders.length > 0) {
          const formatted = (ordersList as any).data.orders.map((o: any) => ({
            id: o.orderNumber,
            customer: o.customerName,
            total: `₹${(o.totalPrice || 0).toLocaleString('en-IN')}`,
            status: o.status?.charAt(0).toUpperCase() + o.status?.slice(1) || 'Unknown',
            date: new Date(o.createdAt).toLocaleDateString('en-IN'),
          }));
          setRecentOrders(formatted);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Format stats data for display
  const statsDisplay = [
    { label: 'Total Products', value: stats.totalProducts, change: '+12%', color: 'bg-blue-50 text-blue-700' },
    { label: 'Total Orders', value: stats.totalOrders, change: '+8%', color: 'bg-green-50 text-green-700' },
    { label: 'Revenue (Month)', value: `₹${stats.monthlyRevenue.toLocaleString('en-IN')}`, change: '+15%', color: 'bg-purple-50 text-purple-700' },
    { label: 'Registered Customers', value: stats.totalCustomers, change: `${stats.activeCustomers} Active`, color: 'bg-rose-50 text-rose-700' },
  ];

  return (
    <div className="space-y-6">
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading dashboard data...</p>
          </div>
        </div>
      )}

      {!loading && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statsDisplay.map((stat, idx) => (
          <div
            key={idx}
            className={`${stat.color} rounded-lg p-6 shadow-sm border border-opacity-20`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium opacity-75">{stat.label}</p>
                <p className="text-3xl font-bold mt-2">{stat.value}</p>
              </div>
              <span className="text-xs font-semibold bg-white bg-opacity-30 px-2 py-1 rounded">
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Customer Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-lg p-6 shadow-sm border border-rose-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-rose-700 opacity-75">Total Customers</p>
              <p className="text-3xl font-bold text-rose-900 mt-2">{stats.totalCustomers}</p>
            </div>
            <MdPeople className="text-rose-400 text-4xl opacity-30" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 shadow-sm border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700 opacity-75">Active Customers</p>
              <p className="text-3xl font-bold text-green-900 mt-2">{stats.activeCustomers}</p>
            </div>
            <MdCheckCircle className="text-green-400 text-4xl opacity-30" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 shadow-sm border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-700 opacity-75">Inactive Customers</p>
              <p className="text-3xl font-bold text-orange-900 mt-2">{stats.inactiveCustomers}</p>
            </div>
            <MdCancel className="text-orange-400 text-4xl opacity-30" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Recent Orders</h3>
            <a href="/admin/orders" className="text-green-600 text-sm font-medium hover:underline">
              View All
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Order ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Customer</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Total</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-medium text-green-600">{order.id}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{order.customer}</td>
                    <td className="py-3 px-4 text-sm font-semibold text-gray-700">{order.total}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-medium ${
                          order.status === 'Delivered'
                            ? 'bg-green-100 text-green-700'
                            : order.status === 'Shipped'
                            ? 'bg-blue-100 text-blue-700'
                            : order.status === 'Processing'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{order.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Best Sellers */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Best Sellers</h3>
          </div>
          <div className="space-y-4">
            {bestSellers.map((product, idx) => (
              <div key={idx} className="flex items-center justify-between pb-4 border-b border-gray-100 last:border-0">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{product.name}</p>
                  <p className="text-xs text-gray-500">{product.sales} sales</p>
                </div>
                <p className="text-sm font-semibold text-green-600">{product.revenue}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Registered Customers */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <MdPeople className="text-rose-600" />
            Recent Registrations
          </h3>
          <a href="/admin/customers" className="text-green-600 text-sm font-medium hover:underline">
            View All Customers
          </a>
        </div>
        
        {!loading && customers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Customer ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Joined</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer: any, idx: number) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className="text-xs font-mono font-bold bg-green-100 text-green-700 px-2 py-1 rounded">
                        {customer.customerId || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-800">{customer.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{customer.email}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(customer.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-medium ${
                          customer.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {customer.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex justify-center items-center py-8">
            <p className="text-gray-500">No customers registered yet</p>
          </div>
        )}
      </div>
        </>
      )}
    </div>
  );
}
