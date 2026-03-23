import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

interface S3UploadOptions {
  bucket: string;
  key: string;
  body: Buffer | string;
  contentType: string;
}

interface S3DeleteOptions {
  bucket: string;
  key: string;
}

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export const uploadToS3 = async (options: S3UploadOptions): Promise<string> => {
  try {
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: options.bucket,
        Key: options.key,
        Body: options.body,
        ContentType: options.contentType,
      },
    });

    await upload.done();

    // Return the S3 URL
    const url = `https://${options.bucket}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${options.key}`;
    return url;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw new Error(`Failed to upload file to S3: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const deleteFromS3 = async (options: S3DeleteOptions): Promise<void> => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: options.bucket,
      Key: options.key,
    });

    await s3Client.send(command);
  } catch (error) {
    console.error('Error deleting from S3:', error);
    throw new Error(`Failed to delete file from S3: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const generateS3Key = (prefix: string, filename: string): string => {
  // Generate a unique key with timestamp to avoid collisions
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const ext = filename.split('.').pop();
  return `${prefix}/${timestamp}-${random}.${ext}`;
};

export default {
  uploadToS3,
  deleteFromS3,
  generateS3Key,
};
