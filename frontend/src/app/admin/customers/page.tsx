'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { customerAPI } from '../../../lib/api';
import { FiSearch, FiTrash2, FiEye, FiUser, FiMail, FiCalendar, FiToggleLeft, FiToggleRight, FiAlertCircle } from 'react-icons/fi';

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, [page, search, limit]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await customerAPI.getAll(page, limit, search);
      setCustomers(response.data.customers);
      setTotalPages(response.data.pagination.pages);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load customers');
      if (err.response?.status === 401) {
        router.push('/auth/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPage(1);
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await customerAPI.updateStatus(id, !currentStatus);
      setSuccess(`Customer status updated`);
      setTimeout(() => setSuccess(''), 3000);
      fetchCustomers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;

    try {
      await customerAPI.delete(id);
      setSuccess('Customer deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
      fetchCustomers();
      setShowModal(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete customer');
    }
  };

  const handleViewDetails = async (id: string) => {
    try {
      const response = await customerAPI.getById(id);
      setSelectedCustomer(response.data.customer);
      setShowModal(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load customer details');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
        <p className="text-gray-600 mt-1">Manage and view all registered customers</p>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <FiAlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-600 text-sm">
          ✓ {success}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Customers</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{customers.length}</p>
            </div>
            <FiUser className="text-green-600 text-4xl opacity-20" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Active</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {customers.filter(c => c.isActive).length}
              </p>
            </div>
            <FiToggleRight className="text-blue-600 text-4xl opacity-20" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-red-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Inactive</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {customers.filter(c => !c.isActive).length}
              </p>
            </div>
            <FiToggleLeft className="text-red-600 text-4xl opacity-20" />
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <form onSubmit={handleSearch} className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 transition"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
          >
            Search
          </button>
        </div>
      </form>

      {/* Items Per Page */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <label className="flex items-center gap-2 text-sm">
          <span className="font-medium text-gray-700">Show:</span>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(parseInt(e.target.value));
              setPage(1);
            }}
            className="border border-gray-300 rounded px-3 py-1 focus:outline-none focus:border-green-500"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={25}>25</option>
          </select>
          <span className="text-gray-600">items per page</span>
        </label>
      </div>

      {/* Customers Table */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-sm p-6 text-center text-gray-600">
          Loading customers...
        </div>
      ) : customers.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-6 text-center text-gray-600">
          No customers found
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Customer ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Joined</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {customers.map((customer) => (
                  <tr key={customer._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="font-mono font-bold text-green-600 bg-green-50 px-3 py-1 rounded inline-block">
                        {customer.customerId || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <p className="font-medium text-gray-900">{customer.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{customer.email}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm flex items-center gap-2">
                      <FiCalendar size={16} className="text-gray-400" />
                      {new Date(customer.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          customer.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {customer.isActive ? '✓ Active' : '✗ Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleViewDetails(customer._id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                          title="View Details"
                        >
                          <FiEye size={18} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(customer._id, customer.isActive)}
                          className={`p-2 rounded transition ${
                            customer.isActive
                              ? 'text-yellow-600 hover:bg-yellow-50'
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={customer.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {customer.isActive ? <FiToggleRight size={18} /> : <FiToggleLeft size={18} />}
                        </button>
                        <button
                          onClick={() => handleDelete(customer._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition"
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
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition"
          >
            Next
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Customer Details</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 font-medium">Customer ID</label>
                <p className="text-gray-900 font-mono font-bold text-lg bg-green-50 px-2 py-1 rounded">
                  {selectedCustomer.customerId || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600 font-medium">Name</label>
                <p className="text-gray-900 font-semibold">{selectedCustomer.name}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600 font-medium">Email</label>
                <p className="text-gray-900 font-semibold break-all">{selectedCustomer.email}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600 font-medium">Status</label>
                <p className={`font-semibold ${selectedCustomer.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {selectedCustomer.isActive ? 'Active' : 'Inactive'}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600 font-medium">Joined</label>
                <p className="text-gray-900">
                  {new Date(selectedCustomer.createdAt).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Close
              </button>
              <button
                onClick={() => handleDelete(selectedCustomer._id)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
