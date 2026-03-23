import { Request, Response } from 'express';
import Product from '../models/Product.js';
import { uploadToS3, deleteFromS3, generateS3Key } from '../services/s3Service.js';

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, category, search } = req.query;

    const filter: any = { isActive: true };
    if (category) filter.category = category;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const products = await Product.find(filter)
      .limit((Number(limit) || 10) * 1)
      .skip((Number(page) - 1) * (Number(limit) || 10));

    const total = await Product.countDocuments(filter);

    res.json({
      products,
      pagination: {
        total,
        pages: Math.ceil(total / (Number(limit) || 10)),
        currentPage: page,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : String(error) });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : String(error) });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, price, category, stock, sku, discount } = req.body;
    let imageUrl = null;

    // Handle image upload if file is provided
    if ((req as any).file) {
      const file = (req as any).file;
      const s3Key = generateS3Key('products', file.originalname);
      
      try {
        imageUrl = await uploadToS3({
          bucket: process.env.AWS_S3_BUCKET_NAME || '',
          key: s3Key,
          body: file.buffer,
          contentType: file.mimetype,
        });
      } catch (uploadError) {
        return res.status(400).json({ 
          message: 'Failed to upload image to S3',
          error: uploadError instanceof Error ? uploadError.message : String(uploadError)
        });
      }
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      stock,
      sku,
      discount: discount || 0,
      image: imageUrl,
      tags: req.body.tags || [],
      isNewArrival: req.body.isNewArrival || false,
      isOfficeWorthy: req.body.isOfficeWorthy || false,
      isGift: req.body.isGift || false,
    });

    res.status(201).json({ message: 'Product created', product });
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : String(error) });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const updateData = { ...req.body };
    let imageUrl = null;

    // Get current product to check for old image
    const currentProduct = await Product.findById(req.params.id);
    if (!currentProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Handle image upload if file is provided
    if ((req as any).file) {
      const file = (req as any).file;
      const s3Key = generateS3Key('products', file.originalname);
      
      try {
        imageUrl = await uploadToS3({
          bucket: process.env.AWS_S3_BUCKET_NAME || '',
          key: s3Key,
          body: file.buffer,
          contentType: file.mimetype,
        });
        updateData.image = imageUrl;

        // Delete old image from S3 if it exists and is an S3 URL
        if (currentProduct.image && currentProduct.image.includes('.s3.')) {
          try {
            const oldKey = currentProduct.image.split('.com/')[1];
            if (oldKey) {
              await deleteFromS3({
                bucket: process.env.AWS_S3_BUCKET_NAME || '',
                key: oldKey,
              });
            }
          } catch (deleteError) {
            console.error('Failed to delete old image:', deleteError);
            // Don't fail the update if deletion fails
          }
        }
      } catch (uploadError) {
        return res.status(400).json({ 
          message: 'Failed to upload image to S3',
          error: uploadError instanceof Error ? uploadError.message : String(uploadError)
        });
      }
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.json({ message: 'Product updated', product });
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : String(error) });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Delete image from S3 if it exists and is an S3 URL
    if (product.image && product.image.includes('.s3.')) {
      try {
        const s3Key = product.image.split('.com/')[1];
        if (s3Key) {
          await deleteFromS3({
            bucket: process.env.AWS_S3_BUCKET_NAME || '',
            key: s3Key,
          });
        }
      } catch (deleteError) {
        console.error('Failed to delete image from S3:', deleteError);
        // Don't fail the product deletion if image deletion fails
      }
    }

    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : String(error) });
  }
};

export const bulkCreateProducts = async (req: Request, res: Response) => {
  try {
    const { products } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'Products array is required and must not be empty' });
    }

    // Validate and prepare products
    const preparedProducts = products.map((product) => ({
      name: product.name,
      description: product.description || '',
      price: parseFloat(product.price),
      discount: parseFloat(product.discount || '0'),
      category: product.category,
      stock: parseInt(product.stock),
      sku: product.sku,
      image: product.image || null,
      isActive: true,
    }));

    // Insert all products
    const createdProducts = await Product.insertMany(preparedProducts);

    res.status(201).json({
      message: `Successfully created ${createdProducts.length} products`,
      count: createdProducts.length,
      products: createdProducts,
    });
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : String(error) });
  }
};

// Get New Arrival products
export const getNewArrivals = async (req: Request, res: Response) => {
  try {
    const { limit = 6 } = req.query;
    const products = await Product.find({ isActive: true, isNewArrival: true })
      .sort({ createdAt: -1 })
      .limit(Number(limit) || 6);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : String(error) });
  }
};

// Get Office Friendly products
export const getOfficeFriendly = async (req: Request, res: Response) => {
  try {
    const { limit = 6 } = req.query;
    const products = await Product.find({ isActive: true, isOfficeWorthy: true })
      .sort({ createdAt: -1 })
      .limit(Number(limit) || 6);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : String(error) });
  }
};

// Get Gift products
export const getGiftProducts = async (req: Request, res: Response) => {
  try {
    const { limit = 6 } = req.query;
    const products = await Product.find({ isActive: true, isGift: true })
      .sort({ createdAt: -1 })
      .limit(Number(limit) || 6);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : String(error) });
  }
};
