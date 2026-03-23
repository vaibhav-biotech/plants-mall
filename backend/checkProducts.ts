import mongoose from 'mongoose';

const mongoUri = 'mongodb+srv://bhushan:Vbiotech2003@plants-mall.tzioxkb.mongodb.net/';

async function checkProducts() {
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const products = await db?.collection('products').find({}).limit(5).toArray();

    console.log('📦 Products in Database:\n');
    products?.forEach((product: any, index: number) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   Image: ${product.image || 'NO IMAGE'}`);
      console.log(`   SKU: ${product.sku}\n`);
    });

    if (products && products.length > 0) {
      const firstProduct = products[0];
      if (firstProduct.image) {
        console.log('🔍 First Product Image URL Analysis:');
        console.log(`   Full URL: ${firstProduct.image}`);
        
        const url = new URL(firstProduct.image);
        console.log(`   Hostname: ${url.hostname}`);
        console.log(`   Is S3?: ${url.hostname.includes('s3') || url.hostname.includes('amazonaws')}`);
      }
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
}

checkProducts();
