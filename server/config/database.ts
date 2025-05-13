import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { log } from '../vite';

// Load environment variables
dotenv.config();

// Connection options to improve performance and reliability
const mongooseOptions = {
  serverSelectionTimeoutMS: 5000, // 5 seconds timeout for server selection
  socketTimeoutMS: 45000, // 45 seconds timeout on socket operations
  family: 4 // Use IPv4, skip trying IPv6
};

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
    
    // Set mongoose connection event handlers
    mongoose.connection.on('connected', () => {
      log('MongoDB connected successfully', 'mongodb');
      isConnected = true;
    });
    
    mongoose.connection.on('error', (err) => {
      log(`MongoDB connection error: ${err}`, 'mongodb');
      isConnected = false;
    });
    
    mongoose.connection.on('disconnected', () => {
      log('MongoDB disconnected', 'mongodb');
      isConnected = false;
    });
    
    // Attempt connection with timeout options
    await mongoose.connect(MONGODB_URI, mongooseOptions);
    
    isConnected = true;
    return true;
  } catch (error) {
    log(`MongoDB connection error: ${error}`, 'mongodb');
    log('Application will continue without MongoDB support', 'mongodb');
    return false;
  }
};

export const isMongoConnected = () => isConnected;
export default connectToDatabase;