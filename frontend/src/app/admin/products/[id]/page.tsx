'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FiArrowLeft, FiLoader, FiTrash2, FiX, FiPlus, FiMove } from 'react-icons/fi';
import { api, categoryAPI } from '../../../../lib/api';

interface Variant {
  size: string;
  price: number;
  stock: number;
}

interface CareInfo {
  watering: string;
  sunlight: string;
  difficulty: string;
  growth: string;
  petFriendly: boolean;
  humidity?: string;
  temperature?: string;
}

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

interface Product extends FormData {
  _id: string;
  image?: string;
  images?: string[];
  variants?: Variant[];
  careInfo?: CareInfo;
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
    isNewArrival: false,
    isOfficeWorthy: false,
    isGift: false,
  });

  // Image management
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [multipleImages, setMultipleImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);

  // Variants
  const [variants, setVariants] = useState<Variant[]>([]);
  const [newVariant, setNewVariant] = useState<Variant>({ size: '', price: 0, stock: 0 });
  const [showVariantForm, setShowVariantForm] = useState(false);

  // Care Info
  const [careInfo, setCareInfo] = useState<CareInfo>({
    watering: '',
    sunlight: '',
    difficulty: '',
    growth: '',
    petFriendly: false,
    humidity: '',
    temperature: '',
  });

  const [product, setProduct] = useState<Product | null>(null);

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
        setMultipleImages(data.images || []);
        setVariants(data.variants || []);
        setCareInfo(data.careInfo || {
          watering: '',
          sunlight: '',
          difficulty: '',
          growth: '',
          petFriendly: false,
          humidity: '',
          temperature: '',
        });
        setFormData({
          name: data.name || '',
          description: data.description || '',
          price: String(data.price || ''),
          discount: String(data.discount || '0'),
          category: data.category || '',
          stock: String(data.stock || ''),
          sku: data.sku || '',
          isNewArrival: data.isNewArrival || false,
          isOfficeWorthy: data.isOfficeWorthy || false,
          isGift: data.isGift || false,
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

  // Upload images to S3
  const uploadImagesToS3 = async (files: File[]): Promise<string[]> => {
    const uploadedUrls: string[] = [];

    for (const file of files) {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      try {
        const response = await api.post('/products/upload', formDataUpload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        uploadedUrls.push(response.data.imageUrl);
      } catch (err) {
        console.error('Failed to upload image:', err);
      }
    }

    return uploadedUrls;
  };

  // Handle main image change
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle multiple images
  const handleMultipleImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setNewImages([...newImages, ...files]);
  };

  // Remove from new images
  const removeNewImage = (index: number) => {
    setNewImages(newImages.filter((_, i) => i !== index));
  };

  // Remove existing image
  const removeExistingImage = (index: number) => {
    setMultipleImages(multipleImages.filter((_, i) => i !== index));
  };

  // Add variant
  const addVariant = () => {
    if (!newVariant.size.trim()) {
      setError('Please enter variant size');
      return;
    }
    setVariants([...variants, newVariant]);
    setNewVariant({ size: '', price: 0, stock: 0 });
    setShowVariantForm(false);
    setError('');
  };

  // Remove variant
  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Product name is required');
      return;
    }

    try {
      setSubmitting(true);

      // Upload new images
      let finalImages = [...multipleImages];
      if (newImages.length > 0) {
        const uploadedUrls = await uploadImagesToS3(newImages);
        finalImages = [...finalImages, ...uploadedUrls];
      }

      // Upload main image if changed
      let mainImageUrl = imagePreview;
      if (imageFile) {
        const urls = await uploadImagesToS3([imageFile]);
        mainImageUrl = urls[0] || imagePreview;
      }

      const updateData = {
        ...formData,
        price: Number(formData.price),
        discount: Number(formData.discount),
        stock: Number(formData.stock),
        image: mainImageUrl,
        images: finalImages,
        variants: variants.length > 0 ? variants : undefined,
        careInfo: careInfo,
      };

      await api.put(`/products/${productId}`, updateData);
      setSuccess('Product updated successfully!');
      setImageFile(null);
      setNewImages([]);

      setTimeout(() => {
        router.push('/admin/products');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update product');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete product
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      setDeleting(true);
      await api.delete(`/products/${productId}`);
      setSuccess('Product deleted successfully!');
      setTimeout(() => {
        router.push('/admin/products');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <FiLoader className="animate-spin text-4xl text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <Link href="/admin/products" className="flex items-center gap-2 text-green-600 hover:text-green-700 mb-6 w-fit">
          <FiArrowLeft size={20} />
          Back to Products
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {product?._id ? 'Edit Product' : 'Create Product'}
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            ❌ {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            ✅ {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Basic Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Product name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">SKU *</label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., MON001"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 h-32"
                placeholder="Product description"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Base Stock *</label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Stock quantity"
                />
              </div>
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
                    disabled={submitting}
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
                    disabled={submitting}
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
                    disabled={submitting}
                  />
                  <span className="text-sm text-gray-700">
                    🎁 <span className="font-semibold">Perfect Gift</span>
                    <span className="text-xs text-gray-500 block">Show in "Perfect Gifts" section</span>
                  </span>
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-3">Tip: A product can have multiple flags at once!</p>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Pricing</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Price (₹) *</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Discount (%)</label>
                <input
                  type="number"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Final Price</label>
                <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 font-semibold">
                  ₹{(Number(formData.price) - (Number(formData.price) * Number(formData.discount)) / 100).toFixed(0)}
                </div>
              </div>
            </div>
          </div>

          {/* Main Image */}
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Main Image</h2>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {imagePreview ? (
                <div className="flex flex-col items-center gap-4">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    width={200}
                    height={200}
                    className="rounded-lg object-cover"
                    unoptimized={imagePreview.includes('s3') || imagePreview.includes('amazonaws')}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setImageFile(null);
                    }}
                    className="text-red-600 hover:text-red-700 font-medium"
                  >
                    Change Image
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <div className="space-y-2">
                    <p className="text-gray-700 font-medium">Upload main product image</p>
                    <p className="text-gray-500 text-sm">Click to select or drag & drop</p>
                  </div>
                </label>
              )}
            </div>
          </div>

          {/* Multiple Images */}
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Additional Images</h2>
              <label className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition cursor-pointer">
                + Add Images
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleMultipleImages}
                  className="hidden"
                />
              </label>
            </div>

            {/* New Images Preview */}
            {newImages.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600 font-semibold">New Images</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {newImages.map((file, idx) => (
                    <div key={idx} className="relative">
                      <Image
                        src={URL.createObjectURL(file)}
                        alt={`New ${idx}`}
                        width={120}
                        height={120}
                        className="rounded-lg object-cover w-full h-32"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(idx)}
                        className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                      >
                        <FiX size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Existing Images */}
            {multipleImages.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600 font-semibold">Uploaded Images</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {multipleImages.map((img, idx) => (
                    <div key={idx} className="relative">
                      <Image
                        src={img}
                        alt={`Image ${idx}`}
                        width={120}
                        height={120}
                        className="rounded-lg object-cover w-full h-32"
                        unoptimized={img.includes('s3') || img.includes('amazonaws')}
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(idx)}
                        className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                      >
                        <FiX size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {newImages.length === 0 && multipleImages.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-4">No additional images yet</p>
            )}
          </div>

          {/* Variants */}
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Size Variants (Optional)</h2>
              <button
                type="button"
                onClick={() => setShowVariantForm(!showVariantForm)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition flex items-center gap-2"
              >
                <FiPlus size={16} />
                Add Variant
              </button>
            </div>

            {showVariantForm && (
              <div className="border border-blue-200 bg-blue-50 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Size</label>
                    <input
                      type="text"
                      placeholder="e.g., Small, Medium, Large"
                      value={newVariant.size}
                      onChange={(e) => setNewVariant({ ...newVariant, size: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Price (₹)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={newVariant.price}
                      onChange={(e) => setNewVariant({ ...newVariant, price: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Stock</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={newVariant.stock}
                      onChange={(e) => setNewVariant({ ...newVariant, stock: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={addVariant}
                    className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                  >
                    Save Variant
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowVariantForm(false)}
                    className="flex-1 px-3 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-medium transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {variants.length > 0 && (
              <div className="space-y-2">
                {variants.map((variant, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3 flex-1">
                      <FiMove className="text-gray-400" size={18} />
                      <div>
                        <p className="font-semibold text-gray-900">{variant.size}</p>
                        <p className="text-sm text-gray-600">₹{variant.price} • Stock: {variant.stock}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeVariant(idx)}
                      className="text-red-600 hover:text-red-700 p-2"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Plant Care Info */}
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Plant Care Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Watering</label>
                <input
                  type="text"
                  placeholder="e.g., Once a week"
                  value={careInfo.watering}
                  onChange={(e) => setCareInfo({ ...careInfo, watering: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Sunlight</label>
                <input
                  type="text"
                  placeholder="e.g., Low light"
                  value={careInfo.sunlight}
                  onChange={(e) => setCareInfo({ ...careInfo, sunlight: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Difficulty Level</label>
                <select
                  value={careInfo.difficulty}
                  onChange={(e) => setCareInfo({ ...careInfo, difficulty: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select Difficulty</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Growth Rate</label>
                <select
                  value={careInfo.growth}
                  onChange={(e) => setCareInfo({ ...careInfo, growth: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select Growth Rate</option>
                  <option value="Slow">Slow</option>
                  <option value="Medium">Medium</option>
                  <option value="Fast">Fast</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Humidity</label>
                <input
                  type="text"
                  placeholder="e.g., 60-80%"
                  value={careInfo.humidity}
                  onChange={(e) => setCareInfo({ ...careInfo, humidity: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Temperature</label>
                <input
                  type="text"
                  placeholder="e.g., 15-25°C"
                  value={careInfo.temperature}
                  onChange={(e) => setCareInfo({ ...careInfo, temperature: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <input
                type="checkbox"
                checked={careInfo.petFriendly}
                onChange={(e) => setCareInfo({ ...careInfo, petFriendly: e.target.checked })}
                className="w-5 h-5 rounded"
              />
              <label className="text-sm font-semibold text-gray-700">Pet Friendly</label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold rounded-lg transition flex items-center justify-center gap-2"
            >
              {submitting && <FiLoader className="animate-spin" />}
              {submitting ? 'Saving...' : 'Save Product'}
            </button>

            {product?._id && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold rounded-lg transition flex items-center gap-2"
              >
                {deleting && <FiLoader className="animate-spin" />}
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
