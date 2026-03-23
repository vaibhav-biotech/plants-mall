import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import 'dotenv/config';

// Import models
import User from './src/models/User.js';
import Product from './src/models/Product.js';

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('✅ Connected to MongoDB');

    // Clear existing data (optional)
    await User.deleteMany({});
    await Product.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create admin user (let schema pre-save hook hash the password)
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@plants.com',
      password: 'Admin@224422',
      role: 'admin',
      isActive: true,
    });
    console.log('✅ Admin user created:', admin.email);

    // Create staff user (let schema pre-save hook hash the password)
    const staff = await User.create({
      name: 'Staff User',
      email: 'staff@plants.com',
      password: 'Staff@123',
      role: 'staff',
      isActive: true,
    });
    console.log('✅ Staff user created:', staff.email);

    // Create sample products
    const products = [
      {
        name: 'Monstera Deliciosa',
        description: 'Beautiful indoor plant with large leaves. Easy to care for.',
        price: 1299,
        discount: 10,
        stock: 45,
        category: 'Indoor Plants',
        sku: 'MON001',
      },
      {
        name: 'Areca Palm XL',
        description: 'Tall elegant palm plant. Perfect for corners.',
        price: 2999,
        discount: 5,
        stock: 12,
        category: 'XL Plants',
        sku: 'ARC001',
      },
      {
        name: 'Pothos Golden',
        description: 'Climbing plant with golden leaves. Low maintenance.',
        price: 499,
        discount: 0,
        stock: 78,
        category: 'Indoor Plants',
        sku: 'POT001',
      },
      {
        name: 'Snake Plant',
        description: 'Air purifying plant. Survives in low light.',
        price: 399,
        discount: 15,
        stock: 120,
        category: 'Low Light Plants',
        sku: 'SNK001',
      },
      {
        name: 'Bird of Paradise',
        description: 'Exotic flowering plant with vibrant colors.',
        price: 4999,
        discount: 20,
        stock: 8,
        category: 'Flowering Plants',
        sku: 'BOP001',
      },
      {
        name: 'Rubber Plant',
        description: 'Large dark leaves. Statement plant for homes.',
        price: 1599,
        discount: 8,
        stock: 25,
        category: 'Indoor Plants',
        sku: 'RUB001',
      },
      {
        name: 'Spider Plant',
        description: 'Classic houseplant. Perfect for beginners.',
        price: 299,
        discount: 0,
        stock: 95,
        category: 'Indoor Plants',
        sku: 'SPI001',
      },
      {
        name: 'Peace Lily',
        description: 'Tolerates low light. Elegant white flowers.',
        price: 599,
        discount: 12,
        stock: 40,
        category: 'Low Light Plants',
        sku: 'PEA001',
      },
    ];

    const createdProducts = await Product.insertMany(products);
    console.log(`✅ ${createdProducts.length} products created`);

    console.log('\n✨ Database seeding completed!');
    console.log('\n📝 Test Credentials:');
    console.log('   Admin: admin@plants.com / Admin@224422');
    console.log('   Staff: staff@plants.com / Staff@123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
