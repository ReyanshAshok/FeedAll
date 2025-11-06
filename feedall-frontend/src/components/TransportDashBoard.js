import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Truck, Package, CheckCircle, AlertCircle, Calendar, User } from 'lucide-react';
import TransportABI from "../Contracts/TransportContract.json";
const CONTRACT_ADDRESS = '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9';
const CONTRACT_ABI = TransportABI.abi;
const TransportContractUI = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [transports, setTransports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [donationId, setDonationId] = useState('');
  const [requestId, setRequestId] = useState('');
  const [vehicleInfo, setVehicleInfo] = useState('');
  const [deliveryTransportId, setDeliveryTransportId] = useState('');
  const [deliveryProof, setDeliveryProof] = useState('');

  const statusLabels = ['Assigned', 'In Transit', 'Delivered'];
  const statusColors = {
    0: 'bg-blue-100 text-blue-800',
    1: 'bg-yellow-100 text-yellow-800',
    2: 'bg-green-100 text-green-800'
  };

  useEffect(() => {
    initializeProvider();
  }, []);

  const initializeProvider = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const web3Provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(web3Provider);
        
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          await connectWallet(web3Provider);
        }

        window.ethereum.on('accountsChanged', (accounts) => {
          if (accounts.length > 0) {
            connectWallet(web3Provider);
          } else {
            setAccount('');
            setSigner(null);
            setContract(null);
          }
        });
      } catch (err) {
        setError('Failed to initialize provider: ' + err.message);
      }
    } else {
      setError('Please install MetaMask to use this application');
    }
  };

  const connectWallet = async (web3Provider = provider) => {
    try {
      setLoading(true);
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);

      const web3Signer = await web3Provider.getSigner();
      setSigner(web3Signer);

      const transportContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, web3Signer);
      setContract(transportContract);

      await loadTransports(transportContract);
      setSuccess('Wallet connected successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to connect wallet: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadTransports = async (contractInstance = contract) => {
    if (!contractInstance) return;
    
    try {
      setLoading(true);
      setError('');
      const allTransports = await contractInstance.getAllTransports();
      
      // Handle empty array case
      if (!allTransports || allTransports.length === 0) {
        setTransports([]);
        return;
      }
      
      const formattedTransports = allTransports.map((t, index) => ({
        id: index,
        donationId: t.donationId.toString(),
        requestId: t.requestId.toString(),
        transporter: t.transporter,
        pickupTime: new Date(Number(t.pickupTime) * 1000).toLocaleString(),
        deliveryTime: t.deliveryTime > 0 ? new Date(Number(t.deliveryTime) * 1000).toLocaleString() : 'Not delivered',
        status: Number(t.status),
        vehicleInfo: t.vehicleInfo,
        deliveryProofIPFS: t.deliveryProofIPFS
      }));
      setTransports(formattedTransports);
    } catch (err) {
      // If it's a decoding error on empty data, just set empty array
      if (err.code === 'BAD_DATA' || err.message.includes('could not decode')) {
        setTransports([]);
      } else {
        setError('Failed to load transports: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTransport = async () => {
    if (!contract) {
      setError('Please connect your wallet first');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const tx = await contract.assignTransport(donationId, requestId, vehicleInfo);
      setSuccess('Transaction submitted! Waiting for confirmation...');
      
      await tx.wait();
      setSuccess('Transport assigned successfully!');
      
      setDonationId('');
      setRequestId('');
      setVehicleInfo('');
      
      await loadTransports();
      
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError('Failed to assign transport: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelivery = async () => {
    if (!contract) {
      setError('Please connect your wallet first');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const tx = await contract.confirmDelivery(deliveryTransportId, deliveryProof);
      setSuccess('Transaction submitted! Waiting for confirmation...');
      
      await tx.wait();
      setSuccess('Delivery confirmed successfully!');
      
      setDeliveryTransportId('');
      setDeliveryProof('');
      
      await loadTransports();
      
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError('Failed to confirm delivery: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Truck className="w-8 h-8 text-indigo-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Transport Management</h1>
                <p className="text-sm text-gray-500 mt-1">Contract: {CONTRACT_ADDRESS.slice(0, 6)}...{CONTRACT_ADDRESS.slice(-4)}</p>
              </div>
            </div>
            {!account ? (
              <button
                onClick={() => connectWallet()}
                disabled={loading}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Connecting...' : 'Connect Wallet'}
              </button>
            ) : (
              <div className="text-right">
                <div className="text-sm text-gray-500">Connected</div>
                <div className="text-sm font-mono bg-gray-100 px-3 py-1 rounded mt-1">
                  {account.slice(0, 6)}...{account.slice(-4)}
                </div>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <p className="text-green-700">{success}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Assign Transport
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Donation ID
                </label>
                <input
                  type="number"
                  value={donationId}
                  onChange={(e) => setDonationId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter donation ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Request ID
                </label>
                <input
                  type="number"
                  value={requestId}
                  onChange={(e) => setRequestId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter request ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vehicle Information
                </label>
                <input
                  type="text"
                  value={vehicleInfo}
                  onChange={(e) => setVehicleInfo(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., Truck - TN01AB1234"
                />
              </div>
              <button
                onClick={handleAssignTransport}
                disabled={loading || !account || !donationId || !requestId || !vehicleInfo}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Processing...' : 'Assign Transport'}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Confirm Delivery
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transport ID
                </label>
                <input
                  type="number"
                  value={deliveryTransportId}
                  onChange={(e) => setDeliveryTransportId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter transport ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Proof (IPFS Hash)
                </label>
                <input
                  type="text"
                  value={deliveryProof}
                  onChange={(e) => setDeliveryProof(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., QmX... or ipfs://..."
                />
              </div>
              <button
                onClick={handleConfirmDelivery}
                disabled={loading || !account || !deliveryTransportId || !deliveryProof}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Processing...' : 'Confirm Delivery'}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">All Transports</h2>
            <button
              onClick={() => loadTransports()}
              disabled={loading || !contract}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          {transports.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Package className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p>No transports found. Assign the first transport to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transports.map((transport) => (
                <div key={transport.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg text-gray-800">Transport #{transport.id}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[transport.status]}`}>
                        {statusLabels[transport.status]}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <Package className="w-4 h-4" />
                        <span className="font-medium">Donation ID:</span>
                        <span>{transport.donationId}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <Package className="w-4 h-4" />
                        <span className="font-medium">Request ID:</span>
                        <span>{transport.requestId}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <User className="w-4 h-4" />
                        <span className="font-medium">Transporter:</span>
                        <span className="font-mono text-xs">{transport.transporter.slice(0, 6)}...{transport.transporter.slice(-4)}</span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <Truck className="w-4 h-4" />
                        <span className="font-medium">Vehicle:</span>
                        <span>{transport.vehicleInfo}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <Calendar className="w-4 h-4" />
                        <span className="font-medium">Pickup:</span>
                        <span>{transport.pickupTime}</span>
                      </div>
                      {transport.status === 2 && (
                        <div className="flex items-center gap-2 text-gray-600 mb-2">
                          <Calendar className="w-4 h-4" />
                          <span className="font-medium">Delivery:</span>
                          <span>{transport.deliveryTime}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {transport.deliveryProofIPFS && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <span className="text-xs font-medium text-gray-600">Delivery Proof: </span>
                      <a 
                        href={`https://ipfs.io/ipfs/${transport.deliveryProofIPFS.replace('ipfs://', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-600 hover:underline break-all"
                      >
                        {transport.deliveryProofIPFS}
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransportContractUI;