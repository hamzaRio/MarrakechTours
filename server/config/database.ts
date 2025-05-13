import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { log } from '../vite';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/marrakechTours';
let isConnected = false;

/**
 * Connect to MongoDB
 */
export const connectToDatabase = async (): Promise<boolean> => {
  // If already connected, return
  if (isConnected) {
    return true;
  }
  
  try {
    log('Connecting to MongoDB...', 'mongodb');
    
    // Create a promise that will be rejected after 5 seconds
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('MongoDB connection timeout after 5 seconds'));
      }, 5000);
    });
    
    // Try to connect with a timeout
    await Promise.race([
      mongoose.connect(MONGODB_URI),
      timeoutPromise
    ]);
    
    isConnected = true;
    log('MongoDB connected successfully', 'mongodb');
    return true;
  } catch (error) {
    log(`MongoDB connection error: ${error}`, 'mongodb');
    log('Application will continue without MongoDB support', 'mongodb');
    return false;
  }
};

export const isMongoConnected = () => isConnected;
export default connectToDatabase;