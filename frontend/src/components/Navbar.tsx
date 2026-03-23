'use client';

import Link from 'next/link';
import { useCartStore, useDrawerStore } from '../lib/store';
import { useAuthStore } from '../lib/authStore';
import { FiShoppingCart, FiSearch, FiMenu, FiX, FiUser, FiLogOut } from 'react-icons/fi';
import CartDrawer from './CartDrawer';
import NotificationBar from './NotificationBar';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const cartItems = useCartStore((state) => state.items);
  const { openDrawer } = useDrawerStore();
  const { token, user, logout } = useAuthStore();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleOpenCart = () => {
    openDrawer(<CartDrawer />);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <>
      <NotificationBar />

      <nav className="bg-white shadow-md sticky top-0 z-40">
        <div className="container flex justify-between items-center py-4">
          <Link href="/" className="text-2xl font-bold text-primary flex items-center gap-2">
            🌿 Plants Mall
          </Link>

          <div className="hidden md:flex flex-1 mx-8">
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Search plants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
              />
              <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/products" className="hidden md:block text-gray-700 hover:text-primary transition">
              Products
            </Link>
            <Link href="/about" className="hidden md:block text-gray-700 hover:text-primary transition">
              About
            </Link>
            <button
              onClick={handleOpenCart}
              className="relative p-2 text-gray-700 hover:text-primary transition"
            >
              <FiShoppingCart size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Menu or Login/Signup */}
            {hydrated && token && user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="hidden md:flex items-center gap-2 bg-green-50 text-green-600 px-4 py-2 rounded-lg hover:bg-green-100 transition"
                >
                  <FiUser size={20} />
                  <span className="text-sm font-medium">{user.name.split(' ')[0]}</span>
                </button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <Link
                      href="/account"
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <FiUser size={18} />
                      My Account
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition"
                    >
                      <FiLogOut size={18} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : hydrated ? (
              <Link href="/auth/login" className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition hidden md:block">
                Login
              </Link>
            ) : null}
          </div>
        </div>
      </nav>
    </>
  );
}
