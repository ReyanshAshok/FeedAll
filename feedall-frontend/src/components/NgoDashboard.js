import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import DonationABI from "../Contracts/DonationContract.json";
import RequestABI from "../Contracts/RequestContract.json";
import TransportABI from "../Contracts/TransportContract.json";

// ⚠️ Replace with deployed addresses
const DONATION_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const REQUEST_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
const TRANSPORT_ADDRESS = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";

const NgoDashboard = () => {
  const [account, setAccount] = useState("");
  const [donations, setDonations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [transports, setTransports] = useState([]);

  // Connect Wallet
  async function connectWallet() {
    if (!window.ethereum) return alert("Install MetaMask!");
    const [acc] = await window.ethereum.request({ method: "eth_requestAccounts" });
    setAccount(acc);
  }

  // Get contract instance
  async function getContract(address, abi) {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(address, abi.abi, signer);
  }

  // Load all dashboard data
  async function loadDashboard() {
    try {
      const donationContract = await getContract(DONATION_ADDRESS, DonationABI);
      const requestContract = await getContract(REQUEST_ADDRESS, RequestABI);
      const transportContract = await getContract(TRANSPORT_ADDRESS, TransportABI);

      const allDonations = await donationContract.getAllDonations();
      const allRequests = await requestContract.getAllRequests();
      const allTransports = await transportContract.getAllTransports();

      setDonations(allDonations);
      setRequests(allRequests);
      setTransports(allTransports);
    } catch (error) {
      console.error("Error loading dashboard:", error);
    }
  }

  useEffect(() => {
    if (account) {
      loadDashboard();
    }
  }, [account]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">NGO Dashboard</h1>
      {!account ? (
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={connectWallet}
        >
          Connect Wallet
        </button>
      ) : (
        <div>
          <p className="mb-4">Connected as: {account}</p>

          {/* Donations Table */}
          <h2 className="text-xl font-semibold">Available Donations</h2>
          <table className="w-full bg-white shadow rounded my-4">
            <thead>
              <tr>
                <th>ID</th>
                <th>Donor</th>
                <th>Food</th>
                <th>Quantity</th>
                <th>Expiry</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {donations.map((d, idx) => (
                <tr key={idx}>
                  <td>{idx}</td>
                  <td>{d.donor}</td>
                  <td>{d.foodType}</td>
                  <td>{Number(d.quantity)} kg</td>
                  <td>{new Date(Number(d.expiryTimestamp) * 1000).toLocaleString()}</td>
                  <td>{Object.keys({0: "Available", 1: "Matched", 2: "InTransit", 3: "Delivered"})[Number(d.status)]}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Requests Table */}
          <h2 className="text-xl font-semibold">Your Requests</h2>
          <table className="w-full bg-white shadow rounded my-4">
            <thead>
              <tr>
                <th>ID</th>
                <th>Food Requested</th>
                <th>Quantity</th>
                <th>Timestamp</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r, idx) => (
                <tr key={idx}>
                  <td>{idx}</td>
                  <td>{r.requestedFoodType}</td>
                  <td>{Number(r.quantity)} kg</td>
                  <td>{new Date(Number(r.timestamp) * 1000).toLocaleString()}</td>
                  <td>{["Pending", "Matched", "Fulfilled"][Number(r.status)]}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Transport Table */}
          <h2 className="text-xl font-semibold">Transport & Delivery Logs</h2>
          <table className="w-full bg-white shadow rounded my-4">
            <thead>
              <tr>
                <th>ID</th>
                <th>Vehicle</th>
                <th>Pickup Time</th>
                <th>Drop Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {transports.map((t, idx) => (
                <tr key={idx}>
                  <td>{idx}</td>
                  <td>{t.vehicleId}</td>
                  <td>{new Date(Number(t.pickupTime) * 1000).toLocaleString()}</td>
                  <td>{t.dropTime > 0 ? new Date(Number(t.dropTime) * 1000).toLocaleString() : "Not Delivered Yet"}</td>
                  <td>{["Assigned", "PickedUp", "Delivered"][Number(t.status)]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default NgoDashboard;
