'use client';

import { useEffect, useState } from 'react';
import { offerAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';

interface Offer {
  _id: string;
  title: string;
  text: string;
  code: string;
  isActive: boolean;
  order: number;
}

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const response = await offerAPI.getAll();
      setOffers(response.data.offers || []);
    } catch (err) {
      console.error('Failed to fetch offers:', err);
      setError('Failed to load offers');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this offer?')) return;

    try {
      await offerAPI.delete(id);
      setOffers(offers.filter(o => o._id !== id));
    } catch (err) {
      console.error('Failed to delete offer:', err);
      setError('Failed to delete offer');
    }
  };

  const handleToggle = async (id: string) => {
    try {
      const response = await offerAPI.toggle(id);
      setOffers(offers.map(o => o._id === id ? response.data : o));
    } catch (err) {
      console.error('Failed to toggle offer:', err);
      setError('Failed to toggle offer');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading offers...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Offers Management</h1>
          <p className="text-gray-600 mt-1">Create and manage promotional offers</p>
        </div>
        <Link
          href="/admin/offers/new"
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2 font-medium"
        >
          <FiPlus size={20} />
          New Offer
        </Link>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {offers.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 mb-4">No offers yet</p>
            <Link
              href="/admin/offers/new"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Create the first offer
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Title</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Code</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Text</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {offers.map((offer) => (
                  <tr key={offer._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{offer.title}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="bg-gray-100 px-2 py-1 rounded text-gray-700 font-mono text-xs">
                        {offer.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 truncate max-w-xs">{offer.text}</td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => handleToggle(offer._id)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                          offer.isActive
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {offer.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/offers/${offer._id}`}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit"
                        >
                          <FiEdit2 size={18} />
                        </Link>
                        <button
                          onClick={() => handleDelete(offer._id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-700">
          <strong>Tip:</strong> Active offers will appear in the notification bar on the public website. Disable offers you no longer want to display.
        </p>
      </div>
    </div>
  );
}
