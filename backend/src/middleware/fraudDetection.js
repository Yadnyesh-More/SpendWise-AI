const detectFraud = async (req, res, next) => {
  const { userId } = req.user;
  const { amount, merchant } = req.body;

  // Get user average spending
  const avgSpend = await Transaction.aggregate([
    { $match: { userId } },
    { $group: { _id: null, avg: { $avg: '$amount' } } }
  ]);

  // Alert if > 3x average
  if (amount > avgSpend[0]?.avg * 3) {
    await sendFraudAlert(userId, amount, merchant);
    req.fraudAlert = true;
  }

  next();
};

// Add to transaction routes
router.post('/transactions', detectFraud, createTransaction);
