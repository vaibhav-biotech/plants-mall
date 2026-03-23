'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { productAPI, bannerAPI } from '../lib/api';
import ProductCard from '../components/ProductCard';
import HeroBanner from '../components/HeroBanner';
import { FiTrendingUp, FiTruck, FiAward } from 'react-icons/fi';

export default function Home() {
  const [featured, setFeatured] = useState<any[]>([]);
  const [offerBanners, setOfferBanners] = useState<any[]>([]);
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [officeFriendly, setOfficeFriendly] = useState<any[]>([]);
  const [giftProducts, setGiftProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, bannersRes, arrivalsRes, officeRes, giftsRes] = await Promise.all([
          productAPI.getAll(1, 6),
          bannerAPI.getAll(),
          productAPI.getNewArrivals(6),
          productAPI.getOfficeFriendly(6),
          productAPI.getGiftProducts(6),
        ]);
        setFeatured(productsRes.data.products || []);
        
        // Filter only active offer banners and sort by gridPosition
        const offers = bannersRes.data
          .filter((b: any) => b.type === 'offer' && b.isActive)
          .sort((a: any, b: any) => (a.gridPosition || 0) - (b.gridPosition || 0))
          .slice(0, 4);
        setOfferBanners(offers);
        
        setNewArrivals(arrivalsRes.data || []);
        setOfficeFriendly(officeRes.data || []);
        setGiftProducts(giftsRes.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      {/* Hero Banner with Carousel */}
      <HeroBanner />

      {/* Offer Banners Section - 4 Columns Grid */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-full mx-auto px-8 sm:px-10 lg:px-12">
          <h2 className="text-3xl font-bold mb-12 text-gray-900">Special Offers</h2>
          {offerBanners.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {offerBanners.map((banner: any) => (
                <Link
                  key={banner._id}
                  href={banner.link || '#'}
                  className="group flex flex-col"
                >
                  <div className="relative h-[35rem] rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 mb-4">
                    <Image
                      src={banner.imageUrl}
                      alt={banner.altText || banner.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300"></div>
                  </div>
                  <h3 className="text-green-600 font-bold text-lg text-center group-hover:text-green-700 transition">
                    {banner.title}
                  </h3>
                </Link>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="group flex flex-col">
                  <div className="h-[35rem] bg-gray-300 rounded-2xl shadow-lg flex items-center justify-center border-2 border-dashed border-gray-400 mb-4 group-hover:shadow-2xl transition-all">
                    <div className="text-center">
                      <p className="text-gray-600 font-semibold">Offer Banner {i}</p>
                      <p className="text-sm text-gray-500">Add from Content Manager</p>
                    </div>
                  </div>
                  <p className="text-gray-400 font-bold text-lg text-center">Special Offer {i}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Why Choose Plants Mall?
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                icon: <FiTrendingUp size={40} />,
                title: 'Fresh Plants',
                description: 'Handpicked, healthy plants delivered fresh',
              },
              {
                icon: <FiTruck size={40} />,
                title: 'Fast Shipping',
                description: 'Quick delivery to your doorstep',
              },
              {
                icon: <FiAward size={40} />,
                title: 'Quality Assured',
                description: 'All plants come with care guides',
              },
              {
                icon: <FiTrendingUp size={40} />,
                title: 'Best Prices',
                description: 'Competitive prices with seasonal offers',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition text-center"
              >
                <div className="text-primary mb-4 flex justify-center">{feature.icon}</div>
                <h3 className="font-bold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <h2 className="text-3xl font-bold mb-12 text-gray-800">Shop by Category</h2>
          <div className="grid md:grid-cols-5 gap-4">
            {['Indoor', 'Outdoor', 'Flowering', 'Succulents', 'Herbs'].map((cat, i) => (
              <Link
                key={i}
                href={`/products?category=${cat.toLowerCase()}`}
                className="bg-gradient-to-br from-green-100 to-blue-100 p-6 rounded-lg text-center hover:shadow-lg transition cursor-pointer"
              >
                <div className="text-4xl mb-4">
                  {i === 0 && '🏠'}
                  {i === 1 && '🌳'}
                  {i === 2 && '🌸'}
                  {i === 3 && '💚'}
                  {i === 4 && '🌿'}
                </div>
                <h3 className="font-bold text-gray-800">{cat}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <h2 className="text-3xl font-bold mb-12 text-gray-800">🆕 New Arrivals</h2>
          {newArrivals.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {newArrivals.map((product: any) => (
                <ProductCard
                  key={product._id}
                  id={product._id}
                  name={product.name}
                  price={product.price}
                  discount={product.discount}
                  image={product.image}
                  category={product.category}
                  stock={product.stock}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">No new arrivals yet</div>
          )}
        </div>
      </section>

      {/* Office Friendly Section */}
      <section className="py-16 bg-blue-50">
        <div className="container">
          <h2 className="text-3xl font-bold mb-12 text-gray-800">💼 Office Friendly</h2>
          {officeFriendly.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {officeFriendly.map((product: any) => (
                <ProductCard
                  key={product._id}
                  id={product._id}
                  name={product.name}
                  price={product.price}
                  discount={product.discount}
                  image={product.image}
                  category={product.category}
                  stock={product.stock}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">No office friendly plants yet</div>
          )}
        </div>
      </section>

      {/* Gifts Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <h2 className="text-3xl font-bold mb-12 text-gray-800">🎁 Perfect Gifts</h2>
          {giftProducts.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {giftProducts.map((product: any) => (
                <ProductCard
                  key={product._id}
                  id={product._id}
                  name={product.name}
                  price={product.price}
                  discount={product.discount}
                  image={product.image}
                  category={product.category}
                  stock={product.stock}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">No gift products yet</div>
          )}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-bold mb-12 text-gray-800">Featured Products</h2>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : featured.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {featured.map((product: any) => (
                <ProductCard
                  key={product._id}
                  id={product._id}
                  name={product.name}
                  price={product.price}
                  discount={product.discount}
                  image={product.image}
                  category={product.category}
                  stock={product.stock}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No products available yet
            </div>
          )}
          <div className="text-center mt-12">
            <Link
              href="/products"
              className="inline-block bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-secondary transition"
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-white py-16">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Subscribe to Our Newsletter</h2>
          <p className="mb-6 text-gray-100">Get exclusive offers and gardening tips delivered to your inbox</p>
          <div className="flex max-w-md mx-auto gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded text-gray-800"
            />
            <button className="bg-secondary text-white px-6 py-3 rounded font-semibold hover:opacity-90 transition">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
