import { Request, Response } from 'express';
import Category from '../models/Category.js';

export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    const filter: any = { isActive: true };

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const categories = await Category.find(filter).sort({ order: 1, createdAt: -1 });

    res.json({
      categories,
      total: categories.length,
    });
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : String(error) });
  }
};

export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : String(error) });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, icon, order } = req.body;

    // Check if category already exists
    const existing = await Category.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
    if (existing) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = await Category.create({
      name,
      description: description || '',
      icon: icon || null,
      order: order || 0,
    });

    res.status(201).json({ message: 'Category created', category });
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : String(error) });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, icon, order, isActive } = req.body;

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description: description || '',
        icon: icon || null,
        order: order !== undefined ? order : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
      },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ message: 'Category updated', category });
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : String(error) });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : String(error) });
  }
};

export const reorderCategories = async (req: Request, res: Response) => {
  try {
    const { categories } = req.body;

    if (!Array.isArray(categories)) {
      return res.status(400).json({ message: 'Categories array is required' });
    }

    // Update all categories with new order
    const updatePromises = categories.map((cat: any, index: number) =>
      Category.findByIdAndUpdate(cat._id, { order: index }, { new: true })
    );

    await Promise.all(updatePromises);

    res.json({ message: 'Categories reordered' });
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : String(error) });
  }
};
