import mongoose, { Schema, Document } from 'mongoose';

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  discount: number;
  subtotal: number;
}

export interface IOrder extends Document {
  userId?: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  totalPrice: number;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  giftCharge?: number;
  isGift?: boolean;
  giftMessage?: string;
  giftAddress?: {
    recipientName: string;
    street: string;
    area: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  status: 'placed' | 'confirmed' | 'processing' | 'shipping' | 'transit' | 'delivered' | 'cancelled';
  paymentMethod: 'credit_card' | 'debit_card' | 'upi' | 'net_banking' | 'cod';
  paymentStatus: 'pending' | 'completed' | 'failed';
  shippingAddress: {
    street: string;
    area: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  trackingNumber?: string;
  notes?: string;
  invoiceId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema({
  productId: String,
  productName: String,
  quantity: Number,
  price: Number,
  discount: Number,
  subtotal: Number,
}, { _id: false });

const OrderSchema = new Schema<IOrder>(
  {
    userId: {
      type: String,
      sparse: true,
    },
    orderNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    customerEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    customerPhone: {
      type: String,
      required: true,
      trim: true,
    },
    items: {
      type: [OrderItemSchema],
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    subtotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    giftCharge: {
      type: Number,
      default: 0,
      min: 0,
    },
    isGift: {
      type: Boolean,
      default: false,
    },
    giftMessage: {
      type: String,
      trim: true,
      sparse: true,
    },
    giftAddress: {
      recipientName: String,
      street: String,
      area: String,
      city: String,
      state: String,
      pincode: String,
      country: String,
    },
    status: {
      type: String,
      enum: ['placed', 'confirmed', 'processing', 'shipping', 'transit', 'delivered', 'cancelled'],
      default: 'placed',
    },
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'debit_card', 'upi', 'net_banking', 'cod'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    shippingAddress: {
      street: {
        type: String,
        required: true,
      },
      area: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      pincode: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        default: 'India',
      },
    },
    trackingNumber: {
      type: String,
      sparse: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    invoiceId: {
      type: String,
      sparse: true,
    },
  },
  { timestamps: true }
);

// Pre-save hook to generate order number if not present
OrderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    // Generate order number: ORD-YYYYMMDD-XXXXX
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 90000) + 10000;
    this.orderNumber = `ORD-${dateStr}-${random}`;
  }
  next();
});

export default mongoose.model<IOrder>('Order', OrderSchema);
