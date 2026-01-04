import Transaction from '../models/Transaction.js';

// Create Transaction
export const createTransaction = async (req, res) => {
  try {
    const { type, amount, category, note, date } = req.body;
    const userId = req.user._id;

    // Validation
    if (!type || !amount || !category || !date) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: type, amount, category, date',
      });
    }

    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be either "income" or "expense"',
      });
    }

    if (Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0',
      });
    }

    // Create transaction
    const transaction = new Transaction({
      user: userId,
      type,
      amount: Number(amount),
      category: category.toLowerCase().trim(),
      note: note?.trim() || '',
      date: new Date(date),
    });

    await transaction.save();

    // Clear cache
    try {
      // await redis.del(`transactions:${userId}`);
      // await redis.del(`summary:${userId}`);
    } catch (cacheErr) {
      console.warn('Cache warning:', cacheErr.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      transaction,
    });
  } catch (err) {
    console.error('❌ Create error:', err.message);
    return res.status(500).json({
      success: false,
      message: err.message || 'Error creating transaction',
    });
  }
};

// Get Transactions
export const getTransactions = async (req, res) => {
  try {
    const { month } = req.query;
    const userId = req.user._id;

    let dateFilter = {};
    if (month && month !== 'all') {
      const startDate = new Date(`${month}-01`);
      const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 1);
      dateFilter = {
        date: { $gte: startDate, $lt: endDate },
      };
    }

    const transactions = await Transaction.find({
      user: userId,
      ...dateFilter,
    }).sort({ date: -1 });

    return res.json({
      success: true,
      transactions,
    });
  } catch (err) {
    console.error('❌ Get transactions error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Error fetching transactions',
    });
  }
};

// Get Summary
export const getSummary = async (req, res) => {
  try {
    const { month } = req.query;
    const userId = req.user._id;

    let dateFilter = {};
    if (month && month !== 'all') {
      const startDate = new Date(`${month}-01`);
      const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 1);
      dateFilter = {
        date: { $gte: startDate, $lt: endDate },
      };
    }

    const transactions = await Transaction.find({
      user: userId,
      ...dateFilter,
    });

    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return res.json({
      success: true,
      summary: {
        income,
        expense,
        balance: income - expense,
        transactionCount: transactions.length,
      },
    });
  } catch (err) {
    console.error('❌ Get summary error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Error fetching summary',
    });
  }
};

// Get Months List
export const getMonthsList = async (req, res) => {
  try {
    const userId = req.user._id;

    const transactions = await Transaction.find({ user: userId }).select('date');

    const months = new Set();
    transactions.forEach((t) => {
      const date = new Date(t.date);
      const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.add(monthStr);
    });

    const sortedMonths = Array.from(months).sort().reverse();

    return res.json({
      success: true,
      months: sortedMonths,
    });
  } catch (err) {
    console.error('❌ Get months error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Error fetching months',
    });
  }
};

// Get Analytics
export const getAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    const transactions = await Transaction.find({ user: userId });

    // Monthly breakdown
    const monthlyData = {};
    transactions.forEach((t) => {
      const date = new Date(t.date);
      const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyData[monthStr]) {
        monthlyData[monthStr] = { month: monthStr, income: 0, expense: 0 };
      }

      if (t.type === 'income') {
        monthlyData[monthStr].income += t.amount;
      } else {
        monthlyData[monthStr].expense += t.amount;
      }
    });

    const monthly = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));

    // Category breakdown
    const categoryData = {};
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        if (!categoryData[t.category]) {
          categoryData[t.category] = { name: t.category, value: 0 };
        }
        categoryData[t.category].value += t.amount;
      });

    const categories = Object.values(categoryData).sort((a, b) => b.value - a.value);

    return res.json({
      success: true,
      monthly,
      categories,
    });
  } catch (err) {
    console.error('❌ Get analytics error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
    });
  }
};

// Delete Transaction
export const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const transaction = await Transaction.findById(id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    if (transaction.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    await Transaction.findByIdAndDelete(id);

    try {
      // await redis.del(`transactions:${userId}`);
      // await redis.del(`summary:${userId}`);
    } catch (cacheErr) {
      console.warn('Cache warning:', cacheErr.message);
    }

    return res.json({
      success: true,
      message: 'Transaction deleted successfully',
    });
  } catch (err) {
    console.error('❌ Delete error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Error deleting transaction',
    });
  }
};
