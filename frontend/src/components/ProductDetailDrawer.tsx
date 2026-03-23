'use client';

import { useState } from 'react';
import { useDrawerStore, useCartStore } from '../lib/store';
import Image from 'next/image';
import { FiShoppingCart, FiHeart } from 'react-icons/fi';

interface ProductDetailDrawerProps {
  product: {
    _id: string;
    name: string;
    description: string;
    price: number;
    discount: number;
    image: string;
    category: string;
    stock: number;
  };
}

const GIFT_CHARGE = 99;

export default function ProductDetailDrawer({ product }: ProductDetailDrawerProps) {
  const { closeDrawer } = useDrawerStore();
  const { addItem } = useCartStore();
  const [isGift, setIsGift] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');
  const [giftRecipient, setGiftRecipient] = useState('');
  
  const finalPrice = product.price - (product.price * product.discount) / 100;
  const totalWithGift = isGift ? finalPrice + GIFT_CHARGE : finalPrice;

  const handleAddToCart = () => {
    addItem({
      id: product._id,
      name: product.name,
      price: product.price,
      discount: product.discount,
      image: product.image,
      quantity: 1,
      isGift: isGift,
      giftMessage: giftMessage,
      giftRecipient: giftRecipient,
      giftCharge: isGift ? GIFT_CHARGE : 0,
    });
    closeDrawer();
  };

  return (
    <div className="space-y-6">
      <div className="relative h-80 bg-gray-200 rounded-lg overflow-hidden">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            unoptimized={product.image.includes('s3') || product.image.includes('amazonaws')}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-xl">📸 No Image</div>
        )}
        {product.discount > 0 && (
          <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-lg font-bold">
            -{product.discount}%
          </div>
        )}
      </div>

      <div>
        <div className="mb-2">
          <span className="text-xs bg-primary text-white px-3 py-1 rounded-full">
            {product.category}
          </span>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
        <p className="text-gray-600 mb-4">{product.description}</p>

        <div className="flex items-center gap-4 mb-4">
          <div>
            <span className="text-4xl font-bold text-primary">₹{totalWithGift.toFixed(2)}</span>
            {product.discount > 0 && (
              <span className="text-lg text-gray-500 line-through ml-2">₹{product.price}</span>
            )}
            {isGift && (
              <div className="text-sm text-amber-600 mt-1">
                Product: ₹{finalPrice.toFixed(2)} + Gift: ₹{GIFT_CHARGE}
              </div>
            )}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-800">
            📦 <span className="font-semibold">{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</span>
          </p>
        </div>

        {/* Gift Option Section */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
          <label className="flex items-center gap-3 cursor-pointer mb-3">
            <input
              type="checkbox"
              checked={isGift}
              onChange={(e) => setIsGift(e.target.checked)}
              className="w-5 h-5 rounded cursor-pointer"
            />
            <span className="font-semibold text-amber-900">🎁 Make this a Gift</span>
            {isGift && <span className="text-sm bg-amber-200 text-amber-900 px-2 py-1 rounded">+₹{GIFT_CHARGE}</span>}
          </label>

          {isGift && (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Recipient's Name"
                value={giftRecipient}
                onChange={(e) => setGiftRecipient(e.target.value)}
                className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
              />
              <textarea
                placeholder="Gift message (optional)"
                value={giftMessage}
                onChange={(e) => setGiftMessage(e.target.value)}
                className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm resize-none"
                rows={3}
                maxLength={150}
              />
              <p className="text-xs text-amber-700">✓ Beautiful gift wrapping & greeting card included</p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="w-full bg-primary text-white py-4 rounded-lg font-semibold hover:bg-secondary transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <FiShoppingCart size={20} />
            Add to Cart
          </button>
          <button className="w-full border-2 border-primary text-primary py-3 rounded-lg font-semibold hover:bg-primary hover:text-white transition flex items-center justify-center gap-2">
            <FiHeart size={20} />
            Add to Wishlist
          </button>
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="font-bold text-gray-800 mb-4">Product Details</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Category:</span>
            <span className="font-semibold">{product.category}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Stock:</span>
            <span className={`font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {product.stock > 0 ? 'Available' : 'Out of Stock'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">SKU:</span>
            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{product._id}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
