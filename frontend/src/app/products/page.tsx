'use client';

import { useEffect, useState } from 'react';
import { productAPI, categoryAPI } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import { FiFilter, FiX } from 'react-icons/fi';
import { Suspense } from 'react';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discount: number;
  category: string;
  stock: number;
  sku: string;
  image?: string;
  isActive?: boolean;
}

interface Category {
  _id: string;
  name: string;
}

function ProductsPageContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [maxPrice, setMaxPrice] = useState(10000);

  // Fetch categories and products
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch categories
      const catResponse = await categoryAPI.getAll();
      setCategories(catResponse.data.categories || []);

      // Fetch products
      const prodResponse = await productAPI.getAll(1, 1000, '', '');
      const prods = prodResponse.data.products || [];
      setProducts(prods);
      
      // Calculate max price from products
      if (prods.length > 0) {
        const max = Math.max(...prods.map(p => p.price));
        setMaxPrice(Math.ceil(max));
        setPriceRange([0, Math.ceil(max)]);
      }
      
      setError('');
    } catch (err: any) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, []);

  // Refresh when tab becomes visible (user comes back from admin panel)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // User switched back to this tab, refresh products
        fetchData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Filter products by category and price range
  const filteredProducts = products.filter((p) => {
    const categoryMatch = !selectedCategory || p.category === selectedCategory;
    const priceMatch = p.price >= priceRange[0] && p.price <= priceRange[1];
    return categoryMatch && priceMatch;
  });

  // Get category counts for filtered view
  const getCategoryCount = (categoryName: string) => {
    return products.filter((p) => {
      const priceMatch = p.price >= priceRange[0] && p.price <= priceRange[1];
      return p.category === categoryName && priceMatch;
    }).length;
  };

  // Check if filters are active
  const hasActiveFilters = selectedCategory !== '' || priceRange[0] !== 0 || priceRange[1] !== maxPrice;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Our Plants</h1>
            <p className="text-gray-600">Explore our collection of beautiful plants</p>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition font-medium"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Mobile Filter Toggle */}
        <div className="md:hidden mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full bg-white border border-gray-300 text-gray-900 px-4 py-3 rounded-lg flex items-center justify-center gap-2 font-medium hover:bg-gray-50"
          >
            <FiFilter size={18} />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Filters - Desktop visible, Mobile toggle */}
          <div className={`${showFilters ? 'block' : 'hidden'} md:block md:w-64 flex-shrink-0`}>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Filters</h2>
                {hasActiveFilters && (
                  <button
                    onClick={() => {
                      setSelectedCategory('');
                      setPriceRange([0, maxPrice]);
                    }}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div className="mb-8 pb-8 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Category</h3>
                <div className="space-y-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      value=""
                      checked={selectedCategory === ''}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-4 h-4 text-green-600 cursor-pointer"
                    />
                    <span className="ml-3 text-gray-700 flex-1">
                      All Categories
                    </span>
                    <span className="text-sm text-gray-500">({products.length})</span>
                  </label>
                  {categories.map((cat) => (
                    <label key={cat._id} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        value={cat.name}
                        checked={selectedCategory === cat.name}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-4 h-4 text-green-600 cursor-pointer"
                      />
                      <span className="ml-3 text-gray-700 flex-1">{cat.name}</span>
                      <span className="text-sm text-gray-500">({getCategoryCount(cat.name)})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Price Range</h3>
                
                <div className="space-y-4">
                  {/* Price Sliders */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Min Price</label>
                    <input
                      type="range"
                      min="0"
                      max={maxPrice}
                      value={priceRange[0]}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (val <= priceRange[1]) {
                          setPriceRange([val, priceRange[1]]);
                        }
                      }}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Max Price</label>
                    <input
                      type="range"
                      min="0"
                      max={maxPrice}
                      value={priceRange[1]}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (val >= priceRange[0]) {
                          setPriceRange([priceRange[0], val]);
                        }
                      }}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                    />
                  </div>

                  {/* Price Input Fields */}
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">From</label>
                      <input
                        type="number"
                        value={priceRange[0]}
                        onChange={(e) => {
                          const val = Number(e.target.value) || 0;
                          if (val <= priceRange[1]) {
                            setPriceRange([val, priceRange[1]]);
                          }
                        }}
                        min="0"
                        max={priceRange[1]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">To</label>
                      <input
                        type="number"
                        value={priceRange[1]}
                        onChange={(e) => {
                          const val = Number(e.target.value) || maxPrice;
                          if (val >= priceRange[0]) {
                            setPriceRange([priceRange[0], val]);
                          }
                        }}
                        min={priceRange[0]}
                        max={maxPrice}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  {/* Price Display */}
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-sm text-gray-600">₹{priceRange[0].toLocaleString('en-IN')} - ₹{priceRange[1].toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products Section */}
          <div className="flex-1">
            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-700">
                    <strong>Active filters:</strong>{' '}
                    {selectedCategory && <span className="ml-2">Category: <strong>{selectedCategory}</strong></span>}
                    {(priceRange[0] !== 0 || priceRange[1] !== maxPrice) && (
                      <span className="ml-2">
                        Price: <strong>₹{priceRange[0].toLocaleString('en-IN')} - ₹{priceRange[1].toLocaleString('en-IN')}</strong>
                      </span>
                    )}
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory('');
                      setPriceRange([0, maxPrice]);
                    }}
                    className="ml-4 text-blue-600 hover:text-blue-700 text-sm font-medium whitespace-nowrap flex items-center gap-1"
                  >
                    Clear all <FiX size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-8 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  No products found matching your filters
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard 
                    key={product._id}
                    id={product._id}
                    name={product.name}
                    price={product.price}
                    discount={product.discount}
                    image={product.image || '/default-plant.jpg'}
                    category={product.category}
                    stock={product.stock}
                  />
                ))}
              </div>
            )}

            {/* Stats */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center">
                Showing {filteredProducts.length} of {products.length} products
                {categories.length > 0 && ` • ${categories.length} categories available`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>}>
      <ProductsPageContent />
    </Suspense>
  );
}
