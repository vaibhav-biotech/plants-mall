import React, { useState, useEffect } from 'react';
import { orderAPI } from '@/lib/api';

interface InvoiceModalProps {
  isOpen: boolean;
  orderId: string;
  onClose: () => void;
}

interface Invoice {
  _id: string;
  invoiceNumber: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    discount: number;
    subtotal: number;
  }>;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  shippingAddress: {
    street: string;
    area: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  paymentMethod: string;
  notes?: string;
  issuedDate: string;
  createdAt: string;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ isOpen, orderId, onClose }) => {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && orderId) {
      fetchInvoice();
    }
  }, [isOpen, orderId]);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await orderAPI.getInvoice(orderId);
      setInvoice(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load invoice');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 flex justify-between items-center p-6">
          <h2 className="text-2xl font-bold text-gray-900">Invoice</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {invoice && (
            <div className="space-y-8">
              {/* Invoice Header */}
              <div className="border-b border-gray-300 pb-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900">INVOICE</h3>
                    <p className="text-gray-600 mt-2">Invoice #: <span className="font-semibold">{invoice.invoiceNumber}</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Issue Date</p>
                    <p className="font-semibold">
                      {new Date(invoice.issuedDate).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bill From & Bill To */}
              <div className="grid grid-cols-2 gap-8 border-b border-gray-300 pb-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Bill From</h4>
                  <p className="text-gray-600">Plants Mall</p>
                  <p className="text-gray-600">All Natural Plants & Flowers</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Bill To</h4>
                  <p className="font-semibold text-gray-900">{invoice.customerName}</p>
                  <p className="text-gray-600">{invoice.customerEmail}</p>
                  <p className="text-gray-600">{invoice.customerPhone}</p>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="border-b border-gray-300 pb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Shipping Address</h4>
                <p className="text-gray-600">
                  {invoice.shippingAddress.street}, {invoice.shippingAddress.area}
                </p>
                <p className="text-gray-600">
                  {invoice.shippingAddress.city}, {invoice.shippingAddress.state} {invoice.shippingAddress.pincode}
                </p>
                <p className="text-gray-600">{invoice.shippingAddress.country}</p>
              </div>

              {/* Items Table */}
              <div className="border-b border-gray-300">
                <table className="w-full mb-6">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left px-4 py-3 text-gray-900 font-semibold">Description</th>
                      <th className="text-center px-4 py-3 text-gray-900 font-semibold">Qty</th>
                      <th className="text-right px-4 py-3 text-gray-900 font-semibold">Price</th>
                      <th className="text-right px-4 py-3 text-gray-900 font-semibold">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item, idx) => (
                      <tr key={idx} className="border-t border-gray-200">
                        <td className="px-4 py-3 text-gray-600">{item.productName}</td>
                        <td className="text-center px-4 py-3 text-gray-600">{item.quantity}</td>
                        <td className="text-right px-4 py-3 text-gray-600">₹{item.price.toFixed(2)}</td>
                        <td className="text-right px-4 py-3 text-gray-900 font-semibold">₹{item.subtotal.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end mb-6">
                <div className="w-64">
                  <div className="flex justify-between py-2 border-b border-gray-300">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="text-gray-900 font-semibold">₹{invoice.subtotal.toFixed(2)}</span>
                  </div>
                  {invoice.discountAmount > 0 && (
                    <div className="flex justify-between py-2 border-b border-gray-300">
                      <span className="text-gray-600">Discount:</span>
                      <span className="text-green-600 font-semibold">-₹{invoice.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {invoice.taxAmount > 0 && (
                    <div className="flex justify-between py-2 border-b border-gray-300">
                      <span className="text-gray-600">Tax:</span>
                      <span className="text-gray-900 font-semibold">₹{invoice.taxAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-3 bg-gray-100 px-4 rounded mt-2">
                    <span className="text-gray-900 font-bold">Total:</span>
                    <span className="text-green-600 font-bold text-lg">₹{invoice.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-gray-50 rounded p-4 border border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Payment Method</p>
                <p className="font-semibold text-gray-900 capitalize">
                  {invoice.paymentMethod.replace('_', ' ')}
                </p>
              </div>

              {invoice.notes && (
                <div className="bg-yellow-50 rounded p-4 border border-yellow-200">
                  <p className="text-sm text-gray-600 mb-1">Notes</p>
                  <p className="text-gray-700">{invoice.notes}</p>
                </div>
              )}

              {/* Footer */}
              <div className="text-center text-sm text-gray-500 pt-6 border-t border-gray-300">
                <p>Thank you for your purchase!</p>
                <p>Please contact us if you have any questions about this invoice.</p>
              </div>
            </div>
          )}
        </div>

        {/* Print Button */}
        {invoice && (
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex gap-4">
            <button
              onClick={() => window.print()}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            >
              Print Invoice
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-900 px-4 py-2 rounded hover:bg-gray-400 transition"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceModal;
