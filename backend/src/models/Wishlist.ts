import mongoose from 'mongoose';

interface IWishlist {
  userId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const wishlistSchema = new mongoose.Schema<IWishlist>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  },
  { timestamps: true }
);

// Ensure a user can only have one wishlist entry per product
wishlistSchema.index({ userId: 1, productId: 1 }, { unique: true });

export default mongoose.model<IWishlist>('Wishlist', wishlistSchema);
