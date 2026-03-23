import React, { useState, useEffect } from 'react';
import { reviewAPI } from '@/lib/api';
import { ReviewCard } from './ReviewCard';
import { ReviewForm } from './ReviewForm';
import { useAuthStore } from '@/lib/authStore';
import { FiMessageCircle } from 'react-icons/fi';

interface ReviewsSectionProps {
  productId: string;
  productName: string;
}

interface Review {
  _id: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  verified: boolean;
  helpful: number;
  createdAt: string;
  userId?: string;
}

interface RatingStats {
  average: number;
  total: number;
  distribution: { 5: number; 4: number; 3: number; 2: number; 1: number };
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ productId, productName }) => {
  const { token, user } = useAuthStore();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ratingStats, setRatingStats] = useState<RatingStats>({
    average: 0,
    total: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sort, setSort] = useState('recent');

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await reviewAPI.getProductReviews(productId, page, 10, sort);
        setReviews(response.data?.reviews || []);
        setRatingStats(response.data?.ratingStats || {
          average: 0,
          total: 0,
          distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        });
        setTotalPages(response.data?.pagination?.pages || 1);
      } catch (err: any) {
        console.error('Failed to fetch reviews:', err);
        setError('Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [productId, page, sort]);

  // Handle review submission
  const handleSubmitReview = async (data: { rating: number; title: string; comment: string }) => {
    try {
      setSubmitting(true);
      setError('');

      if (editingReview) {
        await reviewAPI.updateReview(editingReview._id, data);
      } else {
        await reviewAPI.createReview({
          productId,
          ...data,
        });
      }

      setShowForm(false);
      setEditingReview(null);
      setPage(1);
      
      // Refresh reviews
      const response = await reviewAPI.getProductReviews(productId, 1, 10, sort);
      setReviews(response.data?.reviews || []);
      setRatingStats(response.data?.ratingStats || {
        average: 0,
        total: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle review deletion
  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      await reviewAPI.deleteReview(reviewId);
      setReviews(reviews.filter((r) => r._id !== reviewId));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete review');
    }
  };

  const RatingBar = ({ rating, count, total }: { rating: number; count: number; total: number }) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700 w-8">{rating}★</span>
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-yellow-400 transition-all duration-300"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Rating Overview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <FiMessageCircle size={24} />
          Customer Reviews
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Summary */}
          <div className="text-center">
            <div className="text-5xl font-bold text-gray-900 mb-2">
              {ratingStats.average.toFixed(1)}
            </div>
            <div className="flex justify-center text-lg mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={star <= Math.round(ratingStats.average) ? 'text-yellow-400' : 'text-gray-300'}
                >
                  ★
                </span>
              ))}
            </div>
            <p className="text-sm text-gray-600">
              {ratingStats.total} {ratingStats.total === 1 ? 'review' : 'reviews'}
            </p>
          </div>

          {/* Distribution */}
          <div className="col-span-2 space-y-3">
            <RatingBar rating={5} count={ratingStats.distribution[5]} total={ratingStats.total} />
            <RatingBar rating={4} count={ratingStats.distribution[4]} total={ratingStats.total} />
            <RatingBar rating={3} count={ratingStats.distribution[3]} total={ratingStats.total} />
            <RatingBar rating={2} count={ratingStats.distribution[2]} total={ratingStats.total} />
            <RatingBar rating={1} count={ratingStats.distribution[1]} total={ratingStats.total} />
          </div>
        </div>

        {/* Write Review Button */}
        {token && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full mt-6 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
          >
            Write a Review
          </button>
        )}

        {!token && (
          <p className="text-sm text-gray-600 mt-6 text-center">
            Please <a href="/auth/login" className="text-green-600 hover:underline">login</a> to write a review
          </p>
        )}
      </div>

      {/* Sort and Filter */}
      {reviews.length > 0 && (
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Reviews</h3>
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="recent">Most Recent</option>
            <option value="rating-high">Highest Rating</option>
            <option value="rating-low">Lowest Rating</option>
            <option value="helpful">Most Helpful</option>
          </select>
        </div>
      )}

      {/* Reviews List */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      )}

      {!loading && reviews.length === 0 && (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
        </div>
      )}

      {!loading && reviews.length > 0 && (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard
              key={review._id}
              review={review}
              isAuthor={user?._id === review.userId}
              onEdit={(r) => {
                setEditingReview(r);
                setShowForm(true);
              }}
              onDelete={handleDeleteReview}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
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

      {/* Review Form Modal */}
      {showForm && (
        <ReviewForm
          productId={productId}
          productName={productName}
          onSubmit={handleSubmitReview}
          onClose={() => {
            setShowForm(false);
            setEditingReview(null);
          }}
          isLoading={submitting}
          error={error}
          initialData={
            editingReview
              ? {
                  rating: editingReview.rating,
                  title: editingReview.title,
                  comment: editingReview.comment,
                }
              : undefined
          }
        />
      )}
    </div>
  );
};
