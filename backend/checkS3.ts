import { S3Client, GetBucketPolicyCommand, HeadObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-southeast-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

async function checkS3() {
  console.log('🔍 Checking S3 Configuration...\n');

  const bucket = process.env.AWS_S3_BUCKET_NAME;
  const region = process.env.AWS_REGION;

  console.log(`📦 Bucket: ${bucket}`);
  console.log(`🌍 Region: ${region}\n`);

  try {
    // Check bucket policy
    const policyCommand = new GetBucketPolicyCommand({ Bucket: bucket });
    const policyResponse = await s3Client.send(policyCommand);
    const policy = JSON.parse(policyResponse.Policy || '{}');
    
    console.log('📋 Bucket Policy:');
    console.log(JSON.stringify(policy, null, 2));

    // Check if there's a public read policy
    const hasPublicRead = policy.Statement?.some((stmt: any) => 
      stmt.Principal === '*' && stmt.Effect === 'Allow'
    );

    if (hasPublicRead) {
      console.log('\n✅ Bucket has public read access');
    } else {
      console.log('\n⚠️ Bucket does NOT have public read access - images will be private!');
    }
  } catch (err: any) {
    if (err.Code === 'NoSuchBucketPolicy') {
      console.log('⚠️ No bucket policy found - bucket is PRIVATE');
      console.log('\n📝 You need to set a public read policy on the bucket!');
    } else {
      console.error('Error:', err.message);
    }
  }

  // Test URL format
  const testKey = 'products/test-1234567890.jpg';
  const publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${testKey}`;
  console.log(`\n🔗 Test URL format: ${publicUrl}`);
}

checkS3().catch(console.error);
