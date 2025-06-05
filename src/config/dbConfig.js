import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { DB_NAME } from '../constants/constant.js';

dotenv.config();

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(process.env.MONGO_URL, {
            dbName: DB_NAME,
            serverSelectionTimeoutMS: 10000, // Optional: shorter wait before timeout
            appName: 'GroceryApp',           // Optional: appears in Atlas logs
        });

        console.log(`✅ MongoDB connected at host: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error('❌ MongoDB connection FAILED:', error.message);
        process.exit(1); // Exit the process with failure code
    }
};

export default connectDB;
