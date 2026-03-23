'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { FiMenu, FiX, FiLogOut, FiUser } from 'react-icons/fi';
import { useAuthStore } from '../../lib/authStore';
import ProtectedAdminLayout from './ProtectedLayout';
import { 
  MdDashboard, 
  MdShoppingCart, 
  MdCategory, 
  MdInventory,
  MdPeople,
  MdSettings,
  MdImage,
  MdLocalOffer,
  MdAnalytics,
  MdSlideshow
} from 'react-icons/md';

const adminNavItems = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: MdDashboard,
  },
  {
    label: 'Analytics',
    href: '/admin/analytics',
    icon: MdAnalytics,
  },
  {
    label: 'Products',
    href: '/admin/products',
    icon: MdInventory,
  },
  {
    label: 'Categories',
    href: '/admin/categories',
    icon: MdCategory,
  },
  {
    label: 'Offers',
    href: '/admin/offers',
    icon: MdLocalOffer,
  },
  {
    label: 'Orders',
    href: '/admin/orders',
    icon: MdShoppingCart,
  },
  {
    label: 'Customers',
    href: '/admin/customers',
    icon: MdPeople,
  },
  {
    label: 'Content Manager',
    href: '/admin/content-manager',
    icon: MdSlideshow,
  },
  {
    label: 'Users',
    href: '/admin/users',
    icon: MdPeople,
  },
  {
    label: 'Media',
    href: '/admin/media',
    icon: MdImage,
  },
  {
    label: 'Settings',
    href: '/admin/settings',
    icon: MdSettings,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { logout, user } = useAuthStore();

  // Check if this is the login page - if so, render without the admin layout
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
      router.push('/admin/login');
    }
  };

  return (
    <ProtectedAdminLayout>
      <div className="flex h-screen bg-gray-50">
      {/* SIDEBAR */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gradient-to-b from-gray-700 to-gray-800 text-white transition-all duration-300 shadow-lg overflow-hidden flex flex-col`}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-600 flex items-center justify-between flex-shrink-0">
          {sidebarOpen && (
            <div>
              <h1 className="text-2xl font-bold">🌿</h1>
              <p className="text-sm text-gray-100">Plants Mall</p>
              <p className="text-xs text-gray-200">Admin</p>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-600 rounded-lg transition"
          >
            {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive
                    ? 'bg-white text-gray-700 font-semibold'
                    : 'text-gray-100 hover:bg-gray-600'
                }`}
              >
                <Icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-gray-600 bg-gray-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
              <FiUser size={20} />
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{user?.name || 'Admin'}</p>
                <p className="text-xs text-gray-300 truncate">{user?.email || 'admin@plants.com'}</p>
              </div>
            )}
            <button 
              onClick={handleLogout}
              className="p-2 hover:bg-gray-600 rounded-lg transition flex-shrink-0"
              title="Logout"
            >
              <FiLogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* TOP HEADER */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {pathname === '/admin'
                  ? 'Dashboard'
                  : pathname.includes('products')
                  ? 'Products Management'
                  : pathname.includes('categories')
                  ? 'Categories Management'
                  : pathname.includes('orders')
                  ? 'Orders Management'
                  : pathname.includes('users')
                  ? 'Users Management'
                  : 'Admin Panel'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Manage your plants mall store
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <span className="text-gray-600">🔔</span>
              </button>
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <FiUser className="text-green-700" />
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
      </div>
    </ProtectedAdminLayout>
  );
}
