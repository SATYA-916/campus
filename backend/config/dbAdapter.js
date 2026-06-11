import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { useLocalDB } from './db.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Message from '../models/Message.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCAL_DB_DIR = path.join(__dirname, '..', 'data', 'localdb');
const USERS_FILE = path.join(LOCAL_DB_DIR, 'users.json');
const PRODUCTS_FILE = path.join(LOCAL_DB_DIR, 'products.json');
const MESSAGES_FILE = path.join(LOCAL_DB_DIR, 'messages.json');

// Ensure local db directory and files exist
const initLocalDB = () => {
  if (!fs.existsSync(LOCAL_DB_DIR)) {
    fs.mkdirSync(LOCAL_DB_DIR, { recursive: true });
  }
  if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, JSON.stringify([]));
  if (!fs.existsSync(PRODUCTS_FILE)) fs.writeFileSync(PRODUCTS_FILE, JSON.stringify([]));
  if (!fs.existsSync(MESSAGES_FILE)) fs.writeFileSync(MESSAGES_FILE, JSON.stringify([]));
};

const readJSON = (filePath) => {
  initLocalDB();
  const data = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(data);
};

const writeJSON = (filePath, data) => {
  initLocalDB();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const dbAdapter = {
  // --- USER OPERATIONS ---
  async createUser(userData) {
    if (!useLocalDB) {
      const newUser = new User(userData);
      await newUser.save();
      return newUser.toObject();
    } else {
      const users = readJSON(USERS_FILE);
      const newUser = {
        _id: generateId(),
        ...userData,
        createdAt: new Date().toISOString()
      };
      users.push(newUser);
      writeJSON(USERS_FILE, users);
      return newUser;
    }
  },

  async getUserByEmail(email) {
    const searchEmail = email.toLowerCase();
    if (!useLocalDB) {
      const user = await User.findOne({ email: searchEmail });
      return user ? user.toObject() : null;
    } else {
      const users = readJSON(USERS_FILE);
      const user = users.find(u => u.email.toLowerCase() === searchEmail);
      return user || null;
    }
  },

  async getUserById(id) {
    if (!useLocalDB) {
      const user = await User.findById(id);
      return user ? user.toObject() : null;
    } else {
      const users = readJSON(USERS_FILE);
      const user = users.find(u => u._id === id);
      return user || null;
    }
  },

  async listUsers() {
    if (!useLocalDB) {
      const users = await User.find({});
      return users.map(u => u.toObject());
    } else {
      return readJSON(USERS_FILE);
    }
  },

  // --- PRODUCT OPERATIONS ---
  async createProduct(productData) {
    if (!useLocalDB) {
      const newProduct = new Product(productData);
      await newProduct.save();
      // Populate seller details
      const populated = await Product.findById(newProduct._id).populate('seller', '-password');
      return populated.toObject();
    } else {
      const products = readJSON(PRODUCTS_FILE);
      const newProduct = {
        _id: generateId(),
        ...productData,
        status: 'available',
        createdAt: new Date().toISOString()
      };
      products.push(newProduct);
      writeJSON(PRODUCTS_FILE, products);
      
      // Manually populate seller
      const seller = await this.getUserById(productData.seller);
      if (seller) delete seller.password;
      return { ...newProduct, seller };
    }
  },

  async getProductById(id) {
    if (!useLocalDB) {
      const product = await Product.findById(id).populate('seller', '-password');
      return product ? product.toObject() : null;
    } else {
      const products = readJSON(PRODUCTS_FILE);
      const product = products.find(p => p._id === id);
      if (!product) return null;
      const seller = await this.getUserById(product.seller);
      if (seller) delete seller.password;
      return { ...product, seller };
    }
  },

  async updateProduct(id, updates) {
    if (!useLocalDB) {
      const updated = await Product.findByIdAndUpdate(id, updates, { new: true }).populate('seller', '-password');
      return updated ? updated.toObject() : null;
    } else {
      const products = readJSON(PRODUCTS_FILE);
      const index = products.findIndex(p => p._id === id);
      if (index === -1) return null;
      products[index] = { ...products[index], ...updates };
      writeJSON(PRODUCTS_FILE, products);
      const seller = await this.getUserById(products[index].seller);
      if (seller) delete seller.password;
      return { ...products[index], seller };
    }
  },

  async deleteProduct(id) {
    if (!useLocalDB) {
      const deleted = await Product.findByIdAndDelete(id);
      return !!deleted;
    } else {
      const products = readJSON(PRODUCTS_FILE);
      const filtered = products.filter(p => p._id !== id);
      if (products.length === filtered.length) return false;
      writeJSON(PRODUCTS_FILE, filtered);
      return true;
    }
  },

  async listProducts(filters = {}) {
    if (!useLocalDB) {
      const query = {};
      if (filters.category && filters.category !== 'All') {
        query.category = filters.category;
      }
      if (filters.condition) {
        query.condition = filters.condition;
      }
      if (filters.college && filters.college !== 'All') {
        query.college = filters.college;
      }
      if (filters.status) {
        query.status = filters.status;
      }
      if (filters.search) {
        query.$or = [
          { title: { $regex: filters.search, $options: 'i' } },
          { description: { $regex: filters.search, $options: 'i' } }
        ];
      }
      
      const products = await Product.find(query)
        .populate('seller', '-password')
        .sort({ createdAt: -1 });
      return products.map(p => p.toObject());
    } else {
      let products = readJSON(PRODUCTS_FILE);
      
      if (filters.category && filters.category !== 'All') {
        products = products.filter(p => p.category === filters.category);
      }
      if (filters.condition) {
        products = products.filter(p => p.condition === filters.condition);
      }
      if (filters.college && filters.college !== 'All') {
        products = products.filter(p => p.college.toLowerCase() === filters.college.toLowerCase());
      }
      if (filters.status) {
        products = products.filter(p => p.status === filters.status);
      }
      if (filters.search) {
        const searchRegex = new RegExp(filters.search, 'i');
        products = products.filter(p => searchRegex.test(p.title) || searchRegex.test(p.description));
      }
      
      // Sort by newest
      products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      // Populate sellers
      const populated = [];
      for (const p of products) {
        const seller = await this.getUserById(p.seller);
        if (seller) delete seller.password;
        populated.push({ ...p, seller });
      }
      return populated;
    }
  },

  // --- MESSAGE OPERATIONS ---
  async createMessage(messageData) {
    if (!useLocalDB) {
      const newMessage = new Message(messageData);
      await newMessage.save();
      const populated = await Message.findById(newMessage._id)
        .populate('sender', '-password')
        .populate('recipient', '-password');
      return populated.toObject();
    } else {
      const messages = readJSON(MESSAGES_FILE);
      const newMessage = {
        _id: generateId(),
        ...messageData,
        createdAt: new Date().toISOString()
      };
      messages.push(newMessage);
      writeJSON(MESSAGES_FILE, messages);
      
      const sender = await this.getUserById(messageData.sender);
      if (sender) delete sender.password;
      const recipient = await this.getUserById(messageData.recipient);
      if (recipient) delete recipient.password;
      return { ...newMessage, sender, recipient };
    }
  },

  async getMessagesBetween(userId1, userId2) {
    if (!useLocalDB) {
      const messages = await Message.find({
        $or: [
          { sender: userId1, recipient: userId2 },
          { sender: userId2, recipient: userId1 }
        ]
      })
      .populate('sender', '-password')
      .populate('recipient', '-password')
      .sort({ createdAt: 1 });
      return messages.map(m => m.toObject());
    } else {
      const messages = readJSON(MESSAGES_FILE);
      const chatMessages = messages.filter(m => 
        (m.sender === userId1 && m.recipient === userId2) ||
        (m.sender === userId2 && m.recipient === userId1)
      );
      
      // Sort by oldest first
      chatMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      
      // Populate senders/recipients
      const populated = [];
      for (const m of chatMessages) {
        const sender = await this.getUserById(m.sender);
        if (sender) delete sender.password;
        const recipient = await this.getUserById(m.recipient);
        if (recipient) delete recipient.password;
        populated.push({ ...m, sender, recipient });
      }
      return populated;
    }
  },

  async getUserConversations(userId) {
    // Returns list of unique users that userId has chatted with, along with their last message
    if (!useLocalDB) {
      // Find all messages involving this user
      const messages = await Message.find({
        $or: [{ sender: userId }, { recipient: userId }]
      })
      .populate('sender', '-password')
      .populate('recipient', '-password')
      .sort({ createdAt: -1 });

      const conversationsMap = new Map();
      
      messages.forEach(m => {
        const otherUser = m.sender._id.toString() === userId ? m.recipient : m.sender;
        const otherUserId = otherUser._id.toString();
        
        if (!conversationsMap.has(otherUserId)) {
          conversationsMap.set(otherUserId, {
            otherUser: otherUser.toObject(),
            lastMessage: m.toObject()
          });
        }
      });
      
      return Array.from(conversationsMap.values());
    } else {
      const messages = readJSON(MESSAGES_FILE);
      const userMessages = messages.filter(m => m.sender === userId || m.recipient === userId);
      
      // Sort newest first
      userMessages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      const conversationsMap = new Map();
      for (const m of userMessages) {
        const otherUserId = m.sender === userId ? m.recipient : m.sender;
        if (!conversationsMap.has(otherUserId)) {
          const otherUser = await this.getUserById(otherUserId);
          if (otherUser) {
            delete otherUser.password;
            
            // Re-populate sender/recipient on last message
            const sender = m.sender === userId ? null : otherUser;
            const recipient = m.recipient === userId ? null : otherUser;
            
            conversationsMap.set(otherUserId, {
              otherUser,
              lastMessage: {
                ...m,
                sender: m.sender === userId ? { _id: userId } : otherUser,
                recipient: m.recipient === userId ? { _id: userId } : otherUser
              }
            });
          }
        }
      }
      return Array.from(conversationsMap.values());
    }
  }
};
