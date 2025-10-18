import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import donationRoutes from "./routes/donations.js";
import { ethers } from "ethers";
import DonationABI from "./Contracts/DonationContract.json" with { type: "json" };
import Donation from "./models/Donation.js";  // our mongoose model

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// ✅ Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// ✅ Use Routes (you missed a forward slash here)
app.use("/api/donations", donationRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// ----------------------------------------
// 🔗 BLOCKCHAIN CONNECTION + EVENT LISTENER
// ----------------------------------------

const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

// ⚠️ Replace this with your actual deployed contract address
const DONATION_CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

// Create contract instance
const donationContract = new ethers.Contract(
  DONATION_CONTRACT_ADDRESS,
  DonationABI.abi,
  provider
);

// Listen for DonationCreated event
donationContract.on(
  "DonationCreated",
  async (donationId, donor, restaurantName, restaurantLocation, foodType, quantity, expiryTimestamp, ipfsHash, event) => {
     console.log(`🟢 New Donation detected! ${restaurantName} at ${restaurantLocation}`);

    try {
      await Donation.create({
        donationId: Number(donationId),
        donor,
        restaurantName,
        restaurantLocation,
        foodType,
        quantity: Number(quantity),
        expiryTimestamp: Number(expiryTimestamp),
        ipfsHash,
        status: "Available",
        txHash: event.transactionHash
      });
      console.log("✅ Donation saved to MongoDB!");
    } catch (err) {
      console.error("❌ Error saving donation:", err);
    }
  }
);
