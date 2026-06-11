import { dbAdapter } from '../config/dbAdapter.js';

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const { recipientId, content } = req.body;

    if (!recipientId || !content) {
      return res.status(400).json({ message: 'Recipient and content are required' });
    }

    if (recipientId === req.user.id) {
      return res.status(400).json({ message: 'Cannot chat with yourself' });
    }

    const message = await dbAdapter.createMessage({
      sender: req.user.id,
      recipient: recipientId,
      content,
    });

    res.status(201).json(message);
  } catch (error) {
    console.error('[MessageController] Send Message Error:', error.message);
    res.status(500).json({ message: 'Server error sending message' });
  }
};

// @desc    Get chat messages between current user and target user
// @route   GET /api/messages/chat/:userId
// @access  Private
export const getChatMessages = async (req, res) => {
  try {
    const messages = await dbAdapter.getMessagesBetween(req.user.id, req.params.userId);
    res.json(messages);
  } catch (error) {
    console.error('[MessageController] Get Chat Messages Error:', error.message);
    res.status(500).json({ message: 'Server error fetching chat messages' });
  }
};

// @desc    Get current user's conversations list
// @route   GET /api/messages/conversations
// @access  Private
export const getConversations = async (req, res) => {
  try {
    const conversations = await dbAdapter.getUserConversations(req.user.id);
    res.json(conversations);
  } catch (error) {
    console.error('[MessageController] Get Conversations Error:', error.message);
    res.status(500).json({ message: 'Server error fetching conversations' });
  }
};
