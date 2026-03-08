import mongoose from "mongoose";

const PatientSchema = new mongoose.Schema({

  name: String,

  age: Number,

  heartRate: Number,

  temperature: Number,

  oxygenLevel: Number,

  createdAt: {
    type: Date,
    default: Date.now
  }

});

export default mongoose.model("Patient", PatientSchema);