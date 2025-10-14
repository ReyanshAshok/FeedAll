import express from "express";
import Donation from "../models/Donation.js";
const router = express.Router();

// Get all donations
router.get("/", async (req, res) => {
  try {
    const donations = await Donation.find().sort({ createdAt: -1 });
    res.json(donations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add donation manually (for now)
router.post("/", async (req, res) => {
  try {
    const newDonation = new Donation(req.body);
    const saved = await newDonation.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
