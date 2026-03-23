'use client';

import { useEffect, useState } from 'react';
import { offerAPI } from '@/lib/api';

interface Offer {
  _id: string;
  title: string;
  text: string;
  code: string;
  backgroundColor: string;
  textColor: string;
}

export default function NotificationBar() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await offerAPI.getActive();
        setOffers(response.data.offers || []);
      } catch (error) {
        console.error('Failed to fetch offers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  if (loading || offers.length === 0) {
    return null;
  }

  return (
    <div className="bg-yellow-400 text-gray-900 py-1.5 px-4 text-center font-semibold text-sm">
      <div className="max-w-7xl mx-auto space-y-1">
        {offers.map((offer) => (
          <div key={offer._id} className="flex items-center justify-center gap-2">
            <span>🎉 {offer.text}</span>
            {offer.code && (
              <span className="bg-yellow-500 px-2 py-0.5 rounded text-xs font-bold">
                Code: {offer.code}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );}