'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/lib/store';
import { useAuthStore } from '@/lib/authStore';
import { useRouter } from 'next/navigation';
import { orderAPI, authAPI, customerAPI, addressAPI } from '@/lib/api';
import Link from 'next/link';
import { FiMapPin } from 'react-icons/fi';

export default function CheckoutPage() {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { user, isAuthenticated, login } = useAuthStore();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRegForm, setShowRegForm] = useState(!isAuthenticated);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Redirect if cart is empty
  if (items.length === 0 && typeof window !== 'undefined' && !localStorage.getItem('checkoutInitiated')) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>
            <Link href="/products" className="text-green-600 hover:text-green-700 font-medium">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Auth/Registration Form
  if (showRegForm && !isAuthenticated) {
    return <AuthRegistrationForm onAuthSuccess={() => setShowRegForm(false)} />;
  }

  // Checkout Form
  return <CheckoutForm />;
}

// Auth & Registration Component
function AuthRegistrationForm({ onAuthSuccess }: { onAuthSuccess: () => void }) {
  const { login } = useAuthStore();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });

  const [regForm, setRegForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!loginForm.email || !loginForm.password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const response = await authAPI.login(loginForm.email, loginForm.password);
      
      if (response.data.token && response.data.user) {
        login(response.data.user, response.data.token);
        localStorage.setItem('token', response.data.token);
        onAuthSuccess();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!regForm.name || !regForm.email || !regForm.password || !regForm.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (regForm.password !== regForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (regForm.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      const response = await authAPI.register({
        name: regForm.name,
        email: regForm.email,
        password: regForm.password,
      });

      if (response.data.token && response.data.user) {
        login(response.data.user, response.data.token);
        localStorage.setItem('token', response.data.token);
        onAuthSuccess();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Plants Mall</h1>
          <p className="text-gray-600 mb-6">Sign in or create account to continue checkout</p>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-gray-200">
            <button
              onClick={() => setTab('login')}
              className={`px-4 py-2 font-medium transition ${
                tab === 'login'
                  ? 'border-b-2 border-green-600 text-green-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setTab('register')}
              className={`px-4 py-2 font-medium transition ${
                tab === 'register'
                  ? 'border-b-2 border-green-600 text-green-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Register
            </button>
          </div>

          {/* Login Form */}
          {tab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition font-medium"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          )}

          {/* Register Form */}
          {tab === 'register' && (
            <form onSubmit={handleRegSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={regForm.name}
                onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={regForm.email}
                onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
              <input
                type="password"
                placeholder="Password (min 6 chars)"
                value={regForm.password}
                onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
              <input
                type="password"
                placeholder="Confirm Password"
                value={regForm.confirmPassword}
                onChange={(e) => setRegForm({ ...regForm, confirmPassword: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition font-medium"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          )}

          <Link href="/products" className="block text-center text-gray-600 hover:text-gray-900 mt-6 transition">
            Continue as Guest
          </Link>
        </div>
      </div>
    </div>
  );
}

// Main Checkout Form
function CheckoutForm() {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [error, setError] = useState('');
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    customerName: user?.name || '',
    customerEmail: user?.email || '',
    customerPhone: '',
    street: '',
    area: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    paymentMethod: 'cod',
    // Gift fields
    hasGiftItems: false,
    giftRecipientName: '',
    giftStreet: '',
    giftArea: '',
    giftCity: '',
    giftState: '',
    giftPincode: '',
  });

  // Fetch user addresses on mount
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        setLoadingAddresses(true);
        const response = await addressAPI.getAll();
        const addrs = response.data.addresses || [];
        setAddresses(addrs);
        
        // Auto-select default address
        const defaultAddr = addrs.find((a: any) => a.isDefault);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr._id);
          setFormData(prev => ({
            ...prev,
            street: defaultAddr.street,
            area: defaultAddr.area,
            city: defaultAddr.city,
            state: defaultAddr.state,
            pincode: defaultAddr.pincode,
            customerPhone: defaultAddr.phone,
          }));
        }
      } catch (err: any) {
        console.error('Failed to fetch addresses:', err);
      } finally {
        setLoadingAddresses(false);
      }
    };

    fetchAddresses();
  }, []);

  // Handle address selection
  const handleSelectAddress = (addressId: string) => {
    const address = addresses.find((a: any) => a._id === addressId);
    if (address) {
      setSelectedAddressId(addressId);
      setFormData(prev => ({
        ...prev,
        street: address.street,
        area: address.area,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        customerPhone: address.phone,
      }));
    }
  };

  const totalPrice = getTotalPrice();
  const taxAmount = Math.round(totalPrice * 0.1 * 100) / 100;
  const finalTotal = totalPrice + taxAmount;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerName || !formData.customerEmail || !formData.customerPhone) {
      setError('Please fill in all customer details');
      return;
    }

    if (!formData.street || !formData.area || !formData.city || !formData.state || !formData.pincode) {
      setError('Please fill in complete shipping address');
      return;
    }

    if (items.length === 0) {
      setError('Your cart is empty');
      return;
    }

    try {
      setLoading(true);

      const orderItems = items.map(item => ({
        productId: item.id,
        productName: item.name,
        quantity: item.quantity,
        price: item.price,
        discount: item.discount,
        subtotal: (item.price - (item.price * item.discount) / 100) * item.quantity,
      }));

      // Calculate gift charge
      const giftCharge = items.reduce((total, item) => total + (item.giftCharge || 0), 0);
      const hasGiftItems = items.some(item => item.isGift);

      const orderData: any = {
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        items: orderItems,
        totalPrice: finalTotal + giftCharge,
        subtotal: totalPrice,
        taxAmount: taxAmount,
        discountAmount: 0,
        giftCharge: giftCharge,
        isGift: hasGiftItems,
        paymentMethod: formData.paymentMethod,
        paymentStatus: formData.paymentMethod === 'cod' ? 'pending' : 'pending',
        shippingAddress: {
          street: formData.street,
          area: formData.area,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          country: formData.country,
        },
      };

      // Add gift address if needed
      if (hasGiftItems && formData.giftRecipientName) {
        orderData.giftAddress = {
          recipientName: formData.giftRecipientName,
          street: formData.giftStreet,
          area: formData.giftArea,
          city: formData.giftCity,
          state: formData.giftState,
          pincode: formData.giftPincode,
          country: 'India',
        };
      }

      const response = await orderAPI.create(orderData);
      
      if (response.data && response.data._id) {
        clearCart();
        localStorage.removeItem('checkoutInitiated');
        router.push(`/checkout/confirmation?orderId=${response.data._id}&orderNumber=${response.data.orderNumber}`);
      } else {
        setError('Failed to create order - invalid response');
      }
    } catch (err: any) {
      console.error('Failed to place order:', err);
      setError(err.response?.data?.error || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-1">Complete your purchase</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Customer Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Information</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="customerName"
                    placeholder="Full Name *"
                    value={formData.customerName}
                    onChange={handleChange}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                  <input
                    type="email"
                    name="customerEmail"
                    placeholder="Email Address *"
                    value={formData.customerEmail}
                    onChange={handleChange}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <input
                  type="tel"
                  name="customerPhone"
                  placeholder="Phone Number *"
                  value={formData.customerPhone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
            </div>

            {/* Saved Addresses */}
            {addresses.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <FiMapPin size={24} />
                  Select Shipping Address
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((address) => (
                    <div
                      key={address._id}
                      onClick={() => handleSelectAddress(address._id)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                        selectedAddressId === address._id
                          ? 'border-green-600 bg-green-50'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-semibold text-gray-900 uppercase text-sm">{address.type}</p>
                        {address.isDefault && (
                          <span className="text-xs bg-green-600 text-white px-2 py-1 rounded font-medium">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-gray-900 font-semibold text-sm">{address.street}</p>
                      <p className="text-gray-600 text-sm">{address.area}</p>
                      <p className="text-gray-600 text-sm">
                        {address.city}, {address.state} - {address.pincode}
                      </p>
                      <p className="text-gray-600 text-sm mt-2">📞 {address.phone}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Shipping Address Details</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  name="street"
                  placeholder="Street Address *"
                  value={formData.street}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
                <input
                  type="text"
                  name="area"
                  placeholder="Area/Colony *"
                  value={formData.area}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="city"
                    placeholder="City *"
                    value={formData.city}
                    onChange={handleChange}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                  <input
                    type="text"
                    name="state"
                    placeholder="State *"
                    value={formData.state}
                    onChange={handleChange}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="pincode"
                    placeholder="Pincode (6 digits) *"
                    value={formData.pincode}
                    onChange={handleChange}
                    maxLength={6}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="India">India</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Method</h2>
              <div className="space-y-3">
                {[
                  { value: 'cod', label: 'Cash on Delivery (COD)' },
                  { value: 'credit_card', label: 'Credit Card' },
                  { value: 'debit_card', label: 'Debit Card' },
                  { value: 'upi', label: 'UPI' },
                  { value: 'net_banking', label: 'Net Banking' },
                ].map(method => (
                  <label key={method.value} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.value}
                      checked={formData.paymentMethod === method.value}
                      onChange={handleChange}
                      className="w-4 h-4 text-green-600"
                    />
                    <span className="ml-3 text-gray-700">{method.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Gift Address (if items have gifts) */}
            {items.some(item => item.isGift) && (
              <div className="bg-amber-50 rounded-lg shadow-sm border border-amber-200 p-8">
                <h2 className="text-2xl font-bold text-amber-900 mb-2">🎁 Gift Delivery Address</h2>
                <p className="text-amber-700 text-sm mb-6">Please provide the gift recipient details for delivery</p>
                <div className="space-y-4">
                  <input
                    type="text"
                    name="giftRecipientName"
                    placeholder="Recipient's Name *"
                    value={formData.giftRecipientName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                    required
                  />
                  <input
                    type="text"
                    name="giftStreet"
                    placeholder="Street Address *"
                    value={formData.giftStreet}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                    required
                  />
                  <input
                    type="text"
                    name="giftArea"
                    placeholder="Area/Colony *"
                    value={formData.giftArea}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                    required
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="giftCity"
                      placeholder="City *"
                      value={formData.giftCity}
                      onChange={handleChange}
                      className="px-4 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                      required
                    />
                    <input
                      type="text"
                      name="giftState"
                      placeholder="State *"
                      value={formData.giftState}
                      onChange={handleChange}
                      className="px-4 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                      required
                    />
                  </div>
                  <input
                    type="text"
                    name="giftPincode"
                    placeholder="Pincode (6 digits) *"
                    value={formData.giftPincode}
                    onChange={handleChange}
                    maxLength={6}
                    className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                    required
                  />
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="sticky top-20 h-fit">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                {items.map((item) => {
                  const finalPrice = item.price - (item.price * item.discount) / 100;
                  return (
                    <div key={item.id} className="flex justify-between text-sm">
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium text-gray-900">
                        ₹{(finalPrice * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (10%)</span>
                  <span className="font-medium">₹{taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-green-600">
                  <span>Free Shipping</span>
                  <span className="font-medium">₹0.00</span>
                </div>
                {items.some(item => item.isGift) && (
                  <div className="flex justify-between text-sm text-amber-600 bg-amber-50 p-2 rounded">
                    <span>🎁 Gift Charges</span>
                    <span className="font-medium">₹{items.reduce((t, i) => t + (i.giftCharge || 0), 0).toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between text-lg font-bold mb-8">
                <span>Total</span>
                <span className="text-green-600">₹{(finalTotal + items.reduce((t, i) => t + (i.giftCharge || 0), 0)).toFixed(2)}</span>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50 transition"
              >
                {loading ? 'Processing...' : 'Place Order'}
              </button>

              <Link href="/products" className="block mt-3 text-center text-gray-600 hover:text-gray-900 transition">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
