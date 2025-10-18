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
const DONATION_CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
const contract = new ethers.Contract(DONATION_CONTRACT_ADDRESS, DonationABI.abi, provider);

// ⚠️ Replace this with your actual deployed contract address


// Create contract instance
const donationContract = new ethers.Contract(
  DONATION_CONTRACT_ADDRESS,
  DonationABI.abi,
  provider
);
async function listenForDonations() {
  console.log("👂 Listening for DonationCreated events...");
  let lastBlock = await provider.getBlockNumber();

  setInterval(async () => {
    const newBlock = await provider.getBlockNumber();
    if (newBlock > lastBlock) {
      const events = await contract.queryFilter("DonationCreated", lastBlock + 1, newBlock);
      for (const e of events) {
        const { donationId, donor,restaurantName,restaurantLocation, foodType, quantity, expiryTimestamp, ipfsHash } = e.args;

        console.log(`🟢 New Donation detected: ${donationId}`);

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
          txHash: e.transactionHash,
        });

        console.log("✅ Donation saved to MongoDB!");
      }
      lastBlock = newBlock;
    }
  }, 5000); // poll every 5 seconds
}

// Listen for DonationCreated event
listenForDonations().catch((err) => console.error("❌ Error in event listener:", err));