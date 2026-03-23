'use client';

import { useEffect, useState } from 'react';
import { orderAPI, productAPI } from '@/lib/api';
import { useRouter, useParams } from 'next/navigation';
import { FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { InvoiceModal } from '@/components/InvoiceModal';

interface Order {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: Array<{
    productId?: string;
    productName: string;
    quantity: number;
    price: number;
    discount: number;
    subtotal: number;
  }>;
  totalPrice: number;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  giftCharge?: number;
  isGift?: boolean;
  giftMessage?: string;
  giftAddress?: {
    recipientName: string;
    street: string;
    area: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function OrderDetailPage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [newPaymentStatus, setNewPaymentStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [productVerification, setProductVerification] = useState<Record<string, boolean>>({});
  const [generatingInvoice, setGeneratingInvoice] = useState(false);
  const [invoiceModal, setInvoiceModal] = useState<{ isOpen: boolean; orderId: string }>({ isOpen: false, orderId: '' });
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getById(id);
      setOrder(response.data);
      setNewStatus(response.data.status);
      setNewPaymentStatus(response.data.paymentStatus);
      setTrackingNumber(response.data.trackingNumber || '');
      setNotes(response.data.notes || '');
      
      // Verify each product exists
      await verifyProducts(response.data.items);
    } catch (err) {
      console.error('Failed to fetch order:', err);
      setError('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const verifyProducts = async (items: Order['items']) => {
    const verification: Record<string, boolean> = {};
    
    try {
      const allProducts = await productAPI.getAll(1, 1000, '', '');
      const productNames = new Set(
        (allProducts.data.products || []).map((p: any) => p.name.toLowerCase())
      );
      
      items.forEach(item => {
        verification[item.productName] = productNames.has(item.productName.toLowerCase());
      });
      
      setProductVerification(verification);
    } catch (err) {
      console.error('Failed to verify products:', err);
    }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus || !order || newStatus === order.status) return;

    try {
      setUpdating(true);
      await orderAPI.updateStatus(id, newStatus);
      setOrder({ ...order, status: newStatus as any });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handlePaymentStatusUpdate = async () => {
    if (!newPaymentStatus || !order || newPaymentStatus === order.paymentStatus) return;

    try {
      setUpdating(true);
      await orderAPI.updatePaymentStatus(id, newPaymentStatus);
      setOrder({ ...order, paymentStatus: newPaymentStatus as any });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update payment status');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateOrder = async () => {
    if (!order) return;

    try {
      setUpdating(true);
      await orderAPI.update(id, {
        trackingNumber,
        notes,
      });
      setOrder({ ...order, trackingNumber, notes });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update order');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;

    try {
      setUpdating(true);
      await orderAPI.delete(id);
      router.push('/admin/orders');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete order');
      setUpdating(false);
    }
  };

  const handleGenerateInvoice = async () => {
    try {
      setGeneratingInvoice(true);
      
      // If order is not yet confirmed, confirm it (which generates invoice)
      if (order?.status?.toLowerCase() !== 'confirmed') {
        await orderAPI.confirm(id);
        await fetchOrder();
      }
      
      // Open the invoice modal to view/display the invoice
      setInvoiceModal({ isOpen: true, orderId: id });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate invoice');
    } finally {
      setGeneratingInvoice(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading order...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Order not found
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    const colors: any = {
      pending: 'bg-yellow-100 text-yellow-700',
      processing: 'bg-blue-100 text-blue-700',
      shipped: 'bg-purple-100 text-purple-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{order.orderNumber}</h1>
          <p className="text-gray-600 mt-1">Order Details</p>
        </div>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
        >
          Back to Orders
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Customer Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase">Name</p>
                <p className="text-sm font-medium text-gray-900">{order.customerName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Email</p>
                <p className="text-sm font-medium text-gray-900">{order.customerEmail}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Phone</p>
                <p className="text-sm font-medium text-gray-900">{order.customerPhone}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Order Date</p>
                <p className="text-sm font-medium text-gray-900">{new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Shipping Address</h2>
            <div className="space-y-2 text-sm text-gray-600">
              <p>{order.shippingAddress.street}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
              <p>{order.shippingAddress.country}</p>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Items</h2>
            <div className="space-y-4">
              {order.items.map((item, index) => {
                const productExists = productVerification[item.productName];
                return (
                  <div key={index} className={`flex justify-between items-start pb-4 border-b border-gray-200 last:border-0 ${!productExists ? 'bg-red-50 p-3 rounded -mx-3 px-3' : ''}`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">{item.productName}</p>
                        {productExists === true && (
                          <FiCheckCircle className="text-green-600" size={16} title="Product exists in catalog" />
                        )}
                        {productExists === false && (
                          <FiAlertCircle className="text-red-600" size={16} title="Product no longer exists" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      {productExists === false && (
                        <p className="text-xs text-red-600 mt-1">⚠️ Product not found in current catalog</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">₹{item.subtotal.toFixed(2)}</p>
                      {item.discount > 0 && (
                        <p className="text-xs text-gray-500">-{item.discount}%</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">₹{order.subtotal?.toFixed(2)}</span>
              </div>
              {order.taxAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">₹{order.taxAmount.toFixed(2)}</span>
                </div>
              )}
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-₹{order.discountAmount.toFixed(2)}</span>
                </div>
              )}
              {order.isGift && order.giftCharge && (
                <div className="flex justify-between text-sm text-amber-600 bg-amber-50 p-2 rounded">
                  <span>🎁 Gift Charge</span>
                  <span className="font-medium">₹{order.giftCharge.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-3">
                <span>Total</span>
                <span>₹{order.totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Gift Details */}
          {order.isGift && order.giftAddress && (
            <div className="bg-amber-50 rounded-lg border border-amber-200 p-6">
              <h2 className="text-lg font-bold text-amber-900 mb-4">🎁 Gift Details</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-amber-700 uppercase font-semibold">Recipient Name</p>
                  <p className="text-sm font-medium text-gray-900">{order.giftAddress.recipientName}</p>
                </div>
                {order.giftMessage && (
                  <div>
                    <p className="text-xs text-amber-700 uppercase font-semibold">Gift Message</p>
                    <p className="text-sm text-gray-900 italic">"{order.giftMessage}"</p>
                  </div>
                )}
                <div className="bg-white rounded p-3 mt-4">
                  <p className="text-xs text-amber-700 uppercase font-semibold mb-2">Gift Delivery Address</p>
                  <p className="text-sm text-gray-900">{order.giftAddress.street}</p>
                  <p className="text-sm text-gray-600">{order.giftAddress.area}</p>
                  <p className="text-sm text-gray-600">{order.giftAddress.city}, {order.giftAddress.state} - {order.giftAddress.pincode}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Updates */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Status Updates</h2>
            
            {/* Order Status */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-gray-600 mb-2">Order Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              {newStatus !== order.status && (
                <button
                  onClick={handleStatusUpdate}
                  disabled={updating}
                  className="w-full mt-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition text-sm font-medium"
                >
                  {updating ? 'Updating...' : 'Update Status'}
                </button>
              )}
            </div>

            {/* Payment Status */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-gray-600 mb-2">Payment Status</label>
              <select
                value={newPaymentStatus}
                onChange={(e) => setNewPaymentStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
              {newPaymentStatus !== order.paymentStatus && (
                <button
                  onClick={handlePaymentStatusUpdate}
                  disabled={updating}
                  className="w-full mt-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition text-sm font-medium"
                >
                  {updating ? 'Updating...' : 'Update Payment'}
                </button>
              )}
            </div>

            {/* Current Status Display */}
            <div className="space-y-2 pt-4 border-t border-gray-200">
              <div>
                <p className="text-xs text-gray-500 mb-1">Current Order Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Current Payment Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.paymentStatus)}`}>
                  {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Generate Invoice */}
          {order.status.toLowerCase() === 'confirmed' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Generate Invoice</h2>
              <p className="text-sm text-gray-600 mb-4">Create and manage the invoice for this confirmed order.</p>
              <button
                onClick={handleGenerateInvoice}
                disabled={generatingInvoice}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition font-medium"
              >
                {generatingInvoice ? 'Generating...' : 'Generate & View Invoice'}
              </button>
            </div>
          )}

          {/* Additional Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Additional Info</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Payment Method</label>
                <p className="text-sm text-gray-900 capitalize">{order.paymentMethod?.replace('_', ' ')}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Tracking Number</label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this order"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <button
                onClick={handleUpdateOrder}
                disabled={updating}
                className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition text-sm font-medium"
              >
                {updating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* Delete Button */}
          <button
            onClick={handleDelete}
            disabled={updating}
            className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition font-medium"
          >
            Delete Order
          </button>
        </div>
      </div>

      {/* Invoice Modal */}
      <InvoiceModal
        isOpen={invoiceModal.isOpen}
        orderId={invoiceModal.orderId}
        onClose={() => setInvoiceModal({ isOpen: false, orderId: '' })}
      />
    </div>
  );
}
