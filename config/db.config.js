import mongoose from "mongoose";
import { configDotenv } from "dotenv";
configDotenv()

export const connectToMongoDb = () => {
    try {
        mongoose.connect(process.env.MONGO_DB_URI).then(() => console.log("Connected to MongoDB"))
    } catch (error) {
        console.log("Could not connect to MongoDB")
    }
}