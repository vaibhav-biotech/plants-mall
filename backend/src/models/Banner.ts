import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    imageUrl: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['hero', 'offer'],
      default: 'offer'
    },
    position: {
      type: Number,
      default: 0
    },
    gridPosition: {
      type: Number,
      default: 1,
      min: 1,
      max: 4
    },
    link: {
      type: String,
      default: null
    },
    altText: {
      type: String,
      default: ''
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Banner', bannerSchema);
