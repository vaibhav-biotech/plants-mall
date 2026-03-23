'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiLoader } from 'react-icons/fi';
import { api, productAPI, categoryAPI } from '@/lib/api';

interface FormData {
  name: string;
  description: string;
  price: string;
  discount: string;
  category: string;
  stock: string;
  sku: string;
  isNewArrival?: boolean;
  isOfficeWorthy?: boolean;
  isGift?: boolean;
}

interface Category {
  _id: string;
  name: string;
}

export default function CreateProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    price: '',
    discount: '',
    category: '',
    stock: '',
    sku: '',
    isNewArrival: false,
    isOfficeWorthy: false,
    isGift: false,
  });

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await categoryAPI.getAll();
        setCategories(response.data.categories || []);
      } catch (err) {
        console.error('Failed to load categories');
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Product name is required');
      return false;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError('Valid price is required');
      return false;
    }
    if (!formData.stock || parseInt(formData.stock) < 0) {
      setError('Valid stock quantity is required');
      return false;
    }
    if (!formData.category) {
      setError('Category is required');
      return false;
    }
    if (!formData.sku.trim()) {
      setError('SKU is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Create FormData to handle file upload
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('price', parseFloat(formData.price).toString());
      formDataToSend.append('discount', formData.discount ? parseFloat(formData.discount).toString() : '0');
      formDataToSend.append('category', formData.category);
      formDataToSend.append('stock', parseInt(formData.stock).toString());
      formDataToSend.append('sku', formData.sku.trim());
      formDataToSend.append('isNewArrival', String(formData.isNewArrival || false));
      formDataToSend.append('isOfficeWorthy', String(formData.isOfficeWorthy || false));
      formDataToSend.append('isGift', String(formData.isGift || false));
      
      // Add image file if selected
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      // Use axios to send FormData with proper headers for file upload
      const response = await api.post('/products', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess('Product created successfully! Redirecting...');
      
      // Redirect after 1.5 seconds
      setTimeout(() => {
        router.push('/admin/products');
      }, 1500);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to create product. Please try again.';
      setError(errorMessage);
      console.error('Product creation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/products"
          className="p-2 hover:bg-gray-100 rounded-lg transition"
          title="Back to products"
        >
          <FiArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">Add New Product</h1>
          <p className="text-xs md:text-sm text-gray-600 mt-0.5">Create a new product for your catalog</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
        {/* Error Message */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            ❌ {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
            ✅ {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Monstera Deliciosa"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              disabled={loading}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Provide details about the product..."
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition resize-none"
              disabled={loading}
            />
          </div>

          {/* Two Column Layout - Price & Discount */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Price */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Price (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                disabled={loading}
              />
            </div>

            {/* Discount */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Discount (%)</label>
              <input
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleInputChange}
                placeholder="0"
                step="0.01"
                min="0"
                max="100"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                disabled={loading}
              />
            </div>
          </div>

          {/* Category & Stock */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition disabled:bg-gray-100"
                disabled={loading || categoriesLoading}
              >
                <option value="">{categoriesLoading ? 'Loading categories...' : 'Select a category'}</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {categories.length === 0 && !categoriesLoading && (
                <p className="text-xs text-orange-600 mt-1">No categories created yet. Please create categories first.</p>
              )}
            </div>

            {/* Stock */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Stock Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                disabled={loading}
              />
            </div>
          </div>

          {/* SKU */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              SKU <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="sku"
              value={formData.sku}
              onChange={handleInputChange}
              placeholder="e.g., MON001"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition font-mono"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">Unique product identifier</p>
          </div>

          {/* Collection Flags */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="text-sm font-semibold text-gray-700 mb-3">✨ Collection Flags</p>
            <div className="space-y-2.5">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isNewArrival || false}
                  onChange={(e) => setFormData({ ...formData, isNewArrival: e.target.checked })}
                  className="w-4 h-4 accent-green-600 rounded cursor-pointer"
                  disabled={loading}
                />
                <span className="text-sm text-gray-700">
                  🆕 <span className="font-semibold">New Arrival</span>
                  <span className="text-xs text-gray-500 block">Show in "New Arrivals" section</span>
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isOfficeWorthy || false}
                  onChange={(e) => setFormData({ ...formData, isOfficeWorthy: e.target.checked })}
                  className="w-4 h-4 accent-green-600 rounded cursor-pointer"
                  disabled={loading}
                />
                <span className="text-sm text-gray-700">
                  💼 <span className="font-semibold">Office Friendly</span>
                  <span className="text-xs text-gray-500 block">Show in "Office Friendly" section</span>
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isGift || false}
                  onChange={(e) => setFormData({ ...formData, isGift: e.target.checked })}
                  className="w-4 h-4 accent-green-600 rounded cursor-pointer"
                  disabled={loading}
                />
                <span className="text-sm text-gray-700">
                  🎁 <span className="font-semibold">Perfect Gift</span>
                  <span className="text-xs text-gray-500 block">Show in "Perfect Gifts" section</span>
                </span>
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-3">Tip: A product can have multiple flags at once!</p>
          </div>

          {/* Product Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Product Image</label>
            
            {imagePreview ? (
              <div className="relative">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-full max-w-xs h-64 object-cover rounded-lg border-2 border-green-500"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-500 transition cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={loading}
                  className="hidden"
                  id="image-input"
                />
                <label htmlFor="image-input" className="cursor-pointer block">
                  <div className="text-4xl mb-2">🖼️</div>
                  <p className="text-sm font-medium text-gray-700">Click to upload product image</p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, WebP (max 5MB)</p>
                </label>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <FiLoader size={16} className="animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Product'
              )}
            </button>
            <Link
              href="/admin/products"
              className="flex-1 md:flex-none bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2.5 rounded-lg font-semibold text-sm transition text-center"
            >
              Cancel
            </Link>
          </div>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs md:text-sm text-blue-800">
              <span className="font-semibold">✅ Tip:</span> You can upload a product image when creating the product. The image will be stored in AWS S3 and linked to your product.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
