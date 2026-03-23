'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { FiShoppingCart, FiHeart, FiTruck, FiRotateCcw, FiShield, FiShare2, FiCheck, FiStar, FiMapPin, FiX } from 'react-icons/fi';
import { useCartStore } from '../../../lib/store';
import { productAPI, wishlistAPI } from '../../../lib/api';
import { useAuthStore } from '../../../lib/authStore';
import { ReviewsSection } from '../../../components/ReviewsSection';
import Link from 'next/link';

// Mock product data - will be replaced with API call
const mockProduct = {
  _id: '1',
  name: 'Red Rose Plant',
  description: 'Beautiful red rose plant with vibrant red flowers. Perfect for decorating your home garden. This rose plant comes with proper care instructions and grows well in both indoor and outdoor settings.',
  price: 899,
  discount: 15,
  image: '',
  category: 'Flowering',
  stock: 25,
  sku: 'ROSE001',
  isActive: true,
  fullDescription: 'The Red Rose Plant is one of the most elegant and beautiful flowering plants you can own. These stunning roses are carefully cultivated to ensure vibrant red blooms that last for months. Perfect for gifting, home decoration, or garden enhancement.\n\nFeatures:\n• Natural red blooms\n• Easy to maintain\n• Requires moderate sunlight\n• Perfect humidity retention\n• Long flowering period\n\nCare Instructions:\n• Water daily but avoid waterlogging\n• Place in indirect sunlight\n• Maintain temperature between 15-25°C\n• Use well-draining soil\n• Fertilize once a month during growing season'
};

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [product, setProduct] = useState<any>(mockProduct);
  const [loading, setLoading] = useState(true);
  const [shareCopieid, setShareCopied] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'about' | 'specs' | 'reviews' | 'care'>('about');
  const [deliveryPin, setDeliveryPin] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    fetchProduct();
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getById(params.id);
      if (response.data) {
        setProduct(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch product:', err);
      // Fall back to mock data if API fails
      setProduct(mockProduct);
    } finally {
      setLoading(false);
    }
  };

  // Get the price based on selected variant or base price
  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;
  const finalPrice = currentPrice - (currentPrice * product.discount) / 100;
  const savings = currentPrice * product.discount / 100;

  const handleAddToCart = () => {
    addItem({
      id: product._id,
      name: product.name,
      price: currentPrice,
      discount: product.discount,
      image: product.image,
      quantity: quantity
    });
    setQuantity(1);
  };

  const handleWishlistClick = async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    try {
      if (isWishlisted) {
        // Remove from wishlist
        await wishlistAPI.remove(product._id);
        setIsWishlisted(false);
      } else {
        // Add to wishlist
        await wishlistAPI.add(product._id);
        setIsWishlisted(true);
      }
    } catch (error) {
      console.error('Wishlist error:', error);
    }
  };

  const handleShare = async () => {
    const shareUrl = typeof window !== 'undefined' 
      ? `${window.location.origin}/products/${params.id}`
      : `http://localhost:3000/products/${params.id}`;

    // Copy to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }

    // Try native share if available
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name} on Plants Mall!`,
          url: shareUrl,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    }
  };

  const handleCheckDelivery = () => {
    if (!deliveryPin || deliveryPin.length !== 6) {
      alert('Please enter a valid 6-digit pin code');
      return;
    }
    // Simulate delivery check - in real scenario, call API
    const delivery = new Date();
    delivery.setDate(delivery.getDate() + 2);
    const deliveryDate = delivery.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
    setEstimatedDelivery(deliveryDate);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product || !product.name) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">Product not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Product Image Section */}
          <div className="bg-white rounded-lg shadow-sm sticky top-20 h-fit relative">
            <div className="relative w-full h-[700px] bg-white rounded-lg overflow-hidden">
              {selectedImage || product.image ? (
                <Image
                  src={selectedImage || product.image}
                  alt={product.name || 'Product'}
                  fill
                  className="object-contain hover:scale-110 transition-transform duration-300"
                  priority
                  unoptimized={(selectedImage || product.image).includes('s3') || (selectedImage || product.image).includes('amazonaws')}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <span className="text-3xl">📸 No image</span>
                </div>
              )}
            </div>

            {/* Image Gallery Overlay */}
            {product.images && product.images.length > 0 && (
              <div className="absolute bottom-4 left-0 right-0 mx-4">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {product.images.map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className={`relative w-16 h-16 flex-shrink-0 bg-gray-200 rounded cursor-pointer hover:ring-2 hover:ring-green-500 transition ${
                        selectedImage === img ? 'ring-2 ring-green-600' : ''
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`${product.name} - ${idx + 1}`}
                        fill
                        className="object-cover rounded"
                        unoptimized={img.includes('s3') || img.includes('amazonaws')}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Product Details Section */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full mb-3">
                    {product.category}
                  </span>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{product.name}</h1>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleShare}
                    className={`p-2 rounded-full transition-colors relative ${
                      shareCopieid ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                    }`}
                    title="Share this product"
                  >
                    {shareCopieid ? <FiCheck size={24} /> : <FiShare2 size={24} />}
                    {shareCopieid && (
                      <span className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap">
                        Link copied!
                      </span>
                    )}
                  </button>
                  <button
                    onClick={handleWishlistClick}
                    className={`p-2 rounded-full transition-colors ${
                      isWishlisted ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
                    }`}
                  >
                    <FiHeart size={24} fill={isWishlisted ? 'currentColor' : 'none'} />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                <span>⭐ 4.8 (2,345 reviews)</span>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-3">
                <div className="flex items-baseline gap-4">
                  <span className="text-4xl font-bold text-green-600">₹{finalPrice.toFixed(0)}</span>
                  <span className="text-xl text-gray-500 line-through">₹{currentPrice}</span>
                  <span className="text-lg font-semibold text-red-600 bg-red-50 px-3 py-1 rounded">
                    {product.discount}% OFF
                  </span>
                </div>
                <p className="text-sm text-green-700 font-medium">💚 You save ₹{savings.toFixed(0)}</p>
                {selectedVariant && (
                  <p className="text-sm text-blue-700 font-semibold">✓ Size: {selectedVariant.size} selected</p>
                )}
              </div>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-3 p-4">
              {currentStock > 10 ? (
                <>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-800">In Stock • Only {currentStock} left</span>
                </>
              ) : (
                <>
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm font-medium text-red-700">Low Stock</span>
                </>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Quantity</label>
              <div className="flex items-center border-2 border-gray-200 rounded-lg w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  max={currentStock}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 text-center border-0 outline-none font-semibold"
                />
                <button
                  onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Size Variants Selector */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Size</label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant: any, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedVariant(variant)}
                      disabled={variant.stock === 0}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        selectedVariant?.size === variant.size
                          ? 'bg-green-600 text-white border-2 border-green-600'
                          : 'bg-gray-100 text-gray-800 border-2 border-gray-200 hover:border-green-500'
                      } ${variant.stock === 0 ? 'opacity-50 cursor-not-allowed line-through' : ''}`}
                    >
                      {variant.size}
                      {selectedVariant?.size === variant.size && ' ✓'}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-3 rounded flex items-center justify-center gap-2 transition-colors text-sm"
              >
                <FiShoppingCart size={16} />
                Add to Cart
              </button>
              <button className="flex-1 bg-white hover:bg-green-50 text-green-600 font-semibold py-2 px-3 rounded border-2 border-green-600 transition-colors text-sm">
                Buy Now
              </button>
            </div>

            {/* Check Delivery Availability */}
            <div className="p-3">
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">📍 Delivery Pincode</label>
                  <input
                    type="text"
                    placeholder="Enter 6-digit pin"
                    value={deliveryPin}
                    onChange={(e) => setDeliveryPin(e.target.value)}
                    maxLength={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm outline-none focus:border-gray-500"
                  />
                </div>
                <button
                  onClick={handleCheckDelivery}
                  className="px-3 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded text-xs font-medium transition-colors"
                >
                  Check
                </button>
              </div>
              {estimatedDelivery && (
                <p className="text-xs text-gray-700 mt-2 font-medium">✓ Delivery by {estimatedDelivery}</p>
              )}
            </div>

            {/* Benefits - Single Line */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t">
              <div className="flex flex-col items-center text-center">
                <FiTruck className="text-gray-700 mb-1" size={18} />
                <p className="text-xs font-semibold text-gray-900">Free Delivery</p>
                <p className="text-xs text-gray-600">Above ₹500</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <FiRotateCcw className="text-gray-700 mb-1" size={18} />
                <p className="text-xs font-semibold text-gray-900">Easy Returns</p>
                <p className="text-xs text-gray-600">7 Days</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <FiShield className="text-gray-700 mb-1" size={18} />
                <p className="text-xs font-semibold text-gray-900">Authentic</p>
                <p className="text-xs text-gray-600">Guaranteed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="mt-12 bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Product Description</h2>
          <p className="text-gray-700 whitespace-pre-line leading-relaxed mb-8">
            {product.description || product.fullDescription}
          </p>
        </div>

        {/* Tabs Section */}
        <div className="mt-12 bg-white rounded-lg shadow-sm p-8">
          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-0 border-b-2 border-gray-200 mb-8">
            {['about', 'specs', 'reviews', 'care'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`py-3 px-6 font-semibold text-sm sm:text-base transition-colors border-b-2 -mb-[2px] ${
                  activeTab === tab
                    ? 'text-green-600 border-green-600'
                    : 'text-gray-600 border-transparent hover:text-gray-900'
                }`}
              >
                {tab === 'about' && 'About Product'}
                {tab === 'specs' && 'Specifications'}
                {tab === 'reviews' && 'Reviews'}
                {tab === 'care' && 'Care Guide'}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'about' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">About this Plant</h2>
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                {product.description || product.fullDescription}
              </p>
              
              {/* Product Highlights */}
              {product.variants && product.variants.length > 0 && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-gray-900 mb-3">What's in the Box</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-center gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Premium {product.name} Plant</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Pot & Soil</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Care Instructions Card</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>30-day Assurance</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Product Specifications</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="font-semibold text-gray-700">SKU</span>
                    <span className="text-gray-600">{product.sku}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="font-semibold text-gray-700">Category</span>
                    <span className="text-gray-600">{product.category}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="font-semibold text-gray-700">Stock Available</span>
                    <span className="text-green-600 font-semibold">{product.stock} units</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="font-semibold text-gray-700">Delivery Time</span>
                    <span className="text-gray-600">2-3 business days</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="font-semibold text-gray-700">Return Period</span>
                    <span className="text-gray-600">7 days</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="font-semibold text-gray-700">Warranty</span>
                    <span className="text-gray-600">30 days</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <ReviewsSection productId={product._id} productName={product.name} />
          )}

          {activeTab === 'care' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">🌱 Complete Care Guide</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.careInfo?.watering && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="font-semibold text-gray-900 mb-1">💧 Watering</p>
                    <p className="text-sm text-gray-700">{product.careInfo.watering}</p>
                  </div>
                )}
                {product.careInfo?.sunlight && (
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="font-semibold text-gray-900 mb-1">☀️ Sunlight</p>
                    <p className="text-sm text-gray-700">{product.careInfo.sunlight}</p>
                  </div>
                )}
                {product.careInfo?.temperature && (
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <p className="font-semibold text-gray-900 mb-1">🌡️ Temperature</p>
                    <p className="text-sm text-gray-700">{product.careInfo.temperature}</p>
                  </div>
                )}
                {product.careInfo?.humidity && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="font-semibold text-gray-900 mb-1">💨 Humidity</p>
                    <p className="text-sm text-gray-700">{product.careInfo.humidity}</p>
                  </div>
                )}
                {product.careInfo?.difficulty && (
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="font-semibold text-gray-900 mb-1">📊 Difficulty Level</p>
                    <p className="text-sm text-gray-700">{product.careInfo.difficulty}</p>
                  </div>
                )}
                {product.careInfo?.growth && (
                  <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                    <p className="font-semibold text-gray-900 mb-1">📈 Growth Rate</p>
                    <p className="text-sm text-gray-700">{product.careInfo.growth}</p>
                  </div>
                )}
              </div>
              {product.careInfo?.petFriendly && (
                <div className="p-4 bg-green-100 rounded-lg border-2 border-green-500">
                  <p className="font-semibold text-green-900 text-lg">🐾 Pet Friendly</p>
                  <p className="text-sm text-green-800 mt-1">Safe for cats, dogs, and other pets</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* People Also Buy Section */}
        <div className="mt-12 bg-white rounded-lg shadow-sm p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">👥 People Also Buy</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((idx) => {
              // Generate random product from available products
              const randomIndex = Math.floor(Math.random() * 5);
              const randomProducts = [
                { name: 'Monstera Deliciosa', price: 899, discount: 10, image: '', rating: 4.7 },
                { name: 'Pothos Golden', price: 499, discount: 15, image: '', rating: 4.8 },
                { name: 'Snake Plant', price: 599, discount: 5, image: '', rating: 4.9 },
                { name: 'Philodendron Pink', price: 799, discount: 20, image: '', rating: 4.6 },
                { name: 'Areca Palm', price: 1299, discount: 12, image: '', rating: 4.5 }
              ];
              const randomProduct = randomProducts[randomIndex];
              return (
                <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-48 bg-gray-100">
                    <Image
                      src={randomProduct.image}
                      alt={randomProduct.name}
                      fill
                      className="object-cover"
                    />
                    {randomProduct.discount > 0 && (
                      <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold">
                        {randomProduct.discount}% OFF
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-600 mb-1">Indoor Plant</p>
                    <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">{randomProduct.name}</h4>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs text-gray-600">⭐ {randomProduct.rating}</span>
                    </div>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-lg font-bold text-gray-900">₹{(randomProduct.price - (randomProduct.price * randomProduct.discount) / 100).toFixed(0)}</span>
                      <span className="text-sm text-gray-500 line-through">₹{randomProduct.price}</span>
                    </div>
                    <button className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium transition-colors">
                      Add to Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>      </div>

      {/* Login Modal for Wishlist */}
      {showLoginModal && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowLoginModal(false)} />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-2xl z-50 w-full max-w-md p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Login Required</h2>
              <button onClick={() => setShowLoginModal(false)} className="text-gray-400 hover:text-gray-600">
                <FiX size={28} />
              </button>
            </div>

            <div className="mb-6">
              <FiHeart size={48} className="text-red-500 mx-auto mb-4" />
              <p className="text-center text-gray-600 mb-2">
                You need to be logged in to add products to your wishlist.
              </p>
              <p className="text-center text-sm text-gray-500">
                Create an account or login to save your favorite items.
              </p>
            </div>

            <div className="space-y-3">
              <Link
                href="/auth/login"
                onClick={() => setShowLoginModal(false)}
                className="block w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-semibold text-center transition"
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                onClick={() => setShowLoginModal(false)}
                className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-3 rounded-lg font-semibold text-center transition"
              >
                Create Account
              </Link>
              <button
                onClick={() => setShowLoginModal(false)}
                className="w-full border-2 border-gray-300 hover:border-gray-400 text-gray-700 px-4 py-3 rounded-lg font-semibold transition"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}