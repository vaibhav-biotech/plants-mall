import mongoose from 'mongoose';

interface IVariant {
  size: string; // Small, Medium, Large
  price: number;
  stock: number;
}

interface ICareInfo {
  watering: string;
  sunlight: string;
  difficulty: string;
  growth: string;
  petFriendly: boolean;
  humidity?: string;
  temperature?: string;
}

interface IProduct {
  name: string;
  description: string;
  price: number;
  discount: number;
  image: string;
  images?: string[];
  category: string;
  subcategory?: string;
  stock: number;
  sku: string;
  isActive: boolean;
  tags?: string[]; // "New Arrival", "Office Friendly", "Gift", etc.
  isNewArrival?: boolean;
  isOfficeWorthy?: boolean;
  isGift?: boolean;
  variants?: IVariant[];
  careInfo?: ICareInfo;
  rating?: number;
  reviewCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const variantSchema = new mongoose.Schema<IVariant>(
  {
    size: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, default: 0 },
  },
  { _id: false }
);

const careInfoSchema = new mongoose.Schema<ICareInfo>(
  {
    watering: { type: String, default: '' },
    sunlight: { type: String, default: '' },
    difficulty: { type: String, default: '' },
    growth: { type: String, default: '' },
    petFriendly: { type: Boolean, default: false },
    humidity: { type: String, default: '' },
    temperature: { type: String, default: '' },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0, max: 100 },
    image: { type: String, default: null },
    images: [{ type: String }],
    category: { type: String, required: true },
    subcategory: { type: String, default: '' },
    stock: { type: Number, required: true, default: 0 },
    sku: { type: String, unique: true, required: true },
    isActive: { type: Boolean, default: true },
    tags: [{ type: String, default: null }],
    isNewArrival: { type: Boolean, default: false },
    isOfficeWorthy: { type: Boolean, default: false },
    isGift: { type: Boolean, default: false },
    variants: [variantSchema],
    careInfo: careInfoSchema,
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IProduct>('Product', productSchema);
