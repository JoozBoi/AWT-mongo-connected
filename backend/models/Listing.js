const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an ad title'],
      trim: true,
      maxlength: 120
    },
    description: {
      type: String,
      required: [true, 'Please provide an ad description']
    },
    price: {
      type: Number,
      required: [true, 'Please provide a price in INR']
    },
    category: {
      type: String,
      required: [true, 'Please select a category']
    },
    categorySlug: {
      type: String,
      required: true
    },
    subcategory: {
      type: String,
      default: ''
    },
    condition: {
      type: String,
      enum: ['New', 'Used', 'Refurbished'],
      default: 'Used'
    },
    brand: {
      type: String,
      default: ''
    },
    images: {
      type: [String],
      default: ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80']
    },
    location: {
      city: { type: String, required: true },
      state: { type: String, required: true },
      locality: { type: String, default: '' }
    },
    seller: {
      id: { type: String, required: true },
      name: { type: String, required: true },
      avatar: { type: String, default: '' },
      phone: { type: String, default: '+91 98765 43210' },
      memberSince: { type: String, default: 'Jan 2022' },
      rating: { type: Number, default: 4.8 },
      isVerified: { type: Boolean, default: true },
      responseTime: { type: String, default: 'Replies in minutes' }
    },
    attributes: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    featured: {
      type: Boolean,
      default: false
    },
    isSold: {
      type: Boolean,
      default: false
    },
    viewsCount: {
      type: Number,
      default: 120
    },
    likesCount: {
      type: Number,
      default: 15
    }
  },
  {
    timestamps: true
  }
);

// Search index for text queries
listingSchema.index({ title: 'text', description: 'text', category: 'text', brand: 'text' });

module.exports = mongoose.model('Listing', listingSchema);
