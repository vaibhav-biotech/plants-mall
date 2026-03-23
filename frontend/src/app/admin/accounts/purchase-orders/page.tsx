'use client';

import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiDownload, FiFilter } from 'react-icons/fi';
import Link from 'next/link';

interface PurchaseOrder {
  _id: string;
  poNumber: string;
  supplier: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  status: 'draft' | 'pending' | 'confirmed' | 'received' | 'cancelled';
  totalAmount: number;
  orderDate: string;
  expectedDelivery: string;
  notes: string;
}

export default function PurchaseOrdersPage() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - will connect to API later
  useEffect(() => {
    setLoading(false);
    setPurchaseOrders([]);
  }, []);

  const mockData: PurchaseOrder[] = [
    {
      _id: '1',
      poNumber: 'PO-2026-001',
      supplier: 'Green Nursery Co.',
      items: [
        { productId: '1', productName: 'Monstera Deliciosa', quantity: 50, unitPrice: 200, total: 10000 },
        { productId: '2', productName: 'Peace Lily', quantity: 75, unitPrice: 150, total: 11250 },
      ],
      status: 'confirmed',
      totalAmount: 21250,
      orderDate: '2026-03-01',
      expectedDelivery: '2026-03-15',
      notes: 'Standard order',
    },
    {
      _id: '2',
      poNumber: 'PO-2026-002',
      supplier: 'Premium Plants Ltd.',
      items: [
        { productId: '3', productName: 'Snake Plant', quantity: 100, unitPrice: 120, total: 12000 },
      ],
      status: 'pending',
      totalAmount: 12000,
      orderDate: '2026-03-10',
      expectedDelivery: '2026-03-25',
      notes: 'High priority',
    },
  ];

  const filteredOrders = mockData.filter((order) => {
    const matchesStatus = filter === 'all' || order.status === filter;
    const matchesSearch = order.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    received: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">🛒 Purchase Orders</h1>
            <p className="text-gray-600 mt-2">Manage supplier purchase orders and track deliveries</p>
          </div>
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition">
            <FiPlus size={20} />
            New PO
          </button>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Search PO number or supplier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <div className="flex gap-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="received">Received</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* POs Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading purchase orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-600 text-lg">No purchase orders found</p>
              <p className="text-gray-500 text-sm mt-2">Create a new purchase order to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b-2 border-gray-300">
                  <tr>
                    <th className="px-6 py-4 text-left text-gray-700 font-bold">PO Number</th>
                    <th className="px-6 py-4 text-left text-gray-700 font-bold">Supplier</th>
                    <th className="px-6 py-4 text-center text-gray-700 font-bold">Items</th>
                    <th className="px-6 py-4 text-right text-gray-700 font-bold">Amount</th>
                    <th className="px-6 py-4 text-left text-gray-700 font-bold">Status</th>
                    <th className="px-6 py-4 text-left text-gray-700 font-bold">Delivery Date</th>
                    <th className="px-6 py-4 text-center text-gray-700 font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order._id} className="border-b hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-gray-900 font-semibold">{order.poNumber}</td>
                      <td className="px-6 py-4 text-gray-700">{order.supplier}</td>
                      <td className="px-6 py-4 text-center text-gray-700">
                        <span className="inline-block bg-gray-100 px-3 py-1 rounded-full text-sm">
                          {order.items.length} items
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-gray-900 font-bold">₹{order.totalAmount.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${statusColors[order.status]}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700 text-sm">{order.expectedDelivery}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-3">
                          <button
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="View"
                          >
                            <FiEye size={18} />
                          </button>
                          <button
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                            title="Edit"
                          >
                            <FiEdit2 size={18} />
                          </button>
                          <button
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                            title="Download"
                          >
                            <FiDownload size={18} />
                          </button>
                          <button
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
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

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <p className="text-gray-600 text-sm">Total POs</p>
            <h3 className="text-3xl font-bold text-gray-800 mt-2">{filteredOrders.length}</h3>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
            <p className="text-gray-600 text-sm">Pending</p>
            <h3 className="text-3xl font-bold text-yellow-600 mt-2">
              {filteredOrders.filter((o) => o.status === 'pending').length}
            </h3>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <p className="text-gray-600 text-sm">Total Value</p>
            <h3 className="text-3xl font-bold text-green-600 mt-2">
              ₹{filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0).toLocaleString()}
            </h3>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <p className="text-gray-600 text-sm">Received</p>
            <h3 className="text-3xl font-bold text-purple-600 mt-2">
              {filteredOrders.filter((o) => o.status === 'received').length}
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}
