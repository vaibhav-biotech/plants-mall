'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authAPI } from '../../../lib/api';
import { FiLock, FiAlertCircle, FiCheckCircle, FiEye, FiEyeOff } from 'react-icons/fi';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  const [validation, setValidation] = useState({
    password: { valid: false, message: '' },
    confirmPassword: { valid: false, message: '' },
  });

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FiAlertCircle className="mx-auto mb-4 text-red-600" size={48} />
          <p className="text-gray-900 font-medium mb-4">Invalid reset link</p>
          <Link href="/auth/login" className="text-green-600 hover:text-green-700">Back to login</Link>
        </div>
      </div>
    );
  }

  const validatePassword = (pwd: string) => {
    return pwd.length >= 6 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (name === 'password') {
      setValidation({
        ...validation,
        password: {
          valid: validatePassword(value),
          message: validatePassword(value) ? 'Strong password!' : 'Min 6 chars, 1 uppercase, 1 number',
        },
      });
    } else if (name === 'confirmPassword') {
      setValidation({
        ...validation,
        confirmPassword: {
          valid: value === formData.password && value.length > 0,
          message: value === formData.password ? 'Passwords match!' : 'Passwords do not match',
        },
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Invalid reset link. Please try again.');
      return;
    }

    if (!validation.password.valid || !validation.confirmPassword.valid) {
      setError('Please fill all fields correctly');
      return;
    }

    try {
      setLoading(true);
      await authAPI.resetPassword(token, formData.password);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md text-center">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <FiCheckCircle className="text-green-600" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Password Reset Successful</h1>
            <p className="text-gray-600">Your password has been updated. You can now log in with your new password.</p>
          </div>

          <button
            onClick={() => router.push('/auth/login')}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Password</h1>
          <p className="text-gray-600">Enter your new password below</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex gap-3">
            <FiAlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-red-600 text-sm font-medium">{error}</p>
          </div>
        )}

        {!token && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              Invalid or expired reset link. Please{' '}
              <Link href="/auth/forgot-password" className="font-semibold text-blue-600 hover:text-blue-700">
                request a new one
              </Link>
            </p>
          </div>
        )}

        {token && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700">New Password</label>
                {validation.password.valid && <FiCheckCircle className="text-green-500" size={16} />}
              </div>
              <div className="relative">
                <FiLock className="absolute left-3 top-3 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none transition ${
                    validation.password.valid || !formData.password
                      ? 'border-gray-300 focus:border-green-500'
                      : 'border-red-300 focus:border-red-500'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
              {formData.password && (
                <p className={`text-xs mt-1 ${validation.password.valid ? 'text-green-600' : 'text-red-600'}`}>
                  {validation.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700">Confirm Password</label>
                {validation.confirmPassword.valid && <FiCheckCircle className="text-green-500" size={16} />}
              </div>
              <div className="relative">
                <FiLock className="absolute left-3 top-3 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none transition ${
                    validation.confirmPassword.valid || !formData.confirmPassword
                      ? 'border-gray-300 focus:border-green-500'
                      : 'border-red-300 focus:border-red-500'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
              {formData.confirmPassword && (
                <p className={`text-xs mt-1 ${validation.confirmPassword.valid ? 'text-green-600' : 'text-red-600'}`}>
                  {validation.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Password Requirements */}
            {formData.password && (
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="text-xs font-semibold text-blue-900 mb-2">Password Requirements:</p>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li className={formData.password.length >= 6 ? 'text-green-600' : ''}>
                    ✓ At least 6 characters
                  </li>
                  <li className={/[A-Z]/.test(formData.password) ? 'text-green-600' : ''}>
                    ✓ One uppercase letter
                  </li>
                  <li className={/[0-9]/.test(formData.password) ? 'text-green-600' : ''}>✓ One number</li>
                </ul>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !validation.password.valid || !validation.confirmPassword.valid}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Resetting password...' : 'Reset Password'}
            </button>
          </form>
        )}

        {!token && (
          <Link href="/auth/login" className="block w-full text-center mt-6 text-green-600 font-semibold hover:text-green-700">
            Go back to login
          </Link>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
