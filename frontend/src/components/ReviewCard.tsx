import React from 'react';
import { FiThumbsUp, FiTrash2, FiEdit2 } from 'react-icons/fi';

interface ReviewCardProps {
  review: {
    _id: string;
    userName: string;
    rating: number;
    title: string;
    comment: string;
    verified: boolean;
    helpful: number;
    createdAt: string;
  };
  isAuthor?: boolean;
  onEdit?: (review: any) => void;
  onDelete?: (reviewId: string) => void;
}

const StarRating = ({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) => {
  const sizeClass = size === 'md' ? 'text-lg' : 'text-sm';
  return (
    <div className={`flex gap-1 ${sizeClass}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}>
          ★
        </span>
      ))}
    </div>
  );
};

export const ReviewCard: React.FC<ReviewCardProps> = ({ review, isAuthor, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <StarRating rating={review.rating} size="md" />
            {review.verified && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                ✓ Verified Purchase
              </span>
            )}
          </div>
          <p className="font-semibold text-gray-900">{review.title}</p>
          <p className="text-sm text-gray-500">
            {review.userName} • {new Date(review.createdAt).toLocaleDateString('en-IN')}
          </p>
        </div>
        {isAuthor && (
          <div className="flex gap-2">
            <button
              onClick={() => onEdit?.(review)}
              className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition"
              title="Edit review"
            >
              <FiEdit2 size={16} />
            </button>
            <button
              onClick={() => onDelete?.(review._id)}
              className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition"
              title="Delete review"
            >
              <FiTrash2 size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Comment */}
      <p className="text-gray-700 text-sm mb-3">{review.comment}</p>

      {/* Footer */}
      <div className="flex items-center gap-3">
        <button className="text-xs text-gray-500 hover:text-blue-600 flex items-center gap-1 transition">
          <FiThumbsUp size={14} />
          Helpful ({review.helpful})
        </button>
      </div>
    </div>
  );
};
