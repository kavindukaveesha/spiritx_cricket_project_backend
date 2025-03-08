import mongoose from 'mongoose';
import config from './environment';
import logger from '../utils/logger';

// Define connection options
const options = {
    autoIndex: true,
    connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
};

// Connection function
export const connectDB = async (): Promise<void> => {
    try {
        const connection = await mongoose.connect(config.MONGODB_URI, options);

        logger.info(`MongoDB connected: ${connection.connection.host}`);

        // Log when the connection is disconnected
        mongoose.connection.on('disconnected', () => {
            logger.warn('MongoDB disconnected');
        });

        // Log when the connection is reconnected
        mongoose.connection.on('reconnected', () => {
            logger.info('MongoDB reconnected');
        });

        // Log any connection errors
        mongoose.connection.on('error', (err) => {
            logger.error(`MongoDB connection error: ${err}`);
        });

    } catch (error: any) {
        logger.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1); // Exit with failure
    }
};

// Disconnect function
export const disconnectDB = async (): Promise<void> => {
    try {
        await mongoose.disconnect();
        logger.info('MongoDB disconnected');
    } catch (error: any) {
        logger.error(`Error disconnecting from MongoDB: ${error.message}`);
    }
};

export default { connectDB, disconnectDB };