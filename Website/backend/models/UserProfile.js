const mongoose = require('mongoose');

const UserProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // Behavioral data
  avgTransactionAmount: { type: Number, default: 0 },
  totalTransactions: { type: Number, default: 0 },
  knownReceivers: [{ type: String }],
  knownDevices: [{ type: String }],
  knownLocations: [{ type: String }],
  transactionHistory: [{
    amount: Number,
    timestamp: Date,
    receiverId: String
  }],
  // Stats
  totalAmountSent: { type: Number, default: 0 },
  lastTransactionAt: { type: Date, default: null },
  // Alert count
  totalAlerts: { type: Number, default: 0 }
}, {
  timestamps: true
});

// Update average transaction amount
UserProfileSchema.methods.updateProfile = async function(transaction) {
  const total = this.totalAmountSent + transaction.amount;
  this.totalTransactions += 1;
  this.totalAmountSent = total;
  this.avgTransactionAmount = total / this.totalTransactions;

  if (!this.knownReceivers.includes(transaction.receiverId)) {
    this.knownReceivers.push(transaction.receiverId);
  }
  if (!this.knownDevices.includes(transaction.deviceId)) {
    this.knownDevices.push(transaction.deviceId);
  }
  if (!this.knownLocations.includes(transaction.location)) {
    this.knownLocations.push(transaction.location);
  }

  this.transactionHistory.push({
    amount: transaction.amount,
    timestamp: new Date(),
    receiverId: transaction.receiverId
  });

  // Keep only last 50 transactions in history
  if (this.transactionHistory.length > 50) {
    this.transactionHistory = this.transactionHistory.slice(-50);
  }

  this.lastTransactionAt = new Date();
  await this.save();
};

module.exports = mongoose.model('UserProfile', UserProfileSchema);
