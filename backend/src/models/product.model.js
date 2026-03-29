const mongoose = require('mongoose');

// Schema for fixed-price product listings
const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    images: [
      {
        type: String, // Store image URLs
      },
    ],
    productPic: {
      type: String,
      default: '', 
    },
    buyingDate: {
      type: Date,
      default: Date.now,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // Null when the item is still available
    },
    status: {
      type: String,
      enum: ['pending_approval', 'available', 'sold', 'removed'], // Admin verified filter
      default: 'pending_approval',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
