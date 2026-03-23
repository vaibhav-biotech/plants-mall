import React, { useState, useEffect } from 'react';
import { reviewAPI } from '@/lib/api';
import { ReviewForm } from './ReviewForm';
import { FiStar } from 'react-icons/fi';

interface ReviewableProduct {
  productId: string;
  productName: string;
  productImage: string;
  orderNumber: string;
  orderDate: string;
  reviewed: boolean;
}

const ReviewableProductsSection: React.FC = () => {
  const [products, setProducts] = useState<ReviewableProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<ReviewableProduct | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviewableProducts();
  }, []);

  const fetchReviewableProducts = async () => {
    try {
      setLoading(true);
      const response = await reviewAPI.getUserReviewableProducts();
      setProducts(response.data?.reviewableProducts || []);
    } catch (err: any) {
      console.error('Failed to fetch reviewable products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (data: { rating: number; title: string; comment: string }) => {
    if (!selectedProduct) return;

    try {
      setSubmitting(true);
      await reviewAPI.createReview({
        productId: selectedProduct.productId,
        ...data,
      });

      setShowForm(false);
      setSelectedProduct(null);
      // Refresh the list
      await fetchReviewableProducts();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-12 text-center">
        <FiStar size={48} className="mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600 text-lg">No products to review yet</p>
        <p className="text-gray-500 text-sm mt-2">
          After you receive a product, you can leave a review here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Products You Can Review</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <div
            key={product.productId}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition"
          >
            {/* Product Image */}
            <div className="relative h-48 bg-gray-100 overflow-hidden">
              <img
                src={product.productImage}
                alt={product.productName}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Product Info */}
            <div className="p-4 space-y-3">
              <p className="font-semibold text-gray-900 line-clamp-2">{product.productName}</p>

              <div className="text-xs text-gray-500 space-y-1">
                <p>Order: {product.orderNumber}</p>
                <p>Ordered: {new Date(product.orderDate).toLocaleDateString('en-IN')}</p>
              </div>

              <button
                onClick={() => {
                  setSelectedProduct(product);
                  setShowForm(true);
                }}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-sm"
              >
                Write Review
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Review Form Modal */}
      {showForm && selectedProduct && (
        <ReviewForm
          productId={selectedProduct.productId}
          productName={selectedProduct.productName}
          onSubmit={handleSubmitReview}
          onClose={() => {
            setShowForm(false);
            setSelectedProduct(null);
          }}
          isLoading={submitting}
          error={error}
        />
      )}
    </div>
  );
};

export default ReviewableProductsSection;
