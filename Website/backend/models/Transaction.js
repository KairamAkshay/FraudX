const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userIdString: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: [0.01, 'Amount must be greater than 0']
  },
  receiverId: {
    type: String,
    required: true,
    trim: true
  },
  deviceId: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  transactionTime: {
    type: String,
    required: true
  },
  transactionType: {
    type: String,
    enum: ['send', 'collect'],
    required: true
  },
  // Feature engineering results
  features: {
    amountDeviation: { type: Number, default: 0 },
    newReceiver: { type: Boolean, default: false },
    newDevice: { type: Boolean, default: false },
    locationAnomaly: { type: Boolean, default: false },
    timeAnomaly: { type: Boolean, default: false },
    frequencySpike: { type: Boolean, default: false }
  },
  // Scoring
  ruleScore: { type: Number, default: 0 },
  mlProbability: { type: Number, default: 0 },
  riskScore: { type: Number, default: 0 },
  // Decision
  decision: {
    type: String,
    enum: ['allow', 'otp', 'delay', 'block'],
    required: true
  },
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'very_high'],
    required: true
  },
  // Explainability
  reasons: [{ type: String }],
  // Status
  status: {
    type: String,
    enum: ['completed', 'pending', 'blocked', 'delayed'],
    default: 'completed'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Transaction', TransactionSchema);
