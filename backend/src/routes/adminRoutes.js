import express from 'express';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';

const router = express.Router();

// Get all users (admin only)
router.get('/users', async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized - Admin access required',
      });
    }

    const users = await User.find().select('-password');

    return res.json({
      success: true,
      users,
    });
  } catch (err) {
    console.error('Error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Error fetching users',
    });
  }
});

// Get system statistics
router.get('/stats', async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized - Admin access required',
      });
    }

    const totalUsers = await User.countDocuments();
    const totalTransactions = await Transaction.countDocuments();
    
    const totalIncome = await Transaction.aggregate([
      { $match: { type: 'income' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const totalExpense = await Transaction.aggregate([
      { $match: { type: 'expense' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    return res.json({
      success: true,
      stats: {
        totalUsers,
        totalTransactions,
        totalIncome: totalIncome[0]?.total || 0,
        totalExpense: totalExpense[0]?.total || 0,
      },
    });
  } catch (err) {
    console.error('Error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
    });
  }
});

export default router;
