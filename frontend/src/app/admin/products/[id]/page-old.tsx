'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FiArrowLeft, FiLoader, FiTrash2, FiX } from 'react-icons/fi';
import { api, categoryAPI } from '../../../../lib/api';

interface FormData {
  name: string;
  description: string;
  price: string;
  discount: string;
  category: string;
  stock: string;
  sku: string;
}

interface Product extends FormData {
  _id: string;
  image?: string;
}

interface Category {
  _id: string;
  name: string;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    price: '',
    discount: '',
    category: '',
    stock: '',
    sku: '',
  });
  const [product, setProduct] = useState<Product | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Load categories
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

  // Load product data
  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/products/${productId}`);
        const data = response.data;
        setProduct(data);
        setImagePreview(data.image || null);
        setFormData({
          name: data.name || '',
          description: data.description || '',
          price: String(data.price || ''),
          discount: String(data.discount || '0'),
          category: data.category || '',
          stock: String(data.stock || ''),
          sku: data.sku || '',
        });
        setError('');
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      setImageFile(file);

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

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Product name is required');
      return false;
    }
    if (!formData.price || isNaN(parseFloat(formData.price))) {
      setError('Valid price is required');
      return false;
    }
    if (!formData.category) {
      setError('Category is required');
      return false;
    }
    if (!formData.stock || isNaN(parseInt(formData.stock))) {
      setError('Valid stock quantity is required');
      return false;
    }
    if (!formData.sku.trim()) {
      setError('SKU is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('price', parseFloat(formData.price).toString());
      formDataToSend.append('discount', (parseFloat(formData.discount) || 0).toString());
      formDataToSend.append('category', formData.category);
      formDataToSend.append('stock', parseInt(formData.stock).toString());
      formDataToSend.append('sku', formData.sku.trim());

      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      await api.put(`/products/${productId}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccess('Product updated successfully! Redirecting...');

      setTimeout(() => {
        router.push('/admin/products');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(true);
      await api.delete(`/products/${productId}`);
      setSuccess('Product deleted! Redirecting...');
      setTimeout(() => {
        router.push('/admin/products');
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete product');
      setDeleting(false);
    }
  };

  const calculateFinalPrice = () => {
    const price = parseFloat(formData.price) || 0;
    const discount = parseFloat(formData.discount) || 0;
    return Math.max(0, price - (price * discount) / 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Product not found</p>
        <Link href="/admin/products" className="text-blue-600 hover:underline">
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/admin/products" className="text-gray-600 hover:text-gray-800">
              <FiArrowLeft size={20} />
            </Link>
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">Edit Product</h1>
          </div>
          <p className="text-xs md:text-sm text-gray-600">Update product information</p>
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting || submitting}
          className="w-full sm:w-auto bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-3 md:px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition text-xs md:text-sm font-medium"
        >
          {deleting ? (
            <>
              <FiLoader size={16} className="animate-spin" />
              Deleting...
            </>
          ) : (
            <>
              <FiTrash2 size={16} />
              Delete
            </>
          )}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 md:px-4 md:py-3 rounded-lg text-xs md:text-sm">
          ❌ {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 md:px-4 md:py-3 rounded-lg text-xs md:text-sm">
          ✅ {success}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Product Name */}
        <div>
          <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5">
            Product Name <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Monstera Deliciosa"
            disabled={submitting}
            className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Product description (optional)"
            disabled={submitting}
            rows={4}
            className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 resize-none"
          />
        </div>

        {/* Price and Discount */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5">
              Price (₹) <span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="499"
              step="0.01"
              min="0"
              disabled={submitting}
              className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5">Discount (%)</label>
            <input
              type="number"
              name="discount"
              value={formData.discount}
              onChange={handleChange}
              placeholder="10"
              step="0.01"
              min="0"
              max="100"
              disabled={submitting}
              className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
            />
          </div>
        </div>

        {/* Final Price Display */}
        {formData.price && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4">
            <p className="text-xs md:text-sm text-gray-600">
              <span className="font-semibold">Final Price:</span>{' '}
              <span className="text-lg md:text-xl font-bold text-blue-600">₹{calculateFinalPrice().toFixed(2)}</span>
            </p>
          </div>
        )}

        {/* Category and Stock */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5">
              Category <span className="text-red-600">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              disabled={submitting || categoriesLoading}
              className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
            >
              <option value="">{categoriesLoading ? 'Loading categories...' : 'Select category'}</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
            {categories.length === 0 && !categoriesLoading && (
              <p className="text-xs text-orange-600 mt-1">No categories created yet.</p>
            )}
          </div>

          <div>
            <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5">
              Stock <span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              placeholder="25"
              step="1"
              min="0"
              disabled={submitting}
              className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
            />
          </div>
        </div>

        {/* SKU */}
        <div>
          <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5">
            SKU <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            name="sku"
            value={formData.sku}
            onChange={handleChange}
            placeholder="MON001"
            disabled={submitting}
            className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 font-mono"
          />
        </div>

        {/* Product Image */}
        <div>
          <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5">Product Image</label>

          {imagePreview ? (
            <div className="relative">
              <div className="w-48 h-48 rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={imagePreview}
                  alt="Product preview"
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full transition"
                disabled={submitting}
              >
                <FiX size={16} />
              </button>
            </div>
          ) : (
            <label className="block w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-green-500 transition">
              <div className="flex flex-col items-center gap-2">
                <span className="text-2xl">📸</span>
                <p className="text-xs md:text-sm text-gray-600">
                  Click to upload a new image
                </p>
                <p className="text-xs text-gray-500">PNG, JPG, or WebP up to 5MB</p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                disabled={submitting}
              />
            </label>
          )}

          {imagePreview && (
            <label className="mt-2 block w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-green-500 transition">
              <span className="text-xs text-gray-600">Change image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                disabled={submitting}
              />
            </label>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 md:p-3">
          <p className="text-xs md:text-sm text-blue-700">
            💡 <strong>Note:</strong> Images are uploaded to AWS S3 for secure storage and optimal performance.
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          <Link
            href="/admin/products"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition text-xs md:text-sm font-medium text-gray-700 text-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition text-xs md:text-sm font-medium flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <FiLoader size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
