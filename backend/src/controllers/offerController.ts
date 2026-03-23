import { Request, Response } from 'express';
import Offer from '../models/Offer';

export const getAllOffers = async (req: Request, res: Response) => {
  try {
    const offers = await Offer.find().sort({ order: 1, createdAt: -1 });
    res.json({ offers });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch offers' });
  }
};

export const getActiveOffers = async (req: Request, res: Response) => {
  try {
    const offers = await Offer.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    res.json({ offers });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch active offers' });
  }
};

export const getOfferById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const offer = await Offer.findById(id);
    if (!offer) {
      return res.status(404).json({ error: 'Offer not found' });
    }
    res.json(offer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch offer' });
  }
};

export const createOffer = async (req: Request, res: Response) => {
  try {
    const { title, text, code, backgroundColor = 'bg-yellow-400', textColor = 'text-gray-900' } = req.body;

    // Validate required fields
    if (!title || !text || !code) {
      return res.status(400).json({ error: 'Title, text, and code are required' });
    }

    // Check if code already exists
    const existingOffer = await Offer.findOne({ code: code.toUpperCase() });
    if (existingOffer) {
      return res.status(400).json({ error: 'Offer code already exists' });
    }

    const offer = new Offer({
      title,
      text,
      code: code.toUpperCase(),
      backgroundColor,
      textColor,
      order: 0,
    });

    await offer.save();
    res.status(201).json(offer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create offer' });
  }
};

export const updateOffer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, text, code, isActive, backgroundColor, textColor, order } = req.body;

    // Check if code exists for another offer
    if (code) {
      const existingOffer = await Offer.findOne({
        code: code.toUpperCase(),
        _id: { $ne: id },
      });
      if (existingOffer) {
        return res.status(400).json({ error: 'Offer code already exists' });
      }
    }

    const updateData: any = {};
    if (title) updateData.title = title;
    if (text) updateData.text = text;
    if (code) updateData.code = code.toUpperCase();
    if (isActive !== undefined) updateData.isActive = isActive;
    if (backgroundColor) updateData.backgroundColor = backgroundColor;
    if (textColor) updateData.textColor = textColor;
    if (order !== undefined) updateData.order = order;

    const offer = await Offer.findByIdAndUpdate(id, updateData, { new: true });
    if (!offer) {
      return res.status(404).json({ error: 'Offer not found' });
    }

    res.json(offer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update offer' });
  }
};

export const deleteOffer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const offer = await Offer.findByIdAndDelete(id);
    if (!offer) {
      return res.status(404).json({ error: 'Offer not found' });
    }
    res.json({ message: 'Offer deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete offer' });
  }
};

export const reorderOffers = async (req: Request, res: Response) => {
  try {
    const { offers } = req.body;
    
    if (!Array.isArray(offers)) {
      return res.status(400).json({ error: 'Offers must be an array' });
    }

    // Update order for each offer
    for (let i = 0; i < offers.length; i++) {
      await Offer.findByIdAndUpdate(offers[i]._id, { order: i });
    }

    const updatedOffers = await Offer.find().sort({ order: 1 });
    res.json(updatedOffers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to reorder offers' });
  }
};

export const toggleOfferStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const offer = await Offer.findById(id);
    if (!offer) {
      return res.status(404).json({ error: 'Offer not found' });
    }

    offer.isActive = !offer.isActive;
    await offer.save();
    res.json(offer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle offer status' });
  }
};
