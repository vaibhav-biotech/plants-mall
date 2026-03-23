'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';
import { categoryAPI } from '@/lib/api';

interface Category {
  _id: string;
  name: string;
  description: string;
  slug: string;
  order: number;
  isActive: boolean;
  createdAt: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const filtered = categories.filter((category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredCategories(filtered);
  }, [searchQuery, categories]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryAPI.getAll();
      setCategories(response.data.categories || []);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      setDeleting(id);
      await categoryAPI.delete(id);
      setCategories(categories.filter((c) => c._id !== id));
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete category');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Loading categories...</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 md:space-y-4 lg:space-y-6">
      {/* Header - Responsive Heading */}
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">Categories</h1>
          <p className="text-xs md:text-sm text-gray-600 mt-0.5 hidden sm:block">Manage your product categories</p>
        </div>
        <Link
          href="/admin/categories/new"
          className="text-xs md:text-sm bg-green-600 hover:bg-green-700 text-white px-2.5 md:px-4 py-2 rounded-lg flex items-center gap-1 md:gap-2 transition flex-1 sm:flex-none justify-center"
        >
          <FiPlus size={16} />
          <span>Add</span>
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 md:px-4 md:py-3 rounded-lg text-xs md:text-sm">
          ❌ {error}
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2.5 md:p-4">
        <div className="relative">
          <FiSearch className="absolute left-2.5 md:left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 md:pl-10 pr-3 md:pr-4 py-2 border border-gray-300 rounded-lg text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {filteredCategories.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500 text-sm">No categories found</p>
          </div>
        ) : (
          filteredCategories.map((category) => (
            <div key={category._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 md:p-4 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 text-sm md:text-base line-clamp-2">{category.name}</h3>
                  <p className="text-xs text-gray-500 font-mono mt-1">{category.slug}</p>
                </div>
                {!category.isActive && (
                  <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full ml-2">Inactive</span>
                )}
              </div>

              {category.description && (
                <p className="text-xs md:text-sm text-gray-600 mb-3 line-clamp-2">{category.description}</p>
              )}

              <div className="flex gap-2 pt-3 border-t border-gray-200">
                <Link
                  href={`/admin/categories/${category._id}`}
                  className="flex-1 px-2 md:px-3 py-1.5 text-xs md:text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg flex items-center justify-center gap-1 transition"
                >
                  <FiEdit2 size={14} />
                  <span>Edit</span>
                </Link>
                <button
                  onClick={() => handleDelete(category._id)}
                  disabled={deleting === category._id}
                  className="flex-1 px-2 md:px-3 py-1.5 text-xs md:text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-lg flex items-center justify-center gap-1 transition disabled:opacity-50"
                >
                  <FiTrash2 size={14} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Stats */}
      {categories.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 md:p-3">
          <p className="text-xs md:text-sm text-blue-700">
            Total: <strong>{categories.length}</strong> categories
          </p>
        </div>
      )}
    </div>
  );
}
