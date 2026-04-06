const Transaction = require('../models/Transaction');
const User = require('../models/User');

exports.getDashboard = async (req, res) => {
  try {
    const userId = req.session.user._id;
    const isAdmin = req.session.user.role === 'admin';

    // Query filter (admin sees all, user sees own)
    const filter = isAdmin ? {} : { userId };

    const [
      totalTransactions,
      fraudulentTransactions,
      totalUsers,
      recentTransactions
    ] = await Promise.all([
      Transaction.countDocuments(filter),
      Transaction.countDocuments({ ...filter, decision: { $in: ['block', 'delay'] } }),
      isAdmin ? User.countDocuments() : 1,
      Transaction.find(filter).sort({ createdAt: -1 }).limit(10).lean()
    ]);

    const alertsTriggered = await Transaction.countDocuments({
      ...filter,
      riskLevel: { $in: ['high', 'very_high'] }
    });

    // Chart data: transactions per day (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const txByDay = await Transaction.aggregate([
      { $match: { ...filter, createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Fraud vs Normal ratio
    const fraudCount = await Transaction.countDocuments({ ...filter, riskLevel: { $in: ['high', 'very_high'] } });
    const normalCount = totalTransactions - fraudCount;

    res.render('dashboard/index', {
      title: 'Dashboard — FraudX',
      metrics: {
        totalTransactions,
        fraudulentTransactions,
        totalUsers,
        alertsTriggered
      },
      recentTransactions,
      chartData: {
        barLabels: txByDay.map(d => d._id),
        barValues: txByDay.map(d => d.count),
        pieData: [fraudCount, normalCount]
      }
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.render('error', { title: 'Error', message: err.message });
  }
};
