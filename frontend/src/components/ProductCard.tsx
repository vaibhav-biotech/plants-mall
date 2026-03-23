'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useDrawerStore } from '../lib/store';
import ProductDetailDrawer from './ProductDetailDrawer';
import { useState, useEffect } from 'react';
import { productAPI, wishlistAPI } from '../lib/api';
import { useAuthStore } from '../lib/authStore';
import { FiHeart, FiX } from 'react-icons/fi';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  discount: number;
  image: string;
  category: string;
  stock?: number;
}

export default function ProductCard({ id, name, price, discount, image, category, stock = 0 }: ProductCardProps) {
  const finalPrice = price - (price * discount) / 100;
  const { openDrawer } = useDrawerStore();
  const [product, setProduct] = useState<any>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { isAuthenticated } = useAuthStore();

  // Check if product is in wishlist on mount
  useEffect(() => {
    const checkWishlist = async () => {
      if (!isAuthenticated) return;
      try {
        const response = await wishlistAPI.getAll();
        const wishlisted = response.data?.some((item: any) => item._id === id || item.productId === id);
        setIsWishlisted(wishlisted || false);
      } catch (error) {
        console.error('Error checking wishlist:', error);
      }
    };
    checkWishlist();
  }, [id, isAuthenticated]);

  const handleViewDetails = async () => {
    try {
      const response = await productAPI.getById(id);
      setProduct(response.data);
      openDrawer(<ProductDetailDrawer product={response.data} />);
    } catch (error) {
      console.error('Error fetching product:', error);
    }
  };

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    try {
      if (isWishlisted) {
        await wishlistAPI.remove(id);
        setIsWishlisted(false);
      } else {
        await wishlistAPI.add(id);
        setIsWishlisted(true);
      }
    } catch (error) {
      console.error('Wishlist error:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden cursor-pointer group relative">
      <div
        className="relative h-96 bg-gray-200 overflow-hidden"
        onClick={handleViewDetails}
      >
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover group-hover:scale-110 transition duration-300"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
        )}
        {discount > 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-lg text-sm font-bold shadow-lg">
            -{discount}%
          </div>
        )}
        
        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          className={`absolute top-2 left-2 p-2 rounded-full transition-all z-10 ${
            isWishlisted 
              ? 'bg-red-600 text-white shadow-lg' 
              : 'bg-white text-gray-600 hover:bg-red-100 hover:text-red-600 shadow-md hover:shadow-lg'
          }`}
          title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <FiHeart size={20} fill={isWishlisted ? 'currentColor' : 'none'} strokeWidth={isWishlisted ? 0 : 2} />
        </button>
      </div>
      <div className="p-4">
        <p className="text-xs text-gray-500 mb-2 uppercase font-semibold">{category}</p>
        <h3 className="font-semibold text-gray-800 truncate group-hover:text-primary transition">{name}</h3>
        <div className="mt-4">
          <div className="mb-3">
            {discount > 0 ? (
              <>
                <span className="text-lg font-bold text-primary">₹{finalPrice.toFixed(2)}</span>
                <span className="text-sm text-gray-500 line-through ml-2">₹{price}</span>
              </>
            ) : (
              <span className="text-lg font-bold text-primary">₹{price}</span>
            )}
          </div>
          
          {/* Stock Status */}
          <div className="mb-3">
            {stock > 10 ? (
              <p className="text-xs text-green-600 font-semibold">✓ In Stock ({stock} available)</p>
            ) : stock > 0 ? (
              <p className="text-xs text-orange-600 font-semibold">⚠ Low Stock ({stock} left)</p>
            ) : (
              <p className="text-xs text-red-600 font-semibold">✗ Out of Stock</p>
            )}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleViewDetails}
              className="flex-1 bg-emerald-600 text-white px-3 py-2.5 rounded-md hover:bg-emerald-700 active:bg-emerald-800 transition text-sm font-semibold shadow-sm hover:shadow-md duration-200"
            >
              View
            </button>
            <Link
              href={`/products/${id}`}
              className="flex-1 bg-slate-200 text-slate-700 px-3 py-2.5 rounded-md hover:bg-slate-300 active:bg-slate-400 transition text-sm font-semibold shadow-sm hover:shadow-md duration-200 text-center"
            >
              Details
            </Link>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-8">
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">🔐</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h2>
              <p className="text-gray-600">Please log in to add items to your wishlist.</p>
            </div>
            
            <div className="space-y-3">
              <Link
                href="/auth/login"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition text-center block"
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-2 px-4 rounded-lg transition text-center block"
              >
                Create Account
              </Link>
              <button
                onClick={() => setShowLoginModal(false)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-2 px-4 rounded-lg transition"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
