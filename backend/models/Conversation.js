const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    adId: {
      type: String,
      required: true
    },
    adTitle: {
      type: String,
      required: true
    },
    adPrice: {
      type: Number,
      required: true
    },
    adImage: {
      type: String,
      default: ''
    },
    buyerId: {
      type: String,
      required: true
    },
    sellerName: {
      type: String,
      required: true
    },
    sellerAvatar: {
      type: String,
      default: ''
    },
    lastMessage: {
      type: String,
      default: 'Hi, is this item available?'
    },
    lastMessageTime: {
      type: String,
      default: 'Just now'
    },
    unreadCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Conversation', conversationSchema);
