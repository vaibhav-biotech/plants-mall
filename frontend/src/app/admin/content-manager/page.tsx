'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FiUpload, FiTrash2, FiEdit2, FiPlus, FiToggleRight, FiToggleLeft } from 'react-icons/fi';
import { bannerAPI } from '../../../lib/api';

export default function ContentManagerPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [offerGridHeadline, setOfferGridHeadline] = useState('Special Offers');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    type: 'offer',
    position: 1,
    gridPosition: 1,
    link: '',
    altText: '',
    isActive: true
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await bannerAPI.getAll();
      setBanners(response.data);
    } catch (error) {
      console.error('Failed to fetch banners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile && !editingId) {
      alert('Please select an image');
      return;
    }

    try {
      const form = new FormData();
      form.append('title', formData.title);
      form.append('type', formData.type);
      form.append('position', String(formData.position));
      form.append('gridPosition', String(formData.gridPosition));
      form.append('link', formData.link);
      form.append('altText', formData.altText);
      form.append('isActive', String(formData.isActive));
      if (selectedFile) {
        form.append('file', selectedFile);
      }

      if (editingId) {
        await bannerAPI.update(editingId, form);
      } else {
        await bannerAPI.create(form);
      }

      setFormData({
        title: '',
        type: 'offer',
        position: 1,
        gridPosition: 1,
        link: '',
        altText: '',
        isActive: true
      });
      setSelectedFile(null);
      setPreview(null);
      setEditingId(null);
      setIsModalOpen(false);
      fetchBanners();
    } catch (error) {
      console.error('Failed to save banner:', error);
      alert('Failed to save banner');
    }
  };

  const handleEdit = (banner: any) => {
    setEditingId(banner._id);
    setFormData({
      title: banner.title,
      type: banner.type,
      position: banner.position,
      gridPosition: banner.gridPosition || 1,
      link: banner.link || '',
      altText: banner.altText || '',
      isActive: banner.isActive
    });
    setPreview(banner.imageUrl);
    setIsModalOpen(true);
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const banner = banners.find(b => b._id === id);
      const form = new FormData();
      form.append('title', banner.title);
      form.append('type', banner.type);
      form.append('position', String(banner.position));
      form.append('gridPosition', String(banner.gridPosition || 1));
      form.append('link', banner.link || '');
      form.append('altText', banner.altText || '');
      form.append('isActive', String(!currentStatus));
      
      await bannerAPI.update(id, form);
      fetchBanners();
    } catch (error) {
      console.error('Failed to toggle banner:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this banner?')) {
      try {
        await bannerAPI.delete(id);
        fetchBanners();
      } catch (error) {
        console.error('Failed to delete banner:', error);
        alert('Failed to delete banner');
      }
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setSelectedFile(null);
    setPreview(null);
    setFormData({
      title: '',
      type: 'offer',
      position: 1,
      gridPosition: 1,
      link: '',
      altText: '',
      isActive: true
    });
  };

  const heroBanners = banners.filter(b => b.type === 'hero');
  const offerBanners = banners.filter(b => b.type === 'offer');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Content Manager - Banners</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
          >
            <FiPlus size={20} />
            Add Banner
          </button>
        </div>

        {/* Offer Grid Headline Section */}
        <div className="mb-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Offer Grid Settings</h2>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Offer Grid Headline
              </label>
              <input
                type="text"
                value={offerGridHeadline}
                onChange={(e) => setOfferGridHeadline(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <button
              onClick={() => {
                // Save headline to localStorage for now (can be extended to backend)
                localStorage.setItem('offerGridHeadline', offerGridHeadline);
                alert('Offer grid headline updated!');
              }}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Save
            </button>
          </div>
        </div>

        {/* Hero Banners Table */}
        <div className="mb-12 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Hero Section Banners</h2>
            <p className="text-sm text-gray-600 mt-1">Wide banners at the top of homepage</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Image</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Title</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Link</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Position</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {heroBanners.length > 0 ? (
                  heroBanners.map((banner) => (
                    <tr key={banner._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="relative w-20 h-16 rounded overflow-hidden">
                          <Image
                            src={banner.imageUrl}
                            alt={banner.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{banner.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{banner.link || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{banner.position}</td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleToggleActive(banner._id, banner.isActive)}
                          className={`p-2 rounded-full transition ${
                            banner.isActive
                              ? 'bg-green-100 text-green-600'
                              : 'bg-gray-100 text-gray-400'
                          }`}
                          title={banner.isActive ? 'Active' : 'Inactive'}
                        >
                          {banner.isActive ? (
                            <FiToggleRight size={20} />
                          ) : (
                            <FiToggleLeft size={20} />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEdit(banner)}
                            className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition"
                            title="Edit"
                          >
                            <FiEdit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(banner._id)}
                            className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
                            title="Delete"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <p className="font-medium">No hero banners created yet</p>
                      <p className="text-sm mt-1">Click "Add Banner" to create your first hero banner</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Offer Banners Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Offer Grid Banners (4 Columns)</h2>
            <p className="text-sm text-gray-600 mt-1">Instagram-style grid below hero section</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Image</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Title</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Link</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Grid Position</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {offerBanners.length > 0 ? (
                  offerBanners.map((banner) => (
                    <tr key={banner._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="relative w-20 h-20 rounded overflow-hidden">
                          <Image
                            src={banner.imageUrl}
                            alt={banner.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{banner.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{banner.link || '-'}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-green-100 text-green-700 rounded-full font-bold">
                          {banner.gridPosition || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleToggleActive(banner._id, banner.isActive)}
                          className={`p-2 rounded-full transition ${
                            banner.isActive
                              ? 'bg-green-100 text-green-600'
                              : 'bg-gray-100 text-gray-400'
                          }`}
                          title={banner.isActive ? 'Active' : 'Inactive'}
                        >
                          {banner.isActive ? (
                            <FiToggleRight size={20} />
                          ) : (
                            <FiToggleLeft size={20} />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEdit(banner)}
                            className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition"
                            title="Edit"
                          >
                            <FiEdit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(banner._id)}
                            className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
                            title="Delete"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <p className="font-medium">No offer banners created yet</p>
                      <p className="text-sm mt-1">Click "Add Banner" to create your first offer banner with grid position (1-4)</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upload Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {editingId ? 'Edit Banner' : 'Add New Banner'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Image Preview */}
                  {preview && (
                    <div className="relative h-40 bg-gray-200 rounded-lg overflow-hidden mb-4">
                      <Image
                        src={preview}
                        alt="Preview"
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}

                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {editingId ? 'Change Image (Optional)' : 'Upload Image (to AWS S3)'}
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Images will be automatically uploaded to AWS S3</p>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Banner Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Banner Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="hero">Hero Section (Wide Banner)</option>
                      <option value="offer">Offer Grid (4-Column Grid)</option>
                    </select>
                  </div>

                  {/* Position - for Hero */}
                  {formData.type === 'hero' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Hero Banner Position
                      </label>
                      <input
                        type="number"
                        value={formData.position}
                        onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Display order in hero section</p>
                    </div>
                  )}

                  {/* Grid Position - for Offer */}
                  {formData.type === 'offer' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Grid Position (1-4) *
                      </label>
                      <select
                        value={formData.gridPosition}
                        onChange={(e) => setFormData({ ...formData, gridPosition: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="1">Position 1 (Top Left)</option>
                        <option value="2">Position 2 (Top Right)</option>
                        <option value="3">Position 3 (Bottom Left)</option>
                        <option value="4">Position 4 (Bottom Right)</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Choose which grid slot this banner will occupy</p>
                    </div>
                  )}

                  {/* Link */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Link (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.link}
                      onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                      placeholder="e.g., /products or /offers"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  {/* Alt Text */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Alt Text (for accessibility)
                    </label>
                    <input
                      type="text"
                      value={formData.altText}
                      onChange={(e) => setFormData({ ...formData, altText: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  {/* Active Status */}
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded"
                    />
                    <label htmlFor="isActive" className="text-sm text-gray-700 font-medium">
                      Active - Show this banner on website
                    </label>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                    >
                      {editingId ? 'Update' : 'Create'} Banner
                    </button>
                    <button
                      type="button"
                      onClick={handleModalClose}
                      className="flex-1 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
