import 'dotenv/config';
import connectDB from './src/config/db.js';
import Product from './src/models/Product.js';

async function analyzeProductFlow() {
  try {
    console.log('🔍 Analyzing Product Image Upload Flow...\n');

    // Check environment variables
    console.log('📋 Environment Variables Check:');
    console.log(`   AWS_REGION: ${process.env.AWS_REGION || '❌ NOT SET'}`);
    console.log(`   AWS_ACCESS_KEY_ID: ${process.env.AWS_ACCESS_KEY_ID ? '✅ SET' : '❌ NOT SET'}`);
    console.log(`   AWS_SECRET_ACCESS_KEY: ${process.env.AWS_SECRET_ACCESS_KEY ? '✅ SET' : '❌ NOT SET'}`);
    console.log(`   AWS_S3_BUCKET_NAME: ${process.env.AWS_S3_BUCKET_NAME || '❌ NOT SET'}\n`);

    // Connect to DB
    await connectDB();
    console.log('✅ Database connected\n');

    // Check existing products with images
    console.log('📦 Checking Existing Products in Database:');
    const allProducts = await Product.find({});
    console.log(`   Total products: ${allProducts.length}\n`);

    if (allProducts.length > 0) {
      console.log('📸 Products with Images:');
      allProducts.forEach((product, idx) => {
        if (product.image) {
          console.log(`   ${idx + 1}. "${product.name}"`);
          console.log(`      Image URL: ${product.image}`);
          console.log(`      S3 URL?: ${product.image.includes('s3') ? '✅ YES' : '❌ NO'}\n`);
        }
      });

      const withoutImages = allProducts.filter(p => !p.image);
      if (withoutImages.length > 0) {
        console.log(`\n⚠️  Products WITHOUT Images: ${withoutImages.length}`);
        withoutImages.slice(0, 3).forEach((product, idx) => {
          console.log(`   ${idx + 1}. "${product.name}"`);
        });
      }
    }

    // Summary
    console.log('\n📊 Summary:');
    const productsWithImages = allProducts.filter(p => p.image);
    const productsWithS3Images = allProducts.filter(p => p.image?.includes('s3'));
    
    console.log(`   Products with images: ${productsWithImages.length}/${allProducts.length}`);
    console.log(`   Products with S3 images: ${productsWithS3Images.length}/${allProducts.length}`);
    
    if (productsWithS3Images.length > 0) {
      console.log('\n✅ Flow is working! Images are being uploaded to S3');
    } else if (productsWithImages.length > 0) {
      console.log('\n⚠️  Images are being saved but NOT from S3');
    } else {
      console.log('\n❌ No images found in products. Check:');
      console.log('   1. AWS credentials in .env file');
      console.log('   2. S3 bucket name in .env file');
      console.log('   3. Try uploading a product with an image again');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

analyzeProductFlow();
