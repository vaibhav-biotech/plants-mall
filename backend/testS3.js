import { S3Client, ListObjectsV2Command, HeadBucketCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

const testS3Connection = async () => {
  try {
    console.log('🔍 Testing AWS S3 Connection...\n');

    // Check if all required env variables are set
    console.log('Checking environment variables:');
    console.log(`  AWS_ACCESS_KEY_ID: ${process.env.AWS_ACCESS_KEY_ID ? '✅ Set' : '❌ Not set'}`);
    console.log(`  AWS_SECRET_ACCESS_KEY: ${process.env.AWS_SECRET_ACCESS_KEY ? '✅ Set' : '❌ Not set'}`);
    console.log(`  AWS_S3_BUCKET_NAME: ${process.env.AWS_S3_BUCKET_NAME ? '✅ Set' : '❌ Not set'}`);
    console.log(`  AWS_REGION: ${process.env.AWS_REGION ? '✅ Set' : '❌ Not set'}\n`);

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

    console.log('Configuration:');
    console.log(`  📍 AWS Region: ${process.env.AWS_REGION}`);
    console.log(`  📦 Bucket Name: ${process.env.AWS_S3_BUCKET_NAME}`);
    console.log(`  🔑 Access Key: ${process.env.AWS_ACCESS_KEY_ID.substring(0, 10)}...`);
    console.log(`  🔐 Secret: ${process.env.AWS_SECRET_ACCESS_KEY.substring(0, 10)}...\n`);

    // Create S3 client
    const s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    console.log('Test 1️⃣ : Checking if bucket exists...');
    try {
      const headCommand = new HeadBucketCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
      });
      const response = await s3Client.send(headCommand);
      console.log('✅ Bucket exists and is accessible!');
      console.log(`   Response: ${JSON.stringify(response.$metadata)}\n`);
    } catch (error) {
      console.error('❌ Failed to access bucket\n');
      console.error('Full error details:');
      console.error(`  Code: ${error.Code || error.name}`);
      console.error(`  Message: ${error.message}`);
      console.error(`  Status Code: ${error.$metadata?.httpStatusCode}`);
      console.error();
      
      if (error.Code === 'NoSuchBucket') {
        console.error('📍 Issue: Bucket does not exist');
        console.error('   Solution: Create bucket "plants-mall-website" in AWS S3');
      } else if (error.Code === 'Forbidden' || error.$metadata?.httpStatusCode === 403) {
        console.error('📍 Issue: Access denied (wrong credentials or permissions)');
        console.error('   Solution: Verify AWS credentials and IAM permissions');
      } else if (error.Code === 'InvalidBucketName') {
        console.error('📍 Issue: Invalid bucket name');
        console.error('   Solution: Check bucket name spelling');
      } else if (error.$metadata?.httpStatusCode === 301 || error.$metadata?.httpStatusCode === 307) {
        console.error('📍 Issue: Bucket in wrong region');
        console.error('   Solution: Check AWS_REGION matches where bucket is created');
      }
      
      throw error;
    }

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
          console.log(`   - ${obj.Key} (${obj.Size} bytes)`);
        });
      } else {
        console.log('✅ Bucket is empty - Ready for uploads!');
      }
      console.log();
    } catch (error) {
      console.error('❌ Failed to list objects');
      throw error;
    }

    console.log('Test 3️⃣ : Verifying S3 URL format...');
    const s3Url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`;
    console.log(`✅ Images will be accessible at: ${s3Url}/[filename]\n`);

    console.log('🎉 All S3 tests passed! Your bucket is ready.\n');
    console.log('Next steps:');
    console.log('1. ✅ Run: npm run dev');
    console.log('2. ✅ Go to: http://localhost:3000/admin');
    console.log('3. ✅ Create a product with image upload\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ S3 Connection Test Failed!\n');
    process.exit(1);
  }
};

testS3Connection();
