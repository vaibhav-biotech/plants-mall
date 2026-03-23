import { Request, Response } from 'express';
import csv from 'csv-parser';
import { Readable } from 'stream';
import axios from 'axios';
import Product from '../models/Product.js';
import { uploadToS3 } from '../services/s3Service.js';

interface ProductRow {
  'Product Number': string;
  'Product Name': string;
  Image: string;
  Category: string;
  Subcategory: string;
  'Product Description': string;
  Price: string;
  Discount: string;
  Stock: string;
}

export const importProductsCSV = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const results: ProductRow[] = [];
    const errors: string[] = [];
    const products = [];

    // Parse CSV
    const stream = Readable.from([req.file.buffer.toString()]);
    
    await new Promise<void>((resolve, reject) => {
      stream
        .pipe(csv())
        .on('data', (data: ProductRow) => {
          results.push(data);
        })
        .on('error', (error: any) => {
          reject(error);
        })
        .on('end', () => {
          resolve();
        });
    });

    // Process each row
    for (let i = 0; i < results.length; i++) {
      const row = results[i];

      try {
        // Debug: Log the row to see what fields are being parsed
        console.log(`Row ${i + 2} fields:`, Object.keys(row));
        console.log(`Row ${i + 2} data:`, row);

        // Validate required fields
        if (!row['Product Name'] || !row['Product Number'] || !row.Image) {
          errors.push(`Row ${i + 2}: Missing required fields (Product Name, Product Number, or Image URL)`);
          continue;
        }

        // Get price and discount from CSV
        const price = parseFloat(row.Price) || 0;
        const discount = parseFloat(row.Discount) || 0;

        // Download image(s) from Google Drive and upload to S3
        let imageUrl = '';
        let imageUrls: string[] = [];
        
        try {
          // Support comma-separated image URLs
          const imageUrlsInput = row.Image.split(',').map(url => url.trim()).filter(url => url);
          
          if (imageUrlsInput.length === 0) {
            errors.push(`Row ${i + 2}: No valid image URLs provided`);
            continue;
          }

          for (let imgIndex = 0; imgIndex < imageUrlsInput.length; imgIndex++) {
            try {
              const imageBuffer = await downloadImageFromUrl(imageUrlsInput[imgIndex]);
              const fileName = `product-${row['Product Number']}-${imgIndex + 1}-${Date.now()}.jpg`;
              const uploadedUrl = await uploadToS3({
                bucket: process.env.AWS_S3_BUCKET_NAME || 'plants-mall-website',
                key: `products/${fileName}`,
                body: imageBuffer,
                contentType: 'image/jpeg',
              });
              
              imageUrls.push(uploadedUrl);
              
              // First image is the main image
              if (imgIndex === 0) {
                imageUrl = uploadedUrl;
              }
            } catch (singleImageError: any) {
              console.warn(`Row ${i + 2}: Failed to process image ${imgIndex + 1} - ${singleImageError.message}`);
              // Continue with other images instead of failing the entire row
            }
          }
          
          if (imageUrls.length === 0) {
            errors.push(`Row ${i + 2}: Failed to process any images`);
            continue;
          }
        } catch (imageError: any) {
          errors.push(`Row ${i + 2}: Failed to process images - ${imageError.message}`);
          continue;
        }

        // Check if product with same SKU already exists
        const existingProduct = await Product.findOne({ sku: row['Product Number'] });
        
        if (existingProduct) {
          // UPDATE existing product
          const updateData: any = {
            name: row['Product Name'],
            description: row['Product Description'] || existingProduct.description,
            price: price,
            discount: discount,
            category: row.Category,
            subcategory: row.Subcategory || existingProduct.subcategory || '',
            stock: parseInt(row.Stock) || existingProduct.stock,
          };

          // Only update image if new one was provided
          if (imageUrl) {
            updateData.image = imageUrl;
          }

          // Only update images array if new ones were provided
          if (imageUrls.length > 0) {
            updateData.images = imageUrls;
          }

          await Product.findByIdAndUpdate(existingProduct._id, updateData);
          products.push({
            sku: row['Product Number'],
            name: row['Product Name'],
            imageUrl: imageUrl || existingProduct.image,
          });
        } else {
          // CREATE new product
          const newProduct = new Product({
            sku: row['Product Number'],
            name: row['Product Name'],
            description: row['Product Description'] || 'No description provided',
            price: price,
            discount: discount,
            image: imageUrl,
            images: imageUrls, // Store all images
            category: row.Category,
            subcategory: row.Subcategory || '',
            stock: parseInt(row.Stock) || 0,
            isActive: true,
          });

          await newProduct.save();
          products.push({
            sku: row['Product Number'],
            name: row['Product Name'],
            imageUrl,
          });
        }

      } catch (error: any) {
        errors.push(`Row ${i + 2}: ${error.message}`);
      }
    }

    res.json({
      success: true,
      message: `Import completed. ${products.length} products processed (created/updated).`,
      productsProcessed: products.length,
      products,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('Error in importProductsCSV:', error);
    res.status(500).json({ success: false, message: 'Failed to import products', error: error.message });
  }
};

// Helper function to download image from Google Drive or other URLs
async function downloadImageFromUrl(imageUrl: string): Promise<Buffer> {
  try {
    // Handle Google Drive URLs - convert to direct download link
    let downloadUrl = imageUrl;
    if (imageUrl.includes('drive.google.com')) {
      // Try to extract file ID from different Google Drive URL formats
      let fileId = null;
      
      // Format: /d/FILE_ID or /file/d/FILE_ID
      fileId = imageUrl.match(/\/d\/([^/?]+)/)?.[1];
      
      // Format: ?id=FILE_ID
      if (!fileId) {
        fileId = imageUrl.match(/[?&]id=([^&]+)/)?.[1];
      }
      
      // Format: /folders/FOLDER_ID (for folder URLs)
      if (!fileId) {
        fileId = imageUrl.match(/\/folders\/([^/?]+)/)?.[1];
      }
      
      if (fileId) {
        // Use &confirm=t to bypass Google Drive's virus scan warning
        downloadUrl = `https://drive.google.com/uc?id=${fileId}&export=download&confirm=t`;
      } else {
        throw new Error('Could not extract file ID from Google Drive URL');
      }
    }

    const response = await axios.get(downloadUrl, {
      responseType: 'arraybuffer',
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'image/*,*/*',
        'Referer': 'https://drive.google.com/',
      },
      maxRedirects: 5,
    });

    return Buffer.from(response.data);
  } catch (error: any) {
    throw new Error(`Failed to download image from URL: ${error.message}`);
  }
}

export const getImportStatus = async (req: Request, res: Response) => {
  try {
    const totalProducts = await Product.countDocuments();
    const recentProducts = await Product.find().sort({ createdAt: -1 }).limit(10);

    res.json({
      success: true,
      totalProducts,
      recentProducts,
    });
  } catch (error: any) {
    console.error('Error in getImportStatus:', error);
    res.status(500).json({ success: false, message: 'Failed to get import status' });
  }
};

