import mongoose from 'mongoose';

interface IAddress {
  userId: mongoose.Types.ObjectId;
  street: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  type: 'home' | 'office' | 'other';
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new mongoose.Schema<IAddress>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    street: { type: String, required: true },
    area: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true, match: /^\d{6}$/ },
    phone: { type: String, required: true, match: /^\d{10}$/ },
    type: { type: String, enum: ['home', 'office', 'other'], default: 'home' },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IAddress>('Address', addressSchema);
