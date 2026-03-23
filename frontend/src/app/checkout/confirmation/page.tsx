'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FiCheckCircle, FiDownload } from 'react-icons/fi';

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const orderNumber = searchParams.get('orderNumber');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <FiCheckCircle size={80} className="text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600 text-lg">Thank you for your purchase</p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Left Column */}
            <div>
              <p className="text-sm text-gray-500 uppercase mb-1">Order Number</p>
              <p className="text-2xl font-bold text-gray-900 mb-4">{orderNumber}</p>

              <p className="text-sm text-gray-500 uppercase mb-1">Order ID</p>
              <p className="text-sm font-mono text-gray-600 break-all">{orderId}</p>
            </div>

            {/* Right Column */}
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-sm text-green-700 font-medium mb-1">Status</p>
              <p className="text-2xl font-bold text-green-600">Pending</p>
              <p className="text-xs text-green-600 mt-2">We've received your order and will process it shortly</p>
            </div>
          </div>

          {/* What's Next */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="font-bold text-gray-900 mb-4">What happens next?</h3>
            <ol className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                <span>We'll send you a confirmation email shortly</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                <span>Our team will process your order within 24 hours</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                <span>You'll receive a tracking number via email once shipped</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                <span>Track your order in your account dashboard</span>
              </li>
            </ol>
          </div>

          {/* Info Box */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Check your email (including spam folder) for your order confirmation and tracking details. 
              Keep your order number safe for future reference.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition font-medium"
          >
            <FiDownload size={20} />
            Print Order
          </button>
          <Link
            href="/products"
            className="flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
          >
            Continue Shopping
          </Link>
        </div>

        {/* Support Info */}
        <div className="text-center">
          <p className="text-gray-600 mb-2">Need help?</p>
          <p className="text-sm text-gray-500">
            Contact us at <a href="mailto:support@plantsmall.com" className="text-green-600 hover:text-green-700">support@plantsmall.com</a> or call <a href="tel:+919876543210" className="text-green-600 hover:text-green-700">+91 9876543210</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ConfirmationContent />
    </Suspense>
  );
}
