'use client';

export default function AboutPage() {
  return (
    <div className="min-h-screen py-16">
      <div className="container">
        <div className="mb-16">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">About Plants Mall</h1>
          <p className="text-xl text-gray-600">Your trusted source for quality plants and gardening products</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Story</h2>
            <p className="text-gray-600 mb-4">
              Plants Mall was founded with a mission to bring the joy of gardening to everyone. We believe that plants
              transform spaces and improve lives.
            </p>
            <p className="text-gray-600 mb-4">
              Our carefully curated collection includes indoor plants, outdoor plants, flowering plants, succulents,
              herbs, and more. Each plant is hand-picked and nurtured to ensure it reaches you in perfect condition.
            </p>
            <p className="text-gray-600">
              We're committed to sustainable practices and providing expert gardening advice to all our customers.
            </p>
          </div>
          <div className="text-6xl text-center">🌿🌱🌳🌸</div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Why Choose Us?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl mb-4">✨</div>
              <h3 className="font-bold text-gray-800 mb-2">Quality Assured</h3>
              <p className="text-gray-600 text-sm">
                All plants undergo quality checks and come with care guides
              </p>
            </div>
            <div>
              <div className="text-4xl mb-4">🚚</div>
              <h3 className="font-bold text-gray-800 mb-2">Fast Delivery</h3>
              <p className="text-gray-600 text-sm">
                Quick, safe delivery to keep your plants fresh and healthy
              </p>
            </div>
            <div>
              <div className="text-4xl mb-4">💚</div>
              <h3 className="font-bold text-gray-800 mb-2">Expert Support</h3>
              <p className="text-gray-600 text-sm">
                Get gardening tips and care advice from our experts
              </p>
            </div>
          </div>
        </div>

        <div className="bg-primary text-white rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Start Your Garden?</h2>
          <p className="mb-6">Explore our amazing collection of plants today</p>
          <a href="/products" className="inline-block bg-secondary text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition">
            Shop Now
          </a>
        </div>
      </div>
    </div>
  );
}
