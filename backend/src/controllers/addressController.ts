import { Request, Response } from 'express';
import Address from '../models/Address.js';

export const createAddress = async (req: Request, res: Response) => {
  try {
    const { street, area, city, state, pincode, phone, type, isDefault } = req.body;
    const userId = (req as any).userId;

    // Validation
    if (!street || !area || !city || !state || !pincode || !phone) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (!/^\d{6}$/.test(pincode)) {
      return res.status(400).json({ message: 'Invalid pincode format (must be 6 digits)' });
    }

    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ message: 'Invalid phone format (must be 10 digits)' });
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await Address.updateMany({ userId }, { isDefault: false });
    }

    const address = await Address.create({
      userId,
      street,
      area,
      city,
      state,
      pincode,
      phone,
      type: type || 'home',
      isDefault: isDefault || false,
    });

    res.status(201).json({
      message: 'Address created successfully',
      address,
    });
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : String(error) });
  }
};

export const getAddresses = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const addresses = await Address.find({ userId }).sort({ isDefault: -1, createdAt: -1 });

    res.json({
      message: 'Addresses fetched successfully',
      addresses,
    });
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : String(error) });
  }
};

export const updateAddress = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;
    const { street, area, city, state, pincode, phone, type, isDefault } = req.body;

    const address = await Address.findOne({ _id: id, userId });
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    // Validate pincode and phone if provided
    if (pincode && !/^\d{6}$/.test(pincode)) {
      return res.status(400).json({ message: 'Invalid pincode format' });
    }

    if (phone && !/^\d{10}$/.test(phone)) {
      return res.status(400).json({ message: 'Invalid phone format' });
    }

    // If setting as default, unset other defaults
    if (isDefault && !address.isDefault) {
      await Address.updateMany({ userId, _id: { $ne: id } }, { isDefault: false });
    }

    Object.assign(address, { street, area, city, state, pincode, phone, type, isDefault });
    await address.save();

    res.json({
      message: 'Address updated successfully',
      address,
    });
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : String(error) });
  }
};

export const deleteAddress = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    const address = await Address.findOneAndDelete({ _id: id, userId });
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    res.json({
      message: 'Address deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : String(error) });
  }
};

export const setDefaultAddress = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    const address = await Address.findOne({ _id: id, userId });
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    // Unset all defaults for this user
    await Address.updateMany({ userId }, { isDefault: false });

    // Set this one as default
    address.isDefault = true;
    await address.save();

    res.json({
      message: 'Default address updated',
      address,
    });
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : String(error) });
  }
};
