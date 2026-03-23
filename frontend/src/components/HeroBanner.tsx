'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { bannerAPI } from '../lib/api';

interface BannerImage {
  _id: string;
  imageUrl: string;
  title: string;
  link?: string;
}

export default function HeroBanner() {
  const [banners, setBanners] = useState<BannerImage[]>([]);
  const [current, setCurrent] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHeroBanners = async () => {
      try {
        const res = await bannerAPI.getAll();
        // Filter only active hero banners and sort by position
        const heroBanners = res.data
          .filter((b: any) => b.type === 'hero' && b.isActive)
          .sort((a: any, b: any) => (a.position || 0) - (b.position || 0));
        setBanners(heroBanners.length > 0 ? heroBanners : []);
      } catch (error) {
        console.error('Error fetching hero banners:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHeroBanners();
  }, []);

  useEffect(() => {
    if (!autoPlay || banners.length === 0) return;

    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [autoPlay, banners.length]);

  const next = () => {
    if (banners.length === 0) return;
    setCurrent((prev) => (prev + 1) % banners.length);
    setAutoPlay(false);
  };

  const prev = () => {
    if (banners.length === 0) return;
    setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
    setAutoPlay(false);
  };

  if (loading) {
    return (
      <div className="w-full h-screen md:h-[500px] lg:h-[600px] bg-gray-200 animate-pulse" />
    );
  }

  // Show default placeholder if no banners
  if (banners.length === 0) {
    return (
      <div className="relative w-full h-screen md:h-[500px] lg:h-[600px] bg-gradient-to-br from-gray-300 to-gray-200 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-gray-600 text-4xl font-bold">Welcome to Plants Mall</h2>
          <p className="text-gray-500 mt-2">No hero banners yet. Create one from Content Manager</p>
        </div>
      </div>
    );
  }

  const currentBanner = banners[current];

  return (
    <div
      className="relative w-full h-screen md:h-[500px] lg:h-[600px] bg-gray-200 overflow-hidden group"
      onMouseEnter={() => setAutoPlay(false)}
      onMouseLeave={() => setAutoPlay(true)}
    >
      {/* Banner Container */}
      <div className="relative w-full h-full">
        <Link href={currentBanner.link || '#'}>
          <Image
            src={currentBanner.imageUrl}
            alt={currentBanner.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent flex items-center">
            <h2 className="text-white text-4xl font-bold ml-12">{currentBanner.title}</h2>
          </div>
        </Link>
      </div>

      {/* Left Arrow */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full z-10 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <FiChevronLeft size={28} className="text-gray-800" />
      </button>

      {/* Right Arrow */}
      <button
        onClick={next}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full z-10 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <FiChevronRight size={28} className="text-gray-800" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrent(index);
              setAutoPlay(false);
            }}
            className={`w-3 h-3 rounded-full transition-all ${
              index === current ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
