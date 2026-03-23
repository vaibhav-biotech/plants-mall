'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiLoader } from 'react-icons/fi';
import { categoryAPI } from '@/lib/api';

interface FormData {
  name: string;
  description: string;
  order: string;
}

export default function CreateCategoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    order: '0',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Category name is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        order: parseInt(formData.order) || 0,
      };

      await categoryAPI.create(payload);
      setSuccess('Category created successfully! Redirecting...');
      setTimeout(() => {
        router.push('/admin/categories');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Link href="/admin/categories" className="text-gray-600 hover:text-gray-800">
            <FiArrowLeft size={20} />
          </Link>
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">Add Category</h1>
        </div>
        <p className="text-xs md:text-sm text-gray-600">Create a new product category</p>
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
        {/* Category Name */}
        <div>
          <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5">
            Category Name <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Indoor Plants"
            disabled={loading}
            className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
          />
          <p className="text-xs text-gray-500 mt-1">Slug will be auto-generated from the name</p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Category description (optional)"
            disabled={loading}
            rows={4}
            className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 resize-none"
          />
        </div>

        {/* Display Order */}
        <div>
          <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5">Display Order</label>
          <input
            type="number"
            name="order"
            value={formData.order}
            onChange={handleChange}
            placeholder="0"
            step="1"
            min="0"
            disabled={loading}
            className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
          />
          <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          <Link
            href="/admin/categories"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition text-xs md:text-sm font-medium text-gray-700 text-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition text-xs md:text-sm font-medium flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <FiLoader size={16} className="animate-spin" />
                Creating...
              </>
            ) : (
              'Create Category'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
