'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../lib/authStore';

export default function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Wait for localStorage to be loaded
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    // Check if user is authenticated
    if (!isAuthenticated) {
      router.push('/admin/login');
      return;
    }

    // Check if user has admin or staff role
    if (user && !['admin', 'staff'].includes(user.role)) {
      router.push('/');
      return;
    }
  }, [isHydrated, isAuthenticated, user, router]);

  // Show loading while checking auth
  if (!isHydrated || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Render protected content
  return children;
}
