import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

let dbStatus = {
  connected: false,
  mode: 'synthetic_fallback',
  message: 'Synthetic fallback mode active (in-memory mock store)',
  error: null
};

/**
 * Connects to MongoDB if configured and available,
 * otherwise safely activates synthetic-data fallback mode without crashing.
 */
export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    logger.warn('MONGODB_URI is not set. Activating synthetic data fallback mode.');
    dbStatus = {
      connected: false,
      mode: 'synthetic_fallback',
      message: 'Synthetic fallback active: MONGODB_URI not provided',
      error: null
    };
    return dbStatus;
  }

  try {
    logger.info(`Attempting to connect to MongoDB...`);
    // Use short timeout so backend boots instantaneously even if MongoDB is not running locally
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 1500,
      connectTimeoutMS: 1500
    });

    dbStatus = {
      connected: true,
      mode: 'mongodb',
      message: 'Connected to MongoDB',
      error: null
    };
    logger.info('MongoDB connection established successfully.');
  } catch (err) {
    dbStatus = {
      connected: false,
      mode: 'synthetic_fallback',
      message: 'Synthetic fallback active: MongoDB unreachable',
      error: err.message
    };
    logger.warn(`MongoDB connection failed (${err.message}). Seamlessly activated synthetic data fallback mode.`);
  }

  return dbStatus;
}

/**
 * Disconnects from MongoDB (useful in testing)
 */
export async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  dbStatus = {
    connected: false,
    mode: 'synthetic_fallback',
    message: 'Disconnected from database; synthetic fallback active',
    error: null
  };
}

/**
 * Returns current database status & active mode
 */
export function getDbStatus() {
  return {
    ...dbStatus,
    readyState: mongoose.connection.readyState
  };
}
