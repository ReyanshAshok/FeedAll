import mongoose from "mongoose";

const requestSchema = new mongoose.Schema({
  requestId: Number,
  ngo: String,
  requestedFoodType: String,
  quantity: Number,
  timestamp: Number,
  status: String,
  txHash: String
});

export default mongoose.model("Request", requestSchema);
