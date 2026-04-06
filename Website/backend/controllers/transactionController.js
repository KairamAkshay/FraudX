const Transaction = require('../models/Transaction');
const UserProfile = require('../models/UserProfile');
const featureEngineering = require('../services/featureEngineering');
const mlService = require('../services/mlService');
const riskEngine = require('../services/riskEngine');
const decisionEngine = require('../services/decisionEngine');

exports.getTransactions = async (req, res) => {
  try {
    const isAdmin = req.session.user.role === 'admin';
    const filter = isAdmin ? {} : { userId: req.session.user._id };

    const page = parseInt(req.query.page) || 1;
    const limit = 15;
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      Transaction.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Transaction.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limit);

    res.render('transactions/index', {
      title: 'Transactions — FraudX',
      transactions,
      currentPage: page,
      totalPages,
      total
    });
  } catch (err) {
    console.error('Transactions error:', err);
    res.render('error', { title: 'Error', message: err.message });
  }
};

exports.getSimulate = (req, res) => {
  res.render('transactions/simulate', {
    title: 'Simulate Transaction — FraudX',
    result: null,
    error: null,
    userId: req.session.user._id
  });
};

exports.postSimulate = async (req, res) => {
  try {
    const { userIdString, amount, receiverId, deviceId, location, transactionTime, transactionType } = req.body;
    const userId = req.session.user._id;

    // Validate
    if (!amount || !receiverId || !deviceId || !location || !transactionTime || !transactionType) {
      return res.render('transactions/simulate', {
        title: 'Simulate Transaction — FraudX',
        result: null,
        error: 'All fields are required.',
        userId
      });
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return res.render('transactions/simulate', {
        title: 'Simulate Transaction — FraudX',
        result: null,
        error: 'Amount must be a positive number.',
        userId
      });
    }

    // Get or create user profile
    let userProfile = await UserProfile.findOne({ userId });
    if (!userProfile) {
      userProfile = await UserProfile.create({ userId });
    }

    const transactionData = {
      userId,
      userIdString: userIdString || userId.toString(),
      amount: amountNum,
      receiverId,
      deviceId,
      location,
      transactionTime,
      transactionType
    };

    // Feature engineering
    const features = featureEngineering.extractFeatures(transactionData, userProfile);

    // ML probability
    const mlProbability = await mlService.predict(features);

    // Rule-based scoring
    const ruleScore = riskEngine.calculateRuleScore(features);

    // Hybrid risk score
    const riskScore = riskEngine.calculateHybridScore(ruleScore, mlProbability);

    // Decision
    const { decision, riskLevel, reasons } = decisionEngine.decide(riskScore, features);

    // Simulate delay for high-risk
    if (decision === 'delay') {
      await new Promise(resolve => setTimeout(resolve, 7000));
    }

    // Save transaction
    const transaction = await Transaction.create({
      ...transactionData,
      features,
      ruleScore,
      mlProbability,
      riskScore,
      decision,
      riskLevel,
      reasons,
      status: decision === 'block' ? 'blocked' : decision === 'delay' ? 'delayed' : 'completed'
    });

    // Update user behavioral profile ONLY if allowed
    if (decision !== 'block') {
      await userProfile.updateProfile(transactionData);
    } else {
      userProfile.totalAlerts += 1;
      await userProfile.save();
    }

    res.render('transactions/simulate', {
      title: 'Simulate Transaction — FraudX',
      result: { transaction, mlProbability, ruleScore, riskScore, decision, riskLevel, reasons, features },
      error: null,
      userId
    });
  } catch (err) {
    console.error('Simulate error:', err);
    res.render('transactions/simulate', {
      title: 'Simulate Transaction — FraudX',
      result: null,
      error: 'Processing error: ' + err.message,
      userId: req.session.user._id
    });
  }
};

exports.searchTransactions = async (req, res) => {
  try {
    const { q, decision, riskLevel } = req.query;
    const isAdmin = req.session.user.role === 'admin';
    const filter = isAdmin ? {} : { userId: req.session.user._id };

    if (q) {
      filter.$or = [
        { receiverId: { $regex: q, $options: 'i' } },
        { location: { $regex: q, $options: 'i' } },
        { deviceId: { $regex: q, $options: 'i' } }
      ];
    }
    if (decision) filter.decision = decision;
    if (riskLevel) filter.riskLevel = riskLevel;

    const transactions = await Transaction.find(filter).sort({ createdAt: -1 }).limit(50).lean();

    res.render('transactions/index', {
      title: 'Search Transactions — FraudX',
      transactions,
      currentPage: 1,
      totalPages: 1,
      total: transactions.length
    });
  } catch (err) {
    console.error('Search error:', err);
    res.render('error', { title: 'Error', message: err.message });
  }
};
