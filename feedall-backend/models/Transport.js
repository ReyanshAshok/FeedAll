// models/Transport.js
const mongoose = require('mongoose');

const transportSchema = new mongoose.Schema({
  // Blockchain data
  transportId: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  
  donationId: {
    type: Number,
    required: true,
    index: true
  },
  
  requestId: {
    type: Number,
    required: true,
    index: true
  },
  
  transporter: {
    type: String,
    required: true,
    lowercase: true,
    index: true,
    validate: {
      validator: function(v) {
        return /^0x[a-fA-F0-9]{40}$/.test(v);
      },
      message: props => `${props.value} is not a valid Ethereum address!`
    }
  },
  
  vehicleInfo: {
    type: String,
    required: true,
    trim: true
  },
  
  pickupTime: {
    type: Date,
    required: true,
    index: true
  },
  
  deliveryTime: {
    type: Date,
    default: null
  },
  
  status: {
    type: String,
    enum: ['Assigned', 'InTransit', 'Delivered'],
    default: 'Assigned',
    index: true
  },
  
  deliveryProofIPFS: {
    type: String,
    default: '',
    trim: true
  },
  
  // Blockchain metadata
  blockchainData: {
    transactionHash: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    blockNumber: {
      type: Number,
      required: true
    },
    blockTimestamp: {
      type: Date,
      required: true
    },
    contractAddress: {
      type: String,
      required: true,
      lowercase: true
    },
    network: {
      type: String,
      required: true,
      enum: ['mainnet', 'sepolia', 'polygon', 'mumbai', 'hardhat', 'localhost'],
      default: 'localhost'
    },
    gasUsed: {
      type: String,
      default: '0'
    }
  },
  
  // Additional tracking metadata
  metadata: {
    // Delivery confirmation transaction
    deliveryTransactionHash: {
      type: String,
      default: null
    },
    deliveryBlockNumber: {
      type: Number,
      default: null
    },
    
    // Estimated delivery time
    estimatedDeliveryTime: {
      type: Date,
      default: null
    },
    
    // Route information
    pickupLocation: {
      address: String,
      coordinates: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point'
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          default: undefined
        }
      }
    },
    
    deliveryLocation: {
      address: String,
      coordinates: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point'
        },
        coordinates: {
          type: [Number],
          default: undefined
        }
      }
    },
    
    // Distance and duration
    distance: {
      value: Number, // in meters
      text: String    // human readable
    },
    
    duration: {
      value: Number, // in seconds
      text: String    // human readable
    },
    
    // Additional notes
    notes: {
      type: String,
      default: ''
    },
    
    // Track status changes
    statusHistory: [{
      status: {
        type: String,
        enum: ['Assigned', 'InTransit', 'Delivered']
      },
      timestamp: {
        type: Date,
        default: Date.now
      },
      updatedBy: String,
      transactionHash: String
    }]
  },
  
  // Sync status
  syncStatus: {
    lastSyncedAt: {
      type: Date,
      default: Date.now
    },
    isSynced: {
      type: Boolean,
      default: true
    },
    syncError: {
      type: String,
      default: null
    }
  }
  
}, {
  timestamps: true, // Adds createdAt and updatedAt
  collection: 'transports'
});

// Indexes for better query performance
transportSchema.index({ donationId: 1, requestId: 1 });
transportSchema.index({ transporter: 1, status: 1 });
transportSchema.index({ pickupTime: 1, deliveryTime: 1 });
transportSchema.index({ 'blockchainData.transactionHash': 1 });
transportSchema.index({ 'blockchainData.blockNumber': 1 });
transportSchema.index({ 'metadata.pickupLocation.coordinates': '2dsphere' });
transportSchema.index({ 'metadata.deliveryLocation.coordinates': '2dsphere' });

// Virtual for delivery duration
transportSchema.virtual('deliveryDuration').get(function() {
  if (this.deliveryTime && this.pickupTime) {
    return Math.floor((this.deliveryTime - this.pickupTime) / 1000); // in seconds
  }
  return null;
});

// Instance method to check if delivered
transportSchema.methods.isDelivered = function() {
  return this.status === 'Delivered' && this.deliveryTime !== null;
};

// Instance method to update status with history
transportSchema.methods.updateStatus = function(newStatus, updatedBy, txHash) {
  this.status = newStatus;
  this.metadata.statusHistory.push({
    status: newStatus,
    timestamp: new Date(),
    updatedBy: updatedBy,
    transactionHash: txHash
  });
};

// Static method to find by transporter
transportSchema.statics.findByTransporter = function(transporterAddress) {
  return this.find({ transporter: transporterAddress.toLowerCase() });
};

// Static method to find active transports
transportSchema.statics.findActive = function() {
  return this.find({ 
    status: { $in: ['Assigned', 'InTransit'] } 
  }).sort({ pickupTime: -1 });
};

// Static method to find by donation or request ID
transportSchema.statics.findByDonationOrRequest = function(donationId, requestId) {
  return this.find({ 
    $or: [
      { donationId: donationId },
      { requestId: requestId }
    ]
  });
};

// Pre-save middleware to update sync status
transportSchema.pre('save', function(next) {
  if (this.isModified()) {
    this.syncStatus.lastSyncedAt = new Date();
  }
  next();
});

// Pre-save middleware to add status history on creation
transportSchema.pre('save', function(next) {
  if (this.isNew && this.metadata.statusHistory.length === 0) {
    this.metadata.statusHistory.push({
      status: this.status,
      timestamp: this.pickupTime || new Date(),
      updatedBy: this.transporter,
      transactionHash: this.blockchainData.transactionHash
    });
  }
  next();
});

const Transport = mongoose.model('Transport', transportSchema);

module.exports = Transport;


// models/Donation.js (Reference model for relationships)
const donationSchema = new mongoose.Schema({
  donationId: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  
  donor: {
    type: String,
    required: true,
    lowercase: true
  },
  
  itemDescription: {
    type: String,
    required: true
  },
  
  quantity: {
    type: Number,
    required: true
  },
  
  // Reference to transports
  transports: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transport'
  }],
  
  status: {
    type: String,
    enum: ['Pending', 'Assigned', 'InTransit', 'Delivered', 'Completed'],
    default: 'Pending'
  }
  
}, {
  timestamps: true,
  collection: 'donations'
});

const Donation = mongoose.model('Donation', donationSchema);


// models/Request.js (Reference model for relationships)
const requestSchema = new mongoose.Schema({
  requestId: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  
  requester: {
    type: String,
    required: true,
    lowercase: true
  },
  
  itemsNeeded: {
    type: String,
    required: true
  },
  
  urgency: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  
  // Reference to transports
  transports: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transport'
  }],
  
  status: {
    type: String,
    enum: ['Open', 'Matched', 'InTransit', 'Fulfilled', 'Closed'],
    default: 'Open'
  }
  
}, {
  timestamps: true,
  collection: 'requests'
});

const Request = mongoose.model('Request', requestSchema);


module.exports = {
  Transport,
  Donation,
  Request
};