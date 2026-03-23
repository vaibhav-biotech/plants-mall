'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { customerAPI, addressAPI, wishlistAPI, orderAPI } from '../../lib/api';
import { FiUser, FiMapPin, FiShoppingBag, FiHeart, FiEdit2, FiX, FiPlus, FiCheck, FiTrash2, FiPhone, FiLogOut, FiFileText, FiStar } from 'react-icons/fi';
import OrderStatusTimeline from '../../components/OrderStatusTimeline';
import { InvoiceModal } from '@/components/InvoiceModal';
import ReviewableProductsSection from '@/components/ReviewableProductsSection';

export default function AccountPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  // Modal states
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [addressForm, setAddressForm] = useState({
    street: '',
    area: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    type: 'home',
    isDefault: false,
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showOrderDrawer, setShowOrderDrawer] = useState(false);
  const [isCancellingOrder, setIsCancellingOrder] = useState(false);
  const [invoiceModal, setInvoiceModal] = useState<{ isOpen: boolean; orderId: string }>({ isOpen: false, orderId: '' });

  useEffect(() => {
    fetchAllData();
  }, []);

  // Refresh selected order data when drawer is open
  useEffect(() => {
    if (!showOrderDrawer || !selectedOrder) return;

    const refreshOrderData = async () => {
      try {
        const freshData = await orderAPI.getById(selectedOrder._id);
        setSelectedOrder(freshData.data);
      } catch (error) {
        console.error('Error refreshing order:', error);
      }
    };

    // Refresh immediately and then every 2 seconds while drawer is open
    refreshOrderData();
    const interval = setInterval(refreshOrderData, 2000);

    return () => clearInterval(interval);
  }, [showOrderDrawer, selectedOrder?._id]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [profileRes, addressRes, wishlistRes, ordersRes] = await Promise.all([
        customerAPI.getProfile(),
        addressAPI.getAll(),
        wishlistAPI.getAll(),
        orderAPI.getMyOrders(1, 100, '', ''),
      ]);

      setUser(profileRes.data.user);
      setAddresses(addressRes.data.addresses || []);
      setWishlist(wishlistRes.data.wishlist || []);
      setOrders(ordersRes.data.orders || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load data');
      if (err.response?.status === 401) {
        router.push('/auth/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!addressForm.street || !addressForm.area || !addressForm.city || !addressForm.state || !addressForm.pincode || !addressForm.phone) {
      setError('Please fill all fields');
      return;
    }

    try {
      if (editingAddress) {
        await addressAPI.update(editingAddress._id, addressForm);
        setSuccess('Address updated successfully');
      } else {
        await addressAPI.create(addressForm);
        setSuccess('Address added successfully');
      }
      setShowAddressModal(false);
      setEditingAddress(null);
      setAddressForm({
        street: '',
        area: '',
        city: '',
        state: '',
        pincode: '',
        phone: '',
        type: 'home',
        isDefault: false,
      });
      fetchAllData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save address');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      await addressAPI.delete(id);
      setSuccess('Address deleted successfully');
      fetchAllData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete address');
    }
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      await wishlistAPI.remove(productId);
      setWishlist(wishlist.filter((item) => item.productId._id !== productId));
      setSuccess('Removed from wishlist');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove from wishlist');
    }
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder) return;
    
    try {
      setIsCancellingOrder(true);
      await orderAPI.cancel(selectedOrder._id);
      
      // Update the selected order status
      setSelectedOrder({ ...selectedOrder, status: 'cancelled' });
      
      // Update orders list
      setOrders(orders.map(order => 
        order._id === selectedOrder._id ? { ...order, status: 'cancelled' } : order
      ));
      
      setSuccess('Order cancelled successfully');
      setTimeout(() => {
        setShowOrderDrawer(false);
        setSuccess('');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to cancel order');
    } finally {
      setIsCancellingOrder(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth-store');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
        <p className="text-red-600">User not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                <p className="text-gray-600 flex items-center gap-2 mt-1">
                  <span className="font-mono font-bold text-green-600">ID: {user.customerId}</span>
                </p>
                <p className="text-gray-600 text-sm mt-1">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-medium"
            >
              <FiLogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 bg-green-50 border border-green-200 rounded-lg p-4 text-green-600 text-sm">
          ✓ {success}
        </div>
      )}

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex gap-0 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium transition ${
              activeTab === 'profile'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <FiUser size={20} />
            Profile
          </button>
          <button
            onClick={() => setActiveTab('addresses')}
            className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium transition ${
              activeTab === 'addresses'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <FiMapPin size={20} />
            Addresses ({addresses.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium transition ${
              activeTab === 'orders'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <FiShoppingBag size={20} />
            Orders
          </button>
          <button
            onClick={() => setActiveTab('wishlist')}
            className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium transition ${
              activeTab === 'wishlist'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <FiHeart size={20} />
            Wishlist ({wishlist.length})
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium transition ${
              activeTab === 'reviews'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <FiStar size={20} />
            Write Reviews
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600 font-medium">Full Name</label>
                  <p className="text-gray-900 font-semibold mt-1">{user.name}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 font-medium">Email Address</label>
                  <p className="text-gray-900 font-semibold mt-1">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 font-medium">Account Type</label>
                  <p className="text-gray-900 font-semibold mt-1 capitalize">{user.role}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 font-medium">Customer ID</label>
                  <p className="text-gray-900 font-mono font-bold mt-1 bg-green-50 px-3 py-2 rounded inline-block">
                    {user.customerId}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                  <div>
                    <p className="text-sm text-green-700 font-medium">Status</p>
                    <p className="text-green-900 font-semibold mt-1">Active</p>
                  </div>
                  <FiCheck size={24} className="text-green-600" />
                </div>
                <div>
                  <label className="text-sm text-gray-600 font-medium">Member Since</label>
                  <p className="text-gray-900 font-semibold mt-1">
                    {new Date(user.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Addresses Tab */}
        {activeTab === 'addresses' && (
          <div>
            <div className="mb-6">
              <button
                onClick={() => {
                  setEditingAddress(null);
                  setAddressForm({
                    street: '',
                    area: '',
                    city: '',
                    state: '',
                    pincode: '',
                    phone: '',
                    type: 'home',
                    isDefault: false,
                  });
                  setShowAddressModal(true);
                }}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
              >
                <FiPlus size={20} />
                Add New Address
              </button>
            </div>

            {addresses.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <FiMapPin size={48} className="text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No addresses saved yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {addresses.map((address) => (
                  <div
                    key={address._id}
                    className={`bg-white rounded-lg shadow-sm p-6 border-2 transition ${
                      address.isDefault ? 'border-green-600 bg-green-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-600 uppercase">{address.type}</p>
                        {address.isDefault && (
                          <span className="inline-block mt-1 px-2 py-1 bg-green-600 text-white text-xs rounded font-medium">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingAddress(address);
                            setAddressForm(address);
                            setShowAddressModal(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                        >
                          <FiEdit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(address._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <p className="text-gray-900 font-semibold">{address.street}</p>
                      <p className="text-gray-600">{address.area}</p>
                      <p className="text-gray-600">
                        {address.city}, {address.state} - {address.pincode}
                      </p>
                      <p className="text-gray-600 flex items-center gap-2 mt-3">
                        <FiPhone size={16} /> {address.phone}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            {orders.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <FiShoppingBag size={48} className="text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No orders yet</p>
                <p className="text-gray-500 text-sm mt-2">Your orders will appear here</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Order #</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Items</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Total</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Payment</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {orders.map((order) => (
                        <tr key={order._id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.orderNumber}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{order.items.length} item(s)</td>
                          <td className="px-6 py-4 text-sm font-semibold text-green-600">₹{order.totalPrice.toFixed(2)}</td>
                          <td className="px-6 py-4 text-sm">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                order.status === 'delivered'
                                  ? 'bg-green-100 text-green-800'
                                  : ['shipped', 'shipping'].includes(order.status)
                                  ? 'bg-blue-100 text-blue-800'
                                  : order.status === 'processing'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : order.status === 'cancelled'
                                  ? 'bg-red-100 text-red-800'
                                  : order.status === 'transit' || order.status === 'in-transit'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                order.paymentStatus === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : order.paymentStatus === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={async () => {
                                try {
                                  const freshOrderData = await orderAPI.getById(order._id);
                                  setSelectedOrder(freshOrderData.data);
                                  setShowOrderDrawer(true);
                                } catch (error) {
                                  console.error('Error fetching order:', error);
                                  setSelectedOrder(order);
                                  setShowOrderDrawer(true);
                                }
                              }}
                              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-xs font-semibold transition"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Wishlist Tab */}
        {activeTab === 'wishlist' && (
          <div>
            {wishlist.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <FiHeart size={48} className="text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg font-semibold">No items in wishlist</p>
                <p className="text-gray-500 text-sm mt-2">Items you like will be saved here</p>
                <a href="/products" className="inline-block mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition">
                  Browse Products
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {wishlist.map((item) => {
                  const product = item.productId || item;
                  return (
                    <div key={product._id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition group">
                      {/* Product Image */}
                      <div className="relative h-64 bg-gray-100 overflow-hidden">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-400">
                            <span>No image</span>
                          </div>
                        )}
                        {product.discount > 0 && (
                          <div className="absolute top-3 right-3 bg-red-600 text-white px-2 py-1 rounded text-sm font-bold">
                            -{product.discount}%
                          </div>
                        )}
                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemoveFromWishlist(product._id)}
                          className="absolute top-3 left-3 p-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition shadow-lg"
                          title="Remove from wishlist"
                        >
                          <FiX size={18} />
                        </button>
                      </div>

                      {/* Product Info */}
                      <div className="p-4">
                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">{product.category}</p>
                        <h3 className="text-sm font-semibold text-gray-900 truncate mb-2">{product.name}</h3>
                        
                        {/* Price */}
                        <div className="flex items-baseline gap-2 mb-3">
                          <span className="text-lg font-bold text-green-600">
                            ₹{(product.price - (product.price * product.discount) / 100).toFixed(0)}
                          </span>
                          {product.discount > 0 && (
                            <span className="text-sm text-gray-500 line-through">₹{product.price}</span>
                          )}
                        </div>

                        {/* Stock Status */}
                        <div className="text-xs font-medium mb-3">
                          {product.stock > 10 ? (
                            <span className="text-green-600">✓ In Stock</span>
                          ) : product.stock > 0 ? (
                            <span className="text-orange-600">Only {product.stock} left</span>
                          ) : (
                            <span className="text-red-600">Out of Stock</span>
                          )}
                        </div>

                        {/* View Product Button */}
                        <a
                          href={`/products/${product._id}`}
                          className="block w-full bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm font-semibold text-center transition"
                        >
                          View Product
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <ReviewableProductsSection />
        )}
      </div>

      {/* Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">{editingAddress ? 'Edit Address' : 'Add New Address'}</h2>
              <button onClick={() => setShowAddressModal(false)} className="text-gray-400 hover:text-gray-600">
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleAddressSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                <input
                  type="text"
                  value={addressForm.street}
                  onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                  placeholder="House No., Building Name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Area/Colony *</label>
                <input
                  type="text"
                  value={addressForm.area}
                  onChange={(e) => setAddressForm({ ...addressForm, area: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                  placeholder="Road Name, Area"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <input
                    type="text"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                  <input
                    type="text"
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                    placeholder="State"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                  <input
                    type="text"
                    value={addressForm.pincode}
                    onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                    placeholder="6 digits"
                    maxLength={6}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                    placeholder="10 digits"
                    maxLength={10}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address Type *</label>
                <select
                  value={addressForm.type}
                  onChange={(e) => setAddressForm({ ...addressForm, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                >
                  <option value="home">Home</option>
                  <option value="office">Office</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                  className="w-4 h-4 border border-gray-300 rounded focus:outline-none"
                />
                <span className="text-sm font-medium text-gray-700">Set as default address</span>
              </label>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Details Drawer */}
      {showOrderDrawer && selectedOrder && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowOrderDrawer(false)}
          />
          {/* Drawer */}
          <div className="fixed top-0 right-0 h-full w-full md:w-[500px] bg-white shadow-xl z-50 overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
              <button
                onClick={() => setShowOrderDrawer(false)}
                className="text-gray-400 hover:text-gray-600 p-2"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Order Number & Date */}
              <div>
                <p className="text-sm text-gray-500 mb-1">Order Number</p>
                <p className="text-lg font-bold text-gray-900">{selectedOrder.orderNumber}</p>
                <p className="text-sm text-gray-600 mt-2">
                  {new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>

              {/* Status Timeline */}
              <div className="border-t border-gray-200 pt-6">
                <OrderStatusTimeline
                  status={selectedOrder.status}
                  orderId={selectedOrder._id}
                  canCancel={true}
                  onCancelClick={handleCancelOrder}
                  isCancelling={isCancellingOrder}
                />
              </div>

              {/* Payment Status */}
              <div className="border-t border-gray-200 pt-6">
                <p className="text-sm font-semibold text-gray-700 mb-3">Payment Status</p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    selectedOrder.paymentStatus === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : selectedOrder.paymentStatus === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {selectedOrder.paymentStatus.charAt(0).toUpperCase() + selectedOrder.paymentStatus.slice(1)}
                </span>
              </div>

              {/* Items */}
              <div className="border-t border-gray-200 pt-6">
                <p className="text-sm font-semibold text-gray-700 mb-3">Items ({selectedOrder.items.length})</p>
                <div className="space-y-3">
                  {selectedOrder.items.map((item: any, idx: number) => (
                    <div key={idx} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between mb-2">
                        <p className="font-medium text-gray-900 text-sm">{item.productName}</p>
                        <p className="text-sm font-semibold text-green-600">₹{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Qty: {item.quantity}</span>
                        <span>₹{item.price.toFixed(2)} each</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="border-t border-gray-200 pt-6">
                <p className="text-sm font-semibold text-gray-700 mb-3">Shipping Address</p>
                <div className="text-sm text-gray-600 space-y-1 bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-900 font-medium">{selectedOrder.shippingAddress.street}</p>
                  <p>{selectedOrder.shippingAddress.area}</p>
                  <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode}</p>
                  <p className="pt-2 text-gray-900 font-medium">{selectedOrder.customerPhone}</p>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-gray-200 pt-6">
                <p className="text-sm font-semibold text-gray-700 mb-3">Price Breakdown</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{selectedOrder.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span>₹{selectedOrder.taxAmount.toFixed(2)}</span>
                  </div>
                  {selectedOrder.discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-₹{selectedOrder.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-900">
                    <span>Total</span>
                    <span className="text-green-600 text-lg">₹{selectedOrder.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <div className="border-t border-gray-200 pt-6">
                {selectedOrder.status === 'confirmed' && selectedOrder.invoiceId && (
                  <button
                    onClick={() => setInvoiceModal({ isOpen: true, orderId: selectedOrder._id })}
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 mb-3"
                  >
                    <FiFileText size={18} />
                    View Invoice
                  </button>
                )}
                <button
                  onClick={() => setShowOrderDrawer(false)}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-3 rounded-lg font-semibold transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Invoice Modal */}
      <InvoiceModal
        isOpen={invoiceModal.isOpen}
        orderId={invoiceModal.orderId}
        onClose={() => setInvoiceModal({ isOpen: false, orderId: '' })}
      />
    </div>
  );
}


