const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter a name'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please enter an email'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Please enter a password'],
      minlength: 6
    },
    phone: {
      type: String,
      default: '+91 98765 43210'
    },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
    },
    isAdmin: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['active', 'suspended'],
      default: 'active'
    },
    location: {
      city: { type: String, default: 'Mumbai' },
      state: { type: String, default: 'Maharashtra' }
    },
    joinedDate: {
      type: String,
      default: () => new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('User', userSchema);
