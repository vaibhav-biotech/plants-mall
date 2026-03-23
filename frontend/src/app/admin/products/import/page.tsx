'use client';

import { useState } from 'react';
import { FiUpload, FiCheck, FiAlertCircle, FiDownload } from 'react-icons/fi';
import { importAPI } from '@/lib/api';

export default function ProductImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setError('');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a CSV file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      setError('');
      setResult(null);

      const response = await importAPI.uploadCSV(formData);

      setResult(response.data);
      setFile(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to import products';
      setError(errorMessage);
      console.error('Import error:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const template = `Product Number,Product Name,Image,Category,Subcategory,Product Description,Price,Selling Price,Stock
P001,Monstera Deliciosa,https://drive.google.com/uc?id=YOUR_FILE_ID&export=download,Indoor Plants,Large Leaf Plants,Beautiful large-leaf indoor plant,1299,999,50
P002,Snake Plant,https://drive.google.com/uc?id=YOUR_FILE_ID&export=download,Indoor Plants,Low Maintenance,Low maintenance succulent,699,599,100`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">📦 Bulk Product Import</h1>
          <p className="text-gray-600 mt-2">Upload a CSV file to import products with images from Google Drive</p>
        </div>

        {/* Template Download */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-blue-900">CSV Template Available</h3>
              <p className="text-sm text-blue-700 mt-1">Download the template to see the required format</p>
            </div>
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
            >
              <FiDownload /> Download Template
            </button>
          </div>
        </div>

        {/* Upload Area */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-12 text-center mb-8 transition ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
          }`}
        >
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
            id="csv-upload"
          />
          <label htmlFor="csv-upload" className="cursor-pointer">
            <FiUpload className="text-4xl text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700">
              {file ? file.name : 'Drag and drop your CSV file here'}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              or click to select a file from your computer
            </p>
          </label>
        </div>

        {/* Upload Button */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
          >
            <FiUpload /> {loading ? 'Importing...' : 'Import Products'}
          </button>
          {file && (
            <button
              onClick={() => {
                setFile(null);
                setError('');
              }}
              className="px-6 bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 rounded-lg transition"
            >
              Clear
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg mb-8 flex items-start gap-3">
            <FiAlertCircle className="text-xl flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Import Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Success Result */}
        {result?.success && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-start gap-4 mb-6">
              <FiCheck className="text-4xl text-green-600 flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Import Successful!</h2>
                <p className="text-gray-600 mt-1">{result.message}</p>
              </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-gray-600 text-sm">Products Created</p>
                <p className="text-3xl font-bold text-green-600">{result.productsCreated}</p>
              </div>
              {result.errors && result.errors.length > 0 && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-gray-600 text-sm">Rows with Errors</p>
                  <p className="text-3xl font-bold text-yellow-600">{result.errors.length}</p>
                </div>
              )}
            </div>

            {/* Created Products */}
            {result.products && result.products.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-800 mb-4">✅ Created Products</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {result.products.map((product: any, idx: number) => (
                    <div key={idx} className="bg-gray-50 p-3 rounded-lg flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-800">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.sku}</p>
                      </div>
                      <FiCheck className="text-green-600 text-xl" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Errors */}
            {result.errors && result.errors.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4">⚠️ Import Errors</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {result.errors.map((error: string, idx: number) => (
                    <div key={idx} className="bg-red-50 border border-red-200 p-3 rounded-lg text-sm text-red-700">
                      {error}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info Box */}
        <div className="bg-gray-100 border border-gray-300 rounded-lg p-6 mt-8">
          <h3 className="font-bold text-gray-800 mb-3">📋 How it Works</h3>
          <ol className="space-y-2 text-sm text-gray-700 list-decimal list-inside">
            <li>Download the CSV template using the button above</li>
            <li>Fill in your product data with Google Drive image URLs</li>
            <li>Images should be publicly shared in Google Drive</li>
            <li>Get the share link and extract the file ID from the URL</li>
            <li>Format: https://drive.google.com/uc?id=FILE_ID&export=download</li>
            <li>Upload the CSV file and we'll do the rest!</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
