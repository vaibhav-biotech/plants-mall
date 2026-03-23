import mongoose, { Schema, Document } from 'mongoose';

export interface IOffer extends Document {
  title: string;
  text: string;
  code: string;
  isActive: boolean;
  backgroundColor?: string;
  textColor?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const OfferSchema = new Schema<IOffer>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    backgroundColor: {
      type: String,
      default: 'bg-yellow-400',
    },
    textColor: {
      type: String,
      default: 'text-gray-900',
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IOffer>('Offer', OfferSchema);
