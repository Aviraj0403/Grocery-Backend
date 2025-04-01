import mongoose from 'mongoose';
import { DB_NAME } from '../constants/constant.js';
import dotenv from 'dotenv';
dotenv.config();

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(process.env.MONGO_URL, {
            dbName: DB_NAME
        });
        console.log(`\nMongoDB connected! DB Host: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error("MongoDB connection FAILED:", error);
        process.exit(1);
    }
};

export default connectDB;
