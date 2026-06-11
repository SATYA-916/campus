import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let useLocalDB = false;

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/college-marketplace';
  
  try {
    // Attempt MongoDB connection with 3-second timeout so it doesn't hang indefinitely if offline
    console.log(`[Database] Attempting connection to MongoDB at ${mongoURI.replace(/:[^:]+@/, ':<hidden>@')}...`);
    
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000,
    });
    
    console.log('[Database] MongoDB Connected Successfully.');
    useLocalDB = false;
  } catch (error) {
    console.warn('[Database] MongoDB Connection Failed:', error.message);
    console.warn('[Database] Running with local JSON database fallback store.');
    useLocalDB = true;
  }
};

export { connectDB, useLocalDB };
