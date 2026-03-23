'use client';

import { useCartStore, useDrawerStore } from '../lib/store';
import Image from 'next/image';
import { FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi';
import Link from 'next/link';

interface CartDrawerProps {
  onCheckout?: () => void;
}

export default function CartDrawer({ onCheckout }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, getTotalPrice } = useCartStore();
  const { closeDrawer } = useDrawerStore();

  const handleCheckout = () => {
    closeDrawer();
    localStorage.setItem('checkoutInitiated', 'true');
    // Navigation will happen via Link
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-6xl mb-4">🛒</div>
        <p className="text-gray-600 text-lg">Your cart is empty</p>
        <p className="text-gray-500 text-sm mt-2">Start adding plants!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {items.map((item) => {
          const finalPrice = item.price - (item.price * item.discount) / 100;
          return (
            <div
              key={item.id}
              className="flex gap-4 pb-4 border-b"
            >
              <div className="relative w-24 h-24 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                {item.image ? (
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{item.name}</h3>
                <p className="text-primary font-bold">₹{finalPrice.toFixed(2)}</p>
                {item.isGift && (
                  <div className="text-sm text-amber-600 mt-1">
                    🎁 Gift: +₹{item.giftCharge} | To: {item.giftRecipient}
                  </div>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <FiMinus size={16} />
                  </button>
                  <span className="w-8 text-center font-semibold">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <FiPlus size={16} />
                  </button>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="ml-auto p-1 text-red-500 hover:bg-red-50 rounded"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t pt-4 space-y-3 sticky bottom-0 bg-white py-4">
        <div className="flex justify-between text-lg font-bold">
          <span>Total:</span>
          <span className="text-primary">₹{getTotalPrice().toFixed(2)}</span>
        </div>
        <Link
          href="/checkout"
          onClick={handleCheckout}
          className="block w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-secondary transition text-center"
        >
          Checkout
        </Link>
      </div>
    </div>
  );
}
