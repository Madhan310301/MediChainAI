import mongoose from "mongoose";

const recordSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, required: true },
  fileName: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now }
});

export const Record = mongoose.model("Record", recordSchema);