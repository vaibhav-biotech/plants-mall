import mongoose, { Schema, Document } from 'mongoose';

export interface IInvoice extends Document {
  invoiceNumber: string;
  orderId: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    discount: number;
    subtotal: number;
  }>;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  shippingAddress: {
    street: string;
    area: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  paymentMethod: string;
  notes?: string;
  issuedDate: Date;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema = new Schema<IInvoice>(
  {
    invoiceNumber: {
      type: String,
      unique: true,
      required: true,
    },
    orderId: {
      type: String,
      required: true,
      ref: 'Order',
    },
    userId: {
      type: String,
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
    items: [
      {
        productId: String,
        productName: String,
        quantity: Number,
        price: Number,
        discount: Number,
        subtotal: Number,
      },
    ],
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    taxAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    discountAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
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
    paymentMethod: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    issuedDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IInvoice>('Invoice', InvoiceSchema);
