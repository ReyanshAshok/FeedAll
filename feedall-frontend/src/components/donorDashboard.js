import React, { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import DonationABI from "../Contracts/DonationContract.json";

const CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

function DonorDashboard() {
    const [donations, setDonations] = useState([]);
    const [foodType, setFoodType] = useState("");
    const [quantity, setQuantity] = useState("");
    const [expiry, setExpiry] = useState("");
    const [account, setAccount] = useState(null);
    const [restaurantName, setRestaurantName] = useState("");
    const [restaurantLocation, setRestaurantLocation] = useState("");

    async function connectWallet() {
        if (!window.ethereum) return alert("Please install MetaMask");  
        const [acc] = await window.ethereum.request({ method: "eth_requestAccounts" });
        setAccount(acc);
    }

 const loadDonation = useCallback(async () => {
    try {
        const contract = await getContract();
        const data = await contract.getAllDonations();
        setDonations(data);
    } catch (error) {
        console.error(error);
        alert("Error loading donations");
    }
}, []);

    async function getContract() {
        const provider = new ethers.BrowserProvider(window.ethereum); // ethers v6
        const signer = await provider.getSigner();
        return new ethers.Contract(CONTRACT_ADDRESS, DonationABI.abi, signer);
    }

    async function createDonation(e) {
        e.preventDefault();
        try {
            const contract = await getContract();
            const expiryTimestamp = Math.floor(new Date(expiry).getTime() / 1000);
            const tx = await contract.createDonation(
                restaurantName,
                restaurantLocation,
                foodType,
                parseInt(quantity),
                expiryTimestamp,
                "QmYgWnK2FvA9PzX8b1CgT4pQ5E6D7H3I0JkL2M4oR6sT8UvW0xZ2yA4b6c8d0e2f4g6h8i",
                {
        // Add this options object as the last argument
        gasLimit: 3000000// Setting a high limit, e.g., 3 million
        // Note: You can also use a hex string like "0x2dc6c0"
                }

                );
            await tx.wait();
            alert("Donation created successfully");
            loadDonation();
        } catch (error) {
            console.error(error);
            alert("Error creating donation");
        }
    }


useEffect(() => {
    if (account) loadDonation();
}, [account, loadDonation]);

    return (
        <div>
            <h2>Donor Dashboard</h2>
            {!account && <button onClick={connectWallet}>Connect Wallet</button>}

            {account && (
                <>
                    <form onSubmit={createDonation}>
                        <input
                            type="text"
                            placeholder="Food Type"
                            value={foodType}
                            onChange={(e) => setFoodType(e.target.value)}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Restaurant Name"
                            value={restaurantName}
                            onChange={(e) => setRestaurantName(e.target.value)}
                            required
                            />
                            <input
                            type="text"
                            placeholder="Restaurant Location"
                            value={restaurantLocation}
                            onChange={(e) => setRestaurantLocation(e.target.value)}
                            required
                            />
                        <input
                            type="number"
                            placeholder="Quantity (kg)"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            required
                        />
                        <input
                            type="date"
                            value={expiry}
                            onChange={(e) => setExpiry(e.target.value)}
                            required
                        />
                        <button type="submit">Create Donation</button>
                    </form>

                    <h3>All Donations</h3>
                    <ul>
                        {donations.length > 0 ? donations.map((don, idx) => (
                            <li key={idx}>
                                {don.foodType} - {don.quantity.toString()}kg - Status: {don.status}
                            </li>
                        )) : <li>No donations yet</li>}
                    </ul>
                </>
            )}
        </div>
    );
}

export default DonorDashboard;
