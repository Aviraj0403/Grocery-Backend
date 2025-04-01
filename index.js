import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import connectDB from './src/config/dbConfig.js';
import app from './src/App.js';

const port = process.env.PORT || 4000; 
connectDB()
  .then(() => {
    console.log("MongoDB Connected");
    
    // Start the server
    app.listen(port,  () => {
      console.log(`Server running at ${port}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
  });