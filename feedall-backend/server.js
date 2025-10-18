import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { ethers } from "ethers";
import donationRoutes from "./routes/donations.js";
import requestRoutes from "./routes/requests.js";
import DonationABI from "./Contracts/DonationContract.json" with { type: "json" };
import RequestABI from "./Contracts/RequestContract.json" with { type: "json" };
import Donation from "./models/Donation.js";
import Request from "./models/Request.js"; // new model for NGO requests

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// ✅ Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// ✅ Use Routes
app.use("/api/donations", donationRoutes);
app.use("/api/requests", requestRoutes); // added route for NGO requests

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// ----------------------------------------------------------
// 🔗 BLOCKCHAIN CONNECTION (Hardhat localhost network)
// ----------------------------------------------------------
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

// 🟢 Replace with your deployed contract addresses
const DONATION_CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const REQUEST_CONTRACT_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

// Create contract instances
const donationContract = new ethers.Contract(
  DONATION_CONTRACT_ADDRESS,
  DonationABI.abi,
  provider
);
const requestContract = new ethers.Contract(
  REQUEST_CONTRACT_ADDRESS,
  RequestABI.abi,
  provider
);

// ----------------------------------------------------------
// 👂 LISTEN FOR DONATION EVENTS
// ----------------------------------------------------------
async function listenForDonations() {
  console.log("👂 Listening for DonationCreated events...");
  let lastBlock = await provider.getBlockNumber();

  setInterval(async () => {
    const newBlock = await provider.getBlockNumber();
    if (newBlock > lastBlock) {
      const events = await donationContract.queryFilter(
        "DonationCreated",
        lastBlock + 1,
        newBlock
      );
      for (const e of events) {
        const {
          donationId,
          donor,
          restaurantName,
          restaurantLocation,
          foodType,
          quantity,
          expiryTimestamp,
          ipfsHash,
        } = e.args;

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
  }, 5000);
}

// ----------------------------------------------------------
// 👂 LISTEN FOR NGO REQUEST EVENTS
// ----------------------------------------------------------
async function listenForRequests() {
  console.log("👂 Listening for RequestCreated events...");
  let lastBlock = await provider.getBlockNumber();

  setInterval(async () => {
    const newBlock = await provider.getBlockNumber();
    if (newBlock > lastBlock) {
      const events = await requestContract.queryFilter(
        "RequestCreated",
        lastBlock + 1,
        newBlock
      );
      for (const e of events) {
        const {
          requestId,
          ngo,
          requestedFoodType,
          quantity,
          timestamp,
        } = e.args;

        console.log(`🟢 New NGO Request detected: ${requestId}`);

        await Request.create({
          requestId: Number(requestId),
          ngo,
          requestedFoodType,
          quantity: Number(quantity),
          timestamp: Number(timestamp),
          status: "Pending",
          txHash: e.transactionHash,
        });

        console.log("✅ Request saved to MongoDB!");
      }
      lastBlock = newBlock;
    }
  }, 5000);
}

// Start both listeners
listenForDonations().catch((err) =>
  console.error("❌ Error in Donation listener:", err)
);
listenForRequests().catch((err) =>
  console.error("❌ Error in Request listener:", err)
);
