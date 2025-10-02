import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import DonationABI from "../Contracts/DonationContract.json";

const CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

function DonorDashboard() {
    const [donations, setDonations] = useState([]);
    const [foodType, setFoodType] = useState("");
    const [quantity, setQuantity] = useState("");
    const [expiry, setExpiry] = useState("");
    const [account, setAccount] = useState(null);

    async function connectWallet() {
        if (!window.ethereum) return alert("Please install MetaMask");  
        const [acc] = await window.ethereum.request({ method: "eth_requestAccounts" });
        setAccount(acc);
    }

    function getContract() {
        const provider = new ethers.BrowserProvider(window.ethereum); // ethers v6
        const signer = provider.getSigner();
        return new ethers.Contract(CONTRACT_ADDRESS, DonationABI.abi, signer);
    }

    async function createDonation(e) {
        e.preventDefault();
        try {
            const contract = getContract();
            const expiryTimestamp = Math.floor(new Date(expiry).getTime() / 1000);
            const tx = await contract.createDonation(foodType, parseInt(quantity), expiryTimestamp, "Wallah hi");
            await tx.wait();
            alert("Donation created successfully");
            loadDonation();
        } catch (error) {
            console.error(error);
            alert("Error creating donation");
        }
    }

    async function loadDonation() {
        try {
            const contract = getContract();
            const data = await contract.getAllDonations(); 
            setDonations(data);
        } catch (error) {
            console.error(error);
            alert("Error loading donations");
        }
    }

    useEffect(() => {
        if (account) loadDonation();
    }, [account]);

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
