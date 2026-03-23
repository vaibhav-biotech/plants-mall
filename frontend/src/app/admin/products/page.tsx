'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiDownload, FiUpload, FiX, FiEye, FiGrid } from 'react-icons/fi';
import { api, categoryAPI } from '../../../lib/api';

interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  discount: number;
  stock: number;
  sku: string;
  image?: string;
  images?: string[];
  isActive: boolean;
  variants?: Array<{ size: string; price: number; stock: number }>;
  careInfo?: {
    watering?: string;
    sunlight?: string;
    difficulty?: string;
    growth?: string;
    petFriendly?: boolean;
    humidity?: string;
    temperature?: string;
  };
  createdAt: string;
}

interface CSVProduct {
  name: string;
  description?: string;
  price: string;
  discount?: string;
  category: string;
  stock: string;
  sku: string;
}

interface Category {
  _id: string;
  name: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [togglingProduct, setTogglingProduct] = useState<string | null>(null);
  const [showCategoryDrawer, setShowCategoryDrawer] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');

  // Bulk delete states
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // CSV Upload States
  const [csvFile, setCSVFile] = useState<File | null>(null);
  const [csvPreview, setCSVPreview] = useState<CSVProduct[]>([]);
  const [csvErrors, setCSVErrors] = useState<string[]>([]);
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [csvLoading, setCSVLoading] = useState(false);
  const [csvSuccess, setCSVSuccess] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

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

  useEffect(() => {
    let filtered = products;

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((product) => product.category === selectedCategory);
    }

    // Stock filter
    if (stockFilter === 'in-stock') {
      filtered = filtered.filter((product) => product.stock > 0);
    } else if (stockFilter === 'out-stock') {
      filtered = filtered.filter((product) => product.stock === 0);
    } else if (stockFilter === 'low-stock') {
      filtered = filtered.filter((product) => product.stock > 0 && product.stock <= 10);
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, stockFilter, products]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products?limit=1000');
      setProducts(response.data.products || []);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      setDeleting(id);
      await api.delete(`/products/${id}`);
      setProducts(products.filter((p) => p._id !== id));
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete product');
    } finally {
      setDeleting(null);
    }
  };

  const toggleSelectProduct = (id: string) => {
    const newSelected = new Set(selectedProductIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedProductIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedProductIds.size === paginatedProducts.length) {
      setSelectedProductIds(new Set());
    } else {
      const allIds = new Set(paginatedProducts.map((p) => p._id));
      setSelectedProductIds(allIds);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProductIds.size === 0) {
      setError('Please select at least one product');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedProductIds.size} product(s)?`)) return;

    try {
      setBulkDeleting(true);
      setError('');
      
      await Promise.all(
        Array.from(selectedProductIds).map((id) => api.delete(`/products/${id}`))
      );
      
      setProducts(products.filter((p) => !selectedProductIds.has(p._id)));
      setSelectedProductIds(new Set());
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete products');
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      setTogglingProduct(id);
      const newStatus = !currentStatus;
      
      await api.put(`/products/${id}`, { isActive: newStatus });
      
      // Update local state
      setProducts(products.map(p => 
        p._id === id ? { ...p, isActive: newStatus } : p
      ));
      
      // Update selected product if it's the one being toggled
      if (selectedProduct && selectedProduct._id === id) {
        setSelectedProduct({ ...selectedProduct, isActive: newStatus });
      }
      
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update product status');
    } finally {
      setTogglingProduct(null);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      setError('Category name is required');
      return;
    }

    try {
      setAddingCategory(true);
      const response = await api.post('/categories', { name: newCategoryName.trim() });
      setCategories([...categories, response.data.category]);
      setNewCategoryName('');
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add category');
    } finally {
      setAddingCategory(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      setDeletingCategory(id);
      await api.delete(`/categories/${id}`);
      setCategories(categories.filter((c) => c._id !== id));
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete category');
    } finally {
      setDeletingCategory(null);
    }
  };

  const handleUpdateCategory = async (id: string) => {
    if (!editingCategoryName.trim()) {
      setError('Category name is required');
      return;
    }

    try {
      setEditingCategory(id);
      await api.put(`/categories/${id}`, { name: editingCategoryName.trim() });
      setCategories(categories.map((c) => 
        c._id === id ? { ...c, name: editingCategoryName.trim() } : c
      ));
      setEditingCategory(null);
      setEditingCategoryName('');
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update category');
    }
  };

  const downloadTemplate = () => {
    const headers = ['name', 'description', 'price', 'discount', 'category', 'stock', 'sku'];
    const sampleData = [
      ['Monstera Deliciosa', 'Beautiful climbing plant', '499', '10', 'Indoor Plants', '25', 'MON001'],
    ];

    const csv = [headers, ...sampleData].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const parseCSV = (text: string): CSVProduct[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) throw new Error('CSV must have header row and at least one data row');

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/"/g, ''));
    const requiredFields = ['name', 'price', 'category', 'stock', 'sku'];
    const missingFields = requiredFields.filter((field) => !headers.includes(field));

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    const products: CSVProduct[] = [];
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim().replace(/"/g, ''));
      if (values.every((v) => !v)) continue;

      const row: any = {};
      headers.forEach((header, idx) => {
        row[header] = values[idx] || '';
      });

      const rowErrors: string[] = [];
      if (!row.name) rowErrors.push(`Row ${i + 1}: Name is required`);
      if (!row.price || isNaN(parseFloat(row.price))) rowErrors.push(`Row ${i + 1}: Valid price is required`);
      if (!row.stock || isNaN(parseInt(row.stock))) rowErrors.push(`Row ${i + 1}: Valid stock is required`);
      if (!row.sku) rowErrors.push(`Row ${i + 1}: SKU is required`);
      if (!row.category) rowErrors.push(`Row ${i + 1}: Category is required`);

      const categoryNames = categories.map((c) => c.name);
      if (!categoryNames.includes(row.category)) {
        rowErrors.push(`Row ${i + 1}: Invalid category`);
      }

      if (rowErrors.length > 0) {
        errors.push(...rowErrors);
      } else {
        products.push({
          name: row.name,
          description: row.description || '',
          price: row.price,
          discount: row.discount || '0',
          category: row.category,
          stock: row.stock,
          sku: row.sku,
        });
      }
    }

    if (errors.length > 0) {
      setCSVErrors(errors);
      throw new Error('Validation errors found.');
    }

    return products;
  };

  const handleCSVFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setCSVErrors(['Only .csv files are allowed']);
      return;
    }

    try {
      setCSVErrors([]);
      const text = await file.text();
      const parsed = parseCSV(text);
      setCSVFile(file);
      setCSVPreview(parsed);
      setShowCSVModal(true);
    } catch (err: any) {
      setCSVErrors([err.message]);
      setCSVFile(null);
      setCSVPreview([]);
    }
  };

  const handleCSVUpload = async () => {
    if (csvPreview.length === 0) return;

    try {
      setCSVLoading(true);
      const response = await api.post('/products/bulk', { products: csvPreview });
      setCSVSuccess(`Successfully imported ${response.data.count || csvPreview.length} products!`);
      setShowCSVModal(false);
      setCSVFile(null);
      setCSVPreview([]);
      setCSVErrors([]);

      await fetchProducts();
      setTimeout(() => setCSVSuccess(''), 3000);
    } catch (err: any) {
      setCSVErrors([err.response?.data?.message || 'Failed to import products']);
    } finally {
      setCSVLoading(false);
    }
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Products</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your product catalog</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowCategoryDrawer(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-2 rounded-lg flex items-center gap-2 transition"
          >
            <FiGrid size={16} />
            Categories
          </button>
          <button
            onClick={() => downloadTemplate()}
            className="bg-cyan-600 hover:bg-cyan-700 text-white text-sm px-3 py-2 rounded-lg flex items-center gap-2 transition"
          >
            <FiDownload size={16} />
            CSV
          </button>
          <label className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-3 py-2 rounded-lg flex items-center gap-2 transition cursor-pointer">
            <FiUpload size={16} />
            Import
            <input type="file" accept=".csv" onChange={handleCSVFileSelect} className="hidden" />
          </label>
          <Link
            href="/admin/products/import"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-2 rounded-lg flex items-center gap-2 transition"
          >
            <FiUpload size={16} />
            Bulk Import
          </Link>
          <Link
            href="/admin/products/new"
            className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-2 rounded-lg flex items-center gap-2 transition"
          >
            <FiPlus size={16} />
            Add
          </Link>
          {selectedProductIds.size > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={bulkDeleting}
              className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-2 rounded-lg flex items-center gap-2 transition disabled:opacity-50"
            >
              <FiTrash2 size={16} />
              Delete ({selectedProductIds.size})
            </button>
          )}
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          ❌ {error}
        </div>
      )}
      {csvSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          ✅ {csvSuccess}
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Stock Filter */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Stock</option>
            <option value="in-stock">In Stock</option>
            <option value="low-stock">Low Stock (≤10)</option>
            <option value="out-stock">Out of Stock</option>
          </select>

          {/* Results counter */}
          <div className="flex items-center justify-end text-xs text-gray-600">
            <strong>{filteredProducts.length}</strong>&nbsp;product{filteredProducts.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 text-sm">No products found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 w-12">
                      <input
                        type="checkbox"
                        checked={selectedProductIds.size === paginatedProducts.length && paginatedProducts.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 w-12">#</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Image</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Product</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 hidden sm:table-cell">Category</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700">Price</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 hidden sm:table-cell">Stock</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProducts.map((product, idx) => (
                    <tr key={product._id} className={`border-b border-gray-200 hover:bg-gray-50 transition ${!product.isActive ? 'bg-gray-100 opacity-60' : ''}`}>
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedProductIds.has(product._id)}
                          onChange={() => toggleSelectProduct(product._id)}
                          className="w-4 h-4 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs font-mono">{startIndex + idx + 1}</td>
                      <td className="px-4 py-3">
                        {product.image ? (
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            <Image
                              src={product.image}
                              alt={product.name}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                              unoptimized={product.image.includes('s3') || product.image.includes('amazonaws')}
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                            -
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 line-clamp-2">{product.name}</p>
                        <p className="text-xs text-gray-600 mt-0.5">{product.sku}</p>
                        {!product.isActive && (
                          <span className="inline-block text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded mt-1 font-semibold">
                            Discontinued
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-sm hidden sm:table-cell">{product.category}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900 text-right">
                        ₹{product.price.toLocaleString()}
                        {product.discount > 0 && (
                          <p className="text-xs text-green-600 font-normal">-{product.discount}%</p>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                            product.stock > 10
                              ? 'bg-green-100 text-green-700'
                              : product.stock > 0
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-1">
                          <button
                            onClick={() => {
                              setSelectedProduct(product);
                              setShowDetail(true);
                            }}
                            className="p-2 hover:bg-sky-100 rounded-lg transition text-sky-600"
                            title="View"
                          >
                            <FiEye size={16} />
                          </button>
                          <Link
                            href={`/admin/products/${product._id}`}
                            className="p-2 hover:bg-blue-100 rounded-lg transition text-blue-600"
                            title="Edit"
                          >
                            <FiEdit2 size={16} />
                          </Link>
                          <button
                            onClick={() => handleDelete(product._id)}
                            disabled={deleting === product._id}
                            className="p-2 hover:bg-red-100 rounded-lg transition text-red-600 disabled:opacity-50"
                            title="Delete"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredProducts.length > 0 && (
              <div className="border-t border-gray-200 px-4 py-4 bg-gray-50 space-y-4">
                {/* Results Info & Items Per Page */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <p className="text-sm text-gray-600">
                    Showing <span className="font-semibold">{startIndex + 1}-{Math.min(endIndex, filteredProducts.length)}</span> of <span className="font-semibold">{filteredProducts.length}</span> products
                  </p>
                  <div className="flex items-center gap-3">
                    <label className="text-sm text-gray-600 font-medium">Show per page:</label>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value={10}>10</option>
                      <option value={15}>15</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex gap-1">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition"
                    >
                      ← Previous
                    </button>
                    
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNum = i + 1;
                      if (totalPages > 5 && currentPage > 3) {
                        pageNum = currentPage - 2 + i;
                      }
                      return pageNum <= totalPages ? (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                            currentPage === pageNum
                              ? 'bg-green-600 text-white'
                              : 'border border-gray-300 hover:bg-gray-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      ) : null;
                    })}
                    
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition"
                    >
                      Next →
                    </button>
                  </div>

                  {/* Jump to Page */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Go to page:</span>
                    <input
                      type="number"
                      min="1"
                      max={totalPages}
                      defaultValue={currentPage}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const page = Math.max(1, Math.min(totalPages, Number((e.target as HTMLInputElement).value)));
                          setCurrentPage(page);
                        }
                      }}
                      onChange={(e) => {
                        const page = Math.max(1, Math.min(totalPages, Number(e.target.value)));
                        if (e.target.value === '') return;
                        setCurrentPage(page);
                      }}
                      className="w-16 px-2 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-600">of {totalPages}</span>
                  </div>
                </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Product Detail Modal */}
      {showDetail && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center sticky top-0 bg-white border-b p-4">
              <h2 className="text-lg font-bold text-gray-800">{selectedProduct.name}</h2>
              <button
                onClick={() => setShowDetail(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Main Image */}
              {selectedProduct.image && (
                <div className="relative w-full h-80 bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    fill
                    className="object-cover"
                    unoptimized={selectedProduct.image.includes('s3') || selectedProduct.image.includes('amazonaws')}
                  />
                </div>
              )}

              {/* Product Info */}
              <div>
                <p className="text-2xl font-bold text-gray-800">₹{selectedProduct.price}</p>
                {selectedProduct.discount > 0 && (
                  <p className="text-sm text-green-600 font-semibold">-{selectedProduct.discount}% discount</p>
                )}
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600 font-semibold">Category</p>
                  <p className="text-sm text-gray-900">{selectedProduct.category}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-semibold">Stock</p>
                  <p className={`text-sm font-semibold ${selectedProduct.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedProduct.stock} units
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-semibold">SKU</p>
                  <p className="text-sm font-mono text-gray-900">{selectedProduct.sku}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-semibold">Status</p>
                  <p className={`text-sm font-semibold ${selectedProduct.isActive ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedProduct.isActive ? '✅ Active' : '❌ Discontinued'}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <p className="text-xs text-gray-600 font-semibold mb-1">Description</p>
                <p className="text-sm text-gray-700 line-clamp-4">{selectedProduct.description}</p>
              </div>

              {/* Additional Images */}
              {selectedProduct.images && selectedProduct.images.length > 0 && (
                <div>
                  <p className="text-xs text-gray-600 font-semibold mb-2">Additional Images ({selectedProduct.images.length})</p>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedProduct.images.map((img, idx) => (
                      <div key={idx} className="relative w-full h-20 bg-gray-100 rounded-lg overflow-hidden">
                        <Image
                          src={img}
                          alt={`Variant ${idx}`}
                          fill
                          className="object-cover"
                          unoptimized={img.includes('s3') || img.includes('amazonaws')}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Variants */}
              {selectedProduct.variants && selectedProduct.variants.length > 0 && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 space-y-2">
                  <p className="text-xs text-gray-600 font-semibold">Size Variants</p>
                  {selectedProduct.variants.map((variant: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center bg-white p-2 rounded border border-purple-100">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{variant.size}</p>
                        <p className="text-xs text-gray-600">Stock: {variant.stock}</p>
                      </div>
                      <p className="text-sm font-bold text-purple-600">₹{variant.price}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Plant Care Info */}
              {selectedProduct.careInfo && (Object.values(selectedProduct.careInfo).some(v => v)) && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-2">
                  <p className="text-xs text-gray-600 font-semibold mb-2">🌱 Plant Care Guide</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {selectedProduct.careInfo.watering && (
                      <div className="bg-white p-2 rounded border border-green-100">
                        <p className="text-gray-600">💧 Watering</p>
                        <p className="font-semibold text-gray-900">{selectedProduct.careInfo.watering}</p>
                      </div>
                    )}
                    {selectedProduct.careInfo.sunlight && (
                      <div className="bg-white p-2 rounded border border-green-100">
                        <p className="text-gray-600">☀️ Sunlight</p>
                        <p className="font-semibold text-gray-900">{selectedProduct.careInfo.sunlight}</p>
                      </div>
                    )}
                    {selectedProduct.careInfo.difficulty && (
                      <div className="bg-white p-2 rounded border border-green-100">
                        <p className="text-gray-600">📊 Difficulty</p>
                        <p className="font-semibold text-gray-900">{selectedProduct.careInfo.difficulty}</p>
                      </div>
                    )}
                    {selectedProduct.careInfo.growth && (
                      <div className="bg-white p-2 rounded border border-green-100">
                        <p className="text-gray-600">📈 Growth</p>
                        <p className="font-semibold text-gray-900">{selectedProduct.careInfo.growth}</p>
                      </div>
                    )}
                    {selectedProduct.careInfo.humidity && (
                      <div className="bg-white p-2 rounded border border-green-100">
                        <p className="text-gray-600">💨 Humidity</p>
                        <p className="font-semibold text-gray-900">{selectedProduct.careInfo.humidity}</p>
                      </div>
                    )}
                    {selectedProduct.careInfo.temperature && (
                      <div className="bg-white p-2 rounded border border-green-100">
                        <p className="text-gray-600">🌡️ Temperature</p>
                        <p className="font-semibold text-gray-900">{selectedProduct.careInfo.temperature}</p>
                      </div>
                    )}
                  </div>
                  {selectedProduct.careInfo.petFriendly && (
                    <div className="bg-white p-2 rounded border border-green-100 text-xs">
                      <p className="text-green-700 font-semibold">🐾 Pet Friendly</p>
                    </div>
                  )}
                </div>
              )}

              {/* Status Toggle */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Product Status</p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {selectedProduct.isActive 
                        ? 'Product is currently active and visible'
                        : 'Product is discontinued and hidden from customers'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggleActive(selectedProduct._id, selectedProduct.isActive)}
                    disabled={togglingProduct === selectedProduct._id}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition disabled:opacity-50 ${
                      selectedProduct.isActive
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {togglingProduct === selectedProduct._id 
                      ? 'Updating...' 
                      : selectedProduct.isActive 
                      ? 'Discontinue' 
                      : 'Activate'}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t">
                <Link
                  href={`/admin/products/${selectedProduct._id}`}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-sm font-medium text-center"
                >
                  Edit Product
                </Link>
                <button
                  onClick={() => setShowDetail(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition text-sm font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSV Modal */}
      {showCSVModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center sticky top-0 bg-white border-b p-4">
              <h2 className="text-lg font-bold text-gray-800">Import Products</h2>
              <button
                onClick={() => {
                  setShowCSVModal(false);
                  setCSVFile(null);
                  setCSVPreview([]);
                  setCSVErrors([]);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="p-4 space-y-3">
              {csvErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 max-h-40 overflow-y-auto">
                  <p className="text-red-700 font-semibold text-sm mb-2">Validation Errors:</p>
                  <ul className="space-y-1">
                    {csvErrors.map((err, idx) => (
                      <li key={idx} className="text-red-600 text-xs">
                        • {err}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {csvPreview.length > 0 && csvErrors.length === 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Ready to import: {csvPreview.length} products
                  </p>
                  <div className="border border-gray-200 rounded-lg overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-2 py-2 text-left">Name</th>
                          <th className="px-2 py-2 text-left">Price</th>
                          <th className="px-2 py-2 text-left">Stock</th>
                        </tr>
                      </thead>
                      <tbody>
                        {csvPreview.slice(0, 5).map((product, idx) => (
                          <tr key={idx} className="border-t border-gray-200 hover:bg-gray-50">
                            <td className="px-2 py-2 truncate">{product.name}</td>
                            <td className="px-2 py-2">₹{product.price}</td>
                            <td className="px-2 py-2">{product.stock}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 border-t p-4 bg-gray-50">
              <button
                onClick={() => {
                  setShowCSVModal(false);
                  setCSVFile(null);
                  setCSVPreview([]);
                  setCSVErrors([]);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCSVUpload}
                disabled={csvLoading || csvErrors.length > 0}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition text-sm font-medium"
              >
                {csvLoading ? 'Importing...' : 'Import'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Drawer */}
      {showCategoryDrawer && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-40"
            onClick={() => setShowCategoryDrawer(false)}
          />

          {/* Right Drawer */}
          <div className="fixed right-0 top-0 h-screen w-96 bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Manage Categories</h2>
              <button
                onClick={() => setShowCategoryDrawer(false)}
                className="text-gray-500 hover:text-gray-700 transition"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {/* Add New Category */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Add New Category
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Category name..."
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleAddCategory}
                    disabled={addingCategory || !newCategoryName.trim()}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition"
                  >
                    {addingCategory ? '...' : 'Add'}
                  </button>
                </div>
              </div>

              {/* Categories List */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Categories ({categories.length})
                </p>
                {categories.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No categories yet</p>
                ) : (
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <div key={category._id}>
                        {editingCategory === category._id ? (
                          // Edit Mode
                          <div className="flex gap-2 bg-blue-50 p-3 rounded-lg border border-blue-200">
                            <input
                              type="text"
                              value={editingCategoryName}
                              onChange={(e) => setEditingCategoryName(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && handleUpdateCategory(category._id)}
                              autoFocus
                              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                              onClick={() => handleUpdateCategory(category._id)}
                              disabled={editingCategory === category._id && !editingCategoryName.trim()}
                              className="px-2 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded text-sm font-medium transition"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingCategory(null);
                                setEditingCategoryName('');
                              }}
                              className="px-2 py-1 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded text-sm font-medium transition"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          // View Mode
                          <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition">
                            <span className="text-sm font-medium text-gray-800 flex-1">{category.name}</span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setEditingCategory(category._id);
                                  setEditingCategoryName(category.name);
                                }}
                                className="px-2 py-1 text-blue-600 hover:bg-blue-50 rounded text-sm transition"
                              >
                                <FiEdit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(category._id)}
                                disabled={deletingCategory === category._id}
                                className="px-2 py-1 text-red-600 hover:bg-red-50 rounded text-sm transition disabled:opacity-50"
                              >
                                {deletingCategory === category._id ? (
                                  <span className="text-xs">...</span>
                                ) : (
                                  <FiTrash2 size={16} />
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs">
                  ❌ {error}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-4">
              <button
                onClick={() => setShowCategoryDrawer(false)}
                className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
