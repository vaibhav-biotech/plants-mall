'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiLoader, FiTrash2 } from 'react-icons/fi';
import { categoryAPI } from '@/lib/api';

interface FormData {
  name: string;
  description: string;
  order: string;
  isActive: boolean;
}

interface Category extends FormData {
  _id: string;
  slug: string;
}

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    order: '0',
    isActive: true,
  });
  const [category, setCategory] = useState<Category | null>(null);

  // Load category data
  useEffect(() => {
    if (!categoryId) return;

    const fetchCategory = async () => {
      try {
        setLoading(true);
        const response = await categoryAPI.getById(categoryId);
        const data = response.data;
        setCategory(data);
        setFormData({
          name: data.name || '',
          description: data.description || '',
          order: String(data.order || '0'),
          isActive: data.isActive !== false,
        });
        setError('');
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load category');
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [categoryId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, type } = e.target;
    const value = type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
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
      setSubmitting(true);
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        order: parseInt(formData.order) || 0,
        isActive: formData.isActive,
      };

      await categoryAPI.update(categoryId, payload);
      setSuccess('Category updated successfully! Redirecting...');
      setTimeout(() => {
        router.push('/admin/categories');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(true);
      await categoryAPI.delete(categoryId);
      setSuccess('Category deleted! Redirecting...');
      setTimeout(() => {
        router.push('/admin/categories');
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete category');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Loading category...</p>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Category not found</p>
        <Link href="/admin/categories" className="text-blue-600 hover:underline">
          Back to Categories
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
            <Link href="/admin/categories" className="text-gray-600 hover:text-gray-800">
              <FiArrowLeft size={20} />
            </Link>
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">Edit Category</h1>
          </div>
          <p className="text-xs md:text-sm text-gray-600">Update category information</p>
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
            disabled={submitting}
            className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
          />
          <p className="text-xs text-gray-500 mt-1">
            <strong>Slug:</strong> {category.slug}
          </p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Category description (optional)"
            disabled={submitting}
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
            disabled={submitting}
            className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
          />
          <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
        </div>

        {/* Active Status */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isActive"
            id="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            disabled={submitting}
            className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-2 focus:ring-green-500"
          />
          <label htmlFor="isActive" className="text-xs md:text-sm font-medium text-gray-700">
            Active (visible in product filter)
          </label>
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
