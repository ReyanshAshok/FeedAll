import mongoose from "mongoose";

const donationSchema = new mongoose.Schema({
donationId: { type: Number, required: true }, // from blockchain
donor: { type: String, required: true },  
restaurantName:{type: String,required: true},
restaurantLocation:{type: String,required: true},
foodType: { type: String, required: true },
quantity: { type: Number, required: true },
expiryTimestamp: { type: Number, required: true },
ipfsHash: { type: String },
status: { type: String, enum: ["Available", "Matched", "InTransit", "Delivered"], default: "Available" },
txHash: { type: String }, // blockchain transaction hash
createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Donation", donationSchema);
