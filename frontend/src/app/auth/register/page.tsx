'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authAPI } from '../../../lib/api';
import { useAuthStore } from '../../../lib/authStore';
import { FiMail, FiLock, FiUser, FiAlertCircle, FiCheckCircle, FiEye, FiEyeOff } from 'react-icons/fi';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [validation, setValidation] = useState({
    name: { valid: false, message: '' },
    email: { valid: false, message: '' },
    password: { valid: false, message: '' },
    confirmPassword: { valid: false, message: '' },
  });

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (pwd: string) => {
    // At least 6 characters, 1 uppercase, 1 number
    return pwd.length >= 6 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Real-time validation
    switch (name) {
      case 'name':
        setValidation({
          ...validation,
          name: {
            valid: value.length >= 2,
            message: value.length < 2 ? 'Name must be at least 2 characters' : 'Good!',
          },
        });
        break;
      case 'email':
        setValidation({
          ...validation,
          email: {
            valid: validateEmail(value),
            message: validateEmail(value) ? 'Email looks good!' : 'Invalid email address',
          },
        });
        break;
      case 'password':
        setValidation({
          ...validation,
          password: {
            valid: validatePassword(value),
            message: validatePassword(value) ? 'Strong password!' : 'Min 6 chars, 1 uppercase, 1 number',
          },
        });
        break;
      case 'confirmPassword':
        setValidation({
          ...validation,
          confirmPassword: {
            valid: value === formData.password && value.length > 0,
            message: value === formData.password ? 'Passwords match!' : 'Passwords do not match',
          },
        });
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validation.name.valid || !validation.email.valid || !validation.password.valid || !validation.confirmPassword.valid) {
      setError('Please fill all fields correctly');
      return;
    }

    try {
      setLoading(true);
      const response = await authAPI.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      // Save to Zustand auth store
      login(response.data.user, response.data.token);
      setSuccess('Account created successfully! Redirecting...');
      setTimeout(() => router.push('/'), 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-600 mb-2">🌿 Plants Mall</h1>
          <p className="text-gray-600">Create your plant lover account</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex gap-3">
            <FiAlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-red-600 text-sm font-medium">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex gap-3">
            <FiCheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-green-600 text-sm font-medium">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-gray-700">Full Name</label>
              {validation.name.valid && <FiCheckCircle className="text-green-500" size={16} />}
            </div>
            <div className="relative">
              <FiUser className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none transition ${
                  validation.name.valid || !formData.name
                    ? 'border-gray-300 focus:border-green-500'
                    : 'border-red-300 focus:border-red-500'
                }`}
                required
              />
            </div>
            {formData.name && <p className={`text-xs mt-1 ${validation.name.valid ? 'text-green-600' : 'text-red-600'}`}>{validation.name.message}</p>}
          </div>

          {/* Email */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-gray-700">Email Address</label>
              {validation.email.valid && <FiCheckCircle className="text-green-500" size={16} />}
            </div>
            <div className="relative">
              <FiMail className="absolute left-3 top-3 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none transition ${
                  validation.email.valid || !formData.email
                    ? 'border-gray-300 focus:border-green-500'
                    : 'border-red-300 focus:border-red-500'
                }`}
                required
              />
            </div>
            {formData.email && <p className={`text-xs mt-1 ${validation.email.valid ? 'text-green-600' : 'text-red-600'}`}>{validation.email.message}</p>}
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-gray-700">Password</label>
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
            {formData.password && <p className={`text-xs mt-1 ${validation.password.valid ? 'text-green-600' : 'text-red-600'}`}>{validation.password.message}</p>}
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
            {formData.confirmPassword && <p className={`text-xs mt-1 ${validation.confirmPassword.valid ? 'text-green-600' : 'text-red-600'}`}>{validation.confirmPassword.message}</p>}
          </div>

          {/* Password Requirements */}
          {formData.password && (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-xs font-semibold text-blue-900 mb-2">Password Requirements:</p>
              <ul className="text-xs text-blue-800 space-y-1">
                <li className={formData.password.length >= 6 ? 'text-green-600' : ''}>✓ At least 6 characters</li>
                <li className={/[A-Z]/.test(formData.password) ? 'text-green-600' : ''}>✓ One uppercase letter</li>
                <li className={/[0-9]/.test(formData.password) ? 'text-green-600' : ''}>✓ One number</li>
              </ul>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !validation.name.valid || !validation.email.valid || !validation.password.valid || !validation.confirmPassword.valid}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-green-600 font-semibold hover:text-green-700">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
