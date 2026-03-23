import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';

interface ReviewFormProps {
  productId: string;
  productName: string;
  onSubmit: (data: { rating: number; title: string; comment: string }) => Promise<void>;
  onClose: () => void;
  isLoading?: boolean;
  error?: string;
  initialData?: {
    rating: number;
    title: string;
    comment: string;
  };
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  productId,
  productName,
  onSubmit,
  onClose,
  isLoading = false,
  error = '',
  initialData,
}) => {
  const [rating, setRating] = useState(initialData?.rating || 0);
  const [title, setTitle] = useState(initialData?.title || '');
  const [comment, setComment] = useState(initialData?.comment || '');
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (!rating) {
      setSubmitError('Please select a rating');
      return;
    }

    if (!title.trim()) {
      setSubmitError('Please enter a title');
      return;
    }

    if (!comment.trim()) {
      setSubmitError('Please enter your review');
      return;
    }

    try {
      await onSubmit({ rating, title: title.trim(), comment: comment.trim() });
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit review');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Write a Review</h2>
            <p className="text-sm text-gray-600 mt-1">{productName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {(error || submitError) && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error || submitError}
            </div>
          )}

          {/* Rating */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Rating *</label>
            <div className="flex gap-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-4xl transition ${
                    star <= rating
                      ? 'text-yellow-400'
                      : 'text-gray-300 hover:text-yellow-200'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-gray-600 mt-2">
                {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
              </p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Review Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience..."
              maxLength={100}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <p className="text-xs text-gray-500 mt-1">{title.length}/100</p>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Your Review *
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this product..."
              rows={6}
              maxLength={1000}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">{comment.length}/1000</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
            >
              {isLoading ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
