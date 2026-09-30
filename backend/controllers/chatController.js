const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// @desc    Get user conversations
// @route   GET /api/chats
// @access  Public / Private
const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({}).sort({ updatedAt: -1 });
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create or get conversation for an ad
// @route   POST /api/chats
// @access  Public / Private
const createConversation = async (req, res) => {
  try {
    const { adId, adTitle, adPrice, adImage, sellerName, sellerAvatar } = req.body;

    let conv = await Conversation.findOne({ adId });

    if (!conv) {
      conv = await Conversation.create({
        adId,
        adTitle,
        adPrice,
        adImage,
        buyerId: req.user ? req.user._id : 'user-current',
        sellerName,
        sellerAvatar,
        lastMessage: 'Hi, is this item available?',
        lastMessageTime: 'Just now'
      });
    }

    res.status(201).json(conv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get messages for a conversation
// @route   GET /api/chats/:id/messages
// @access  Public / Private
const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ conversationId: req.params.id }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send a message in a conversation
// @route   POST /api/chats/:id/messages
// @access  Public / Private
const sendMessage = async (req, res) => {
  try {
    const { text, isSeller } = req.body;
    const conversationId = req.params.id;

    const message = await Message.create({
      conversationId,
      senderId: req.user ? req.user._id : 'user-current',
      text,
      isSeller: isSeller || false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    // Update last message in conversation
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: text,
      lastMessageTime: 'Just now'
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getConversations,
  createConversation,
  getMessages,
  sendMessage
};
