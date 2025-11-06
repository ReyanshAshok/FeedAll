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
        if (typeof window === "undefined" || !window.ethereum) {
            return alert("Install MetaMask!");
        }
        try {
            await window.ethereum.request({ method: "eth_requestAccounts" });
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner(); // now safe
            const accounts = await signer.getAddress();
            setAccount(accounts);
        } catch (err) {
            console.error("Wallet connect error:", err);
            alert("Failed to connect wallet");
        }
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
        if (typeof window === "undefined" || !window.ethereum) {
            throw new Error("No injected wallet found");
        }
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner(); // won't be null if window.ethereum present
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
                    gasLimit: 3000000
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
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-3 rounded-xl shadow-lg">
                                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900">Donor Dashboard</h2>
                                <p className="text-sm text-gray-600">Manage your food donations</p>
                            </div>
                        </div>
                        {!account ? (
                            <button 
                                onClick={connectWallet}
                                className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                                Connect Wallet
                            </button>
                        ) : (
                            <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-200">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                <span className="text-sm font-medium text-gray-700">{account.slice(0, 6)}...{account.slice(-4)}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {account && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Donations</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">{donations.length}</p>
                                </div>
                                <div className="bg-emerald-100 p-3 rounded-xl">
                                    <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Quantity</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">
                                        {donations.reduce((acc, don) => acc + Number(don.quantity), 0)} kg
                                    </p>
                                </div>
                                <div className="bg-blue-100 p-3 rounded-xl">
                                    <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Active</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">
                                        {donations.filter(d => d.status !== 2).length}
                                    </p>
                                </div>
                                <div className="bg-green-100 p-3 rounded-xl">
                                    <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-lg">
                                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900">Create New Donation</h3>
                            </div>
                            
                            <form onSubmit={createDonation} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Food Type
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="e.g., Pizza, Salad, Pasta"
                                            value={foodType}
                                            onChange={(e) => setFoodType(e.target.value)}
                                            required
                                            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Restaurant Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Your restaurant name"
                                        value={restaurantName}
                                        onChange={(e) => setRestaurantName(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Location
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Restaurant address"
                                            value={restaurantLocation}
                                            onChange={(e) => setRestaurantLocation(e.target.value)}
                                            required
                                            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Quantity (kg)
                                        </label>
                                        <div className="relative">
                                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                </svg>
                                            </div>
                                            <input
                                                type="number"
                                                placeholder="0"
                                                value={quantity}
                                                onChange={(e) => setQuantity(e.target.value)}
                                                required
                                                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Expiry Date
                                        </label>
                                        <div className="relative">
                                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <input
                                                type="date"
                                                value={expiry}
                                                onChange={(e) => setExpiry(e.target.value)}
                                                required
                                                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 px-6 rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Create Donation
                                </button>
                            </form>
                        </div>

                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">All Donations</h3>
                            
                            <ul className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                                {donations.length > 0 ? donations.map((don, idx) => (
                                    <li 
                                        key={idx}
                                        className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all duration-200 hover:border-emerald-200"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-emerald-100 p-2 rounded-lg">
                                                    <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900 text-lg">{don.foodType}</h4>
                                                    <p className="text-sm text-gray-600">{don.quantity.toString()} kg</p>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                                                don.status === 0 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                                don.status === 1 ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                                'bg-green-100 text-green-800 border-green-200'
                                            }`}>
                                                {don.status === 0 ? 'Available' : don.status === 1 ? 'Claimed' : 'Completed'}
                                            </span>
                                        </div>
                                    </li>
                                )) : (
                                    <li className="text-center py-12">
                                        <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                            </svg>
                                        </div>
                                        <p className="text-gray-600 font-medium">No donations yet</p>
                                        <p className="text-sm text-gray-500 mt-1">Create your first donation to get started</p>
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DonorDashboard;