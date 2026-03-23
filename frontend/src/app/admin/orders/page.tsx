'use client';

import { useEffect, useState } from 'react';
import { orderAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiEye, FiTrash2 } from 'react-icons/fi';

interface Order {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalPrice: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'failed';
  createdAt: string;
  items: any[];
  isGift?: boolean;
  giftCharge?: number;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchOrders();
  }, [page, status, search]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getAll(page, 10, status, search);
      setOrders(response.data.orders || []);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;

    try {
      await orderAPI.delete(id);
      setOrders(orders.filter(o => o._id !== id));
    } catch (err) {
      console.error('Failed to delete order:', err);
      setError('Failed to delete order');
    }
  };



  const getStatusColor = (status: string) => {
    const colors: any = {
      placed: 'bg-gray-100 text-gray-700',
      confirmed: 'bg-blue-100 text-blue-700',
      processing: 'bg-cyan-100 text-cyan-700',
      shipping: 'bg-purple-100 text-purple-700',
      transit: 'bg-indigo-100 text-indigo-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getPaymentStatusColor = (status: string) => {
    const colors: any = {
      pending: 'bg-yellow-100 text-yellow-700',
      completed: 'bg-green-100 text-green-700',
      failed: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
        <p className="text-gray-600 mt-1">View and manage all customer orders</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <input
            type="text"
            placeholder="Search by order # or customer..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">All Statuses</option>
            <option value="placed">Placed</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipping">Shipping</option>
            <option value="transit">Transit</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Clear Filters */}
          {(search || status) && (
            <button
              onClick={() => {
                setSearch('');
                setStatus('');
                setPage(1);
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 mb-4">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Order #</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Customer</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Items</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Gift</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Order Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Payment</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{order.orderNumber}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="text-gray-900 font-medium">{order.customerName}</div>
                      <div className="text-xs text-gray-500">{order.customerEmail}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      ₹{order.totalPrice?.toLocaleString('en-IN') || '0'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {order.isGift ? (
                        <div className="flex items-center gap-1">
                          <span className="text-lg">🎁</span>
                          <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded font-medium">
                            Gift +₹{order.giftCharge || 99}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                        {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/orders/${order._id}`}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="View Details"
                        >
                          <FiEye size={18} />
                        </Link>
                        <button
                          onClick={() => handleDelete(order._id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
