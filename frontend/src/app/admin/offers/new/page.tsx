'use client';

import { useState } from 'react';
import { offerAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function NewOfferPage() {
  const [formData, setFormData] = useState({
    title: '',
    text: '',
    code: '',
    backgroundColor: 'bg-yellow-400',
    textColor: 'text-gray-900',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.text || !formData.code) {
      setError('Title, text, and code are required');
      return;
    }

    try {
      setLoading(true);
      await offerAPI.create(formData);
      router.push('/admin/offers');
      router.refresh();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create offer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Create New Offer</h1>
        <p className="text-gray-600 mt-1">Add a promotional offer to display on the website</p>
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
              placeholder="e.g., Spring Sale"
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
              placeholder="e.g., Get 20% OFF on all plants"
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
              placeholder="e.g., SPRING20"
              maxLength={20}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 uppercase"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Promo code must be unique</p>
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
              <option value="bg-yellow-400">Yellow (Default)</option>
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
              <option value="text-gray-900">Dark (Default)</option>
              <option value="text-white">White</option>
              <option value="text-gray-600">Gray</option>
            </select>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-600 mb-2">Preview</p>
            <div className={`${formData.backgroundColor} ${formData.textColor} py-3 px-4 rounded text-center font-semibold`}>
              🎉 {formData.text || 'Your offer text here'}
              {formData.code && (
                <div className="mt-2 text-sm">
                  Code: <span className="font-bold">{formData.code}</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition font-medium"
            >
              {loading ? 'Creating...' : 'Create Offer'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
