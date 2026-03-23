'use client';

import { useState, useEffect } from 'react';
import { FiDownload, FiEye, FiFilter, FiPrinter } from 'react-icons/fi';

interface Invoice {
  _id: string;
  invoiceNumber: string;
  type: 'customer' | 'vendor';
  customerName: string;
  amount: number;
  status: 'draft' | 'issued' | 'paid' | 'overdue' | 'cancelled';
  issueDate: string;
  dueDate: string;
  items: number;
  paidAmount: number;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setLoading(false);
    setInvoices([]);
  }, []);

  const mockData: Invoice[] = [
    {
      _id: '1',
      invoiceNumber: 'INV-2026-001',
      type: 'customer',
      customerName: 'Rajesh Kumar',
      amount: 5420,
      status: 'paid',
      issueDate: '2026-03-01',
      dueDate: '2026-03-08',
      items: 3,
      paidAmount: 5420,
    },
    {
      _id: '2',
      invoiceNumber: 'INV-2026-002',
      type: 'customer',
      customerName: 'Priya Singh',
      amount: 12850,
      status: 'issued',
      issueDate: '2026-03-05',
      dueDate: '2026-03-15',
      items: 5,
      paidAmount: 0,
    },
    {
      _id: '3',
      invoiceNumber: 'VINV-2026-001',
      type: 'vendor',
      customerName: 'Green Nursery Co.',
      amount: 21250,
      status: 'paid',
      issueDate: '2026-02-28',
      dueDate: '2026-03-10',
      items: 2,
      paidAmount: 21250,
    },
    {
      _id: '4',
      invoiceNumber: 'INV-2026-003',
      type: 'customer',
      customerName: 'Amit Patel',
      amount: 8900,
      status: 'overdue',
      issueDate: '2026-02-15',
      dueDate: '2026-02-28',
      items: 4,
      paidAmount: 0,
    },
  ];

  const filteredInvoices = mockData.filter((inv) => {
    const matchesType = typeFilter === 'all' || inv.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    const matchesSearch = inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inv.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesStatus && matchesSearch;
  });

  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    issued: 'bg-blue-100 text-blue-800',
    paid: 'bg-green-100 text-green-800',
    overdue: 'bg-red-100 text-red-800',
    cancelled: 'bg-yellow-100 text-yellow-800',
  };

  const totalRevenue = filteredInvoices
    .filter((inv) => inv.type === 'customer' && inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const totalOutstanding = filteredInvoices
    .filter((inv) => inv.type === 'customer' && (inv.status === 'issued' || inv.status === 'overdue'))
    .reduce((sum, inv) => sum + (inv.amount - inv.paidAmount), 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">📄 Invoices Management</h1>
          <p className="text-gray-600 mt-2">View, generate, and track customer and vendor invoices</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <p className="text-gray-600 text-sm">Paid Revenue</p>
            <h3 className="text-3xl font-bold text-green-600 mt-2">₹{totalRevenue.toLocaleString()}</h3>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <p className="text-gray-600 text-sm">Outstanding</p>
            <h3 className="text-3xl font-bold text-blue-600 mt-2">₹{totalOutstanding.toLocaleString()}</h3>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
            <p className="text-gray-600 text-sm">Total Invoices</p>
            <h3 className="text-3xl font-bold text-yellow-600 mt-2">{filteredInvoices.length}</h3>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
            <p className="text-gray-600 text-sm">Overdue</p>
            <h3 className="text-3xl font-bold text-red-600 mt-2">
              {filteredInvoices.filter((inv) => inv.status === 'overdue').length}
            </h3>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Search invoice number or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="customer">Customer Invoices</option>
              <option value="vendor">Vendor Invoices</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="issued">Issued</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading invoices...</p>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-600 text-lg">No invoices found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 border-b-2 border-gray-300">
                  <tr>
                    <th className="px-6 py-4 text-left text-gray-700 font-bold">Invoice #</th>
                    <th className="px-6 py-4 text-left text-gray-700 font-bold">Type</th>
                    <th className="px-6 py-4 text-left text-gray-700 font-bold">Customer/Vendor</th>
                    <th className="px-6 py-4 text-right text-gray-700 font-bold">Amount</th>
                    <th className="px-6 py-4 text-right text-gray-700 font-bold">Paid</th>
                    <th className="px-6 py-4 text-left text-gray-700 font-bold">Issue Date</th>
                    <th className="px-6 py-4 text-left text-gray-700 font-bold">Due Date</th>
                    <th className="px-6 py-4 text-left text-gray-700 font-bold">Status</th>
                    <th className="px-6 py-4 text-center text-gray-700 font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice._id} className="border-b hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-gray-900 font-semibold">{invoice.invoiceNumber}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                          invoice.type === 'customer' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
                        }`}>
                          {invoice.type === 'customer' ? 'Customer' : 'Vendor'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{invoice.customerName}</td>
                      <td className="px-6 py-4 text-right text-gray-900 font-bold">₹{invoice.amount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right text-gray-700">₹{invoice.paidAmount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-gray-700 text-xs">{invoice.issueDate}</td>
                      <td className="px-6 py-4 text-gray-700 text-xs">{invoice.dueDate}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusColors[invoice.status]}`}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="View"
                          >
                            <FiEye size={16} />
                          </button>
                          <button
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                            title="Print"
                          >
                            <FiPrinter size={16} />
                          </button>
                          <button
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                            title="Download"
                          >
                            <FiDownload size={16} />
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
      </div>
    </div>
  );
}
