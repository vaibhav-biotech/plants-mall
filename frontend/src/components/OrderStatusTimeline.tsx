'use client';

import { useState } from 'react';
import { FiCheck, FiAlertCircle } from 'react-icons/fi';

interface OrderStatusTimelineProps {
  status: string;
  orderId: string;
  canCancel?: boolean;
  onCancelClick?: () => void;
  isCancelling?: boolean;
}

export default function OrderStatusTimeline({
  status,
  orderId,
  canCancel,
  onCancelClick,
  isCancelling = false,
}: OrderStatusTimelineProps) {
  // Normalize status names (handle both old and new names)
  const normalizeStatus = (s: string) => {
    const statusMap: any = {
      'pending': 'placed',
      'shipped': 'shipping',
      'in-transit': 'transit',
    };
    return statusMap[s] || s;
  };

  const normalizedStatus = normalizeStatus(status);
  const statuses = ['placed', 'confirmed', 'processing', 'shipping', 'transit', 'delivered'];
  const statusLabels = {
    placed: 'Order Placed',
    confirmed: 'Order Confirmed',
    processing: 'Processing',
    shipping: 'Shipping',
    transit: 'In Transit',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };

  const statusEmojis = {
    placed: '📦',
    confirmed: '✅',
    processing: '⚙️',
    shipping: '🚚',
    transit: '🚛',
    delivered: '🎉',
    cancelled: '❌',
  };

  const currentIndex = statuses.indexOf(normalizedStatus);
  const isCancelled = normalizedStatus === 'cancelled';
  // Allow cancel if NOT delivered and NOT already cancelled
  const allowCancel = canCancel && !['delivered', 'cancelled'].includes(normalizedStatus);

  return (
    <div className="py-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Status</h3>

      {/* Status Timeline */}
      <div className="space-y-4">
        {isCancelled ? (
          <div className="flex flex-col items-center justify-center py-8 bg-red-50 rounded-lg border-2 border-red-300">
            <span className="text-4xl mb-2">❌</span>
            <p className="text-lg font-semibold text-red-700">Order Cancelled</p>
            <p className="text-sm text-red-600">This order has been cancelled</p>
          </div>
        ) : (
          <div className="relative">
            {statuses.map((s, index) => {
              const isCompleted = index < currentIndex;
              const isCurrent = index === currentIndex;

              return (
                <div key={s} className="flex items-center mb-4">
                  {/* Connector Line */}
                  {index < statuses.length - 1 && (
                    <div
                      className={`absolute left-6 top-16 w-1 h-10 ${
                        isCompleted || isCurrent ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                      style={{ width: '2px' }}
                    />
                  )}

                  {/* Status Circle */}
                  <div className="relative z-10 mr-4">
                    {isCompleted ? (
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                        <FiCheck size={24} className="text-white" />
                      </div>
                    ) : isCurrent ? (
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shadow-lg border-4 border-blue-300 animate-pulse">
                        <span className="text-xl">{statusEmojis[s as keyof typeof statusEmojis]}</span>
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center shadow">
                        <span className="text-gray-600">○</span>
                      </div>
                    )}
                  </div>

                  {/* Status Label */}
                  <div>
                    <p
                      className={`font-semibold ${
                        isCurrent
                          ? 'text-blue-600'
                          : isCompleted
                          ? 'text-green-600'
                          : 'text-gray-500'
                      }`}
                    >
                      {statusLabels[s as keyof typeof statusLabels]}
                    </p>
                    <p className="text-xs text-gray-500">
                      {isCompleted ? '✓ Completed' : isCurrent ? 'Currently here' : 'Pending'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
