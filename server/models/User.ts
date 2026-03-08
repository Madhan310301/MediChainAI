import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  photoURL: { type: String },
  phone: { type: String },
  address: { type: String },
  twoFactorEnabled: { type: Boolean, default: false },
  // TTL Index: This will automatically delete the user document 24 hours (86400 seconds) after lastLogin
  lastLogin: { type: Date, default: Date.now, expires: 86400 } 
});

export const User = mongoose.model("User", userSchema);
