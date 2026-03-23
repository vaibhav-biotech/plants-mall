'use client';

import { useRouter } from 'next/navigation';
import { FiFileText, FiShoppingCart, FiTrendingUp, FiActivity } from 'react-icons/fi';
import Link from 'next/link';

export default function AccountsPage() {
  const router = useRouter();

  const sections = [
    {
      title: 'Purchase Orders',
      description: 'Manage supplier purchase orders, track deliveries, and update inventory',
      icon: FiShoppingCart,
      link: '/admin/accounts/purchase-orders',
      color: 'bg-blue-500',
      stats: 'Pending Orders',
    },
    {
      title: 'Invoices',
      description: 'View, generate, and export customer & vendor invoices',
      icon: FiFileText,
      link: '/admin/accounts/invoices',
      color: 'bg-green-500',
      stats: 'Recent Invoices',
    },
    {
      title: 'Reports',
      description: 'Financial reports, sales reports, and inventory reports',
      icon: FiTrendingUp,
      link: '/admin/accounts/reports',
      color: 'bg-purple-500',
      stats: 'Monthly Reports',
    },
    {
      title: 'Performance',
      description: 'Track accountant activities, audit trails, and financial metrics',
      icon: FiActivity,
      link: '/admin/accounts/performance',
      color: 'bg-orange-500',
      stats: 'Activity Logs',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">💼 Accounts & Finance</h1>
          <p className="text-gray-600 mt-2">Manage invoices, purchase orders, reports, and financial activities</p>
        </div>

        {/* Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {sections.map((section, idx) => {
            const IconComponent = section.icon;
            return (
              <Link
                key={idx}
                href={section.link}
                className="group"
              >
                <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6 h-full cursor-pointer">
                  <div className={`${section.color} text-white p-4 rounded-lg w-fit mb-4 group-hover:scale-110 transition`}>
                    <IconComponent size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{section.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{section.description}</p>
                  <p className="text-xs text-blue-600 font-semibold">{section.stats} →</p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <p className="text-gray-600 text-sm">Pending POs</p>
            <h3 className="text-3xl font-bold text-gray-800 mt-2">0</h3>
            <p className="text-xs text-gray-500 mt-2">Awaiting confirmation</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <p className="text-gray-600 text-sm">Pending Invoices</p>
            <h3 className="text-3xl font-bold text-gray-800 mt-2">0</h3>
            <p className="text-xs text-gray-500 mt-2">Awaiting payment</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <p className="text-gray-600 text-sm">Total Revenue</p>
            <h3 className="text-3xl font-bold text-gray-800 mt-2">₹0</h3>
            <p className="text-xs text-gray-500 mt-2">This month</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
            <p className="text-gray-600 text-sm">Outstanding</p>
            <h3 className="text-3xl font-bold text-gray-800 mt-2">₹0</h3>
            <p className="text-xs text-gray-500 mt-2">Accounts receivable</p>
          </div>
        </div>
      </div>
    </div>
  );
}
