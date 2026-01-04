import Transaction from '../models/Transaction.js';
import nodemailer from 'nodemailer';

const fraudAlerts = new Map();

const sendFraudAlert = async (userId, amount, merchant) => {
  // console.log(`🚨 FRAUD ALERT: User ${userId} - ₹${amount} at ${merchant}`);
  
  // Store for frontend
  fraudAlerts.set(userId, {
    timestamp: new Date(),
    amount,
    merchant,
    severity: 'HIGH'
  });
};

const detectFraud = async (req, res, next) => {
  const { userId } = req.user;
  const { amount, merchant, category } = req.body;

  try {
    // 1. Get user spending patterns (last 30 days)
    const recentTransactions = await Transaction.aggregate([
      { 
        $match: { 
          userId, 
          date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        } 
      },
      { $group: { _id: null, avg: { $avg: '$amount' }, max: { $max: '$amount' } } }
    ]);

    const avgSpend = recentTransactions[0]?.avg || 1000;
    const maxSpend = recentTransactions[0]?.max || 5000;

    // 2. Fraud rules
    const alerts = [];
    
    // Rule 1: High amount (>3x average)
    if (amount > avgSpend * 3) {
      alerts.push(`High amount: ₹${amount} (3x avg ₹${avgSpend.toFixed(0)})`);
    }
    
    // Rule 2: Unusual merchant
    if (merchant && merchant.length < 3) {
      alerts.push(`Suspicious merchant: ${merchant}`);
    }
    
    // Rule 3: Max spend exceeded (5x)
    if (amount > maxSpend * 5) {
      alerts.push(`Record breaking spend: ₹${amount}`);
    }

    // Rule 4: Category anomaly (gambling, etc.)
    const riskyCategories = ['gambling', 'crypto', 'casino'];
    if (riskyCategories.some(cat => category?.toLowerCase().includes(cat))) {
      alerts.push(`Risky category: ${category}`);
    }

    // Trigger alert if any rule hit
    if (alerts.length > 0) {
      await sendFraudAlert(userId, amount, merchant || 'Unknown');
      req.fraudAlert = {
        alerts,
        amount,
        merchant: merchant || 'N/A',
        timestamp: new Date()
      };
    }

    next();
  } catch (error) {
    console.error('Fraud detection error:', error);
    next();
  }
};

// Get recent fraud alerts for dashboard
const getFraudAlerts = async (req, res) => {
  const { userId } = req.user;
  
  try {
    // Get recent suspicious transactions
    const suspiciousTx = await Transaction.aggregate([
      { $match: { userId } },
      { $sort: { date: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      alerts: fraudAlerts.get(userId) ? [fraudAlerts.get(userId)] : [],
      recentSuspicious: suspiciousTx.slice(0, 3)
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export default { detectFraud, getFraudAlerts };
