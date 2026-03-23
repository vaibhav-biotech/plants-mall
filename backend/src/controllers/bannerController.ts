import { Request, Response } from 'express';
import Banner from '../models/Banner.js';
import { uploadToS3 } from '../services/s3Service.js';

// Get all banners (optionally filtered by type)
export const getAllBanners = async (req: Request, res: Response) => {
  try {
    const { type, isActive } = req.query;
    const filter: any = {};

    if (type) filter.type = type;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const banners = await Banner.find(filter).sort({ position: 1 });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch banners' });
  }
};

// Get banner by ID
export const getBannerById = async (req: Request, res: Response) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ error: 'Banner not found' });
    }
    res.json(banner);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch banner' });
  }
};

// Create new banner
export const createBanner = async (req: Request, res: Response) => {
  try {
    const { title, type, position, link, altText, isActive } = req.body;
    let imageUrl = req.body.imageUrl;

    // If file is uploaded, upload to S3
    if (req.file) {
      const s3Url = await uploadToS3({
        bucket: process.env.AWS_S3_BUCKET_NAME || '',
        key: `banners/${Date.now()}-${req.file.originalname}`,
        body: req.file.buffer,
        contentType: req.file.mimetype,
      });
      imageUrl = s3Url;
    }

    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL or file is required' });
    }

    const banner = new Banner({
      title,
      imageUrl,
      type,
      position: position || 0,
      link,
      altText,
      isActive: isActive !== false
    });

    await banner.save();
    res.status(201).json(banner);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create banner' });
  }
};

// Update banner
export const updateBanner = async (req: Request, res: Response) => {
  try {
    const { title, type, position, link, altText, isActive } = req.body;
    let updateData: any = { title, type, position, link, altText, isActive };

    // If new file is uploaded, upload to S3
    if (req.file) {
      const s3Url = await uploadToS3({
        bucket: process.env.AWS_S3_BUCKET_NAME || '',
        key: `banners/${Date.now()}-${req.file.originalname}`,
        body: req.file.buffer,
        contentType: req.file.mimetype,
      });
      updateData.imageUrl = s3Url;
    } else if (req.body.imageUrl) {
      updateData.imageUrl = req.body.imageUrl;
    }

    const banner = await Banner.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!banner) {
      return res.status(404).json({ error: 'Banner not found' });
    }

    res.json(banner);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update banner' });
  }
};

// Delete banner
export const deleteBanner = async (req: Request, res: Response) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) {
      return res.status(404).json({ error: 'Banner not found' });
    }
    res.json({ message: 'Banner deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete banner' });
  }
};

// Reorder banners
export const reorderBanners = async (req: Request, res: Response) => {
  try {
    const { bannerIds } = req.body;

    for (let i = 0; i < bannerIds.length; i++) {
      await Banner.findByIdAndUpdate(bannerIds[i], { position: i });
    }

    const banners = await Banner.find().sort({ position: 1 });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ error: 'Failed to reorder banners' });
  }
};
