'use client';

import { useEffect, useState } from 'react';
import { offerAPI } from '@/lib/api';
import { useRouter, useParams } from 'next/navigation';

interface Offer {
  _id: string;
  title: string;
  text: string;
  code: string;
  isActive: boolean;
  backgroundColor: string;
  textColor: string;
}

export default function EditOfferPage() {
  const [formData, setFormData] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    if (id) {
      fetchOffer();
    }
  }, [id]);

  const fetchOffer = async () => {
    try {
      setLoading(true);
      const response = await offerAPI.getById(id);
      setFormData(response.data);
    } catch (err) {
      console.error('Failed to fetch offer:', err);
      setError('Failed to load offer');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (!formData) return;
    
    setFormData(prev => ({
      ...prev!,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    if (!formData.title || !formData.text || !formData.code) {
      setError('Title, text, and code are required');
      return;
    }

    try {
      setSubmitting(true);
      await offerAPI.update(id, formData);
      router.push('/admin/offers');
      router.refresh();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update offer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this offer?')) return;

    try {
      setSubmitting(true);
      await offerAPI.delete(id);
      router.push('/admin/offers');
      router.refresh();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete offer');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading offer...</p>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Offer not found
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Edit Offer</h1>
        <p className="text-gray-600 mt-1">Update promotional offer details</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Offer Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          {/* Text */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Display Text *
            </label>
            <textarea
              name="text"
              value={formData.text}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">This text will appear in the notification bar</p>
          </div>

          {/* Code */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Promo Code *
            </label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              maxLength={20}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 uppercase"
              required
            />
          </div>

          {/* Active Status */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-4 h-4 text-green-600 rounded"
              />
              <span className="text-sm font-medium text-gray-900">Active (Visible on website)</span>
            </label>
          </div>

          {/* Background Color */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Background Color
            </label>
            <select
              name="backgroundColor"
              value={formData.backgroundColor}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="bg-yellow-400">Yellow</option>
              <option value="bg-blue-500">Blue</option>
              <option value="bg-green-500">Green</option>
              <option value="bg-red-500">Red</option>
              <option value="bg-purple-500">Purple</option>
            </select>
          </div>

          {/* Text Color */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Text Color
            </label>
            <select
              name="textColor"
              value={formData.textColor}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="text-gray-900">Dark</option>
              <option value="text-white">White</option>
              <option value="text-gray-600">Gray</option>
            </select>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-600 mb-2">Preview</p>
            <div className={`${formData.backgroundColor} ${formData.textColor} py-3 px-4 rounded text-center font-semibold`}>
              🎉 {formData.text}
              <div className="mt-2 text-sm">
                Code: <span className="font-bold">{formData.code}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition font-medium"
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={submitting}
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition font-medium"
            >
              Delete
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
