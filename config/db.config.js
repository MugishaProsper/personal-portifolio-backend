import mongoose from "mongoose";
import logger from "../utils/logger.js";

export const connectToMongoDb = async (retries = 5, delayMs = 2000) => {
    const uri = process.env.MONGO_DB_URI;
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            await mongoose.connect(uri, {
                serverSelectionTimeoutMS: 5000,
                maxPoolSize: 10
            });
            logger.info("Connected to MongoDB");
            return;
        } catch (error) {
            logger.error(`MongoDB connection attempt ${attempt} failed: ${error.message}`);
            if (attempt === retries) {
                throw error;
            }
            await new Promise(r => setTimeout(r, delayMs));
        }
    }
};