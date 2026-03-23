'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiMail, FiLock, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { useAuthStore } from '../../../lib/authStore';
import { authAPI } from '../../../lib/api';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await authAPI.login(email, password);
      const data = response.data;

      // Login successful
      setSuccess('✅ Login successful! Redirecting...');
      
      // Store auth data (this will persist to localStorage)
      login(data.user, data.token);

      // Redirect to dashboard after a bit longer to ensure state is persisted
      setTimeout(() => {
        router.push('/admin');
      }, 2000);
    } catch (err: any) {
      const errorMessage = 
        err?.response?.data?.error || 
        err?.message || 
        'Login failed. Please check your credentials and try again.';
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🌿</div>
          <h1 className="text-3xl font-bold text-white mb-2">Plants Mall</h1>
          <p className="text-gray-400">Admin Dashboard</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-lg shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Admin Login</h2>

          {/* Error Message */}
          {error && (
            <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <FiAlertCircle size={20} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-6 flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              <FiCheckCircle size={20} />
              <span className="text-sm">{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@plants.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 rounded-lg font-semibold text-white transition ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 active:scale-95'
              }`}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3">
              <strong>Demo Credentials:</strong>
            </p>
            <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Email:</span>
                <code className="ml-2 bg-white px-2 py-1 rounded border border-gray-200">
                  admin@plants.com
                </code>
              </div>
              <div>
                <span className="text-gray-600">Password:</span>
                <code className="ml-2 bg-white px-2 py-1 rounded border border-gray-200">
                  Admin@123
                </code>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              💡 Tip: These credentials will work after backend seed data is loaded.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-gray-400 text-sm">
          <p>Secure admin login • Password protected</p>
        </div>
      </div>
    </div>
  );
}
