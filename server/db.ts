import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export async function connectDB() {
  try {
    // console.log("🔎 MONGO_URI =", process.env.MONGO_URI);

    await mongoose.connect(process.env.MONGO_URI as string);

    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error);
    process.exit(1);
  }
}