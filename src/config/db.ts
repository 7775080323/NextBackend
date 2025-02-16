import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const connection = async () => {
  try {
    const uri = process.env.MONGODB_URL;
    
    if (!uri) {
      throw new Error("MongoDB URL is not defined in environment variables.");
    }

    await mongoose.connect(uri);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }
};

export default connection;
