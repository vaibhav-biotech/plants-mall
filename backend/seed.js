import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  discount: Number,
  image: String,
  category: String,
  stock: Number,
  sku: String,
  isActive: Boolean,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);

async function seedProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('🗑️  Cleared existing products');

    // Add rose product
    const rose = await Product.create({
      name: 'Red Rose Plant',
      description: 'Beautiful red rose plant with vibrant red flowers. Perfect for decorating your home garden. This rose plant comes with proper care instructions and grows well in both indoor and outdoor settings.',
      price: 899,
      discount: 15,
      image: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=500&h=500&fit=crop',
      category: 'Flowering',
      stock: 25,
      sku: 'ROSE001',
      isActive: true
    });

    console.log('✅ Rose product added:', rose);
    
    // Add a few more products for variety
    const products = [
      {
        name: 'Monstera Deliciosa',
        description: 'Large green leafy plant with natural holes in the leaves. Tropical indoor plant that adds elegance to any space.',
        price: 1499,
        discount: 10,
        image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&h=500&fit=crop',
        category: 'Indoor',
        stock: 15,
        sku: 'MON001',
        isActive: true
      },
      {
        name: 'Snake Plant',
        description: 'Low-maintenance succulent plant with long green striped leaves. Great for beginners and purifies air.',
        price: 599,
        discount: 0,
        image: 'https://images.unsplash.com/photo-1523438097914-512b3d84c64e?w=500&h=500&fit=crop',
        category: 'Succulent',
        stock: 30,
        sku: 'SNK001',
        isActive: true
      },
      {
        name: 'Pothos Plant',
        description: 'Climbing vine plant with heart-shaped leaves. Perfect for hanging baskets and indoor decoration.',
        price: 449,
        discount: 20,
        image: 'https://images.unsplash.com/photo-1520763185298-1b434c919eba?w=500&h=500&fit=crop',
        category: 'Indoor',
        stock: 40,
        sku: 'POT001',
        isActive: true
      }
    ];

    const insertedProducts = await Product.insertMany(products);
    console.log(`✅ Added ${insertedProducts.length} more products`);

    console.log('\n✨ Database seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedProducts();
