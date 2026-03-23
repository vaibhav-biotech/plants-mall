import { S3Client, ListObjectsV2Command, HeadBucketCommand } from '@aws-sdk/client-s3';
import 'dotenv/config';

const testS3Connection = async () => {
  try {
    console.log('🔍 Testing AWS S3 Connection...\n');

    // Check if all required env variables are set
    if (!process.env.AWS_ACCESS_KEY_ID) {
      throw new Error('❌ AWS_ACCESS_KEY_ID not set in .env');
    }
    if (!process.env.AWS_SECRET_ACCESS_KEY) {
      throw new Error('❌ AWS_SECRET_ACCESS_KEY not set in .env');
    }
    if (!process.env.AWS_S3_BUCKET_NAME) {
      throw new Error('❌ AWS_S3_BUCKET_NAME not set in .env');
    }
    if (!process.env.AWS_REGION) {
      throw new Error('❌ AWS_REGION not set in .env');
    }

    console.log('✅ All environment variables are set\n');

    // Create S3 client
    const s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    console.log(`📍 AWS Region: ${process.env.AWS_REGION}`);
    console.log(`📦 Bucket Name: ${process.env.AWS_S3_BUCKET_NAME}\n`);

    // Test 1: Check if bucket exists
    console.log('Test 1️⃣ : Checking if bucket exists...');
    try {
      const headCommand = new HeadBucketCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
      });
      await s3Client.send(headCommand);
      console.log('✅ Bucket exists and is accessible!\n');
    } catch (error: any) {
      if (error.name === 'NotFound') {
        throw new Error('❌ Bucket does not exist. Please check the bucket name.');
      }
      throw error;
    }

    // Test 2: List objects in bucket
    console.log('Test 2️⃣ : Listing objects in bucket...');
    try {
      const listCommand = new ListObjectsV2Command({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        MaxKeys: 5,
      });
      const response = await s3Client.send(listCommand);
      
      if (response.Contents && response.Contents.length > 0) {
        console.log(`✅ Found ${response.Contents.length} objects in bucket:`);
        response.Contents.forEach((obj) => {
          console.log(`   - ${obj.Key}`);
        });
      } else {
        console.log('✅ Bucket is empty (no objects found) - Ready for uploads!\n');
      }
    } catch (error) {
      throw error;
    }

    // Test 3: Check bucket accessibility
    console.log('\nTest 3️⃣ : Verifying S3 URL format...');
    const s3Url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`;
    console.log(`✅ Images will be accessible at: ${s3Url}/[filename]\n`);

    console.log('🎉 All S3 tests passed! Your bucket is ready for uploads.\n');
    console.log('Next steps:');
    console.log('1. Make sure bucket policy allows public read (if needed)');
    console.log('2. Start the backend: npm run dev');
    console.log('3. Test product image upload in admin dashboard\n');

    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ S3 Connection Test Failed!\n');
    console.error('Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check AWS credentials are correct');
    console.error('2. Verify bucket name exists in your AWS account');
    console.error('3. Ensure IAM user has S3 permissions');
    console.error('4. Check AWS_REGION matches where bucket is created\n');
    process.exit(1);
  }
};

testS3Connection();
