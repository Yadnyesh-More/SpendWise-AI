import express from 'express';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// ✅ 1. EXPENSE TRENDS (7D/30D/90D)
router.get('/trends/:period', auth, async (req, res) => {
  try {
    const { userId } = req.user;
    const { period } = req.params;

    const days = { '7d': 7, '30d': 30, '90d': 90 }[period];
    if (!days) return res.status(400).json({ success: false, message: 'Invalid period' });

    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    const trends = await Transaction.aggregate([
      {
        $match: {
          userId,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$date' }
          },
          totalExpense: { $sum: '$amount' },
          transactionCount: { $sum: 1 },
          avgAmount: { $avg: '$amount' }
        }
      },
      { $sort: { '_id': 1 } },
      {
        $project: {
          date: '$_id',
          total: '$totalExpense',
          count: '$transactionCount',
          avg: { $round: ['$avgAmount', 0] }
        }
      }
    ]);

    // Fill missing dates
    const allDates = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(endDate.getTime() - i * 24 * 60 * 60 * 1000);
      allDates.unshift(date.toISOString().split('T')[0]);
    }

    const filledTrends = allDates.map(date => {
      const trend = trends.find(t => t.date === date) || { total: 0, count: 0, avg: 0 };
      return { date, ...trend };
    });

    res.json({
      success: true,
      trends: filledTrends,
      summary: {
        totalPeriod: filledTrends.reduce((sum, t) => sum + t.total, 0),
        avgDaily: Math.round(filledTrends.reduce((sum, t) => sum + t.total, 0) / days),
        highestDay: Math.max(...filledTrends.map(t => t.total))
      }
    });
  } catch (error) {
    console.error('Trends error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ✅ 2. CATEGORY BREAKDOWN
router.get('/categories', auth, async (req, res) => {
  try {
    const { userId } = req.user;
    const { period = '30d' } = req.query;

    const days = { '7d': 7, '30d': 30, '90d': 90 }[period] || 30;
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    const categories = await Transaction.aggregate([
      {
        $match: {
          userId,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          avg: { $avg: '$amount' }
        }
      },
      { $sort: { total: -1 } },
      { $limit: 10 }
    ]);

    const totalSpent = categories.reduce((sum, cat) => sum + cat.total, 0);

    res.json({
      success: true,
      categories,
      totalSpent,
      topCategory: categories[0],
      categoriesPercentage: categories.map(cat => ({
        ...cat,
        percentage: Math.round((cat.total / totalSpent) * 100)
      }))
    });
  } catch (error) {
    console.error('Categories error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ✅ 3. SPENDING PREDICTIONS
router.get('/predictions', auth, async (req, res) => {
  try {
    const { userId } = req.user;

    const monthsData = await Transaction.aggregate([
      {
        $match: { userId }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          total: { $sum: '$amount' },
          transactions: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 6 }
    ]);

    if (monthsData.length < 2) {
      return res.json({
        success: true,
        prediction: 0,
        message: 'Need more data'
      });
    }

    const recentTotal = monthsData.slice(0, 3).reduce((sum, m) => sum + m.total, 0) / 3;
    const olderTotal = monthsData.slice(3).reduce((sum, m) => sum + m.total, 0) / 3;
    const growthRate = (recentTotal - olderTotal) / olderTotal || 0.05;

    const nextMonthPrediction = Math.round(recentTotal * (1 + growthRate));

    res.json({
      success: true,
      nextMonthPrediction,
      savingsPrediction: Math.round(recentTotal * 0.2),
      growthRate: Math.round(growthRate * 100),
      trend: growthRate > 0 ? '📈 Increasing' : '📉 Decreasing',
      confidence: monthsData.length >= 4 ? 'High' : 'Medium'
    });
  } catch (error) {
    console.error('Predictions error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ✅ 4. FRAUD ALERTS
router.get('/fraud-alerts', auth, async (req, res) => {
  try {
    const { userId } = req.user;

    const avgSpend = await Transaction.aggregate([
      { $match: { userId } },
      { $group: { _id: null, avg: { $avg: '$amount' } } }
    ]);

    const alerts = await Transaction.find({
      userId,
      amount: { $gt: (avgSpend[0]?.avg || 0) * 3 },
      isFlagged: { $ne: true }
    }).sort({ date: -1 }).limit(10);

    await Transaction.updateMany(
      { _id: { $in: alerts.map(a => a._id) } },
      { $set: { isFlagged: true } }
    );

    res.json({
      success: true,
      alerts,
      avgSpend: Math.round(avgSpend[0]?.avg || 0),
      alertCount: alerts.length
    });
  } catch (error) {
    console.error('Fraud alerts error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ✅ 5. OVERVIEW SUMMARY
router.get('/overview', auth, async (req, res) => {
  try {
    const { userId } = req.user;
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const overview = await Transaction.aggregate([
      {
        $match: {
          userId,
          date: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: { $cond: [{ $lt: ['$type', 0] }, '$amount', 0] }
          },
          totalExpense: {
            $sum: { $cond: [{ $gte: ['$type', 0] }, '$amount', 0] }
          },
          categories: { $addToSet: '$category' },
          transactionCount: { $sum: 1 }
        }
      }
    ]);

    const summary = overview[0] || {
      totalIncome: 0,
      totalExpense: 0,
      categories: [],
      transactionCount: 0
    };

    res.json({
      success: true,
      ...summary,
      savings: summary.totalIncome - summary.totalExpense,
      savingsRate: summary.totalIncome > 0 
        ? Math.round(((summary.totalIncome - summary.totalExpense) / summary.totalIncome) * 100)
        : 0
    });
  } catch (error) {
    console.error('Overview error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
