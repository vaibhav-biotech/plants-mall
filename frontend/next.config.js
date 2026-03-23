/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'res.cloudinary.com',
      'plants-mall-website.s3.ap-southeast-2.amazonaws.com',
      'plants-mall-images.s3.us-east-1.amazonaws.com',
      '*.s3.amazonaws.com',
      '*.s3.us-east-1.amazonaws.com',
      '*.s3.ap-southeast-2.amazonaws.com',
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api',
  },
};

export default nextConfig;
