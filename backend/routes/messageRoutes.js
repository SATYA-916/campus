import express from 'express';
import {
  sendMessage,
  getChatMessages,
  getConversations,
} from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All messaging routes are protected

router.route('/')
  .post(sendMessage);

router.route('/conversations')
  .get(getConversations);

router.route('/chat/:userId')
  .get(getChatMessages);

export default router;
